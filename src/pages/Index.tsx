import React, { useState } from 'react';
import DopamineWave from '../components/DopamineWave';
import { motion } from 'framer-motion';

const Index = () => {
  const [activePattern, setActivePattern] = useState<'natural' | 'cocaine' | 'chocolate' | 'exercise' | 'normal'>('natural');

  const handlePatternClick = (pattern: typeof activePattern) => {
    if (pattern !== activePattern) {
      setActivePattern(pattern);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-center">
          <motion.h1 
            className="text-xl font-semibold font-['Space_Grotesk']"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            This is your dopamine
          </motion.h1>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container flex-1 flex gap-8 py-8">
        {/* Wave Display - 20% smaller */}
        <motion.div 
          className="flex-1 h-[320px] rounded-lg border border-border/40 mx-auto w-4/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <DopamineWave pattern={activePattern} />
        </motion.div>

        {/* Control Tabs */}
        <motion.div 
          className="w-48 space-y-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {(['normal', 'cocaine', 'chocolate', 'exercise'] as const).map((pattern) => (
            <button
              key={pattern}
              onClick={() => handlePatternClick(pattern)}
              className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                activePattern === pattern
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
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