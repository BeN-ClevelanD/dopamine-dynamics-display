import React, { useState } from 'react';
import DopamineWave from '../components/DopamineWave';
import { motion } from 'framer-motion';
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

const Index = () => {
  const [activePattern, setActivePattern] = useState<'normal' | 'cocaine' | 'chocolate' | 'exercise' | 'amphetamine' | 'videogames' | 'sex'>('normal');
  const { setTheme, theme } = useTheme();

  const handlePatternClick = (pattern: typeof activePattern) => {
    if (pattern !== 'normal') {
      setActivePattern(pattern);
      setTimeout(() => {
        setActivePattern('normal');
      }, 20000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex-1" />
          <motion.h1 
            className="text-xl font-semibold font-['Space_Grotesk']"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            This is your dopamine
          </motion.h1>
          <div className="flex-1 flex justify-end items-center gap-2">
            <span className="text-sm">Dark mode</span>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </div>
      </nav>

      <main className="container flex-1 flex gap-8 py-8">
        <motion.div 
          className="flex-1 h-[320px] rounded-lg border border-border/40 mx-auto w-4/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DopamineWave pattern={activePattern} />
        </motion.div>

        <motion.div 
          className="w-48 space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {(['cocaine', 'amphetamine', 'chocolate', 'exercise', 'videogames', 'sex'] as const).map((pattern) => (
            <button
              key={pattern}
              onClick={() => handlePatternClick(pattern)}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                bg-secondary text-secondary-foreground hover:bg-secondary/80
                active:bg-primary active:text-primary-foreground
              `}
            >
              {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
            </button>
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default Index;