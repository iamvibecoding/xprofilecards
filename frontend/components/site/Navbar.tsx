'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Github, Menu, X as CloseIcon, Coffee } from 'lucide-react';
import { ThemeToggle } from '@/components/site/ThemeToggle';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Helper to close menu when a link is clicked
  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-slate-200 dark:border-[#2f3336]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-6 lg:px-12">
          
          {/* Logo Area */}
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-full border border-slate-200 dark:border-slate-800 transition-transform group-hover:scale-105"
            />
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white hidden sm:block">
              X Profile Cards
            </span>
          </Link>

          {/* DESKTOP Actions (Visible only on Large screens lg: 1024px+) */}
          <div className="hidden lg:flex items-center gap-3">
             <nav className="flex items-center gap-6 mr-6 text-sm font-medium text-slate-600 dark:text-[#71767b]">
                <Link href="/#how-it-works" className="hover:text-black dark:hover:text-white transition-colors">How it works</Link>
                <Link href="https://github.com/iamvibecoding" target="_blank" className="hover:text-black dark:hover:text-white transition-colors">GitHub</Link>
             </nav>
            
            <div className="h-6 w-px bg-slate-200 dark:bg-[#2f3336]" />

            {/* Support Button (Desktop) */}
            <Button asChild size="sm" className="h-9 rounded-full bg-amber-400 hover:bg-amber-500 text-black font-bold px-4 shadow-sm border border-amber-500/50">
              <Link href="https://buymeacoffee.com/iamvibecoder" target="_blank">
                <Coffee className="mr-2 h-4 w-4" />
                Support
              </Link>
            </Button>

            {/* Follow Button (Desktop) */}
            <Button asChild size="sm" className="h-9 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 font-bold px-5">
              <Link href="https://x.com/iamvibecoder" target="_blank">
                Follow
              </Link>
            </Button>
            
            <ThemeToggle />
          </div>

          {/* MOBILE/TABLET Menu Toggle (Visible below lg: 1024px) */}
          <div className="lg:hidden flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-900 dark:text-white active:scale-95 transition-transform"
            >
              {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE/TABLET Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white dark:bg-black pt-24 px-6 lg:hidden animate-in slide-in-from-top-10 duration-200 flex flex-col h-[100dvh]">
           
           <nav className="flex flex-col gap-3 flex-1 mt-4">
              
              {/* Navigation Links - Centered */}
              <Button asChild variant="ghost" className="w-full justify-center text-lg font-medium h-12 rounded-xl" onClick={closeMenu}>
                <Link href="/#how-it-works">
                  How it works
                </Link>
              </Button>

              <Button asChild variant="ghost" className="w-full justify-center text-lg font-medium h-12 rounded-xl" onClick={closeMenu}>
                <Link href="https://github.com/iamvibecoding" target="_blank">
                  GitHub
                </Link>
              </Button>

              <div className="h-px w-full bg-slate-100 dark:bg-[#2f3336] my-4 opacity-50" />
              
              {/* Support Button - SOLID & TACTILE */}
              <Button asChild className="w-full justify-center text-base font-bold h-12 rounded-full bg-amber-400 hover:bg-amber-500 text-black shadow-sm" onClick={closeMenu}>
                <Link href="https://buymeacoffee.com/iamvibecoder" target="_blank">
                  <Coffee className="mr-2 h-5 w-5" />
                  Support on Buy Me a Coffee
                </Link>
              </Button>
              
              {/* Follow Button - SOLID & TACTILE */}
              <Button asChild className="w-full justify-center text-base font-bold h-12 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 shadow-sm" onClick={closeMenu}>
                <Link href="https://x.com/iamvibecoder" target="_blank">
                   <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                   Follow on X
                </Link>
              </Button>
           </nav>
           
           <div className="pb-12 text-center text-slate-400 text-xs tracking-widest uppercase opacity-60">
             Free Fast Simple
           </div>
        </div>
      )}
    </>
  );
}