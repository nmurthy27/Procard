import React, { useState, useRef } from 'react';
import { Camera, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PhotoSectionProps {
  photoURL: string;
  name: string;
  photoFilter?: string;
  onUpdate: (updates: { photoURL?: string, photoFilter?: string }) => void;
}

export function PhotoSection({ photoURL, name, photoFilter, onUpdate }: PhotoSectionProps) {
  const [isBeautifying, setIsBeautifying] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for Firestore base64
        alert("Image too large. Please choose an image under 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ photoURL: reader.result as string, photoFilter: 'none' });
      };
      reader.readAsDataURL(file);
    }
  };

  const beautify = async (choice: string) => {
    setIsBeautifying(true);
    try {
      const response = await fetch('/api/beautify-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: photoURL, choice }),
      });
      const data = await response.json();
      if (data.filter) {
        onUpdate({ photoFilter: data.filter });
      }
    } catch (error) {
      console.error("Beautify failed", error);
    } finally {
      setIsBeautifying(false);
      setShowOptions(false);
    }
  };

  const beautifyOptions = [
    { id: 'professional', label: 'Professional', icon: '👔' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'warm', label: 'Warm Glow', icon: '✨' },
    { id: 'dramatic', label: 'Dramatic', icon: '🎭' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">Profile Picture</label>
        <div className="flex gap-2">
          {photoFilter && photoFilter !== 'none' && (
            <button
               onClick={() => onUpdate({ photoFilter: 'none' })}
               className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
               Reset Filter
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group">
          <div 
            className="w-24 h-24 rounded-3xl bg-slate-100 border-2 border-slate-200 overflow-hidden relative cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {photoURL ? (
              <img 
                src={photoURL} 
                alt={name} 
                className="w-full h-full object-cover transition-all"
                style={{ filter: photoFilter || 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <Camera className="w-8 h-8" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
              Change
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        <div className="flex-1 space-y-3">
          <p className="text-xs text-slate-500 max-w-[200px]">
            Upload a clear photo. AI can then "beautify" it to match your desired professional vibe.
          </p>
          
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              disabled={!photoURL || isBeautifying}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
            >
              {isBeautifying ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              AI Beautify
            </button>

            <AnimatePresence>
              {showOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute top-full left-0 mt-2 p-2 bg-white rounded-2xl border border-slate-100 shadow-2xl z-10 w-48"
                >
                  <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-2 tracking-widest">Select Style</p>
                  {beautifyOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => beautify(opt.id)}
                      className="w-full text-left px-3 py-2 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <span className="text-lg">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
