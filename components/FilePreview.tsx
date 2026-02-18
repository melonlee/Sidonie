import React from 'react';
import { X, FileText } from 'lucide-react';
import { Attachment } from '../types';

interface FilePreviewProps {
  files: Attachment[];
  onRemove: (index: number) => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ files, onRemove }) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-2 px-4">
      {files.map((file, index) => (
        <div
          key={index}
          className="group relative flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
        >
          {file.originalFileType === 'image' || (file.mimeType.startsWith('image/') && file.originalFileType !== 'docx') ? (
             <div className="w-8 h-8 rounded overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                <img 
                  src={`data:${file.mimeType};base64,${file.data}`} 
                  alt="preview" 
                  className="w-full h-full object-cover" 
                />
             </div>
          ) : (
            <div className="w-8 h-8 rounded flex items-center justify-center bg-blue-50 text-blue-600 border border-blue-100">
              <FileText size={16} />
            </div>
          )}
          
          <div className="flex flex-col min-w-0 max-w-[150px]">
            <span className="text-xs font-medium truncate text-slate-700">
              {file.name}
            </span>
            <span className="text-[10px] text-slate-500 uppercase">
              {file.originalFileType || file.mimeType.split('/')[1]}
            </span>
          </div>

          <button
            onClick={() => onRemove(index)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-white border border-slate-200 text-slate-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:text-red-500 hover:border-red-100"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FilePreview;