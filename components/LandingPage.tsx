
import React from 'react';
import { X, Sparkles, Cpu, Layers, Code, Zap, FileText, Brain } from 'lucide-react';
import { TRANSLATIONS } from '../constants';
import { Language } from '../types';

interface LandingPageProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

const LandingPage: React.FC<LandingPageProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto animate-fade-in">
      {/* Navbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-lg">
                <Sparkles size={18} />
             </div>
             <span className="text-xl font-bold tracking-tight text-gray-900">Sidonie</span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="py-20 px-6 text-center bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-3xl mx-auto">
           <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
             {t.landingTitle}
           </h1>
           <p className="text-xl md:text-2xl text-gray-500 font-light leading-relaxed">
             {t.landingSubtitle}
           </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">{t.features}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Cpu size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">{t.feature1Title}</h3>
             <p className="text-gray-600 leading-relaxed text-sm">{t.feature1Desc}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Brain size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">{t.feature2Title}</h3>
             <p className="text-gray-600 leading-relaxed text-sm">{t.feature2Desc}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
             <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4">
                <Layers size={24} />
             </div>
             <h3 className="text-lg font-bold text-gray-900 mb-2">{t.feature3Title}</h3>
             <p className="text-gray-600 leading-relaxed text-sm">{t.feature3Desc}</p>
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="bg-gray-50 py-16">
         <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-12 text-center">{t.useCases}</h2>
            <div className="space-y-4 max-w-2xl mx-auto">
               <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg"><Zap size={20} /></div>
                  <span className="font-medium text-gray-800">{t.useCase1}</span>
               </div>
               <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg"><Code size={20} /></div>
                  <span className="font-medium text-gray-800">{t.useCase2}</span>
               </div>
               <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
                  <div className="p-2 bg-red-100 text-red-700 rounded-lg"><FileText size={20} /></div>
                  <span className="font-medium text-gray-800">{t.useCase3}</span>
               </div>
            </div>
         </div>
      </div>

      {/* Tech Stack */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">{t.techStack}</h2>
        <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">{t.techDesc}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
           <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <code className="text-sm font-semibold text-gray-700">{t.tech1}</code>
           </div>
           <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <code className="text-sm font-semibold text-gray-700">{t.tech2}</code>
           </div>
           <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <code className="text-sm font-semibold text-gray-700">{t.tech3}</code>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
         <p>&copy; {new Date().getFullYear()} Sidonie AI. All rights reserved.</p>
      </div>

    </div>
  );
};

export default LandingPage;
