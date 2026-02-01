import { useEffect } from 'react';

/**
 * Dynamically tracks viewport height and updates CSS custom property.
 * Handles mobile keyboard opening/closing by using visualViewport API.
 * Falls back to window.innerHeight for older browsers.
 * 
 * Sets --app-vh CSS variable to 1% of current viewport height.
 * Use: height: calc(var(--app-vh, 1vh) * 100) instead of height: 100vh
 */
export const useViewportHeight = () => {
  useEffect(() => {
    const setViewportHeight = () => {
      // Use visualViewport for accurate mobile keyboard handling
      const height = window.visualViewport 
        ? window.visualViewport.height 
        : window.innerHeight;
      
      // Set CSS custom property: 1% of viewport height
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--app-vh', `${vh}px`);
    };

    // Set initial value
    setViewportHeight();

    // Listen to viewport changes (keyboard open/close, orientation change)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', setViewportHeight);
      window.visualViewport.addEventListener('scroll', setViewportHeight);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', setViewportHeight);
      window.addEventListener('orientationchange', setViewportHeight);
    }

    // Cleanup listeners
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', setViewportHeight);
        window.visualViewport.removeEventListener('scroll', setViewportHeight);
      } else {
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
      }
    };
  }, []);
};
