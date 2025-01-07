import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface Point {
  x: number;
  y: number;
}

interface DopamineWaveProps {
  pattern: 'natural' | 'cocaine' | 'chocolate' | 'exercise';
}

const DopamineWave: React.FC<DopamineWaveProps> = ({ pattern }) => {
  const [points, setPoints] = useState<Point[]>([]);
  const [height, setHeight] = useState(300);
  const [width, setWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateNaturalWave = () => {
    const newPoints: Point[] = [];
    const baselineY = height / 2;
    
    for (let x = 0; x < width; x += 5) {
      // Combine multiple sine waves for a more natural feel
      const y = baselineY + 
        Math.sin(x * 0.02) * 15 + 
        Math.sin(x * 0.01) * 10;
      newPoints.push({ x, y });
    }
    return newPoints;
  };

  const generateStimulusWave = (type: 'cocaine' | 'chocolate' | 'exercise') => {
    const newPoints: Point[] = [];
    const baselineY = height / 2;
    
    // Define characteristics for each stimulus type
    const patterns = {
      cocaine: {
        peakHeight: 0.8, // 80% of available height
        peakPosition: 0.2, // Peak at 20% of width
        decayRate: 2.5, // Steep decay
        afterTroughDepth: 0.6 // Deep post-high trough
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
    
    for (let x = 0; x < width; x += 5) {
      let y;
      const xProgress = x / width;
      
      if (xProgress < peakPosition) {
        // Rising phase - smooth acceleration
        const riseProgress = xProgress / peakPosition;
        y = baselineY - (Math.pow(riseProgress, 2) * height * peakHeight);
      } else if (xProgress < peakPosition + 0.1) {
        // Peak plateau
        y = baselineY - height * peakHeight;
      } else {
        // Decay and after-effects phase
        const decayProgress = (xProgress - (peakPosition + 0.1)) / 0.9;
        const decayValue = Math.exp(-decayProgress * decayRate);
        
        // Add the trough effect
        const troughEffect = Math.sin(decayProgress * Math.PI) * afterTroughDepth;
        
        y = baselineY - 
            (height * peakHeight * decayValue) + 
            (height * troughEffect);
      }
      
      // Ensure the wave stays within bounds
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
    let newPoints: Point[];
    let animationFrameId: number;
    let startTime: number;
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (pattern === 'natural') {
        newPoints = generateNaturalWave().map(point => ({
          x: point.x,
          y: point.y + Math.sin(progress * 0.002) * 5
        }));
      } else {
        newPoints = generateStimulusWave(pattern);
      }
      
      setPoints(newPoints);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    if (pattern !== 'natural') {
      const timer = setTimeout(() => {
        setPoints(generateNaturalWave());
      }, 20000);
      
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animationFrameId);
      };
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [pattern, width, height]);

  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <div ref={containerRef} className="wave-container w-full h-full rounded-lg">
      <svg width="100%" height="100%" className="overflow-visible">
        <motion.path
          d={pathData}
          fill="none"
          stroke="rgba(255,255,255,0.8)"
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