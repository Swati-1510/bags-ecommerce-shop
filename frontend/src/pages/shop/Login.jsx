import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../../context/AuthContext';
import axios from 'axios';
import GoogleAuthButton from '../../components/GoogleAuthButton';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login, setSession } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // Step 1: Login, Step 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/shop');
    } else {
      if (res.requireOtp) {
        setStep(2);
        setEmail(res.email);
        setMessage(res.message || 'OTP verification code sent to your email.');
      } else {
        setError(res.message);
      }
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/auth/verify-otp`, { email, otp });
      const { token: userToken, ...userData } = res.data;
      setSession(userData, userToken);
      navigate('/shop');
    } catch (err) {
      console.error('OTP verification failed:', err);
      setError(err.response?.data?.message || 'Invalid OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResending(true);
    setError('');
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE}/auth/resend-otp`, { email });
      setMessage(res.data.message || 'New OTP sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-[#FFFDFB] px-4 py-12 sm:px-6 lg:px-8 font-body">
      <div className="w-full max-w-md space-y-8 border border-stone-200 p-8 sm:p-10 bg-white shadow-xs">
        
        {step === 1 ? (
          <>
            <div className="text-center">
              <h2 className="font-heading text-3xl font-semibold tracking-widest text-[#111111] uppercase">
                Sign In
              </h2>
              <p className="mt-2 text-xs tracking-wider text-[#707070] uppercase">
                Access your luxury collection portal
              </p>
            </div>

            {error && (
              <div className="bg-[#E07A5F]/10 border border-[#E07A5F] p-3 text-center text-xs text-[#E07A5F]">
                {error}
              </div>
            )}

            {/* Google Sign In */}
            <div className="pt-2">
              <GoogleAuthButton text="Sign in with Google" />
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-stone-200"></div>
              <span className="flex-shrink mx-4 text-[10px] text-stone-400 font-bold uppercase tracking-widest">or sign in with email</span>
              <div className="flex-grow border-t border-stone-200"></div>
            </div>

            <form className="space-y-6 font-body" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 text-sm text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="block text-xs font-semibold tracking-wider text-[#111111] uppercase">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full border border-stone-200 bg-[#FFFDFB] px-3 py-3 pr-10 text-sm text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-stone-500 hover:text-[#111111]"
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
                  className="flex w-full justify-center bg-[#7A624E] py-4 text-xs font-semibold tracking-widest text-white uppercase hover:bg-[#5f4b3c] focus:outline-none disabled:opacity-50 transition-all duration-300 rounded-xs"
                >
                  {loading ? 'Verifying...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="text-center mt-6 font-body text-xs text-[#707070] tracking-wide">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#111111] hover:text-[#7A624E] underline transition-colors">
                Register Here
              </Link>
            </div>
          </>
        ) : (
          /* STEP 2: OTP VERIFICATION STEP */
          <div className="space-y-6 text-center">
            <div>
              <span className="text-2xl">✉️</span>
              <h2 className="font-heading text-2xl font-semibold tracking-widest text-[#111111] uppercase mt-2">
                Verify Email Address
              </h2>
              <p className="mt-2 text-xs tracking-wider text-[#707070]">
                We sent a 6-digit OTP code to <br/>
                <span className="font-semibold text-[#111111]">{email}</span>
              </p>
            </div>

            {message && (
              <div className="bg-emerald-50 border border-emerald-250 p-3 text-center text-xs font-semibold text-emerald-800 rounded-xs">
                {message}
              </div>
            )}

            {error && (
              <div className="bg-[#E07A5F]/10 border border-[#E07A5F] p-3 text-center text-xs text-[#E07A5F] rounded-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#111111] uppercase mb-2">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full text-center border-2 border-stone-200 bg-[#FFFDFB] py-3 text-2xl font-bold tracking-[0.4em] text-[#111111] focus:border-[#7A624E] focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="flex w-full justify-center bg-[#111111] py-4 text-xs font-semibold tracking-widest text-white uppercase hover:bg-[#7A624E] focus:outline-none disabled:opacity-50 transition-all duration-300 rounded-xs"
              >
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-[#707070]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="hover:text-[#111111] underline uppercase text-[10px] tracking-wider font-semibold"
              >
                ← Back to Login
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
                className="text-[#7A624E] font-semibold hover:underline uppercase text-[10px] tracking-wider disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend OTP Code'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
