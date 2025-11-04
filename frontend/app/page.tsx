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
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getApiEndpoint = (): string => {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    return `http://${hostname}:4000`;
  };

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
      // ✅ FIX: Convert 'undefined' to 'null' for the state setter
      setError(validation.error ?? null);
      showToast(validation.error || 'Invalid URL', 'error', 3000);
      return;
    }

    setIsLoading(true);
    showToast('Fetching profile data...', 'loading', 3000); 

    try {
      const apiEndpoint = getApiEndpoint();
      
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
        errorMsg = '❌ Backend not running on port 4000';
      } else if (['ENOTFOUND', 'ERR_NAME_NOT_RESOLVED'].includes(err.code)) {
        errorMsg = '❌ Cannot reach backend. Check network.';
      } else if (['ETIMEDOUT', 'ECONNABORTED'].includes(err.code)) {
        errorMsg = '⏱️ Request timeout. Try again.';
      } else if (err.message?.includes('Network Error')) {
        errorMsg = '❌ Network error. Check your connection.';
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

  const steps = [
    { icon: Link, title: 'Input Link', description: 'Paste your X.com profile URL or handle.' },
    { icon: Zap, title: 'Scrape Data', description: 'Fetch public profile instantly.' },
    { icon: Palette, title: 'Render Themes', description: 'Preview 26+ unique card designs.' },
    { icon: Download, title: 'Export PNG', description: 'Download high-quality images.' },
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
      <div className="fixed inset-0 -z-10 overflow-hidden bg-gradient-to-br from-slate-50 via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob hidden sm:block" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 dark:opacity-10 animate-blob animation-delay-2000 hidden sm:block" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 dark:opacity-10 animate-blob animation-delay-4000 hidden sm:block" />
      </div>

      <div className="relative w-full">
        <section className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 sm:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-sky-100/50 dark:bg-sky-900/50 backdrop-blur-sm border border-sky-200/50 dark:border-sky-800/50">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-sm font-medium text-sky-700 dark:text-sky-300">Create stunning X profile cards</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-slate-900 dark:text-slate-100">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              X Profile Cards
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal">
            Transform any X profile into beautiful, shareable cards. Choose from <span className="font-semibold text-sky-600 dark:text-sky-400">26+</span> premium themes.
          </p>
        </section>

        <div className="relative z-50 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-sky-300 to-cyan-300 rounded-2xl blur opacity-20" />
            <div className="relative bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl rounded-2xl p-6 sm:p-8 border border-white/40 dark:border-slate-800/40 shadow-xl">
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
            <div className="px-0 sm:px-6 lg:px-8 lg:px-12 mb-24 sm:mb-32"> 
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
                    <div className="relative bg-white/60 dark:bg-slate-900/60 backdrop-blur-lg rounded-3xl shadow-lg transition-all duration-300 group-hover:shadow-2xl  overflow-hidden border border-white/40 dark:border-slate-800/40">
                      <CardItem data={profileData} theme={theme as Theme} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <section id="how-it-works" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-900 dark:text-slate-100">
              How it works
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Four simple steps to create your custom X profile card
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-300 to-cyan-300 blur opacity-0 group-hover:opacity-25 transition-opacity" />
                <Card className="relative h-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 shadow-lg hover:shadow-xl transition-all p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {index + 1}
                  </div>
                  <step.icon className="w-8 h-8 text-sky-600 dark:text-sky-400 mx-auto mb-3" />
                  <CardTitle className="text-lg font-semibold mb-2 text-slate-900 dark:text-slate-100">{step.title}</CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        <section id="tech" className="px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-slate-200/50 dark:border-slate-800/5ANd9GcQ">
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
      `}</style>
    </>
  );
}