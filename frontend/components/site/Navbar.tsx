'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Github, Menu, X as CloseIcon } from 'lucide-react';
import { ThemeToggle } from '@/components/site/ThemeToggle';

const XLogo = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 shadow-sm'
            : 'bg-white/60 dark:bg-slate-950/60 backdrop-blur-md border-b border-transparent'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl tracking-tight"
          >
            <Image
              src="/logo.png"
              alt="X Profile Cards Logo"
              width={28}
              height={28}
              // FIX: Changed from rounded-full to rounded-md to match the logo shape
              className="rounded-md border border-slate-200"
            />
            {/* FIX: Replaced gradient with clean, solid text for a modern look */}
            <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
              X Profile Cards
            </span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/#how-it-works" className="hover:text-blue-600 transition-colors">
                    How it works
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/#tech" className="hover:text-blue-600 transition-colors">
                    Tech Stack
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden md:flex items-center gap-2">
            {/* FIX: Restored text to buttons for clarity */}
            <Button asChild variant="outline" size="sm" className="h-9">
              <Link href="https://github.com/iamvibecoding" target="_blank" rel="noreferrer">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-9 bg-black hover:bg-gray-900 text-white shadow-lg"
            >
              <Link href="https://x.com/iamvibecoder?s=21" target="_blank" rel="noreferrer">
                <XLogo className="mr-2 h-4 w-4" />
                Follow
              </Link>
            </Button>
            <ThemeToggle />
          </div>

          {/* Mobile controls */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 px-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800 shadow-xl">
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Link
                href="/#how-it-works"
                onClick={handleNavClick}
                className="px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600 transition-colors font-medium"
              >
                How it works
              </Link>
              <Link
                href="/#tech"
                onClick={handleNavClick}
                className="px-4 py-3 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-900 hover:text-blue-600 transition-colors font-medium"
              >
                Tech Stack
              </Link>

              <div className="border-t border-slate-200 dark:border-slate-800 my-2" />

              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link
                    href="https://github.com/iamvibecoding"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleNavClick}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View on GitHub
                  </Link>
                </Button>
                <Button
                  asChild
                  className="w-full justify-start bg-black hover:bg-gray-900 text-white"
                >
                  <Link
                    href="https://x.com/iamvibecoder?s=21"
                    target="_blank"
                    rel="noreferrer"
                    onClick={handleNavClick}
                  >
                    <XLogo className="mr-2 h-4 w-4" />
                    Follow on X
                  </Link>
                </Button>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}