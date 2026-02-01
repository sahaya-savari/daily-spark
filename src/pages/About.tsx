import { ArrowLeft, Github, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BottomNav } from '@/components/BottomNav';
import { APP_NAME, APP_VERSION, APP_DESCRIPTION } from '@/lib/constants';
import { Button } from '@/components/ui/button';

const About = () => {
  return (
    <div className="min-h-screen bg-background pb-nav">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card border-b border-border safe-top">
        <div className="content-width px-4 py-4 flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-bold">About</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="content-width px-4 py-8 space-y-8">
        {/* App Section */}
        <section className="space-y-4">
          <div className="text-center space-y-3">
            <div className="w-20 h-20 mx-auto rounded-2xl fire-gradient flex items-center justify-center">
              <span className="text-4xl">🔥</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground">{APP_NAME}</h2>
            <p className="text-sm font-medium text-primary">v{APP_VERSION}</p>
          </div>

          <p className="text-center text-muted-foreground text-base leading-relaxed">
            {APP_DESCRIPTION}
          </p>
        </section>

        {/* Purpose */}
        <section className="space-y-3 bg-muted/50 rounded-xl p-4">
          <h3 className="font-semibold text-foreground">Why Daily Spark?</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Building habits is hard. Daily Spark makes it simple by giving you a visual way to track your daily streaks and celebrate your consistency. Never break the chain.
          </p>
        </section>

        {/* Features */}
        <section className="space-y-3">
          <h3 className="font-semibold text-foreground">Features</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Track multiple streaks simultaneously</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>View calendar with habit history</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Works completely offline</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Backup and restore your data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Share your streaks with friends</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">✓</span>
              <span>Customizable reminders and dark mode</span>
            </li>
          </ul>
        </section>

        {/* Creator */}
        <section className="space-y-4 border-t border-border pt-6">
          <h3 className="font-semibold text-foreground">Creator</h3>

          <div className="space-y-3">
            <div>
              <p className="font-medium text-foreground">Sahaya Savari</p>
              <p className="text-sm text-muted-foreground">Full Stack Developer & Student</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Passionate about building practical, user-friendly tools that solve real problems. Currently exploring React, PWAs, and modern web development. Daily Spark is a passion project demonstrating full-stack capabilities.
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              <a
                href="https://github.com/sahaya-savari"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                GitHub Profile
              </a>
              <a
                href="https://github.com/sahaya-savari/daily-spark"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors text-sm"
              >
                <Github className="w-4 h-4" />
                Repository
              </a>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="space-y-3 border-t border-border pt-6">
          <h3 className="font-semibold text-foreground">Built With</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="space-y-1">
              <p className="font-medium text-foreground">Frontend</p>
              <ul className="text-muted-foreground space-y-0.5">
                <li>React 18</li>
                <li>TypeScript</li>
                <li>Vite</li>
              </ul>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Styling & PWA</p>
              <ul className="text-muted-foreground space-y-0.5">
                <li>Tailwind CSS</li>
                <li>shadcn/ui</li>
                <li>Vite PWA</li>
              </ul>
            </div>
          </div>
        </section>

        {/* License */}
        <section className="space-y-3 border-t border-border pt-6 pb-4">
          <h3 className="font-semibold text-foreground">License</h3>
          <p className="text-sm text-muted-foreground">
            This project is open source and available under the{' '}
            <a
              href="https://github.com/sahaya-savari/daily-spark/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              MIT License
            </a>
            .
          </p>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default About;
