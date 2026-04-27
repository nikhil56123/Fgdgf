import React, { useMemo } from 'react';
import { useProjectStore } from '../store';
import { Settings2, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { checkCompatibility, MOD_LOADER_RULES } from '../lib/compatibility';

export function ProjectSettings() {
  const { project, updateProjectMetadata } = useProjectStore();

  const compatibility = useMemo(() => {
    if (!project) return null;
    return checkCompatibility(project.modType, project.mcVersion);
  }, [project?.modType, project?.mcVersion]);

  if (!project) return null;

  const rule = MOD_LOADER_RULES[project.modType];

  return (
    <div className="p-8 bg-zinc-950 h-full flex flex-col gap-8 max-w-3xl mx-auto overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
            <Settings2 className="text-emerald-400" size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Configuration</h2>
            <p className="text-xs text-zinc-500 font-mono">APP.MANIFEST_V1</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Identification</label>
            <div className="space-y-4">
              <div className="group">
                <p className="text-[10px] text-zinc-600 mb-1 ml-1">MOD NAME</p>
                <input 
                  type="text" 
                  value={project.name}
                  onChange={(e) => updateProjectMetadata({ name: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
              <div className="group">
                <p className="text-[10px] text-zinc-600 mb-1 ml-1">BUILD VERSION</p>
                <input 
                  type="text" 
                  value={project.version}
                  onChange={(e) => updateProjectMetadata({ version: e.target.value })}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Environment</label>
            <div className="group">
              <p className="text-[10px] text-zinc-600 mb-1 ml-1">MINECRAFT VERSION</p>
              <select
                value={project.mcVersion}
                onChange={(e) => updateProjectMetadata({ mcVersion: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-100 focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="1.21">1.21 (LATEST)</option>
                <option value="1.20.4">1.20.4</option>
                <option value="1.20.1">1.20.1 (STABLE)</option>
                <option value="1.19.4">1.19.4</option>
                <option value="1.18.2">1.18.2</option>
                <option value="1.16.5">1.16.5</option>
                <option value="1.12.2">1.12.2 (LEGACY)</option>
                <option value="1.8.9">1.8.9</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Runtime Analysis
            </h3>
            
            {compatibility && (
              <div className={`p-4 rounded-xl border mb-4 ${
                compatibility.type === 'error' ? 'bg-red-500/5 border-red-500/20 text-red-400' :
                compatibility.type === 'warning' ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' :
                'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
              }`}>
                <div className="flex gap-3">
                  {compatibility.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  <div className="text-[11px] leading-relaxed font-mono">
                    {compatibility.message}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">Active Loader</span>
                <span className="text-zinc-300 font-mono font-bold uppercase">{project.modType}</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">Loader Target</span>
                <span className="text-zinc-300 font-mono">{project.mcVersion}</span>
              </div>
              <div className="h-px bg-zinc-800 my-2" />
              <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-600 font-bold uppercase">Loader Insight</span>
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                  {rule?.notes}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex gap-3">
            <Info size={16} className="text-blue-400 shrink-0" />
            <p className="text-[10px] text-blue-300/70 leading-relaxed">
              Exporting a project for an unsupported version may lead to build failures in your local development environment (IntelliJ/VSCode).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

