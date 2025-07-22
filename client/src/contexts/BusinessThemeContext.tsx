import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useBusinessProfileContext } from '@/contexts/BusinessProfileContext';

interface BusinessTheme {
  primary: string;
  secondary: string;
  accent: string;
}

interface BusinessThemeContextType {
  theme: BusinessTheme;
  applyTheme: (colors: BusinessTheme) => void;
  resetTheme: () => void;
}

const defaultTheme: BusinessTheme = {
  primary: '#3b82f6',
  secondary: '#64748b', 
  accent: '#f59e0b',
};

const BusinessThemeContext = createContext<BusinessThemeContextType | undefined>(undefined);

export const useBusinessTheme = () => {
  const context = useContext(BusinessThemeContext);
  if (context === undefined) {
    throw new Error('useBusinessTheme must be used within a BusinessThemeProvider');
  }
  return context;
};

interface BusinessThemeProviderProps {
  children: ReactNode;
}

export const BusinessThemeProvider: React.FC<BusinessThemeProviderProps> = ({ children }) => {
  const { activeProfile } = useBusinessProfileContext();
  const [theme, setTheme] = React.useState<BusinessTheme>(defaultTheme);

  // Update theme when active profile changes
  useEffect(() => {
    if (activeProfile?.brand_colors) {
      const brandColors = activeProfile.brand_colors as any;
      setTheme({
        primary: brandColors.primary || defaultTheme.primary,
        secondary: brandColors.secondary || defaultTheme.secondary,
        accent: brandColors.accent || defaultTheme.accent,
      });
    } else {
      setTheme(defaultTheme);
    }
  }, [activeProfile]);

  // Apply theme to CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    
    // Convert hex to HSL for CSS custom properties
    const hexToHsl = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;

      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
    };

    // Apply business-specific theme colors
    root.style.setProperty('--business-primary', hexToHsl(theme.primary));
    root.style.setProperty('--business-secondary', hexToHsl(theme.secondary));
    root.style.setProperty('--business-accent', hexToHsl(theme.accent));
    
    // Update primary color to business primary for consistent theming
    root.style.setProperty('--primary', hexToHsl(theme.primary));
    root.style.setProperty('--accent', hexToHsl(theme.accent));
  }, [theme]);

  const applyTheme = (colors: BusinessTheme) => {
    setTheme(colors);
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
  };

  const contextValue: BusinessThemeContextType = {
    theme,
    applyTheme,
    resetTheme,
  };

  return (
    <BusinessThemeContext.Provider value={contextValue}>
      {children}
    </BusinessThemeContext.Provider>
  );
};