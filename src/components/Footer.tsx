import { APP_VERSION, APP_NAME } from '@/lib/constants';

export const Footer = () => {
  return (
    <footer className="mt-12 py-6 px-4 border-t border-border/50 text-center text-sm text-muted-foreground">
      <div className="content-width mx-auto space-y-2">
        <p>{APP_NAME} v{APP_VERSION}</p>
        <p>© 2026 Daily Spark. All rights reserved.</p>
      </div>
    </footer>
  );
};
