interface LoadingScreenProps {
  message?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '7xl';
}

export const LoadingScreen = ({ message = 'Loading...', maxWidth = '4xl' }: LoadingScreenProps) => {
  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
    '7xl': 'max-w-7xl',
  }[maxWidth];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className={`${maxWidthClass} mx-auto`}>
        <div className="text-center py-12">
          <div className="text-xl text-gray-600">{message}</div>
        </div>
      </div>
    </div>
  );
};

