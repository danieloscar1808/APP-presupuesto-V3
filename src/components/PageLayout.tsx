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
    <div className="min-h-screen bg-background pt-16 pb-20">
      {(title || headerContent) && (
        <header className="header-gradient text-primary-foreground px-4 pt-4 pb-3 safe-top fixed top-0 left-0 right-0 z-40">
          <div className="max-w-lg mx-auto flex items-center justify-center text-center">
          {title && (
            <h1 className="text-xl font-semibold leading-tight text-center">
          {title}
          </h1>
        )}
          {headerContent && (
          <div className="flex-shrink-0">
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
