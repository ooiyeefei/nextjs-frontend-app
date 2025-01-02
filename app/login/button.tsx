'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export function Button({ children, className, disabled, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={`flex items-center justify-between px-4 py-2 rounded-md bg-[#3b82f6] text-white w-full 
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'} 
      ${className}`}
    >
      {children}
    </button>
  );
}
