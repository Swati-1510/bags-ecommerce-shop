import React from 'react';

const Terms = () => {
  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 font-body text-left">
        <h1 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase mb-10 text-center">
          Terms & Conditions
        </h1>
        
        <div className="space-y-8 text-sm text-[#707070] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">1. Introduction</h2>
            <p>
              Welcome to S3 Fashion Gallery. By accessing our website and purchasing our products, you agree to be bound by these Terms and Conditions. Please read them carefully.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">2. Products and Pricing</h2>
            <p>
              All products listed on the website, their descriptions, and their prices are each subject to change. S3 Fashion Gallery reserves the right, at any time, to modify, suspend, or discontinue the sale of any product with or without notice. 
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">3. Payment Terms</h2>
            <p>
              We accept online payments via Razorpay (UPI, Credit/Debit Cards, Net Banking, and Wallets). All transactions are completely secure and encrypted. Full payment must be received before the order is processed and dispatched.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">4. Intellectual Property</h2>
            <p>
              All content included on this site, such as text, graphics, logos, images, and software, is the property of S3 Fashion Gallery or its content suppliers and protected by international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">5. Governing Law</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes relating to these terms will be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
