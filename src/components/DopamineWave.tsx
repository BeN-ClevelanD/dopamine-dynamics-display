import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface DopamineWaveProps {
  pattern: 'natural' | 'cocaine' | 'chocolate' | 'exercise' | 'normal';
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
      // Simulate daily fluctuations with multiple frequencies
      const timeOfDay = ((x + xOffset) % width) / width * 24; // Map x to 24 hours
      
      // Morning spike
      const morningSpike = Math.max(0, 20 * Math.exp(-(Math.pow(timeOfDay - 8, 2)) / 2));
      
      // Afternoon dip
      const afternoonDip = -10 * Math.exp(-(Math.pow(timeOfDay - 14, 2)) / 8);
      
      // Evening moderate level
      const eveningLevel = 5 * Math.sin((timeOfDay - 18) * 0.5);
      
      const y = baselineY + morningSpike + afternoonDip + eveningLevel;
      newPoints.push({ x, y: Math.max(10, Math.min(height - 10, y)) });
    }
    return newPoints;
  };

  const generateStimulusWave = (type: 'cocaine' | 'chocolate' | 'exercise', xOffset: number, progress: number = 1) => {
    const newPoints: Point[] = [];
    const baselineY = height / 2;
    
    const patterns = {
      cocaine: {
        peakHeight: 0.8,
        peakPosition: 0.2,
        decayRate: 2.5,
        afterTroughDepth: 0.6
      },
      chocolate: {
        peakHeight: 0.4,
        peakPosition: 0.3,
        decayRate: 1.2,
        afterTroughDepth: 0.2
      },
      exercise: {
        peakHeight: 0.5,
        peakPosition: 0.4,
        decayRate: 0.8,
        afterTroughDepth: 0.1
      }
    };
    
    const { peakHeight, peakPosition, decayRate, afterTroughDepth } = patterns[type];
    
    for (let x = 0; x < width + 100; x += 5) {
      let y;
      const xProgress = ((x + xOffset) % width) / width;
      
      // Only show one peak
      if (xProgress < peakPosition) {
        const riseProgress = xProgress / peakPosition;
        y = baselineY - (Math.pow(riseProgress, 2) * height * peakHeight * progress);
      } else if (xProgress < peakPosition + 0.1) {
        y = baselineY - height * peakHeight * progress;
      } else {
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
    <div ref={containerRef} className="wave-container w-full h-full rounded-lg">
      <svg width="100%" height="100%" className="overflow-visible">
        <motion.path
          d={pathData}
          fill="none"
          stroke="rgba(0,0,0,0.6)"
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
