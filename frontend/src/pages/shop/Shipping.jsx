import React from 'react';

const Shipping = () => {
  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 font-body text-left">
        <h1 className="font-heading text-3xl font-light tracking-widest text-[#111111] uppercase mb-10 text-center">
          Shipping & Delivery Policy
        </h1>
        
        <div className="space-y-8 text-sm text-[#707070] leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">1. Processing Time</h2>
            <p>
              All orders are processed within 1-2 business days. Orders are not shipped or delivered on Sundays or local public holidays. If we are experiencing a high volume of orders, shipments may be delayed by a few days.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">2. Shipping Rates & Estimates</h2>
            <p>
              We offer complimentary standard shipping on all orders within India. Delivery typically takes 3-7 business days depending on your location. Expedited shipping options (if available) will have their charges calculated and displayed at checkout.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">3. Shipment Confirmation & Tracking</h2>
            <p>
              You will receive a Shipment Confirmation email containing your tracking number(s) once your order has shipped. The tracking number will be active within 24 hours.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#111111] uppercase tracking-wider mb-4">4. Damages During Shipping</h2>
            <p>
              S3 Fashion Gallery is not liable for any products damaged or lost during shipping. However, if you received your order damaged, please contact us immediately so we can assist you in filing a claim with the shipment carrier. Please save all packaging materials and damaged goods.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
