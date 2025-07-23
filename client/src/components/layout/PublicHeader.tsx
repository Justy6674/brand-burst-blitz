
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ComingSoonPopup } from '@/components/common/ComingSoonPopup';
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

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

  const getActiveNavStyle = (path: string) => {
    return isActivePath(path) 
      ? `${navigationMenuTriggerStyle()} bg-primary/20 text-primary font-medium` 
      : navigationMenuTriggerStyle();
  };

  const getMobileNavStyle = (path: string) => {
    const baseClasses = "block py-2 transition-colors";
    return isActivePath(path)
      ? `${baseClasses} text-primary font-medium bg-primary/10 px-3 rounded`
      : `${baseClasses} text-foreground hover:text-primary`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/jbsaaslogo.png" 
              alt="JB-SaaS" 
              className="h-8 w-auto"
            />
            <span className="hidden sm:block text-xl font-bold text-primary">
              JB-SaaS
            </span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.path}>
                  <NavigationMenuLink asChild className={getActiveNavStyle(item.path)}>
                    <Link to={item.path}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <Button variant="outline" asChild>
              <Link to="/auth">Login</Link>
            </Button>
            <ComingSoonPopup 
              trigger={
                <Button className="bg-gradient-primary text-primary-foreground px-6 py-2 font-semibold">
                  Join Healthcare Professionals Waitlist
                </Button>
              } 
            />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <nav className="px-4 py-4 space-y-4">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={getMobileNavStyle(item.path)}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/auth"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <div className="pt-4 border-t">
                <ComingSoonPopup 
                  trigger={
                    <Button className="w-full bg-gradient-primary text-primary-foreground font-semibold" onClick={() => setMobileMenuOpen(false)}>
                      Join Healthcare Professionals Waitlist
                    </Button>
                  } 
                />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default PublicHeader;
