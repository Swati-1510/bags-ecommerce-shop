import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../../context/AuthContext';
import { MapPin, Phone, Mail, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/queries`, formData);
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      setError(err.response?.data?.message || 'Something went wrong. Please check your network and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFDFB] min-h-screen py-16 font-body text-xs tracking-wider uppercase text-stone-600">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase">
            Get In Touch
          </span>
          <h1 className="mt-2 font-heading text-4xl font-light tracking-widest text-[#111111] uppercase">
            Contact & Support
          </h1>
          <p className="mt-2 text-xs text-[#707070] max-w-md mx-auto leading-relaxed normal-case">
            Have a question about bag size, custom designs, or deliveries? Reach out to us directly or visit our physical shop in Mumbai.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: Store Identity & Info Card */}
          <div className="lg:col-span-5 space-y-8 bg-stone-50/50 border border-stone-150 p-8 rounded-xs text-left">
            <div>
              <span className="font-heading text-lg font-bold tracking-[0.2em] text-[#111111] uppercase block mb-3">
                Shivang's Bags Collection
              </span>
              <p className="normal-case font-light text-stone-500 leading-relaxed">
                Shivang's Bags Collection (S3 Fashion Gallery) is an established local family-owned retail business in Mumbai. We have been bringing durable, stylish, and high-quality college backpacks, office laptop bags, and slings directly to local customers for years. We are proud to expand our operations online to serve you nationwide.
              </p>
            </div>

            <div className="border-t border-stone-200 pt-6 space-y-5">
              
              {/* Address */}
              <div className="flex items-start space-x-3.5">
                <MapPin className="h-5 w-5 text-[#7A624E] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#111111] block mb-1">Our Store Address</span>
                  <p className="normal-case text-stone-500 leading-relaxed font-light">
                    Shop No. 3, Shivang's Bags Collection,<br />
                    Mohili Village, Sakinaka Pipeline,<br />
                    Mumbai, Maharashtra 400072
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start space-x-3.5">
                <Clock className="h-5 w-5 text-[#7A624E] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#111111] block mb-1">Operational Hours</span>
                  <p className="normal-case text-stone-500 leading-relaxed font-light">
                    Open Monday - Sunday<br />
                    11:00 AM to 11:00 PM
                  </p>
                </div>
              </div>

              {/* Email & Support */}
              <div className="flex items-start space-x-3.5">
                <Mail className="h-5 w-5 text-[#7A624E] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#111111] block mb-1">Email Queries</span>
                  <a href="mailto:s3bagscollection@gmail.com" className="normal-case text-stone-500 hover:text-[#7A624E] transition-colors font-light">
                    s3bagscollection@gmail.com
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-3.5">
                <Phone className="h-5 w-5 text-[#7A624E] flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#111111] block mb-1">Phone Call Support</span>
                  <div className="space-y-1">
                    <a href="tel:+918451021245" className="block text-stone-500 hover:text-[#7A624E] transition-colors font-light">
                      +91 8451021245
                    </a>
                    <a href="tel:+918779269047" className="block text-stone-500 hover:text-[#7A624E] transition-colors font-light">
                      +91 8779269047
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Redirection */}
            <div className="border-t border-stone-200 pt-6">
              <a
                href="https://wa.me/918451021245?text=Hi%2C%20I%20have%20a%20query%20about%20a%20bag%20at%20Shivang's%20Bags%20Collection"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2.5 bg-[#25D366] hover:bg-[#128C7E] text-white py-3.5 font-semibold tracking-wider transition-colors duration-300 w-full rounded-xs shadow-sm uppercase text-xs"
              >
                <MessageSquare className="h-4.5 w-4.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Query Form */}
          <div className="lg:col-span-7 bg-[#FFFDFB] border border-stone-200 p-8 rounded-xs shadow-xs text-left">
            
            {success ? (
              <div className="py-16 text-center space-y-6">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-[#7A624E] animate-bounce" />
                </div>
                <h3 className="font-heading text-xl font-semibold tracking-wider text-[#111111] uppercase">
                  Inquiry Submitted!
                </h3>
                <p className="normal-case text-stone-500 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. Your message has been saved. Our support team will review your inquiry and get back to you shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="mt-4 border border-[#111111] px-6 py-3 text-[10px] font-bold tracking-widest text-[#111111] uppercase hover:bg-[#111111] hover:text-white transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="font-heading text-lg font-semibold tracking-wider text-[#111111] uppercase mb-6 pb-2 border-b border-stone-100">
                  Send A Message
                </h2>
                
                {error && (
                  <div className="mb-6 border border-[#E07A5F] bg-[#E07A5F]/10 p-3 text-center text-xs text-[#E07A5F]">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Name field */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full border border-stone-200 bg-white px-3.5 py-3 text-sm text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Email */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full border border-stone-200 bg-white px-3.5 py-3 text-sm text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs"
                      />
                    </div>
                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full border border-stone-200 bg-white px-3.5 py-3 text-sm text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[10px] font-bold text-[#111111] mb-1.5 uppercase tracking-wider">Message / Inquiry</label>
                    <textarea
                      name="message"
                      required
                      rows="5"
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full border border-stone-200 bg-white px-3.5 py-3 text-sm text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors rounded-xs"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center space-x-2.5 bg-[#7A624E] hover:bg-[#5f4b3c] text-white py-3.5 font-semibold tracking-widest transition-all duration-300 w-full rounded-xs disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{loading ? 'Sending Query...' : 'Submit Message'}</span>
                  </button>

                </form>
              </>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;
