import Link from 'next/link';
import { Github, Heart } from 'lucide-react';

const XLogo = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  // Added relative z-50 to ensure it sits ON TOP of fixed page backgrounds
  return (
    <footer className="relative z-50 border-t border-slate-200 dark:border-[#2f3336] bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        
        {/* Top Section */}
        <div className="flex flex-col gap-6 mb-12">
            <div>
                <h2 className="text-2xl font-bold mb-2">X Profile Cards</h2>
                <p className="text-slate-500 dark:text-[#71767b]">Transform any X profile into stunning, shareable cards.</p>
            </div>
            <div className="flex gap-3">
                <Link 
                  href="https://github.com/iamvibecoding" 
                  target="_blank" 
                  className="p-3 bg-white dark:bg-[#16181c] rounded-full shadow-sm border border-slate-200 dark:border-[#2f3336] hover:scale-105 transition-transform"
                >
                    <Github className="w-5 h-5" />
                </Link>
                <Link 
                  href="https://x.com/iamvibecoder" 
                  target="_blank" 
                  className="p-3 bg-white dark:bg-[#16181c] rounded-full shadow-sm border border-slate-200 dark:border-[#2f3336] hover:scale-105 transition-transform"
                >
                    <XLogo className="w-5 h-5" />
                </Link>
            </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-[#2f3336] w-full mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500 dark:text-[#71767b]">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <p>© {currentYear} X Profile Cards. All rights reserved.</p>
                <div className="flex gap-4">
                    <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy</Link>
                    <Link href="/license" className="hover:text-slate-900 dark:hover:text-white transition-colors">License</Link>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500 mx-1" />
                <span>by</span>
                <Link href="https://x.com/iamvibecoder" className="font-semibold text-slate-900 dark:text-white hover:underline">Siddhesh</Link>
            </div>
        </div>

      </div>
    </footer>
  );
}