import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface DopamineWaveProps {
  pattern: 'cocaine' | 'chocolate' | 'exercise' | 'normal' | 'amphetamine' | 'videogames' | 'sex';
}

const DopamineWave: React.FC<DopamineWaveProps> = ({ pattern }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [height, setHeight] = useState(300);
  const [width, setWidth] = useState(800);
  const [offset, setOffset] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(1);
  const previousPattern = useRef(pattern);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateNormalDayWave = (xOffset: number) => {
    const newPoints: Point[] = [];
    const baselineY = height / 2;
    
    for (let x = 0; x < width + 100; x += 5) {
      const timeOfDay = ((x + xOffset) % width) / width * 24;
      const morningSpike = Math.max(0, 20 * Math.exp(-(Math.pow(timeOfDay - 8, 2)) / 2));
      const afternoonDip = -10 * Math.exp(-(Math.pow(timeOfDay - 14, 2)) / 8);
      const eveningLevel = 5 * Math.sin((timeOfDay - 18) * 0.5);
      
      const y = baselineY + morningSpike + afternoonDip + eveningLevel;
      newPoints.push({ x, y: Math.max(10, Math.min(height - 10, y)) });
    }
    return newPoints;
  };

  const generateStimulusWave = (type: DopamineWaveProps['pattern'], xOffset: number, progress: number = 1) => {
    const newPoints: Point[] = [];
    const baselineY = height / 2;
    
    // Updated patterns to reflect relative percentages and speeds
    const patterns = {
      cocaine: {
        peakHeight: 2.25, // 225% above baseline
        peakPosition: 0.1,
        decayRate: 3.0, // Fast decay
        afterTroughDepth: 0.4, // Significant drop below baseline
        riseSpeed: 0.8 // Very fast rise
      },
      amphetamine: {
        peakHeight: 10.0, // 1000% above baseline
        peakPosition: 0.15,
        decayRate: 1.5, // Slower decay than cocaine
        afterTroughDepth: 0.6, // Deeper drop below baseline
        riseSpeed: 0.9 // Fastest rise
      },
      chocolate: {
        peakHeight: 0.5, // 50% above baseline
        peakPosition: 0.3,
        decayRate: 0.8, // Moderate decay
        afterTroughDepth: 0.0, // No drop below baseline
        riseSpeed: 0.4 // Moderate rise
      },
      exercise: {
        peakHeight: 0.4, // 40% above baseline
        peakPosition: 0.4,
        decayRate: 0.5, // Slow, gradual decay
        afterTroughDepth: 0.0, // No drop below baseline
        riseSpeed: 0.3 // Gradual rise
      },
      videogames: {
        peakHeight: 1.0, // 100% above baseline
        peakPosition: 0.25,
        decayRate: 0.7, // Moderate decay
        afterTroughDepth: 0.1, // Slight drop below baseline
        riseSpeed: 0.5 // Moderate rise
      },
      sex: {
        peakHeight: 1.0, // 100% above baseline
        peakPosition: 0.2,
        decayRate: 2.0, // Fast decay after peak
        afterTroughDepth: 0.0, // No significant drop below baseline
        riseSpeed: 0.6 // Moderate-fast rise
      },
      normal: {
        peakHeight: 0.2,
        peakPosition: 0.3,
        decayRate: 0.5,
        afterTroughDepth: 0.0,
        riseSpeed: 0.3
      }
    };
    
    const { peakHeight, peakPosition, decayRate, afterTroughDepth, riseSpeed } = patterns[type];
    
    for (let x = 0; x < width + 100; x += 5) {
      let y;
      const xProgress = ((x + xOffset) % width) / width;
      
      // Single peak with customized rise and fall
      if (xProgress < peakPosition) {
        // Rise phase with customizable speed
        const riseProgress = Math.pow(xProgress / peakPosition, riseSpeed);
        y = baselineY - (height * peakHeight * riseProgress * progress);
      } else if (xProgress < peakPosition + 0.1) {
        // Peak plateau
        y = baselineY - height * peakHeight * progress;
      } else {
        // Decay phase with customizable trough
        const decayProgress = (xProgress - (peakPosition + 0.1)) / 0.9;
        const decayValue = Math.exp(-decayProgress * decayRate);
        const troughEffect = Math.sin(decayProgress * Math.PI) * afterTroughDepth;
        
        y = baselineY - 
            (height * peakHeight * decayValue * progress) + 
            (height * troughEffect * progress);
      }
      
      // Blend with normal pattern based on progress
      const normalY = generateNormalDayWave(xOffset)[Math.floor(x/5)].y;
      y = y * progress + normalY * (1 - progress);
      
      y = Math.max(10, Math.min(height - 10, y));
      newPoints.push({ x, y });
    }
    return newPoints;
  };

  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        if (containerRef.current) {
          setWidth(containerRef.current.offsetWidth);
          setHeight(containerRef.current.offsetHeight);
        }
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    
    if (pattern !== previousPattern.current) {
      setTransitionProgress(1);
      previousPattern.current = pattern;
    }
    
    const animate = () => {
      setOffset(prev => (prev + 2) % width);
      
      if (pattern === 'normal') {
        setPoints(generateNormalDayWave(offset));
      } else {
        // If it's a stimulus pattern, gradually transition back to normal
        if (transitionProgress > 0) {
          setPoints(generateStimulusWave(pattern, offset, transitionProgress));
          setTransitionProgress(prev => Math.max(0, prev - 0.005)); // Gradual transition
        } else {
          setPoints(generateNormalDayWave(offset));
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [pattern, width, height, offset, transitionProgress]);

  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <div ref={containerRef} className="wave-container w-full h-full">
      <svg width="100%" height="100%" className="overflow-visible">
        <motion.path
          d={pathData}
          fill="none"
          className="stroke-foreground"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
};

export default DopamineWave;