import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface PixelCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'panel';
  delay?: number;
}

export const PixelCard = ({
  children,
  className = '',
  variant = 'default',
  delay = 0,
}: PixelCardProps) => {
  const variantStyles = {
    default: 'pixel-card',
    panel: 'pixel-panel',
  };

  return (
    <motion.div
      className={`${variantStyles[variant]} ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay }}
    >
      {children}
    </motion.div>
  );
};
