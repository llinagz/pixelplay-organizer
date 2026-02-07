import { forwardRef, InputHTMLAttributes } from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  ({ label, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-pixel-sm text-primary mb-2 uppercase tracking-wider">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`pixel-input w-full text-pixel-base ${className}`}
          {...props}
        />
      </div>
    );
  }
);

PixelInput.displayName = 'PixelInput';
