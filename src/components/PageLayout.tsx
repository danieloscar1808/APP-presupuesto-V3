import { ReactNode } from 'react';
import { BottomNavigation } from './BottomNavigation';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  headerContent?: ReactNode;
}

export const PageLayout = ({ children, title, headerContent }: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background pt-14 pb-20">
      {(title || headerContent) && (
        <header className="header-gradient text-primary-foreground px-4 pt-4 pb-3 safe-top fixed top-0 left-0 right-0 z-40">

  <div className="max-w-lg mx-auto flex flex-col items-center text-center">

    {title && (
      <h1 className="text-lg sm:text-xl font-semibold leading-tight">
        {title}
      </h1>
    )}

    {headerContent && (
      <div>
        {headerContent}
      </div>
    )}

  </div>

</header>
      )}
      <main className="px-4 py-4 max-w-lg mx-auto animate-fade-in">
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
};
