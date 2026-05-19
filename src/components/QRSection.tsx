import { QRCodeSVG } from 'qrcode.react';
import { Share2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface QRSectionProps {
  url: string;
}

export function QRSection({ url }: QRSectionProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
      <div className="bg-slate-50 p-6 rounded-2xl mb-6">
        <QRCodeSVG 
          value={url} 
          size={200}
          level="H"
          includeMargin={false}
          className="rounded-lg"
        />
      </div>
      
      <p className="text-sm text-slate-500 mb-6 text-center max-w-[240px]">
        Scan this code to save my contact info directly to your CRM.
      </p>

      <div className="flex gap-3 w-full">
        <button 
          onClick={copyToClipboard}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 text-white text-sm font-medium transition-all active:scale-95 hover:bg-slate-800"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>
        <button 
          className="flex items-center justify-center p-3 rounded-xl border border-slate-200 text-slate-600 transition-all active:scale-95 hover:bg-slate-50"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
