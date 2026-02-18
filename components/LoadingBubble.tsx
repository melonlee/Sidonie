import React, { useState, useEffect } from 'react';
import { Sparkles, Search, FileText, Cpu } from 'lucide-react';

interface LoadingBubbleProps {
  status?: string;
}

const LoadingBubble: React.FC<LoadingBubbleProps> = ({ status }) => {
  const [dots, setDots] = useState('.');
  const [messageIndex, setMessageIndex] = useState(0);

  // Default thinking messages if no specific status is provided
  const thinkingMessages = [
    "Thinking...",
    "Analyzing context...",
    "Formulating response..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '.' : d + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Cycle default messages if status is generic or empty
  useEffect(() => {
    if (!status) {
      const interval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % thinkingMessages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const displayStatus = status || thinkingMessages[messageIndex];

  // Choose icon based on status keyword
  const getIcon = () => {
    const s = displayStatus.toLowerCase();
    if (s.includes('search')) return <Search size={14} className="animate-pulse" />;
    if (s.includes('file') || s.includes('reading')) return <FileText size={14} className="animate-pulse" />;
    if (s.includes('analyzing') || s.includes('thinking')) return <Cpu size={14} className="animate-pulse" />;
    return <Sparkles size={14} className="animate-pulse" />;
  };

  return (
    <div className="flex items-center gap-3 py-3 px-1 animate-fade-in">
      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500">
        {getIcon()}
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-500 flex">
          {displayStatus}
          <span className="w-4 inline-block text-left">{dots}</span>
        </span>
      </div>
    </div>
  );
};

export default LoadingBubble;