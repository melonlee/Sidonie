import React from 'react';
import { Globe } from 'lucide-react';

interface SearchSourcesProps {
  metadata: any;
  title?: string;
}

const SearchSources: React.FC<SearchSourcesProps> = ({ metadata, title = "Sources" }) => {
  if (!metadata || !metadata.groundingChunks || metadata.groundingChunks.length === 0) return null;

  // Extract sources from grounding chunks
  const sources = metadata.groundingChunks
    .map((chunk: any, index: number) => {
        if (chunk.web) {
            return {
                title: chunk.web.title || `Source ${index + 1}`,
                uri: chunk.web.uri
            };
        }
        return null;
    })
    .filter((source: any) => source !== null);

  if (sources.length === 0) return null;

  return (
    <div className="mt-4 pt-3 border-t border-slate-100">
       <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
         <Globe size={12} />
         <span>{title}</span>
       </div>
       <div className="flex flex-wrap gap-2">
         {sources.map((source: any, idx: number) => (
           <a 
             key={idx} 
             href={source.uri} 
             target="_blank" 
             rel="noopener noreferrer"
             className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg text-xs transition-colors text-slate-700 hover:text-blue-700 max-w-full"
             title={source.title}
           >
             <div className="truncate max-w-[200px]">{source.title}</div>
           </a>
         ))}
       </div>
    </div>
  );
};
export default SearchSources;