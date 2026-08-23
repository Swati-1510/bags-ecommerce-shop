# Shivang's Bags - Production Deployment Guide

Follow this guide step-by-step to deploy your e-commerce shop live for real customers to visit and make payments.

---

## 🛠️ Step 1: Set Up Cloud MongoDB Database (MongoDB Atlas)
Since your local computer won't be running 24/7, you need a database in the cloud:
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and register for a free account.
2. Create a new database cluster (select the **FREE M0** shared tier).
3. Under **Security > Database Access**, create a user (e.g., `shopadmin`) and set a strong password.
4. Under **Security > Network Access**, click **Add IP Address** and choose **Allow Access From Anywhere** (`0.0.0.0/0`). *This is required so your cloud hosting servers can connect to the database.*
5. On the database dashboard, click **Connect > Drivers**. Copy the connection string. It will look like this:
   `mongodb+srv://shopadmin:<PASSWORD>@cluster0.abcde.mongodb.net/shivangs_bags?retryWrites=true&w=majority`
   *(Replace `<PASSWORD>` with your user's actual password).*

---

## 💳 Step 2: Set Up Razorpay Payment Gateway
To accept UPI (GPay, Paytm, PhonePe), credit cards, and net banking:
1. Create a business account on [Razorpay](https://razorpay.com).
2. Complete your activation KYC by uploading business details and your father's shop bank account number (so funds settle directly into his account).
3. Go to your Razorpay Dashboard, switch to **Live Mode** (or **Test Mode** first for testing), and navigate to **Account & Settings > API Keys**.
4. Click **Generate Key**. Copy both values immediately:
   * **Key ID** (this goes into `VITE_RAZORPAY_KEY_ID` on frontend and `RAZORPAY_KEY_ID` on backend).
   * **Key Secret** (keep this private! This goes into `RAZORPAY_KEY_SECRET` on backend only).

---

## 📧 Step 3: Set Up Automated Email Transporter (Gmail App Password)
To send email invoice receipts automatically from your Gmail account:
1. Log in to the Google account you wish to send emails from (e.g., `snehalcmahajan381@gmail.com`).
2. Go to **Google Account Settings > Security**.
3. Under "How you sign in to Google", enable **2-Step Verification** (required to generate App Passwords).
4. Go to the Search Bar in your settings, search for **App Passwords**, and click on it.
5. Create a new App Password (name it something like `Shivang's Bags Web Store`).
6. Copy the generated 16-character code (e.g., `abcd efgh ijkl mnop`). This is your `EMAIL_PASS`. Your regular Gmail password will NOT work.

---

## 🖥️ Step 4: Deploy the Backend API (Render)
Render will host your Node.js server. It is free and highly reliable:
1. Create a free account on [Render](https://render.com) and link your GitHub repository.
2. Click **New + > Web Service**. Select your repository.
3. Configure the following build settings:
   * **Language**: `Node`
   * **Build Command**: `npm install` (run in the `backend/` directory)
   * **Start Command**: `node server.js`
4. Under **Environment Variables**, add the following keys:
   * `MONGO_URI` = *(Your MongoDB Atlas connection string from Step 1)*
   * `JWT_SECRET` = *(Any random, long, secure sentence like `ShivangsBagsSecret2026TokenKey!`)*
   * `RAZORPAY_KEY_ID` = *(Your Razorpay Key ID from Step 2)*
   * `RAZORPAY_KEY_SECRET` = *(Your Razorpay Key Secret from Step 2)*
   * `EMAIL_USER` = `snehalcmahajan381@gmail.com` *(Or your sending Gmail)*
   * `EMAIL_PASS` = *(The 16-character App Password code from Step 3)*
   * `PORT` = `5000`
5. Click **Deploy Web Service**. Once the deploy finishes, Render will provide a public URL (e.g., `https://shivangs-bags-backend.onrender.com`). Copy this URL.

---

## 🎨 Step 5: Deploy the Frontend Storefront (Vercel)
Vercel is the fastest platform for hosting React web interfaces:
1. Create a free account on [Vercel](https://vercel.com) and link your GitHub repository.
2. Click **Add New > Project**. Select your repository.
3. In the project configurations:
   * **Framework Preset**: `Vite` (or Other)
   * **Root Directory**: `frontend`
4. Expand **Environment Variables** and add:
   * `VITE_API_URL` = `https://shivangs-bags-backend.onrender.com/api` *(Your Render backend URL from Step 4 with `/api` appended)*
   * `VITE_RAZORPAY_KEY_ID` = *(Your Razorpay Key ID from Step 2)*
5. Click **Deploy**. Vercel will compile the code and provide your live website link (e.g., `https://bags-ecommerce-shop.vercel.app`).

---

## 🔗 Step 6: Link Your Custom GoDaddy Domain
Once Vercel has deployed your frontend:
1. In your Vercel Dashboard, go to **Settings > Domains**.
2. Type in your custom domain (e.g., `shivangsbags.com` or `s3fashiongallery.com`) and click **Add**.
3. Vercel will show the DNS records you need to update:
   * An **A Record** pointing to Vercel's IP address.
   * A **CNAME Record** pointing to `cname.vercel-dns.com`.
4. Log into your **GoDaddy DNS Zone Manager**, add these records, and save. Within a few hours, your domain will be active with free secure HTTPS (SSL) automatically enabled!
