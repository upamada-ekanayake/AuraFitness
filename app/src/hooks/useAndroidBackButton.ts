import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App } from '@capacitor/app';

export function useAndroidBackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = async () => {
      if (location.pathname === '/' || location.pathname === '/auth') {
        // Exit app if on Dashboard or Auth page
        await App.exitApp();
      } else {
        // Navigate back otherwise
        navigate(-1);
      }
    };

    const listener = App.addListener('backButton', handleBackButton);

    return () => {
      void listener.then(l => l.remove());
    };
  }, [location, navigate]);
}
