import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { WaitlistDialog } from '@/components/ui/waitlist-dialog';

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900">
      <div className="container mx-auto px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <img 
            src="/jbsaaslogo.png" 
            alt="JB SAAS Logo" 
            className="h-8 w-auto"
          />
          <span className="text-white text-xl font-semibold">
            JB-SaaS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2 bg-slate-800/50 px-2 py-2 rounded-full">
          <Link to="/" className="px-4 py-2 text-white/90 hover:text-white hover:bg-slate-700 rounded-full transition-all duration-200 text-sm font-medium">
            Home
          </Link>
          <Link to="/australian-services" className="px-4 py-2 text-white/90 hover:text-white hover:bg-slate-700 rounded-full transition-all duration-200 text-sm font-medium">
            Services
          </Link>
          <Link to="/blog" className="px-4 py-2 text-white/90 hover:text-white hover:bg-slate-700 rounded-full transition-all duration-200 text-sm font-medium bg-slate-700">
            Blog
          </Link>
          <Link to="/pricing" className="px-4 py-2 text-white/90 hover:text-white hover:bg-slate-700 rounded-full transition-all duration-200 text-sm font-medium">
            Pricing
          </Link>
          <Link to="/common-questions" className="px-4 py-2 text-white/90 hover:text-white hover:bg-slate-700 rounded-full transition-all duration-200 text-sm font-medium">
            FAQ
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-3">
          <WaitlistDialog>
            <Button variant="ghost" className="text-white hover:bg-slate-800 rounded-full px-6 py-2 text-sm font-medium">
              Login
            </Button>
          </WaitlistDialog>
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
            <Link 
              to="/" 
              className="px-4 py-2 text-white hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/australian-services" 
              className="px-4 py-2 text-white hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link 
              to="/blog" 
              className="px-4 py-2 text-white hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/pricing" 
              className="px-4 py-2 text-white hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              to="/common-questions" 
              className="px-4 py-2 text-white hover:bg-slate-800 rounded transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <div className="flex flex-col space-y-2 pt-4 border-t border-slate-800">
              <WaitlistDialog>
                <Button variant="ghost" className="text-white hover:bg-slate-800 w-full justify-start">
                  Login
                </Button>
              </WaitlistDialog>
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