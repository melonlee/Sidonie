
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Check, Loader2, CircleDashed, ListStart } from 'lucide-react';

interface PlanWidgetProps {
  planContent: string;
  currentContent?: string; // The streaming content from the model
  isStreaming?: boolean;
}

interface PlanItem {
  text: string;
  status: 'pending' | 'in-progress' | 'completed';
}

const PlanWidget: React.FC<PlanWidgetProps> = ({ planContent, currentContent = '', isStreaming = false }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 1. Parse the plan items from the XML/Markdown string
  const rawItems = useMemo(() => {
    return planContent
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('- [ ]') || line.startsWith('- [x]'))
      .map(line => line.replace(/- \[[ x]\]/, '').trim());
  }, [planContent]);

  // 2. Determine status of each item based on streaming content
  const items: PlanItem[] = useMemo(() => {
    // If streaming is totally done, mark all as completed (fallback)
    if (!isStreaming && currentContent.length > 0) {
      return rawItems.map(text => ({ text, status: 'completed' }));
    }

    let foundCurrent = false;
    
    return rawItems.map((text, index) => {
      // Heuristic: Check if the item's key phrases appear in the generated content.
      // We look for the item text in the content. 
      // To avoid false positives, we look for a significant portion of the string or headers.
      
      // Simplify text for matching (remove punctuation, lowercase)
      const cleanItemText = text.toLowerCase().replace(/[^\w\s]/g, '');
      const cleanContent = currentContent.toLowerCase();
      
      // Split item into keywords (ignoring small words)
      const keywords = cleanItemText.split(' ').filter(w => w.length > 3);
      
      // If content contains most keywords, assume this step is mentioned/done.
      // OR if we find a Header (# Item Text)
      const isMentioned = keywords.length > 0 && keywords.every(k => cleanContent.includes(k));

      if (isMentioned) {
        return { text, status: 'completed' };
      } 
      
      // The first item that is NOT completed is "in-progress"
      if (!foundCurrent) {
        foundCurrent = true;
        return { text, status: 'in-progress' };
      }

      return { text, status: 'pending' };
    });
  }, [rawItems, currentContent, isStreaming]);

  // Auto-collapse logic: only auto-collapse if completely finished and user hasn't interacted
  // (Optional: currently keeping it open as it looks nice)

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50/50 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all animate-fade-in group">
      {/* Header */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white/60 hover:bg-white/80 transition-colors border-b border-gray-100/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-md ${isStreaming ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
            {isStreaming ? (
               <Loader2 size={14} className="animate-spin" strokeWidth={2.5} />
            ) : (
               <ListStart size={14} strokeWidth={2.5} />
            )}
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-gray-500">
            {isStreaming ? 'Working on Plan' : 'Execution Plan'}
          </span>
        </div>
        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
          {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </button>

      {/* Plan List */}
      {!isCollapsed && (
        <div className="px-5 py-4 bg-white/40">
          <div className="space-y-3">
            {items.map((item, idx) => {
              const isCompleted = item.status === 'completed';
              const isInProgress = item.status === 'in-progress';
              
              return (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 text-[14px] transition-all duration-500
                    ${isCompleted ? 'text-gray-400' : isInProgress ? 'text-gray-900 font-medium' : 'text-gray-500'}
                  `}
                >
                  {/* Status Icon */}
                  <div className="mt-0.5 flex-shrink-0 transition-all duration-300">
                     {isCompleted ? (
                       <div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center animate-scale-in">
                         <Check size={12} strokeWidth={3} />
                       </div>
                     ) : isInProgress ? (
                       <div className="w-5 h-5 rounded-full border-2 border-gray-900 border-t-transparent animate-spin" />
                     ) : (
                       <div className="w-5 h-5 flex items-center justify-center text-gray-300">
                         <CircleDashed size={16} />
                       </div>
                     )}
                  </div>

                  {/* Text */}
                  <span className={`leading-relaxed ${isCompleted ? 'line-through decoration-gray-200' : ''}`}>
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanWidget;
