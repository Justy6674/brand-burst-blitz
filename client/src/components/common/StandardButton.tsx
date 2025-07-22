import { Button } from "@/components/ui/button";
import { WaitlistDialog } from "./WaitlistDialog";
import { useScrollToPricing } from "@/hooks/useScrollToPricing";
import { ButtonHTMLAttributes } from "react";

interface StandardButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  action: 'waitlist' | 'pricing';
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'default' | 'lg' | 'xl';
  children: React.ReactNode;
  className?: string;
}

export const StandardButton = ({ 
  action, 
  variant = 'primary', 
  size = 'xl',
  children, 
  className,
  ...props 
}: StandardButtonProps) => {
  const { scrollToPricing } = useScrollToPricing();

  const buttonVariant = variant === 'primary' ? 'hero' : 'outline-white';
  const buttonClasses = `${size === 'xl' ? 'text-lg md:text-xl px-8 md:px-12 py-4 md:py-6' : ''} w-full sm:w-auto ${className || ''}`;

  if (action === 'waitlist') {
    return (
      <WaitlistDialog>
        <Button 
          variant={buttonVariant} 
          size={size} 
          className={buttonClasses}
          {...props}
        >
          {children}
        </Button>
      </WaitlistDialog>
    );
  }

  return (
    <Button 
      variant={buttonVariant} 
      size={size} 
      className={buttonClasses}
      onClick={scrollToPricing}
      {...props}
    >
      {children}
    </Button>
  );
};