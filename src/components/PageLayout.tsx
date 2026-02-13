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
    <div className="min-h-screen bg-background pb-20">
      {(title || headerContent) && (
        <header className="header-gradient text-primary-foreground px-4 pt-4 pb-6 safe-top">
          <div className="max-w-lg mx-auto">
            {title && <h1 className="text-xl font-semibold">{title}</h1>}
            {headerContent}
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
