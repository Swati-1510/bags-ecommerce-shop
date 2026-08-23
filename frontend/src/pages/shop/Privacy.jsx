import React from 'react';

const Privacy = () => {
  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 font-body text-left">
        <h1 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase mb-10 text-center">
          Privacy Policy
        </h1>
        
        <div className="space-y-8 text-sm text-[#707070] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, such as your name, email address, shipping address, and phone number when you create an account, place an order, or contact us.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to fulfill your orders, communicate with you about your purchase, improve our website, and provide customer support. We do not sell your personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">3. Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All online payments are handled securely through Razorpay, and we do not store your credit card or UPI details on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">4. Cookies</h2>
            <p>
              Our website uses cookies and similar tracking technologies to enhance your browsing experience, remember your cart items, and analyze site traffic.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at s3bagscollection@gmail.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
