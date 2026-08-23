import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';

const AdminLogin = () => {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await adminLogin(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/admin/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#111111] px-4 font-body">
      <div className="w-full max-w-md space-y-8 border border-stone-800 bg-[#161616] p-8 sm:p-10 text-white shadow-2xl">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-stone-900 border border-stone-800 mb-4">
            <ShieldCheck className="h-6 w-6 text-[#C5A880] stroke-[1.5]" />
          </div>
          <h2 className="font-heading text-2xl font-semibold tracking-widest uppercase text-white">
            Shivang's Bags
          </h2>
          <p className="mt-2 text-[10px] tracking-widest text-stone-400 uppercase font-semibold">
            Administrative Control Panel Gate
          </p>
        </div>

        {error && (
          <div className="bg-[#E07A5F]/15 border border-[#E07A5F] p-3 text-center text-xs text-[#E07A5F]">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="text-left">
              <label htmlFor="email-address" className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                Admin Email Address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 block w-full border border-stone-800 bg-stone-900 px-3 py-3 text-sm text-white focus:border-[#7A624E] focus:outline-none transition-colors"
                placeholder="s3bagscollection@gmail.com"
              />
            </div>

            <div className="text-left relative">
              <label htmlFor="password" className="block text-[10px] font-bold tracking-widest text-stone-400 uppercase">
                Secure Password
              </label>
              <div className="relative mt-1.5">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full border border-stone-800 bg-stone-900 px-3 py-3 pr-10 text-sm text-white focus:border-[#7A624E] focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center bg-[#7A624E] py-4 text-xs font-semibold tracking-widest text-[#FFFDFB] uppercase hover:bg-[#5f4b3c] focus:outline-none disabled:opacity-50 transition-all duration-300"
            >
              {loading ? 'Authenticating...' : 'Enter Dashboard'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
