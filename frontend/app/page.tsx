'use client';

import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Link as LinkIcon, Download, Code, Zap, 
  Palette, ArrowRight, X, Terminal, ShieldCheck, Layers, Sparkles 
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- MOCK DEPENDENCIES TO ENSURE PREVIEW WORKS ---

// 1. Mock Themes
const themes = [
  { id: 'modern', name: 'Modern' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'dark', name: 'Midnight' },
  { id: 'glass', name: 'Glassmorphism' },
  { id: 'gradient', name: 'Gradient' },
  { id: 'retro', name: 'Retro 90s' }
];

// 2. Mock Toast
const showToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
  console.log(`[${type.toUpperCase()}] ${message}`);
  // In a real app, this would trigger a UI toast
};

// 3. Simplified CardItem Component (Inlined to avoid import error)
const CardItem = ({ data, theme }: { data: any, theme: any }) => {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Visual Preview of the Card */}
      <div 
        className={`w-full aspect-[1.91/1] p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-500
          ${theme.id === 'modern' ? 'bg-white border-2 border-slate-900 text-slate-900' : ''}
          ${theme.id === 'minimal' ? 'bg-zinc-50 border border-zinc-200 text-zinc-800' : ''}
          ${theme.id === 'dark' ? 'bg-black text-white border border-zinc-800' : ''}
          ${theme.id === 'glass' ? 'bg-white/10 backdrop-blur-md text-white border border-white/20' : ''}
          ${theme.id === 'gradient' ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white' : ''}
          ${theme.id === 'retro' ? 'bg-[#ff00ff] text-yellow-300 font-mono border-4 border-yellow-300' : ''}
          ${!['modern','minimal','dark','glass','gradient','retro'].includes(theme.id) ? 'bg-white text-black border border-slate-200' : ''}
        `}
      >
         <div className="flex items-start justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0">
                <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">{data.name}</h3>
                <p className="opacity-60 text-sm">@{data.handle}</p>
              </div>
            </div>
            {/* X Logo Mock */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-50" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
         </div>

         <div className="z-10 mt-auto">
            <p className="text-sm leading-relaxed opacity-90 mb-4 line-clamp-2">{data.bio}</p>
            <div className="flex gap-4 text-xs font-medium opacity-70">
              <span><span className="font-bold opacity-100">{data.followingCount}</span> Following</span>
              <span><span className="font-bold opacity-100">{data.followersCount}</span> Followers</span>
            </div>
         </div>
      </div>
      
      {/* Action Bar */}
      <div className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex gap-2">
        <button className="flex-1 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black text-xs font-bold flex items-center justify-center gap-2 hover:opacity-90">
           <Download className="w-3 h-3" /> Save
        </button>
      </div>
    </div>
  )
};

// --- END MOCKS ---

export interface ProfileData {
  name: string;
  handle: string;
  bio: string;
  avatarUrl: string;
  followingCount: string;
  followersCount: string;
  location: string | null;
  website: string | null;
}

// --- Specialized Components ---

const StepCard = memo(({ step, index }: { step: { icon: any; title: string; description: string }, index: number }) => {
  const Icon = step.icon;
  const isWide = index === 0 || index === 3; 
  
  return (
    <div className={`group relative p-8 rounded-3xl overflow-hidden border transition-all duration-300
      ${isWide 
        ? 'lg:col-span-2 bg-[#000] border-[#2f3336] text-white' 
        : 'bg-white dark:bg-[#000] border-slate-200 dark:border-[#2f3336] text-slate-900 dark:text-white hover:border-sky-500/50'
      }`}>
      
      {/* Noise Texture */}
      {isWide && (
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
      )}

      {/* Hover Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl blur opacity-0 group-hover:opacity-10 transition duration-500" />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-6 
            ${isWide ? 'bg-[#16181c] border border-[#2f3336]' : 'bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/30'}`}>
            <Icon className={`w-6 h-6 ${isWide ? 'text-white' : 'text-sky-500'}`} />
          </div>
          <h3 className="text-xl font-bold mb-3 tracking-tight">
            {step.title}
          </h3>
          <p className={`text-base leading-relaxed ${isWide ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {step.description}
          </p>
        </div>
        
        <div className="mt-8 flex items-center gap-2 text-[10px] font-mono opacity-40 uppercase tracking-[0.2em]">
          <span>0{index + 1}</span>
          <div className="h-px flex-1 bg-current" />
        </div>
      </div>
    </div>
  );
});
StepCard.displayName = 'StepCard';

const TechBadge = memo(({ tech }: { tech: { icon: any; title: string } }) => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-[#2f3336] bg-white/50 dark:bg-[#000] backdrop-blur-sm transition-transform hover:scale-105">
    <tech.icon className="w-4 h-4 text-sky-500" />
    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tech.title}</span>
  </div>
));
TechBadge.displayName = 'TechBadge';

const faqData = [
  { q: "Is this free to use?", a: "Yes. 100% free for personal use. Generate as many cards as you like." },
  { q: "Can I use this for my business?", a: "For commercial use, please contact us for a license agreement." },
  { q: "Why did the extraction fail?", a: "Ensure the profile is public. We cannot access private or age-restricted accounts." },
  { q: "How is my data handled?", a: "Privacy first. We process data in-memory and discard it immediately after generation." }
];

export default function Page() {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const validateAndNormalizeUrl = useCallback((inputUrl: string): { valid: boolean; error?: string; normalizedUrl?: string } => {
    if (!inputUrl.trim()) return { valid: false, error: 'Please enter a URL or handle' };
    let handle = inputUrl.trim();
    if (handle.startsWith('@')) handle = handle.substring(1);
    
    if (handle.startsWith('http')) {
      try {
        const urlObj = new URL(handle);
        if (!urlObj.hostname.includes('x.com') && !urlObj.hostname.includes('twitter.com')) {
          return { valid: false, error: 'Only x.com or twitter.com URLs allowed' };
        }
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        handle = pathParts[0] || '';
      } catch (e) {
        return { valid: false, error: 'Invalid URL format' };
      }
    }

    if (!/^[a-zA-Z0-9_]+$/.test(handle)) return { valid: false, error: 'Invalid characters in handle' };
    return { valid: true, normalizedUrl: `https://x.com/${handle}` };
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setProfileData(null);
    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid) {
      setError(validation.error ?? null);
      showToast(validation.error || 'Invalid URL', 'error');
      return;
    }

    setIsLoading(true);
    
    // Use timeout to simulate API if ENV not set
    setTimeout(() => {
        // MOCK DATA for preview purposes
        const mockData: ProfileData = {
            name: "Elon Musk",
            handle: "elonmusk",
            bio: "Read the instructions.",
            avatarUrl: "https://pbs.twimg.com/profile_images/1683325380441128960/yRsRRjGO_400x400.jpg",
            followingCount: "665",
            followersCount: "196.2M",
            location: "Texas",
            website: "x.com"
        };
        setProfileData(mockData);
        showToast('Profile extracted', 'success');
        setIsLoading(false);
        setTimeout(() => {
          document.getElementById('themes')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
    }, 1500);

  }, [url, validateAndNormalizeUrl]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim() && !isLoading) handleSubmit();
  }, [url, isLoading, handleSubmit]);

  const steps = useMemo(() => [
    { icon: LinkIcon, title: 'Input Link', description: 'Paste any X profile URL or @handle.' },
    { icon: Layers, title: 'Data Extraction', description: 'Real-time fetching of bio, stats, and high-res avatars.' },
    { icon: Palette, title: 'Theme Engine', description: 'Auto-generate 26+ variations instantly.' },
    { icon: Download, title: 'HD Export', description: 'Download crisp PNGs ready for social sharing.' },
  ], []);

  const techStack = useMemo(() => [
    { icon: Code, title: 'Next.js 14' },
    { icon: Zap, title: 'Tailwind' },
    { icon: Sparkles, title: 'Framer' },
    { icon: ShieldCheck, title: 'TypeScript' },
  ], []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen font-sans selection:bg-sky-500/30 bg-white dark:bg-black text-slate-900 dark:text-slate-100">
      
      <div className="fixed inset-0 z-0 bg-white dark:bg-black">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-sky-500/10 opacity-50 blur-[100px] pointer-events-none"></div>
      </div>

      {/* Adjusted padding for mobile: pt-20 (less space), pb-12 (less bottom space) */}
      <main className="relative z-10 w-full max-w-[1400px] mx-auto pt-20 sm:pt-32">
        
        <section className="px-6 lg:px-12 pb-12 md:pb-24 text-center">
          
        

          {/* Reduced mb-6 */}
          <div className="inline-flex items-center gap-3 px-5 py-2 mb-6 rounded-full border border-slate-200 dark:border-[#2f3336] bg-white/50 dark:bg-[#16181c]/50 backdrop-blur-xl shadow-lg hover:border-emerald-500/30 transition-colors cursor-default">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">
              <span>Modern Fast Free</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-sky-500">v1.0</span>
            </div>
          </div>
           {/* --- TinyLaunch Badge (Hero Position) --- */}
         {/* Reduced mb-6 for tighter mobile layout */}
          <div className="flex justify-center mb-6">
            <a 
              href="https://www.tinylaunch.com/launch/7469" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group relative transition-all duration-300 hover:scale-105"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <img 
                src="https://tinylaunch.com/tinylaunch_badge_live_now.svg" 
                alt="TinyLaunch Badge" 
                width="240" 
                height="80" 
                className="relative block h-14 w-auto shadow-sm"
              />
            </a>
          </div>
          {/* Main Landing Text: Reduced size on mobile (text-4xl) to improve flow, reduced mb-6 */}
          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white leading-[1.0] sm:leading-[0.9]">
            The new standard for <br className="hidden sm:block" />
            <span className="bg-gradient-to-br from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-500 bg-clip-text text-transparent">
              Profile Cards.
            </span>
          </h1>
          
          {/* Reduced mb-8 */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-[#71767b] max-w-2xl mx-auto mb-8 font-medium">
            Generate production-ready assets for your X brand. <br className="hidden sm:block" />
            Zero friction. 100% Free.
          </p>

          <div className="max-w-xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-white dark:bg-black rounded-full p-2 ring-1 ring-slate-200 dark:ring-[#2f3336] focus-within:ring-2 focus-within:ring-sky-500 transition-all shadow-xl">
              <div className="pl-4 text-slate-400">
                <LinkIcon className="w-5 h-5" />
              </div>
              <Input
                type="text"
                placeholder="x.com/username"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-lg h-12 placeholder:text-slate-400 dark:placeholder:text-[#71767b]"
              />
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !url.trim()}
                className="h-10 px-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-bold hover:bg-sky-600 dark:hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 inline-flex items-center gap-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/50">
              <Terminal className="w-4 h-4" />
              <span className="text-sm font-mono">{error}</span>
            </div>
          )}

          <div className="mt-12 flex flex-wrap justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
            {techStack.map((tech, i) => <TechBadge key={i} tech={tech} />)}
          </div>
        </section>

        {/* Cinematic Demo Preview - HIDDEN ON MOBILE (hidden md:block) */}
        <div className="relative px-6 lg:px-12 mb-16 md:mb-32 group perspective-1000 hidden md:block">
          <div className="relative max-w-[70%] mx-auto transition-transform duration-700 hover:scale-[1.01]">
            <div className="absolute inset-4 rounded-[40px] shadow-2xl shadow-sky-900/20 dark:shadow-sky-500/10 z-0"></div>
            {/* Switched to standard img tag to avoid Next.js Image error in loose mode */}
            <img
              src="/demo.png"
              alt="Demo"
              width={1200}
              height={660}
              className="relative z-10 w-full h-auto object-cover rounded-[32px] border border-slate-200/60 dark:border-white/10"
              draggable={false}
              onError={(e) => {
                  // Fallback if demo.png doesn't exist in environment
                  e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-sky-500 animate-spin mb-6" />
            <p className="text-slate-500 dark:text-[#71767b] font-mono animate-pulse tracking-widest uppercase text-sm">
              Connecting to Neural Net...
            </p>
          </div>
        )}

        {profileData && (
          <div id="themes" className="px-6 lg:px-12 mb-16 md:mb-32 scroll-mt-24">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4 border-b border-slate-200 dark:border-[#2f3336] pb-6">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Assets Ready</h2>
                <p className="text-slate-500 dark:text-[#71767b]">
                  Generated for <span className="text-sky-500 font-bold">@{profileData.handle}</span>
                </p>
              </div>
              <Button variant="ghost" onClick={() => { setProfileData(null); setUrl(''); }} className="gap-2 hover:bg-slate-100 dark:hover:bg-[#16181c]">
                <X className="w-4 h-4" /> Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {themes.map((theme) => (
                <div key={theme.id} className="group flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-widest">{theme.name}</span>
                  </div>
                  <div className="relative rounded-[20px] overflow-hidden shadow-sm border border-slate-200 dark:border-[#2f3336] bg-white dark:bg-[#000] transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:ring-1 group-hover:ring-sky-500/50">
                    <CardItem data={profileData} theme={theme} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- WORKFLOW SECTION --- */}
        <section className="bg-white dark:bg-black transition-colors duration-300">
           <div className="px-6 lg:px-12 py-12 md:py-24 border-t border-gray-200 dark:border-[#2f3336]">
            <div className="max-w-5xl mx-auto">
              <div className="mb-12 md:mb-16 max-w-3xl">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-4 text-black dark:text-white">
                  Workflow. <span className="text-gray-400 dark:text-gray-600">Simplified.</span>
                </h2>
                <p className="text-gray-600 dark:text-gray-500 text-sm md:text-base max-w-lg">
                  From URL to polished brand asset in seconds.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {steps.map((step, index) => (
                  <StepCard key={index} step={step} index={index} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="bg-white dark:bg-black transition-colors duration-300">
          <div className="px-6 lg:px-12 py-12 md:py-40 border-t border-gray-200 dark:border-[#2f3336]">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row gap-10 md:gap-16">
                
                {/* Header Section */}
                <div className="md:w-1/3 md:sticky md:top-24 md:self-start h-fit">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-black dark:text-white mb-4 md:mb-6">
                    Frequent <br className="hidden md:block" /> Questions
                  </h2>
                  <p className="text-gray-600 dark:text-gray-500 text-sm md:text-base">
                    Everything you need to know about the generator.
                  </p>
                </div>
                
                {/* Accordion Section */}
                <div className="md:w-2/3">
                  <Accordion type="single" collapsible className="w-full flex flex-col gap-4">
                    {faqData.map((item, i) => (
                      <AccordionItem 
                        key={i} 
                        value={`item-${i}`} 
                        className="border border-gray-200 dark:border-[#333] rounded-2xl overflow-hidden"
                      >
                        <AccordionTrigger 
                          className="px-6 w-full text-lg md:text-xl font-medium hover:no-underline py-6 md:py-8 text-black dark:text-white data-[state=open]:text-blue-600 dark:data-[state=open]:text-blue-400 text-left transition-colors duration-300 [&[data-state=open]>svg]:rotate-180"
                        >
                          <span className="pr-4">{item.q}</span>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 text-base md:text-lg text-gray-600 dark:text-gray-400 pb-6 md:pb-8 leading-relaxed">
                          {item.a}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}