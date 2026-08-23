import React from 'react';

const Refund = () => {
  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 font-body text-left">
        <h1 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase mb-10 text-center">
          Refund & Cancellation Policy
        </h1>
        
        <div className="space-y-8 text-sm text-[#707070] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">1. Order Cancellations</h2>
            <p>
              Orders can be canceled within 24 hours of placement or before they are dispatched, whichever is earlier. To cancel an order, please contact our support team immediately at s3bagscollection@gmail.com with your Order ID.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">2. Returns</h2>
            <p>
              We accept returns within 7 days of delivery only if the product is defective, damaged upon arrival, or if you received the incorrect item. The item must be unused, in its original packaging, and with all tags intact.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">3. Refunds</h2>
            <p>
              Once your return is received and inspected, we will notify you of the approval or rejection of your refund. If approved, the refund will be processed back to your original method of payment (via Razorpay) within 5-7 business days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">4. Non-Returnable Items</h2>
            <p>
              Sale items or products purchased using special promotional codes (unless defective) are strictly non-returnable and non-refundable.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Refund;
