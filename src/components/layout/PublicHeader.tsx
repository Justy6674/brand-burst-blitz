import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { WaitlistDialog } from '@/components/ui/waitlist-dialog';

const PublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-slate-900 border-b border-slate-800">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/jbsaaslogo.png" 
            alt="JB SAAS Logo" 
            className="h-8 w-auto"
          />
          <span className="text-white text-xl font-bold">
            JB-SaaS
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <Link to="/" className="px-4 py-2 text-white hover:bg-slate-800 rounded-full transition-colors">
            Home
          </Link>
          <Link to="/australian-services" className="px-4 py-2 text-white hover:bg-slate-800 rounded-full transition-colors">
            Services
          </Link>
          <Link to="/blog" className="px-4 py-2 text-white hover:bg-slate-800 rounded-full transition-colors">
            Blog
          </Link>
          <Link to="/pricing" className="px-4 py-2 text-white hover:bg-slate-800 rounded-full transition-colors">
            Pricing
          </Link>
          <Link to="/common-questions" className="px-4 py-2 text-white hover:bg-slate-800 rounded-full transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center space-x-4">
          <WaitlistDialog>
            <Button variant="ghost" className="text-white hover:bg-slate-800">
              Login
            </Button>
          </WaitlistDialog>
          <WaitlistDialog>
            <Button className="bg-gradient-to-r from-purple-500 to-cyan-400 hover:from-purple-600 hover:to-cyan-500 text-white px-6 py-2 rounded-full font-medium">
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