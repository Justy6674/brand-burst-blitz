import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, ChevronDown, Network, Eye } from 'lucide-react';
import { useState } from 'react';
import { WaitlistDialog } from '@/components/ui/waitlist-dialog';

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { path: '/', label: 'Home' },
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
          
          {/* Services Dropdown */}
          <div className="relative">
            <button
              className={`${getNavLinkClasses('/services')} flex items-center gap-1`}
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
              onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
            >
              Services
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {servicesDropdownOpen && (
              <div 
                className="absolute top-full left-0 mt-2 w-80 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50"
                onMouseEnter={() => setServicesDropdownOpen(true)}
                onMouseLeave={() => setServicesDropdownOpen(false)}
              >
                <div className="p-4">
                  <Link 
                    to="/services" 
                    className="block p-3 rounded-lg hover:bg-slate-700 transition-colors group"
                    onClick={() => setServicesDropdownOpen(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Menu className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white group-hover:text-blue-400">All Services</h3>
                        <p className="text-sm text-slate-400">Complete healthcare marketing platform</p>
                      </div>
                    </div>
                  </Link>
                  
                  <div className="border-t border-slate-700 mt-3 pt-3">
                    <div className="mb-2">
                      <span className="text-xs uppercase text-slate-400 font-semibold tracking-wide">🎯 FLAGSHIP SEO TOOLS</span>
                    </div>
                    
                    <Link 
                      to="/free-subdomain-analysis" 
                      className="block p-3 rounded-lg hover:bg-slate-700 transition-colors group"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-orange-400">Free Subdomain Analysis</h3>
                          <p className="text-sm text-slate-400">Discover competitor strategies - 60 seconds</p>
                        </div>
                      </div>
                    </Link>
                    
                    <Link 
                      to="/dashboard/seo-expansion" 
                      className="block p-3 rounded-lg hover:bg-slate-700 transition-colors group"
                      onClick={() => setServicesDropdownOpen(false)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Network className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white group-hover:text-indigo-400">Subdomain Intelligence</h3>
                          <p className="text-sm text-slate-400">Full competitor analysis & implementation</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
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
            
            {/* Mobile Services Section */}
            <div className="border-t border-slate-800 pt-4 mt-4">
              <div className="mb-2">
                <span className="text-xs uppercase text-slate-400 font-semibold tracking-wide px-4">SERVICES</span>
              </div>
              <Link 
                to="/services" 
                className={getMobileNavLinkClasses('/services')}
                onClick={() => setMobileMenuOpen(false)}
              >
                All Services
              </Link>
              
              <div className="ml-4 mt-2 space-y-1">
                <Link 
                  to="/free-subdomain-analysis" 
                  className="flex items-center gap-3 px-4 py-2 rounded transition-colors text-white hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Eye className="w-4 h-4 text-orange-400" />
                  Free Subdomain Analysis
                </Link>
                <Link 
                  to="/dashboard/seo-expansion" 
                  className="flex items-center gap-3 px-4 py-2 rounded transition-colors text-white hover:bg-slate-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Network className="w-4 h-4 text-indigo-400" />
                  Subdomain Intelligence
                </Link>
              </div>
            </div>
            
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