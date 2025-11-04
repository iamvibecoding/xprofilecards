import Link from 'next/link';
import { Github, Heart } from 'lucide-react';

// X Logo Component
const XLogo = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Github, href: 'https://github.com/iamvibecoding', label: 'GitHub' },
    { icon: XLogo, href: 'https://x.com/iamvibecoder', label: 'X (Twitter)' },
  ];

  return (
    <footer className="relative mt-20 bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-950 rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-20" />
      </div>

      <div className="relative">
        <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto">
            
            <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-3">
                X Profile Cards
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mb-5">
                Transform any X profile into stunning, shareable cards.
              </p>

              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label }) => (
                  <Link
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-slate-800 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-110"
                    title={label}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <p>© {currentYear} X Profile Cards. All rights reserved.</p>
                <div className="flex gap-4">
                  <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    Privacy
                  </Link>
                  <Link href="/license" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    License
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>Built with</span>
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>by</span>
                <a
                  href="mailto:siddheshkamath40@gmail.com"
                  className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Siddhesh
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}