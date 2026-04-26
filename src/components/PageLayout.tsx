import { ReactNode } from 'react';
import { FABMenu } from "./ui/FABMenu";
import FABAction from "./ui/FABAction";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  headerContent?: ReactNode;
  contentWidth?: "default" | "wide";
}

export const PageLayout = ({
  children,
  title,
  headerContent,
  contentWidth = "default",
}: PageLayoutProps) => {
  const hasHeader = Boolean(title || headerContent);
  const contentClassName =
    contentWidth === "wide" ? "max-w-4xl" : "max-w-lg";

  return (
    <div className={`min-h-screen bg-background text-foreground pb-24 relative overflow-x-hidden ${hasHeader ? "pt-32" : "pt-6"}`}>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,_rgba(157,168,185,0.18),_transparent_60%)]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(157,168,185,0.12),_transparent_70%)] blur-2xl" />
      </div>
      {hasHeader && (
        <header className="header-gradient text-primary px-4 pt-4 pb-4 safe-top fixed top-0 left-0 right-0 z-40 border-b border-border/70 backdrop-blur-xl">

  <div className={`${contentClassName} mx-auto flex flex-col items-center text-center app-panel px-5 py-4 surface-soft`}>

    {title && (
      <h1 className="text-lg sm:text-xl font-semibold leading-tight tracking-[0.02em]">
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
      <main className={`px-4 py-5 ${contentClassName} mx-auto animate-fade-in`}>
        {children}
      </main>
      <FABAction />
      <FABMenu />
    </div>
  );
};
