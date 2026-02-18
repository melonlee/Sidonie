import React, { useEffect, useState, useRef, useMemo } from 'react';
import mermaid from 'mermaid';
import { AlertCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

// Initialize Mermaid globally
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif',
  logLevel: 'error', 
});

interface MermaidRendererProps {
  code: string;
}

const MermaidRenderer: React.FC<MermaidRendererProps> = ({ code }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Clean up code before rendering to remove common LLM artifacts
  const cleanCode = useMemo(() => {
    if (!code) return '';
    let c = code.trim();
    
    // 1. Remove markdown code block delimiters
    c = c.replace(/^```mermaid\s*/, '').replace(/^```/, '').replace(/```$/, '');
    
    // 2. Decode HTML Entities
    c = c.replace(/&gt;/g, '>')
         .replace(/&lt;/g, '<')
         .replace(/&quot;/g, '"')
         .replace(/&apos;/g, "'")
         .replace(/&amp;/g, '&');

    // 3. Structural Fixes for common LLM syntax errors
    c = c.replace(/(TD|TB|BT|RL|LR)(subgraph)/g, '$1\n$2');
    c = c.replace(/(\s)end\s*subgraph/g, '$1end\nsubgraph');
    c = c.replace(/("\s*)([A-Za-z0-9_]+\s*[\{\[\(])/g, '$1\n$2');
    c = c.replace(/(subgraph\s+[A-Za-z0-9_]+)\s+([A-Za-z0-9_]+\s*[\{\[\(])/g, '$1\n$2');
    c = c.replace(/([\]\)\}])\s*([A-Za-z0-9_]+\s*[\{\[\(])/g, '$1\n$2');
    c = c.replace(/([^\n;])\s+(subgraph\s)/g, '$1\n$2');
    c = c.replace(/([\]\)\}"';])\s+(end)(?=\s|$)/g, '$1\n$2');
    
    return c.trim();
  }, [code]);

  useEffect(() => {
    let isMounted = true;
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    const renderDiagram = async () => {
      if (!cleanCode) return;

      try {
        setError(null);
        const { svg } = await mermaid.render(id, cleanCode);
        if (isMounted) {
          setSvg(svg);
        }
      } catch (err: any) {
        console.error("Mermaid Rendering Failed:", err);
        if (isMounted) {
          setError("Syntax Error");
        }
      }
    };

    renderDiagram();

    return () => {
      isMounted = false;
    };
  }, [cleanCode]);

  // Fallback view for errors
  if (error) {
    return (
      <div className="my-4 rounded-xl border border-red-100 bg-red-50/50 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-red-100 bg-red-50 text-red-600 text-xs font-medium uppercase tracking-wider">
           <AlertCircle size={14} />
           <span>Diagram Generation Failed</span>
        </div>
        <div className="p-4">
           <div className="text-sm text-slate-600 mb-2 font-medium">
             The model generated invalid Mermaid syntax.
           </div>
           <div className="relative">
             <div className="absolute top-2 right-2 text-[10px] text-slate-400 font-mono">MERMAID</div>
             <pre className="p-3 bg-white rounded-lg border border-red-100 text-xs font-mono text-slate-600 overflow-x-auto whitespace-pre leading-relaxed">
               {cleanCode}
             </pre>
           </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (!svg) {
     return (
       <div className="my-6 p-8 flex justify-center items-center bg-slate-50 rounded-xl border border-slate-100 border-dashed animate-pulse">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-blue-500 rounded-full animate-spin"></div>
       </div>
     )
  }

  return (
    <div className="my-6 group relative rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md overflow-hidden">
      {/* Zoom Controls */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-white/90 backdrop-blur-sm p-1 rounded-lg border border-slate-100 shadow-sm">
        <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="Zoom Out"><ZoomOut size={14}/></button>
        <span className="text-[10px] font-medium text-slate-400 w-8 text-center select-none">{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(2, s + 0.1))} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="Zoom In"><ZoomIn size={14}/></button>
        <div className="w-px h-3 bg-slate-200 mx-1"/>
        <button onClick={() => setScale(1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500" title="Reset"><RotateCcw size={14}/></button>
      </div>

      <div 
        ref={containerRef}
        className="overflow-auto flex justify-center p-6 bg-white custom-scrollbar select-none"
        style={{ minHeight: '150px' }}
      >
        <div 
           dangerouslySetInnerHTML={{ __html: svg }} 
           style={{ 
             transform: `scale(${scale})`, 
             transformOrigin: 'center top',
             transition: 'transform 0.2s ease-out'
           }}
        />
      </div>
    </div>
  );
};

export default MermaidRenderer;