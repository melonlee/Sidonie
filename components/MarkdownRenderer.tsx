
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Download, Maximize2, Minimize2, Code, Play, Check, Copy, X } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import MermaidRenderer from './MermaidRenderer';

interface MarkdownRendererProps {
  content: string;
  onImageClick?: (src: string) => void;
  isStreaming?: boolean;
  language?: Language;
  codeBlockDefaultMode?: 'code' | 'preview';
}

// Robustly extract text from a HAST node (recursive)
const getNodeText = (node: any): string => {
  if (!node) return '';
  if (node.type === 'text') return node.value || '';
  if (Array.isArray(node.children)) {
    return node.children.map(getNodeText).join('');
  }
  return '';
};

// Fallback helper for React children
const extractText = (children: any): string => {
  if (children === null || children === undefined) return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return children.toString();
  
  if (Array.isArray(children)) {
    return children.map(child => extractText(child)).join('');
  }
  
  if (typeof children === 'object') {
     if ('props' in children) {
        return extractText(children.props.children);
     }
     return '';
  }
  
  return String(children);
};

// --- Sub-component: Code Artifact (Handles Preview & Download) ---
const CodeArtifact = ({ language, code, inline, className, appLanguage, defaultMode, ...props }: any) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>(defaultMode || 'code');
  const [isCopied, setIsCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const t = TRANSLATIONS[appLanguage || 'zh'];

  // Handle Mermaid Diagrams
  if (language === 'mermaid') {
    return <MermaidRenderer code={code} />;
  }

  const isHtml = language === 'html' || language === 'xml';
  const canPreview = isHtml && !inline;
  const isShortSnippet = !inline && code.trim().length < 80 && !code.includes('\n');

  if (inline || isShortSnippet) {
    return (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-[13px] font-medium border border-gray-200 break-words whitespace-pre-wrap" {...props}>
        {props.children}
      </code>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: isHtml ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `artifact-${Date.now()}.${language === 'javascript' ? 'js' : language === 'python' ? 'py' : language}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Render Full Screen Preview Modal
  if (isFullscreen && canPreview) {
    return (
      <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">{t.preview}</span>
          </div>
          <div className="flex items-center gap-2">
             <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
              title={t.exitFullScreen}
            >
              <Minimize2 size={20} />
            </button>
             <button
              onClick={() => setIsFullscreen(false)}
              className="p-2 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-gray-500"
              title={t.close}
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1 w-full h-full bg-white relative">
           <iframe
              srcDoc={code}
              title="Full Screen Preview"
              sandbox="allow-scripts allow-modals" 
              className="w-full h-full border-none"
            />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden my-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-200 transition-all hover:border-gray-300 w-full max-w-full">
      {/* Artifact Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-50/50 border-b border-gray-100">
        
        {/* Left: Language & Tabs */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-mono font-bold uppercase tracking-wider select-none">
            {language || 'text'}
          </span>
          
          {canPreview && (
            <div className="flex bg-gray-100 p-0.5 rounded-lg">
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'code' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code size={12} /> {t.code}
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'preview' 
                    ? 'bg-white text-black shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Play size={12} /> {t.preview}
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {activeTab === 'preview' && (
             <button
              onClick={() => setIsFullscreen(true)}
              className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              title={t.fullScreen}
             >
               <Maximize2 size={14} />
             </button>
          )}
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title={t.copy}
          >
            {isCopied ? <Check size={14} /> : <Copy size={14} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            title={t.download}
          >
            <Download size={14} />
          </button>
        </div>
      </div>

      {/* Artifact Content */}
      <div className="relative group max-w-full">
        {activeTab === 'code' ? (
          <SyntaxHighlighter
            style={oneLight}
            language={language}
            PreTag="div"
            customStyle={{ margin: 0, padding: '1.25rem', background: '#ffffff', fontSize: '0.825rem', lineHeight: '1.6', maxWidth: '100%', overflowX: 'auto' }}
            {...props}
          >
            {code}
          </SyntaxHighlighter>
        ) : (
          <div className="w-full bg-white h-[400px] border-none relative">
            <iframe
              srcDoc={code}
              title="Preview"
              sandbox="allow-scripts allow-modals" 
              className="w-full h-full border-none"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Renderer ---

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, onImageClick, isStreaming, language, codeBlockDefaultMode }) => {
  return (
    <div className="prose prose-gray max-w-none text-gray-800 leading-relaxed break-words min-w-0 w-full">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={(value) => value}
        components={{
          pre: ({children}) => <div className="max-w-full overflow-x-auto">{children}</div>,
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            
            let codeContent = getNodeText(node);
            if (!codeContent) {
               codeContent = extractText(children);
            }
            codeContent = codeContent.replace(/\n$/, '');

            return (
              <CodeArtifact 
                language={lang} 
                code={codeContent} 
                inline={inline} 
                className={className} 
                appLanguage={language}
                defaultMode={codeBlockDefaultMode}
                {...props} 
              >
                {children}
              </CodeArtifact>
            );
          },
          table({ children }) {
            return (
              <div className="my-6 w-full overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return <thead className="bg-gray-50">{children}</thead>;
          },
          tbody({ children }) {
            return <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>;
          },
          tr({ children }) {
            return <tr className="hover:bg-gray-50/50 transition-colors">{children}</tr>;
          },
          th({ children }) {
            return (
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="px-6 py-4 whitespace-nowrap text-gray-600 max-w-[300px] truncate">{children}</td>;
          },
          img({src, alt}) {
            if (!src) return null;
            
            const handleDownload = (e: React.MouseEvent) => {
              e.stopPropagation();
              const link = document.createElement('a');
              link.href = src;
              link.download = `gemini-image-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            };

            return (
              <div className="relative group my-6 inline-block max-w-full">
                 <img 
                   src={src} 
                   alt={alt} 
                   className="rounded-lg shadow-sm border border-gray-100 max-h-[512px] object-contain bg-gray-50 cursor-zoom-in" 
                   loading="lazy"
                   onClick={() => onImageClick && onImageClick(src)}
                 />
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={handleDownload}
                      className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md backdrop-blur-md"
                      title="Download"
                    >
                      <Download size={14} />
                    </button>
                    <button 
                      onClick={() => onImageClick && onImageClick(src)}
                      className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-md backdrop-blur-md"
                      title="Expand"
                    >
                      <Maximize2 size={14} />
                    </button>
                 </div>
              </div>
            )
          },
          p({children}) {
             return <p className="mb-4 last:mb-0 text-gray-700 leading-7 break-words whitespace-pre-wrap">{children}</p>
          },
          a({children, href}) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-gray-900 underline decoration-gray-300 hover:decoration-gray-900 underline-offset-4 transition-all break-all">
                {children}
              </a>
            )
          }
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 align-middle bg-gray-400 animate-pulse rounded-sm" />
      )}
    </div>
  );
};

export default MarkdownRenderer;
