'use client';

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { CardItem } from '@/components/CardItem';
import { themes, Theme } from '@/lib/themes';
import { Loader2, Link, Download, Code, Zap, Palette, Sparkles, ArrowRight } from 'lucide-react';
import { showToast } from '@/lib/toast';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- Type Definition ---
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

// --- Component Definition ---
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
    if (!inputUrl.trim()) {
      return { valid: false, error: 'Please enter a URL or handle' };
    }

    let handle = inputUrl.trim();

    if (handle.startsWith('@')) {
      handle = handle.substring(1);
    }
    
    if (handle.startsWith('http')) {
      try {
        const urlObj = new URL(handle);
        if (!urlObj.hostname.includes('x.com') && !urlObj.hostname.includes('twitter.com')) {
          return { valid: false, error: 'Please enter a valid X.com or Twitter.com URL' };
        }
        
        const pathParts = urlObj.pathname.split('/').filter(p => p);
        handle = pathParts[0] || ''; 

      } catch (e) {
        return { valid: false, error: 'Invalid format. Try: @iamvibecoder or iamvibecoder' };
      }
    }

    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      return { valid: false, error: 'Invalid handle format' };
    }

    if (handle.length < 1 || handle.length > 15) {
      return { valid: false, error: 'Handle must be 1-15 characters' };
    }

    const normalizedUrl = `https://x.com/${handle}`;
    return { valid: true, normalizedUrl };
  }, []);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setProfileData(null);

    const validation = validateAndNormalizeUrl(url);
    if (!validation.valid) {
      setError(validation.error ?? null);
      showToast(validation.error || 'Invalid URL', 'error', 3000);
      return;
    }

    setIsLoading(true);
    showToast('Fetching profile data...', 'loading', 3000); 

    const apiEndpoint = process.env.NEXT_PUBLIC_API_URL;

    if (!apiEndpoint) {
      console.error("API URL is not configured. NEXT_PUBLIC_API_URL is missing.");
      setError("App is not configured. Please contact support.");
      showToast("❌ App is not configured.", "error", 4000);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${apiEndpoint}/api/scrape-twitter`,
        { twitterUrl: validation.normalizedUrl },
        { timeout: 30000, headers: { 'Content-Type': 'application/json' } }
      );

      if (response.data) {
        setProfileData(response.data);
        showToast('✨ Profile loaded!', 'success', 2000);
      } else {
        setError('No profile data was found.');
        showToast('❌ No profile data was found.', 'error', 4000);
      }

    } catch (err: any | undefined) {
      console.error('API Error:', err);

      let errorMsg = 'Failed to scrape profile';
      
      if (err.response?.status === 400) {
        errorMsg = err.response?.data?.error || 'Invalid Twitter/X URL';
      } else if (err.response?.status === 500) {
        errorMsg = err.response?.data?.error || 'Could not load profile. Check if profile is public.';
      } else if (err.code === 'ECONNREFUSED') {
        errorMsg = '❌ Cannot connect to backend.';
      } else if (['ENOTFOUND', 'ERR_NAME_NOT_RESOLVED'].includes(err.code)) {
        errorMsg = '❌ Cannot reach backend. Check network.';
      } else if (['ETIMEDOUT', 'ECONNABORTED'].includes(err.code)) {
        errorMsg = '⏱️ Request timeout. The server is slow, try again.';
      } else if (err.message?.includes('Network Error')) {
        errorMsg = '❌ Network error. Check your connection or if the backend is down.';
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else {
        errorMsg = err.message || errorMsg;
      }

      setError(errorMsg);
      showToast(errorMsg, 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  }, [url, validateAndNormalizeUrl]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim() && !isLoading) {
      handleSubmit();
    }
  };

  // Updated steps data
  const steps = [
    { icon: Link, title: 'Input Link', description: 'Paste your X.com profile URL or just the @handle.' },
    { icon: Zap, title: 'Scrape Data', description: 'Our server instantly fetches all public profile data.' },
    { icon: Palette, title: 'Render Themes', description: 'Preview your card in 26+ unique designs.' },
    { icon: Download, title: 'Export PNG', description: 'Download high-quality PNGs to share anywhere.' },
  ];

  const techStack = [
    { icon: Code, title: 'Next.js 14', description: 'App Router with Server Components' },
    { icon: Zap, title: 'Tailwind CSS', description: 'Utility-first styling framework' },
    { icon: Download, title: 'html2canvas', description: 'DOM to Canvas/PNG conversion' },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* NOTE ON SEO: 
        Because this is a Client Component ('use client'), 
        you cannot export the 'metadata' object from this file.
        To add SEO tags (title, description), you must add them
        to your root 'app/layout.tsx' file.
      */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50 dark:from-slate-950 dark:via-slate-950 black:to-black">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808026_1px,transparent_1px),linear-gradient(to_bottom,#80808026_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob hidden sm:block" />
        <div className="absolute top-0 right-1/ar w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000 hidden sm:block" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-10 animate-blob animation-delay-4000 hidden sm:block" />
      </div>

      <div className="relative w-full">
        <section className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-sky-100/50 dark:bg-sky-900/50 backdrop-blur-sm border border-sky-200/50 dark:border-sky-800/50">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-medium text-sky-700 dark:text-sky-300">X Profile Cards</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 text-slate-900 dark:text-slate-100">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
              X Profile Cards
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
            Transform any X profile into beautiful, shareable cards with our <span className="font-semibold text-sky-600 dark:text-sky-400">100% free X profile card generator</span>. Choose from <span className="font-semibold text-sky-600 dark:text-sky-400">26+</span> premium themes.
          </p>
        </section>

        <div className="relative  px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-white-800 to-slate-300 rounded-2xl blur-lg" />
            
            <div className="relative bg-white dark:bg-slate-950/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white dark:border-slate-800 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-3 items-end">
                <div className="flex-1 w-full">
                  <Input
                    type="text"
                    placeholder="@iamvibecoder or https://x.com/iamvibecoder"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="h-12 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-sky-400 rounded-full text-base"
                  />
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !url.trim()}
                  className="h-12 px-8 w-full lg:w-auto bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 rounded-full font-semibold shadow-lg text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap text-white"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Generating
                    </>
                  ) : (
                    <>
                      Generate
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-300 p-3 rounded-lg border border-red-100 dark:border-red-900">
                  {error}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                Examples: @iamvibecoder · iamvibecoder · https://x.com/iamvibecoder
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:block px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-sky-600 dark:text-sky-400 mb-2">Endless Possibilities</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">See what you can create</h3>
          </div>
          
          <div className="relative h-96 flex items-center justify-center perspective pointer-events-none select-none">
            <Image
              src="/demo.png"
              alt="X Profile Cards Demo - Multiple theme examples"
              width={400}
              height={220}
              priority
              draggable={false}
              className="w-full h-auto max-w-4xl object-contain drop-shadow-2xl pointer-events-none select-none"
              style={{
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.1))',
                userSelect: 'none',
              }}
              unoptimized
            />
          </div>
        </div>

        {isLoading && (
          <div className="h-64 sm:h-96 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
            <Loader2 className="h-12 w-12 animate-spin text-sky-500 mb-4" />
            <p className="text-lg font-medium">Fetching profile data...</p>
          </div>
        )}

          {profileData && (
            <div id="themes" className="px-0 sm:px-6 lg:px-8 lg:px-12 mb-24 sm:mb-32"> 
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-slate-100">
                  Choose your style
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  Select from <span className="font-semibold text-sky-600 dark:text-sky-400">26+</span> professionally designed themes
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
                {themes.map((theme) => (
                  <div key={theme.id} className="group px-2 sm:px-0"> 
                    <h3 className="text-lg font-semibold mb-3 text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                      {theme.name}
                    </h3>
                    {/* Hover animation removed */}
                    <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl shadow-lg transition-all duration-300 overflow-hidden border border-white/40 dark:border-slate-800/40">
                      <CardItem data={profileData} theme={theme as Theme} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* --- 
          START: "HOW IT WORKS" BENTO GRID 
          --- */}
        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              How it works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Four simple steps to create your custom X profile card.
            </p>
          </div>
          
          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            
            {/* Step 1: Wide */}
            <div className="relative lg:col-span-2 p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl">
              <div className="absolute inset-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" 
                   style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23ffffff' d='M0 0h16v16H0z'/%3E%3C/svg%3E\")", backgroundSize: "32px 32px"}}>
              </div>
              <span className="absolute -top-4 -right-2 text-[8rem] font-bold text-white/10 select-none opacity-50">1</span>
              <div className="relative z-10">
                {(() => {
                  const Icon = steps[0].icon;
                  return <Icon className="w-10 h-10 text-white/80 mb-4" />;
                })()}
                <h3 className="text-2xl font-semibold mb-2 text-white">{steps[0].title}</h3>
                <p className="text-base text-sky-100">{steps[0].description}</p>
              </div>
            </div>

            {/* Step 2: Normal */}
            <div className="relative lg:col-span-1 p-8 rounded-3xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg">
              <span className="absolute -top-4 -right-2 text-[8rem] font-bold text-slate-500/10 dark:text-white/5 select-none opacity-50">2</span>
              <div className="relative z-10">
                {(() => {
                  const Icon = steps[1].icon;
                  return <Icon className="w-10 h-10 text-sky-600 dark:text-sky-400 mb-4" />;
                })()}
                <h3 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{steps[1].title}</h3>
                <p className="text-base text-slate-600 dark:text-slate-400">{steps[1].description}</p>
              </div>
            </div>

            {/* Step 3: Normal */}
            <div className="relative lg:col-span-1 p-8 rounded-3xl overflow-hidden bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg">
              <span className="absolute -top-4 -right-2 text-[8rem] font-bold text-slate-500/10 dark:text-white/5 select-none opacity-50">3</span>
              <div className="relative z-10">
                {(() => {
                  const Icon = steps[2].icon;
                  return <Icon className="w-10 h-10 text-sky-600 dark:text-sky-400 mb-4" />;
                })()}
                <h3 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-slate-100">{steps[2].title}</h3>
                <p className="text-base text-slate-600 dark:text-slate-400">{steps[2].description}</p>
              </div>
            </div>

            {/* Step 4: Wide */}
            <div className="relative lg:col-span-2 p-8 rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl">
              <div className="absolute inset-0 opacity-10 [mask-image:radial-gradient(ellipse_at_center,white,transparent_70%)]" 
                   style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Cpath fill='%23ffffff' d='M0 0h16v16H0z'/%3E%3C/svg%3E\")", backgroundSize: "32px 32px"}}>
              </div>
              <span className="absolute -top-4 -right-2 text-[8rem] font-bold text-white/10 select-none opacity-50">4</span>
              <div className="relative z-10">
                {(() => {
                  const Icon = steps[3].icon;
                  return <Icon className="w-10 h-10 text-white/80 mb-4" />;
                })()}
                <h3 className="text-2xl font-semibold mb-2 text-white">{steps[3].title}</h3>
                <p className="text-base text-sky-100">{steps[3].description}</p>
              </div>
            </div>

          </div>
        </section>
        {/* --- 
          END: "HOW IT WORKS" BENTO GRID 
          --- */}

        <section id="tech" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              Built with modern tech
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Powered by the latest web technologies for speed and reliability
            </p>
          </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {techStack.map((tech, index) => (
            <div key={index} className="relative">
              <Card className="relative h-full bg-transparent border-0 shadow-none p-6 text-center">
                <tech.icon className="w-10 h-10 text-sky-600 dark:text-sky-400 mx-auto mb-4" />
                <CardTitle className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">
                  {tech.title}
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">{tech.description}</p>
              </Card>
            </div>
          ))}
        </div>
        </section>

        <section id="faq" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              Frequently Asked Questions (FAQ)
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Questions about our X Profile Cards Generator? We have answers.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full space-y-4">
              
              <AccordionItem value="item-1" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg rounded-xl px-6">
                <AccordionTrigger className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:no-underline text-left">
                  Is X Profile Cards free to use?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-400 pt-2 pb-4">
                  Yes, X Profile Cards is a <span className="font-semibold">100% free</span> tool for personal, non-commercial use. You can create and share cards on social media.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg rounded-xl px-6">
                <AccordionTrigger className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:no-underline text-left">
                  Can I use this for my company or brand?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-400 pt-2 pb-4">
                  Commercial use is not permitted under the standard license. For commercial licensing inquiries, please contact the author at <a href="mailto:siddheshkamath40@gmail.com" className="text-sky-600 dark:text-sky-400 hover:underline">siddheshkamath4D@gmail.com</a>.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg rounded-xl px-6">
                <AccordionTrigger className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:no-underline text-left">
                  What am I *not* allowed to do?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-400 pt-2 pb-4">
                  You cannot copy, distribute, modify, reverse engineer, or create derivative works from the source code. You also may not sell or lease the software.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg rounded-xl px-6">
                <AccordionTrigger className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:no-underline text-left">
                  Why did I get an error?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-400 pt-2 pb-4">
                  Errors can occur for a few reasons. The most common is that the X profile is private, suspended, or does not exist. It can also happen if the server is busy. Please double-check the handle and try again.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/4S shadow-lg rounded-xl px-6">
                <AccordionTrigger className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:no-underline text-left">
                  Is there a warranty for this software?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-400 pt-2 pb-4">
                  No. The software is provided "AS IS" without warranty of any kind, express or implied. The author is not liable for any claims or damages.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg rounded-xl px-6">
                <AccordionTrigger className="text-lg font-semibold text-slate-900 dark:text-slate-100 hover:no-underline text-left">
                  Who is the author?
                </AccordionTrigger>
                <AccordionContent className="text-base text-slate-600 dark:text-slate-400 pt-2 pb-4">
                  {/* --- THIS IS THE FIXED LINE --- */}
                  This project was created by Siddhesh Kamath. You can find him on X as <a href="https://x.com/iamvibecoder" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">@iamvibecoder</a> or on GitHub as <a href="https://github.com/iamvibecoding" target="_blank" rel="noopener noreferrer" className="text-sky-600 dark:text-sky-400 hover:underline">@iamvibecoding</a>.
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </div>
        </section>

        <div className="h-24" />
      </div>

      <style jsx global>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 10s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .perspective {
          perspective: 1000px; 
          transform-style: preserve-3d;
        }
        /* Styles for Shadcn Accordion */
        [data-state='open'] > svg {
          transform: rotate(180deg);
        }
        [data-state='closed'] > svg {
          transform: rotate(0deg);
        }
        .dark .dark\\:border-slate-800\\/40 {
          border-color: rgba(30, 41, 59, 0.4);
        }
        .dark .dark\\:bg-slate-900\\/60 {
           background-color: rgba(15, 23, 42, 0.6);
        }
      `}</style>
    </>
  );
}