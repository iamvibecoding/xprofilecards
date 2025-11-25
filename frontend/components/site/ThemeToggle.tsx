'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  // Add rounded-full here for the loading state button
  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="h-9 w-9 px-0 rounded-full" />
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Add rounded-full here for the main button */}
        <Button
          variant="outline"
          size="sm"
          className="h-9 w-9 px-0 relative rounded-full" 
        >
          <Sun
            className="h-[1.2rem] w-[1.2rem] z-50 text-yellow-900 
                       transition-all duration-300 rotate-0 scale-100 
                       dark:-rotate-90 dark:scale-0 absolute"
          />

          <Moon
            className="h-[1.2rem] w-[1.2rem] text-slate-200 
                       transition-all duration-300 rotate-90 scale-0 
                       dark:rotate-0 dark:scale-100 absolute"
          />
           {/* Good practice to include readable text for screen readers, 
               even if visually hidden */}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}