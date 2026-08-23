const nodemailer = require('nodemailer');

// Dynamic SMTP transporter helper
const getTransporter = () => {
  const EMAIL_USER = process.env.EMAIL_USER || '';
  const EMAIL_PASS = process.env.EMAIL_PASS || '';

  if (EMAIL_USER && EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS // Gmail App Password
      }
    });
  }
  return null;
};

/**
 * Dispatch automated invoice receipt to customer and order alert to admin
 * @param {Object} order - Full mongoose Order document
 */
const sendOrderReceipts = async (order) => {
  const { _id, items, shippingDetails, totalAmount } = order;
  const invoiceId = _id.toString().substring(_id.toString().length - 6).toUpperCase();

  // Create list of items HTML
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #EAEAEA;">
        <span style="font-weight: bold; color: #111111;">${item.name}</span>
        ${item.color ? `<br/><span style="font-size: 11px; color: #888888;">Color: ${item.color}</span>` : ''}
      </td>
      <td style="padding: 12px; text-align: center; border-bottom: 1px solid #EAEAEA; color: #666666;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; text-align: right; border-bottom: 1px solid #EAEAEA; font-weight: bold; color: #111111;">
        ₹${item.price.toLocaleString()}
      </td>
    </tr>
  `).join('');

  // 1. Customer HTML Invoice Template
  const customerHtml = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FFFDFB; padding: 30px; border: 1px solid #EAEAEA; max-width: 600px; margin: 0 auto; color: #333333;">
      <!-- Brand Header -->
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #7A624E; margin-bottom: 30px;">
        <h2 style="font-family: serif; color: #7A624E; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Shivang's Bags</h2>
        <p style="font-size: 10px; letter-spacing: 1px; color: #888888; margin: 5px 0 0 0; text-transform: uppercase;">Luxury Collections</p>
      </div>

      <!-- Welcome Message -->
      <div style="margin-bottom: 25px;">
        <p style="font-size: 14px; line-height: 1.5; color: #444444;">Dear <strong>${shippingDetails.name}</strong>,</p>
        <p style="font-size: 14px; line-height: 1.5; color: #444444;">Thank you for shopping with us! We are pleased to confirm that your payment has been processed successfully. Your order is being processed for shipment.</p>
      </div>

      <!-- Invoice Details Table -->
      <div style="background-color: #FFFFFF; border: 1px solid #EAEAEA; padding: 20px; border-radius: 4px; margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-transform: uppercase;">
          <tr>
            <td style="padding-bottom: 10px; color: #888888; font-weight: bold;">Invoice ID</td>
            <td style="padding-bottom: 10px; text-align: right; font-weight: bold; color: #111111;">#${invoiceId}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; color: #888888; font-weight: bold;">Date</td>
            <td style="padding-bottom: 10px; text-align: right; color: #111111;">${new Date().toLocaleDateString()}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; color: #888888; font-weight: bold;">Payment Method</td>
            <td style="padding-bottom: 10px; text-align: right; color: #111111;">UPI/Card (Razorpay)</td>
          </tr>
        </table>
      </div>

      <!-- Order Items -->
      <h3 style="font-family: serif; color: #7A624E; font-size: 14px; border-bottom: 1px solid #7A624E; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase;">Order Items</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #F9F7F5; text-transform: uppercase; font-size: 11px; letter-spacing: 1px;">
            <th style="padding: 10px; text-align: left; color: #666666;">Product</th>
            <th style="padding: 10px; text-align: center; color: #666666;">Qty</th>
            <th style="padding: 10px; text-align: right; color: #666666;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 12px; text-align: right; font-weight: bold; color: #7A624E; font-size: 14px;">Total Amount:</td>
            <td style="padding: 12px; text-align: right; font-weight: bold; color: #7A624E; font-size: 16px;">₹${totalAmount.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <!-- Shipping Address -->
      <h3 style="font-family: serif; color: #7A624E; font-size: 14px; border-bottom: 1px solid #7A624E; padding-bottom: 8px; margin-bottom: 15px; text-transform: uppercase;">Shipping Address</h3>
      <div style="background-color: #F9F7F5; padding: 15px; border-radius: 4px; font-size: 13px; line-height: 1.6; color: #555555; margin-bottom: 35px;">
        <strong>${shippingDetails.name}</strong><br/>
        ${shippingDetails.address}<br/>
        ${shippingDetails.city} - ${shippingDetails.postalCode}<br/>
        ${shippingDetails.country}<br/>
        Tel: ${shippingDetails.phone}
      </div>

      <!-- Shop Details (Trust) -->
      <div style="border-top: 1px solid #EAEAEA; padding-top: 25px; text-align: center; font-size: 11px; color: #888888; line-height: 1.6;">
        <strong style="color: #7A624E;">Shivang's Bags Collection</strong><br/>
        Shop No. 3, Mohili Village, Sakinaka Pipeline, Mumbai 400072<br/>
        Support Tel/WhatsApp: +91 8451021245 / +91 8779269047 | Email: s3bagscollection@gmail.com<br/>
        Open Monday - Sunday: 11:00 AM to 11:00 PM
      </div>
    </div>
  `;

  // 2. Admin Notification Template
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #EAEAEA; max-width: 600px; margin: 0 auto; background-color: #FDFDFD;">
      <h2 style="color: #7A624E; border-bottom: 2px solid #7A624E; padding-bottom: 10px; text-transform: uppercase;">New Incoming Order Alert</h2>
      <p style="font-size: 14px;">Hello SN Snehal Mahajan,</p>
      <p style="font-size: 14px;">A new order has been paid and completed on the web portal. Please review and prepare it for dispatch.</p>
      
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 20px 0;">
        <tr style="background-color: #F5F5F5;">
          <td style="padding: 8px; font-weight: bold;">Order Invoice ID:</td>
          <td style="padding: 8px;">#${invoiceId}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Customer Name:</td>
          <td style="padding: 8px;">${shippingDetails.name}</td>
        </tr>
        <tr style="background-color: #F5F5F5;">
          <td style="padding: 8px; font-weight: bold;">Customer Contact:</td>
          <td style="padding: 8px;">${shippingDetails.phone} | ${shippingDetails.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; font-weight: bold;">Amount Paid:</td>
          <td style="padding: 8px; font-weight: bold; color: #2E7D32;">₹${totalAmount.toLocaleString()}</td>
        </tr>
      </table>

      <p style="font-size: 12px; color: #666666;">View complete details inside your merchant dashboard under the "Manage Orders" panel.</p>
    </div>
  `;

  const transporter = getTransporter();
  const EMAIL_USER = process.env.EMAIL_USER || '';

  if (transporter) {
    try {
      // Send to Customer
      await transporter.sendMail({
        from: `"Shivang's Bags" <${EMAIL_USER}>`,
        to: shippingDetails.email,
        subject: `Your Shivang's Bags Invoice - Order #${invoiceId}`,
        html: customerHtml
      });

      // Send to Admin
      await transporter.sendMail({
        from: `"Web Portal" <${EMAIL_USER}>`,
        to: process.env.EMAIL_USER || 's3bagscollection@gmail.com', // Store owner support mail
        subject: `🔔 New Order Received! #${invoiceId} - ₹${totalAmount}`,
        html: adminHtml
      });

      console.log(`Invoice receipts successfully mailed for Order #${invoiceId}.`);
    } catch (error) {
      console.error(`Mailer failed to deliver order receipts:`, error.message);
      throw error;
    }
  } else {
    // If not configured, print beautiful log in stdout
    console.log("---------------- MOCK MAIL RECEIPTS ----------------");
    console.log(`To: Customer (${shippingDetails.email})`);
    console.log(`Subject: Your Shivang's Bags Invoice - Order #${invoiceId}`);
    console.log(`To: Admin (${process.env.EMAIL_USER || 's3bagscollection@gmail.com'})`);
    console.log(`Subject: New Order Received! #${invoiceId}`);
    console.log("----------------------------------------------------");
  }
};

/**
 * Send 6-digit Verification OTP Email
 * @param {string} email - Destination email address
 * @param {string} name - Recipient name
 * @param {string} otpCode - 6-digit OTP code string
 */
const sendOtpEmail = async (email, name, otpCode) => {
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #FFFDFB; padding: 30px; border: 1px solid #EAEAEA; max-width: 500px; margin: 0 auto; color: #333333;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #7A624E; margin-bottom: 25px;">
        <h2 style="font-family: serif; color: #7A624E; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Shivang's Bags</h2>
        <p style="font-size: 10px; letter-spacing: 1px; color: #888888; margin: 5px 0 0 0; text-transform: uppercase;">Email Account Verification</p>
      </div>

      <div style="text-align: center; padding: 10px 0 20px 0;">
        <p style="font-size: 14px; color: #444444; margin-bottom: 15px;">Hello <strong>${name || 'Valued Customer'}</strong>,</p>
        <p style="font-size: 13px; color: #666666; line-height: 1.6; margin-bottom: 25px;">Thank you for registering with Shivang's Bags Collection. Please use the One-Time Password (OTP) below to verify your email address:</p>

        <div style="margin: 20px 0; padding: 18px 24px; background-color: #F9F7F5; border: 1px border-dashed #7A624E; display: inline-block; border-radius: 4px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111111;">${otpCode}</span>
        </div>

        <p style="font-size: 11px; color: #888888; margin-top: 20px;">This OTP code will expire in 10 minutes. For security reasons, do not share this code with anyone.</p>
      </div>

      <div style="border-top: 1px solid #EAEAEA; padding-top: 20px; text-align: center; font-size: 11px; color: #888888;">
        <strong style="color: #7A624E;">Shivang's Bags Collection</strong><br/>
        Luxury Leather Crafts & Handbags
      </div>
    </div>
  `;

  const transporter = getTransporter();
  const EMAIL_USER = process.env.EMAIL_USER || '';

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Shivang's Bags" <${EMAIL_USER}>`,
        to: email,
        subject: `${otpCode} is your Shivang's Bags verification code`,
        html
      });
      console.log(`Verification OTP code sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send OTP email to ${email}:`, error.message);
      throw error;
    }
  } else {
    console.log("---------------- MOCK EMAIL OTP ----------------");
    console.log(`To: ${email}`);
    console.log(`Verification OTP Code: ${otpCode}`);
    console.log("------------------------------------------------");
  }
};

/**
 * Sends real-time Order Status Update email to customer
 */
const sendOrderStatusUpdateEmail = async (order, oldStatus) => {
  const { shippingDetails, _id, orderStatus, trackingNumber, courierName } = order;
  const invoiceId = _id.toString().substring(_id.toString().length - 6).toUpperCase();
  const recipientEmail = shippingDetails?.email;

  if (!recipientEmail) return;

  const courierText = trackingNumber ? `<p style="font-size: 13px; color: #444; background: #F9F7F5; padding: 12px; border-left: 4px solid #7A624E; margin: 15px 0;"><strong>Courier Partner:</strong> ${courierName || 'Blue Dart'}<br/><strong>AWB Tracking Number:</strong> <span style="font-family: monospace; font-size: 14px; font-weight: bold; color: #7A624E;">${trackingNumber}</span></p>` : '';

  let statusMessage = `Your order status has been updated to <strong>${orderStatus.toUpperCase()}</strong>.`;
  if (orderStatus === 'Shipped') {
    statusMessage = `Great news! Your order <strong>#${invoiceId}</strong> has been dispatched and is on its way to you.`;
  } else if (orderStatus === 'Delivered') {
    statusMessage = `Your order <strong>#${invoiceId}</strong> has been successfully delivered. Thank you for shopping with Shivang's Bags Collection!`;
  } else if (orderStatus === 'Cancelled') {
    statusMessage = `Your order <strong>#${invoiceId}</strong> has been cancelled. If a payment was made, your refund is being processed to your original payment method.`;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #EAEAEA; max-width: 550px; margin: 0 auto; background-color: #FFFDFB; color: #333;">
      <div style="text-align: center; border-bottom: 2px solid #7A624E; padding-bottom: 15px; margin-bottom: 25px;">
        <h2 style="font-family: serif; color: #7A624E; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Shivang's Bags</h2>
        <p style="font-size: 11px; letter-spacing: 1px; color: #888; margin-top: 5px; text-transform: uppercase;">Order Status Update Alert</p>
      </div>

      <p style="font-size: 14px; color: #444;">Hello <strong>${shippingDetails.name}</strong>,</p>
      <p style="font-size: 13px; line-height: 1.6; color: #555;">${statusMessage}</p>

      <div style="background-color: #F9F7F5; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px;">
        <p style="margin: 0 0 5px 0;"><strong>Order Invoice ID:</strong> #${invoiceId}</p>
        <p style="margin: 0 0 5px 0;"><strong>Current Status:</strong> <span style="color: #7A624E; font-weight: bold; text-transform: uppercase;">${orderStatus}</span></p>
        <p style="margin: 0;"><strong>Delivery Address:</strong> ${shippingDetails.address}, ${shippingDetails.city} - ${shippingDetails.postalCode}</p>
      </div>

      ${courierText}

      <div style="border-top: 1px solid #EAEAEA; padding-top: 20px; text-align: center; font-size: 11px; color: #888; line-height: 1.6; margin-top: 30px;">
        <strong style="color: #7A624E;">Shivang's Bags Collection</strong><br/>
        Support Tel/WhatsApp: +91 8451021245 / +91 8779269047 | Email: s3bagscollection@gmail.com
      </div>
    </div>
  `;

  const transporter = getTransporter();
  const EMAIL_USER = process.env.EMAIL_USER || '';

  console.log(`[EMAIL DISPATCH] Triggering ${orderStatus} status update email to: ${recipientEmail} for Order #${invoiceId}`);

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Shivang's Bags Order Desk" <${EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Order #${invoiceId} Update: ${orderStatus}`,
        html
      });
      console.log(`✅ Order status update (${orderStatus}) email successfully sent to ${recipientEmail}`);
    } catch (err) {
      console.error(`❌ Error sending status update email to ${recipientEmail}:`, err.message);
    }
  } else {
    console.log(`[MOCK EMAIL] Status update to ${orderStatus} for ${recipientEmail} (Transporter not ready)`);
  }
};

/**
 * Sends Order Cancellation receipt to customer and admin
 */
const sendOrderCancellationEmail = async (order) => {
  const { shippingDetails, _id, totalAmount, cancellationReason } = order;
  const invoiceId = _id.toString().substring(_id.toString().length - 6).toUpperCase();
  const recipientEmail = shippingDetails?.email;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 30px; border: 1px solid #EAEAEA; max-width: 550px; margin: 0 auto; background-color: #FFFDFB; color: #333;">
      <div style="text-align: center; border-bottom: 2px solid #E07A5F; padding-bottom: 15px; margin-bottom: 25px;">
        <h2 style="font-family: serif; color: #E07A5F; letter-spacing: 2px; margin: 0; text-transform: uppercase;">Shivang's Bags</h2>
        <p style="font-size: 11px; letter-spacing: 1px; color: #888; margin-top: 5px; text-transform: uppercase;">Order Cancellation Confirmation</p>
      </div>

      <p style="font-size: 14px; color: #444;">Hello <strong>${shippingDetails?.name || 'Valued Customer'}</strong>,</p>
      <p style="font-size: 13px; line-height: 1.6; color: #555;">Your order <strong>#${invoiceId}</strong> has been successfully cancelled as requested.</p>

      <div style="background-color: #F9F7F5; padding: 15px; border-radius: 4px; margin: 20px 0; font-size: 13px;">
        <p style="margin: 0 0 5px 0;"><strong>Order ID:</strong> #${invoiceId}</p>
        <p style="margin: 0 0 5px 0;"><strong>Amount:</strong> ₹${totalAmount.toLocaleString()}</p>
        <p style="margin: 0 0 5px 0;"><strong>Cancellation Reason:</strong> ${cancellationReason || 'N/A'}</p>
        <p style="margin: 0;"><strong>Refund Status:</strong> Initiated (Processed within 3-5 business days)</p>
      </div>

      <div style="border-top: 1px solid #EAEAEA; padding-top: 20px; text-align: center; font-size: 11px; color: #888; line-height: 1.6;">
        <strong style="color: #7A624E;">Shivang's Bags Collection</strong><br/>
        Support Tel/WhatsApp: +91 8451021245 / +91 8779269047
      </div>
    </div>
  `;

  const transporter = getTransporter();
  const EMAIL_USER = process.env.EMAIL_USER || '';

  if (transporter && recipientEmail) {
    try {
      await transporter.sendMail({
        from: `"Shivang's Bags" <${EMAIL_USER}>`,
        to: recipientEmail,
        subject: `Order #${invoiceId} Cancelled - Refund Initiated`,
        html
      });
    } catch (err) {
      console.error(`Error sending cancellation email:`, err.message);
    }
  }
};

/**
 * Sends a notification email to the admin when a new customer query is submitted.
 * @param {Object} query - The query document
 */
const sendQueryNotificationEmail = async (query) => {
  const { name, email, phone, message } = query;
  
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333333; line-height: 1.6;">
      <p style="margin: 0 0 5px 0;"><strong>Name:</strong> ${name}</p>
      <p style="margin: 0 0 5px 0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #0056b3;">${email}</a></p>
      <p style="margin: 0 0 5px 0;"><strong>Phone:</strong> ${phone}</p>
      <br/>
      <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
      <p style="white-space: pre-wrap; background-color: #F5F5F5; padding: 15px; border-left: 4px solid #7A624E; margin: 0;">${message}</p>
    </div>
  `;

  const transporter = getTransporter();
  const EMAIL_USER = process.env.EMAIL_USER || '';
  const ADMIN_EMAIL = process.env.EMAIL_USER || 's3bagscollection@gmail.com';

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${name} (Contact Form)" <${EMAIL_USER}>`,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: `Customer Query: ${name}`,
        html: adminHtml
      });
      console.log(`Query notification successfully mailed to ${ADMIN_EMAIL}.`);
    } catch (error) {
      console.error(`Mailer failed to deliver query notification:`, error.message);
    }
  } else {
    console.log("---------------- MOCK MAIL QUERY NOTIFICATION ----------------");
    console.log(`To: Admin (${ADMIN_EMAIL})`);
    console.log(`Subject: 🔔 New Customer Query from ${name}`);
    console.log(`Message: ${message}`);
    console.log("--------------------------------------------------------------");
  }
};

module.exports = {
  sendOrderReceipts,
  sendOtpEmail,
  sendOrderStatusUpdateEmail,
  sendOrderCancellationEmail,
  sendQueryNotificationEmail
};
