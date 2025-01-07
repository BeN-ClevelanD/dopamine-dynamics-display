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
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateNaturalWave = (xOffset: number) => {
    const newPoints: Point[] = [];
    const baselineY = height / 2;
    
    // Generate more points than visible to allow for smooth scrolling
    for (let x = 0; x < width + 100; x += 5) {
      // Combine multiple sine waves for a more natural feel, offset by xOffset
      const y = baselineY + 
        Math.sin((x + xOffset) * 0.02) * 15 + 
        Math.sin((x + xOffset) * 0.01) * 10;
      newPoints.push({ x, y });
    }
    return newPoints;
  };

  const generateStimulusWave = (type: 'cocaine' | 'chocolate' | 'exercise', xOffset: number) => {
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
    
    // Generate more points than visible to allow for smooth scrolling
    for (let x = 0; x < width + 100; x += 5) {
      let y;
      const xProgress = ((x + xOffset) % width) / width;
      
      if (xProgress < peakPosition) {
        const riseProgress = xProgress / peakPosition;
        y = baselineY - (Math.pow(riseProgress, 2) * height * peakHeight);
      } else if (xProgress < peakPosition + 0.1) {
        y = baselineY - height * peakHeight;
      } else {
        const decayProgress = (xProgress - (peakPosition + 0.1)) / 0.9;
        const decayValue = Math.exp(-decayProgress * decayRate);
        const troughEffect = Math.sin(decayProgress * Math.PI) * afterTroughDepth;
        
        y = baselineY - 
            (height * peakHeight * decayValue) + 
            (height * troughEffect);
      }
      
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
    
    const animate = () => {
      setOffset(prev => (prev + 2) % width); // Increase this value for faster movement
      
      if (pattern === 'natural') {
        setPoints(generateNaturalWave(offset));
      } else {
        setPoints(generateStimulusWave(pattern, offset));
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    if (pattern !== 'natural') {
      const timer = setTimeout(() => {
        setPoints(generateNaturalWave(offset));
      }, 20000);
      
      return () => {
        clearTimeout(timer);
        cancelAnimationFrame(animationFrameId);
      };
    }
    
    return () => cancelAnimationFrame(animationFrameId);
  }, [pattern, width, height, offset]);

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