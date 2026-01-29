
import React from 'react';
import { Link } from 'react-router-dom';
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/downscalederm-logo.png" 
              alt="Downscale Derm" 
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
               </NavigationMenuItem>
               <NavigationMenuItem>
                 <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                   <Link to="/all-services">Services</Link>
                 </NavigationMenuLink>
               </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/blog">Blog</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/pricing">Pricing</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to="/common-questions">FAQ</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
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
                  Book a Consultation
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
              <Link
                to="/"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
               <Link
                 to="/all-services"
                 className="block py-2 text-foreground hover:text-primary transition-colors"
                 onClick={() => setMobileMenuOpen(false)}
               >
                 Services
               </Link>
              <Link
                to="/blog"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                to="/pricing"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                to="/common-questions"
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </Link>
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
                      Book a Consultation
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
