import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { WaitlistDialog } from '@/components/ui/waitlist-dialog';

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/blog', label: 'Blog' },
    { path: '/pricing', label: 'Pricing' },
    { path: '/common-questions', label: 'FAQ' }
  ];

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const getNavLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-2 rounded-full transition-all duration-200 text-sm font-medium";
    const isActive = isActivePath(path);
    
    if (isActive) {
      return `${baseClasses} bg-slate-700 text-white`;
    }
    return `${baseClasses} text-white/90 hover:text-white hover:bg-slate-700`;
  };

  const getMobileNavLinkClasses = (path: string) => {
    const baseClasses = "px-4 py-2 rounded transition-colors";
    const isActive = isActivePath(path);
    
    if (isActive) {
      return `${baseClasses} bg-slate-700 text-white`;
    }
    return `${baseClasses} text-white hover:bg-slate-800`;
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
          <img 
            src="/lovable-uploads/42e98c4f-c6ed-4a73-b8db-79fef687b3fe.png" 
            alt="jbhealth.health Logo" 
            className="h-10 w-auto"
          />
          <span className="text-white text-xl font-semibold whitespace-nowrap">
            jbhealth.health
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 bg-slate-800/50 px-2 py-2 rounded-full">
          {navigationItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={getNavLinkClasses(item.path)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <Link to="/auth">
            <Button variant="ghost" className="text-white hover:bg-slate-800 rounded-full px-6 py-2 text-sm font-medium">
              Login
            </Button>
          </Link>
          <WaitlistDialog>
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 text-white px-6 py-2 rounded-full font-medium text-sm shadow-lg">
              Join Healthcare Professionals Waitlist
            </Button>
          </WaitlistDialog>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800">
          <nav className="container py-4 flex flex-col space-y-2">
            {navigationItems.map((item) => (
              <Link 
                key={item.path}
                to={item.path} 
                className={getMobileNavLinkClasses(item.path)}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            <div className="flex flex-col space-y-2 pt-4 border-t border-slate-800">
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="text-white hover:bg-slate-800 w-full justify-start">
                  Login
                </Button>
              </Link>
              <WaitlistDialog>
                <Button className="bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 text-white w-full">
                  Join Healthcare Professionals Waitlist
                </Button>
              </WaitlistDialog>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default PublicHeader;