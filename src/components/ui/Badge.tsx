interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}
