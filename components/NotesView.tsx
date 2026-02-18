
import React, { useState, useMemo } from 'react';
import { Note, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  Search, 
  Clock, 
  MoreHorizontal, 
  X, 
  Trash2, 
  Save, 
  ChevronLeft, 
  ChevronRight,
  Edit3,
  Plus,
  FileText
} from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface NotesViewProps {
  notes: Note[];
  onUpdateNote: (note: Note) => void;
  onCreateNote: (title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  language: Language;
}

const THEME_STYLES = {
  blue: 'bg-blue-50 border-blue-100 hover:shadow-blue-100',
  yellow: 'bg-yellow-50 border-yellow-100 hover:shadow-yellow-100',
  green: 'bg-green-50 border-green-100 hover:shadow-green-100',
  purple: 'bg-purple-50 border-purple-100 hover:shadow-purple-100',
  default: 'bg-white border-slate-200 hover:shadow-slate-100'
};

const THEME_ACCENTS = {
  blue: 'text-blue-600 bg-blue-100',
  yellow: 'text-yellow-700 bg-yellow-100',
  green: 'text-green-600 bg-green-100',
  purple: 'text-purple-600 bg-purple-100',
  default: 'text-slate-600 bg-slate-100'
};

const NotesView: React.FC<NotesViewProps> = ({ notes, onUpdateNote, onCreateNote, onDeleteNote, language }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const t = TRANSLATIONS[language];

  // Edit State
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());

  const filteredNotes = useMemo(() => {
    return notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [notes, searchQuery]);

  const handleNoteClick = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleNewNote = () => {
    // Create a temporary note object for the UI
    const tempNote: Note = {
      id: 'temp-new',
      title: '',
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      theme: 'default',
      tags: ['New Note']
    };
    setSelectedNote(tempNote);
    setEditTitle('');
    setEditContent('');
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleSaveEdit = () => {
    if (selectedNote) {
      if (isCreating) {
        onCreateNote(editTitle, editContent);
        setIsCreating(false);
        // Close modal after create to reset state, or we could update selectedNote with the real ID if we had it returned
        setSelectedNote(null); 
      } else {
        const updated = {
          ...selectedNote,
          title: editTitle,
          content: editContent,
          updatedAt: Date.now()
        };
        onUpdateNote(updated);
        setSelectedNote(updated); // Update local view
        setIsEditing(false);
      }
    }
  };

  const handleDelete = () => {
    if (selectedNote && window.confirm(t.deleteNoteConfirm)) {
      const idToDelete = selectedNote.id;
      // Close modal first
      setSelectedNote(null);
      // Then trigger delete
      onDeleteNote(idToDelete);
    }
  };
  
  const handleQuickDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm(t.deleteNoteConfirm)) {
      onDeleteNote(id);
    }
  };

  const handleExportWord = () => {
    const content = isEditing ? editContent : selectedNote?.content || '';
    if (!content) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export</title></head><body>";
    const footer = "</body></html>";
    const sourceHTML = header + `<div style="font-family: Calibri, sans-serif;">${content.replace(/\n/g, '<br>')}</div>` + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `note-${selectedNote?.title || 'untitled'}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
  };

  // --- Calendar Helpers ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay, year, month };
  };

  const renderCalendar = () => {
    const { daysInMonth, firstDay, year, month } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString(language === 'zh' ? 'zh-CN' : 'default', { month: 'long' });
    const days = [];

    // Empty slots for start of month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 bg-slate-50/50 border-b border-r border-slate-100" />);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDayStart = new Date(year, month, d).setHours(0,0,0,0);
      const currentDayEnd = new Date(year, month, d).setHours(23,59,59,999);
      
      const dayNotes = notes.filter(n => n.createdAt >= currentDayStart && n.createdAt <= currentDayEnd);

      days.push(
        <div key={d} className="h-32 border-b border-r border-slate-100 p-2 relative group hover:bg-slate-50 transition-colors">
          <span className={`text-sm font-medium ${
            new Date().toDateString() === new Date(year, month, d).toDateString() 
              ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center' 
              : 'text-slate-500'
          }`}>{d}</span>
          
          <div className="mt-2 space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            {dayNotes.map(note => (
              <button 
                key={note.id}
                onClick={() => handleNoteClick(note)}
                className={`w-full text-left text-[10px] truncate px-1.5 py-1 rounded border ${
                  note.theme === 'blue' ? 'bg-blue-50 border-blue-100 text-blue-700' :
                  note.theme === 'yellow' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' :
                  note.theme === 'green' ? 'bg-green-50 border-green-100 text-green-700' :
                  note.theme === 'purple' ? 'bg-purple-50 border-purple-100 text-purple-700' :
                  'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {note.title}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
           <h2 className="text-lg font-semibold text-slate-700">{monthName} {year}</h2>
           <div className="flex gap-2">
             <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-100 rounded-full">
               <ChevronLeft size={20} />
             </button>
             <button onClick={() => setCurrentDate(new Date())} className="text-sm px-3 py-1 bg-slate-100 rounded-md font-medium text-slate-600 hover:bg-slate-200">{t.today}</button>
             <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-100 rounded-full">
               <ChevronRight size={20} />
             </button>
           </div>
        </div>
        <div className="grid grid-cols-7 text-center border-b border-slate-200 bg-slate-50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-2 text-xs font-semibold text-slate-400 uppercase">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 bg-white">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Header */}
      <div className="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-800">{t.notesTitle}</h1>
           <p className="text-slate-500 text-sm mt-1">{t.notesSubtitle}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleNewNote}
            className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-slate-800 transition-colors shadow-sm text-sm font-medium"
          >
            <Plus size={16} /> {t.newNote}
          </button>
          
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
             <button 
               onClick={() => setViewMode('grid')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <LayoutGrid size={16} /> {t.grid}
             </button>
             <button 
               onClick={() => setViewMode('calendar')}
               className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
             >
               <CalendarIcon size={16} /> {t.calendar}
             </button>
          </div>
        </div>
      </div>

      {/* Search & Filter (Only visible in Grid) */}
      {viewMode === 'grid' && (
        <div className="px-8 mb-6">
           <div className="relative max-w-md">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder={t.searchNotes}
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all shadow-sm"
             />
           </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 pb-12 custom-scrollbar">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
            {filteredNotes.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-400">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <LayoutGrid size={32} className="opacity-50" />
                </div>
                <p>{t.noNotesFound}</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div 
                  key={note.id}
                  onClick={() => handleNoteClick(note)}
                  className={`group relative rounded-2xl p-5 cursor-pointer border transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-md flex flex-col justify-between h-[280px] ${THEME_STYLES[note.theme || 'default']}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                       <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${THEME_ACCENTS[note.theme || 'default']}`}>
                         {note.tags?.[0] || 'Note'}
                       </span>
                       <span className="text-xs text-slate-400 flex items-center gap-1">
                         {new Date(note.createdAt).toLocaleDateString()}
                       </span>
                    </div>
                    <h3 className="font-bold text-lg text-slate-800 mb-2 line-clamp-2 leading-tight">{note.title}</h3>
                    <p className="text-sm text-slate-600 line-clamp-6 leading-relaxed opacity-90">
                      {note.content.replace(/[#*`]/g, '')}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200/50 opacity-0 group-hover:opacity-100 transition-opacity">
                     <span className="text-xs text-slate-400 flex items-center gap-1">
                       <Clock size={12} /> {new Date(note.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                     </span>
                     <button 
                        onClick={(e) => handleQuickDelete(e, note.id)}
                        className="p-1.5 hover:bg-red-100 hover:text-red-600 rounded-full text-slate-400 transition-colors"
                        title={t.deleteNote}
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          renderCalendar()
        )}
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
               <div className="flex items-center gap-3">
                 <div className={`w-3 h-3 rounded-full ${THEME_ACCENTS[selectedNote.theme || 'default'].split(' ')[1].replace('bg-', 'bg-').replace('100', '500')}`} />
                 <span className="text-sm text-slate-500">
                    {t.createdOn} {new Date(selectedNote.createdAt).toLocaleString()}
                 </span>
               </div>
               <div className="flex items-center gap-2">
                 {/* Export Button */}
                 <button
                    onClick={handleExportWord}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.exportWord}
                 >
                    <FileText size={20} />
                 </button>
                 
                 {isEditing ? (
                   <button 
                     onClick={handleSaveEdit}
                     className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                   >
                     <Save size={16} /> {t.saveChanges}
                   </button>
                 ) : (
                    <button 
                     onClick={() => setIsEditing(true)}
                     className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                   >
                     <Edit3 size={16} /> {t.edit}
                   </button>
                 )}
                 {!isCreating && (
                   <button 
                     onClick={handleDelete}
                     className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                     title={t.deleteNote}
                   >
                     <Trash2 size={20} />
                   </button>
                 )}
                 <div className="w-px h-6 bg-slate-200 mx-2" />
                 <button 
                   onClick={() => setSelectedNote(null)}
                   className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                 >
                   <X size={24} />
                 </button>
               </div>
            </div>

            {/* Editor/Viewer */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-50/30">
              {isEditing ? (
                <div className="space-y-4 max-w-3xl mx-auto">
                   <input 
                     type="text" 
                     value={editTitle}
                     onChange={(e) => setEditTitle(e.target.value)}
                     className="w-full text-3xl font-bold bg-transparent border-none focus:ring-0 placeholder-slate-300 text-slate-800"
                     placeholder={t.noteTitlePlaceholder}
                     autoFocus={isCreating}
                   />
                   <textarea 
                     value={editContent}
                     onChange={(e) => setEditContent(e.target.value)}
                     className="w-full h-[60vh] resize-none bg-transparent border-none focus:ring-0 text-lg leading-relaxed text-slate-700 placeholder-slate-300"
                     placeholder={t.startTyping}
                   />
                </div>
              ) : (
                <div className="max-w-3xl mx-auto">
                  <h1 className="text-3xl font-bold text-slate-900 mb-8">{selectedNote.title}</h1>
                  <MarkdownRenderer content={selectedNote.content} language={language} />
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default NotesView;
