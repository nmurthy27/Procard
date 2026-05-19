import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BioEditorProps {
  value: string;
  name: string;
  title: string;
  onChange: (value: string) => void;
}

export function BioEditor({ value, name, title, onChange }: BioEditorProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhanceBio = async () => {
    if (!name || !title) {
      setError("Please enter your name and title first for better results.");
      return;
    }

    setIsEnhancing(true);
    setError(null);
    try {
      const response = await fetch('/api/bio-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentBio: value, name, title }),
      });
      
      const data = await response.json();
      if (data.improvedBio) {
        onChange(data.improvedBio);
      } else {
        throw new Error(data.error || "Failed to enhance bio");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-700">Bio / Summary</label>
        <button
          type="button"
          onClick={enhanceBio}
          disabled={isEnhancing}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 transition-colors"
        >
          {isEnhancing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          AI Enhance
        </button>
      </div>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tell people what you do or your professional mission..."
          className="w-full min-h-[120px] p-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-slate-700 bg-white"
          maxLength={300}
        />
        <div className="absolute bottom-3 right-4 text-[10px] text-slate-400 font-medium">
          {value.length}/300
        </div>
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-red-500 font-medium px-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
