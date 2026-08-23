import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../context/AuthContext';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const StoreSettings = () => {
  const { token } = useAuth();
  
  const [isSaleActive, setIsSaleActive] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE}/settings`);
        const data = res.data;
        setIsSaleActive(data.isSaleActive);
        setAnnouncementText(data.announcementText);
        setPromoCode(data.promoCode || '');
        setDiscountPercentage(data.discountPercentage || 0);
        setHeroTitle(data.heroTitle || '');
        setHeroSubtitle(data.heroSubtitle || '');
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Failed to load store settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.put(
        `${API_BASE}/settings`,
        {
          isSaleActive,
          announcementText,
          promoCode: promoCode.trim().toUpperCase(),
          discountPercentage: Number(discountPercentage),
          heroTitle: heroTitle.trim(),
          heroSubtitle: heroSubtitle.trim()
        },
        { headers }
      );

      setIsSaleActive(res.data.isSaleActive);
      setAnnouncementText(res.data.announcementText);
      setPromoCode(res.data.promoCode || '');
      setDiscountPercentage(res.data.discountPercentage || 0);
      setHeroTitle(res.data.heroTitle || '');
      setHeroSubtitle(res.data.heroSubtitle || '');

      setMessage('Store settings updated successfully!');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err.response?.data?.message || 'Failed to update store settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-stone-200 w-1/4 rounded-sm" />
        <div className="h-64 bg-stone-200 rounded-sm" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left font-body">
      
      {/* Title */}
      <div>
        <h1 className="font-heading text-3xl font-light tracking-wider text-[#111111] uppercase">
          Store Settings
        </h1>
        <p className="mt-1 text-xs text-[#707070] tracking-wider uppercase">
          Manage homepage banners, header announcements, and festive discounts
        </p>
      </div>

      {message && (
        <div className="bg-emerald-50 border border-emerald-250 p-4 text-xs font-semibold text-emerald-800 flex items-center space-x-2 rounded-xs">
          <CheckCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 p-4 text-xs font-semibold text-[#E07A5F] flex items-center space-x-2 rounded-xs">
          <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-stone-200 p-8 sm:p-10 space-y-8 shadow-xs">
        
        {/* SECTION 1: FESTIVE SALE CONTROLS */}
        <div className="space-y-6">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase pb-2 border-b border-stone-100 flex items-center justify-between">
            <span>Festive Season Promotion</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-xs uppercase ${
              isSaleActive ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-stone-100 text-stone-500'
            }`}>
              {isSaleActive ? 'Active' : 'Inactive'}
            </span>
          </h3>

          <div className="flex items-center space-x-3.5 py-2">
            <input
              type="checkbox"
              id="isSaleActive"
              checked={isSaleActive}
              onChange={(e) => setIsSaleActive(e.target.checked)}
              className="h-4 w-4 rounded-xs border-stone-300 text-[#7A624E] focus:ring-[#7A624E] cursor-pointer accent-[#7A624E]"
            />
            <label htmlFor="isSaleActive" className="text-xs font-semibold text-[#111111] uppercase tracking-wider cursor-pointer select-none">
              Activate Festive Sale Mode
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Promo Code / Coupon</label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="e.g. FESTIVE20"
                className="mt-1.5 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-xs focus:border-[#7A624E] focus:outline-none transition-colors uppercase font-bold tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Discount Percentage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                className="mt-1.5 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-xs focus:border-[#7A624E] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: TOP ANNOUNCEMENT BANNER */}
        <div className="space-y-6">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase pb-2 border-b border-stone-100">
            Header Notice Bar
          </h3>
          <div>
            <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Announcement Text</label>
            <input
              type="text"
              required
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              placeholder="e.g. Free Shipping & Delivery All Over India"
              className="mt-1.5 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-xs focus:border-[#7A624E] focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* SECTION 3: HOME HERO CONFIG */}
        <div className="space-y-6">
          <h3 className="font-heading text-sm font-semibold tracking-wider text-[#111111] uppercase pb-2 border-b border-stone-100">
            Homepage Hero Banner
          </h3>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Hero Title</label>
              <input
                type="text"
                required
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                placeholder="e.g. Shivang's Bags Collection"
                className="mt-1.5 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-xs focus:border-[#7A624E] focus:outline-none transition-colors uppercase font-bold tracking-wider"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">Hero Subtitle</label>
              <input
                type="text"
                required
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                placeholder="e.g. Your Perfect Travel & Style Companion"
                className="mt-1.5 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-xs focus:border-[#7A624E] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-4 border-t border-stone-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 bg-[#111111] hover:bg-[#7A624E] text-[#FFFDFB] px-8 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-300 rounded-xs disabled:opacity-50"
          >
            <Save className="h-4.5 w-4.5 stroke-[1.5]" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

export default StoreSettings;
