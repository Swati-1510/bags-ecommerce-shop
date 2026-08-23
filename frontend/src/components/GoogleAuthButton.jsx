import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth, API_BASE } from '../context/AuthContext';

const GoogleAuthButton = ({ text = "Continue with Google" }) => {
  const { setSession } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  const handleGoogleSuccess = async (googleUserObj) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/google`, googleUserObj);
      const { token: userToken, ...userData } = res.data;
      setSession(userData, userToken);
      navigate('/shop');
    } catch (err) {
      console.error('Google Auth Error:', err);
      setError(err.response?.data?.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            try {
              const base64Url = response.credential.split('.')[1];
              const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
              const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
              }).join(''));
              const payload = JSON.parse(jsonPayload);
              
              handleGoogleSuccess({
                email: payload.email,
                name: payload.name,
                googleId: payload.sub
              });
            } catch (e) {
              console.error('Error decoding Google credential:', e);
            }
          }
        });

        const btnContainer = document.getElementById('googleButtonDiv');
        if (btnContainer) {
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'continue_with'
          });
        }
      } catch (err) {
        console.error('Google GIS Init error:', err);
      }
    }
  }, [clientId]);

  const handleFallbackClick = () => {
    const testEmail = prompt("Enter your Gmail address to simulate Google Sign-In:", "customer@gmail.com");
    if (testEmail && testEmail.includes('@')) {
      const testName = testEmail.split('@')[0];
      handleGoogleSuccess({
        email: testEmail.toLowerCase(),
        name: testName.charAt(0).toUpperCase() + testName.slice(1),
        googleId: `google_mock_${Math.random().toString(36).substring(2, 11)}`
      });
    }
  };

  return (
    <div className="w-full space-y-2">
      {error && <p className="text-[10px] text-[#E07A5F] font-semibold text-center">{error}</p>}

      {clientId ? (
        <div id="googleButtonDiv" className="w-full flex justify-center min-h-[44px]"></div>
      ) : (
        <button
          type="button"
          onClick={handleFallbackClick}
          disabled={loading}
          className="w-full border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 py-3 px-4 font-body text-xs font-semibold uppercase tracking-wider flex items-center justify-center space-x-3 transition-colors rounded-xs shadow-2xs cursor-pointer"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Authenticating...' : text}</span>
        </button>
      )}
    </div>
  );
};

export default GoogleAuthButton;
