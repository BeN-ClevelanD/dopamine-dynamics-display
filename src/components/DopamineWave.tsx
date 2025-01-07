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
    for (let x = 0; x < width; x += 5) {
      const y = Math.sin(x * 0.02) * 20 + height / 2;
      newPoints.push({ x, y });
    }
    return newPoints;
  };

  const generateStimulusWave = (type: 'cocaine' | 'chocolate' | 'exercise') => {
    const newPoints: Point[] = [];
    const patterns = {
      cocaine: { peak: 0.9, decay: 0.8 },
      chocolate: { peak: 0.5, decay: 0.3 },
      exercise: { peak: 0.7, decay: 0.4 },
    };
    
    const { peak, decay } = patterns[type];
    
    for (let x = 0; x < width; x += 5) {
      let y;
      if (x < width * 0.2) {
        // Rising phase
        y = height / 2 - (x / (width * 0.2)) * height * peak;
      } else {
        // Decay phase
        const decayProgress = (x - width * 0.2) / (width * 0.8);
        y = height / 2 - height * peak * Math.exp(-decayProgress * decay);
      }
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
    
    if (pattern === 'natural') {
      newPoints = generateNaturalWave();
    } else {
      newPoints = generateStimulusWave(pattern);
    }
    
    setPoints(newPoints);
    
    if (pattern !== 'natural') {
      const timer = setTimeout(() => {
        setPoints(generateNaturalWave());
      }, 20000);
      
      return () => clearTimeout(timer);
    }
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