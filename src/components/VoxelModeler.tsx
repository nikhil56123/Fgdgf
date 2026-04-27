import React, { useState } from 'react';
import { ExternalLink, Info, HelpCircle } from 'lucide-react';

export function VoxelModeler() {
  const [showHelp, setShowHelp] = useState(true);

  return (
    <div className="relative w-full h-full bg-zinc-950 flex flex-col">
      {/* Help Overlay (Togglable) */}
      {showHelp && (
        <div className="absolute top-4 right-4 z-20 max-w-xs bg-zinc-900/95 border border-zinc-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Info size={14} /> Workflow Guide
            </h4>
            <button onClick={() => setShowHelp(false)} className="text-zinc-500 hover:text-white text-lg leading-none">×</button>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed mb-3">
            To use these models in your mod:
          </p>
          <ol className="text-[11px] text-zinc-300 space-y-2 list-decimal ml-4">
            <li>Create your model in the Blockbench window below.</li>
            <li>Go to <strong>File &gt; Export &gt; Java Block/Item</strong>.</li>
            <li>When your mod is ready, use the <strong>Download</strong> icon in our left sidebar to export the full project.</li>
          </ol>
          <a 
            href="https://web.blockbench.net" 
            target="_blank" 
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-2 w-full bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold py-2 rounded-lg transition-colors uppercase tracking-widest"
          >
            <ExternalLink size={12} /> Open Full Window
          </a>
        </div>
      )}

      {!showHelp && (
        <button 
          onClick={() => setShowHelp(true)}
          className="absolute top-4 right-4 z-20 p-2 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white shadow-xl"
        >
          <HelpCircle size={18} />
        </button>
      )}

      {/* Blockbench Iframe */}
      <div className="flex-1 bg-[#1c1c1c]">
        <iframe
          src="https://web.blockbench.net/"
          className="w-full h-full border-none"
          title="Blockbench Editor"
          allow="fullscreen; clipboard-read; clipboard-write;"
        />
      </div>

      <div className="absolute bottom-4 left-4 text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em] bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-800/50 backdrop-blur-sm pointer-events-none">
        Integrated Blockbench Environment
      </div>
    </div>
  );
}

