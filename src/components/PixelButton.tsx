import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PixelButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const PixelButton = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
}: PixelButtonProps) => {
  const baseStyles = 'font-pixel uppercase tracking-wider transition-all duration-75 select-none';
  
  const sizeStyles = {
    sm: 'px-4 py-1 text-pixel-sm border-2',
    md: 'px-6 py-2 text-pixel-base border-4',
    lg: 'px-8 py-3 text-pixel-lg border-4',
  };

  const variantStyles = {
    primary: 'pixel-button',
    secondary: 'pixel-button-secondary',
    ghost: 'bg-transparent border-2 border-border text-foreground hover:bg-muted hover:border-primary',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
};
