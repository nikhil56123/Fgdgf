import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Code2, 
  Box, 
  Download, 
  FolderOpen, 
  X,
  Layers, 
  FileCode, 
  Shapes,
  Sword,
  Wrench,
  Settings2,
  ChevronRight,
  Database,
  Shield,
  Zap,
  Globe,
  Upload,
  User as UserIcon,
  LogOut,
  Sparkles,
  LogIn,
  Save,
  Cloud,
  Loader2,
  Users
} from 'lucide-react';
import { useProjectStore, ModProject } from './store';
import { FORGE_TEMPLATE, FABRIC_TEMPLATE, NEOFORGE_TEMPLATE, QUILT_TEMPLATE } from './templates';
import { VoxelModeler } from './components/VoxelModeler';
import { CodeEditor } from './components/CodeEditor';
import { ProjectSettings } from './components/ProjectSettings';
import JSZip from 'jszip';
import { AIAssistant } from './components/AIAssistant';
import { Community } from './components/Community';
import { publishMod } from './services/communityService';
import { auth, loginWithGoogle, logout, saveProject, fetchUserProjects } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const { project, setProject, activeFile, activeModel } = useProjectStore();
  const [view, setView] = useState<'editor' | 'modeler' | 'settings' | 'dashboard'>('editor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<ModProject[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'ai' | 'account' | 'community'>('projects');
  const [selectedTemplate, setSelectedTemplate] = useState<ModProject | null>(null);
  const [setupData, setSetupData] = useState({ name: '', mcVersion: '1.20.1', version: '1.0.0' });
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (!project) setView('dashboard');
  }, [project]);

  useEffect(() => {
    if (selectedTemplate) {
      setSetupData({
        name: selectedTemplate.name,
        mcVersion: selectedTemplate.mcVersion,
        version: selectedTemplate.version
      });
    }
  }, [selectedTemplate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        loadUserProjects();
      } else {
        setUserProjects([]);
      }
    });
    return unsubscribe;
  }, []);

  const loadUserProjects = async () => {
    const projects = await fetchUserProjects();
    setUserProjects(projects);
  };

  const login = async () => {
    try {
      const u = await loginWithGoogle();
      setUser(u);
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error("Login Error:", e);
    }
  };

  const createFromTemplate = () => {
    if (!selectedTemplate) return;
    setProject({
      ...selectedTemplate,
      id: Math.random().toString(36).substr(2, 9),
      name: setupData.name,
      mcVersion: setupData.mcVersion,
      version: setupData.version
    });
    setSelectedTemplate(null);
    setView('editor');
  };

  const handleSaveToCloud = async () => {
    if (!project || !user) return;
    setIsSyncing(true);
    try {
      await saveProject(project);
      await loadUserProjects();
    } catch (e) {
      alert("Failed to save to cloud");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = async () => {
    if (!project) return;
    const zip = new JSZip();
    
    // Add source files
    const src = zip.folder('src/main/java');
    project.files.forEach(file => {
      src?.file(file.name, file.content);
    });

    // Add models
    const models = zip.folder('src/main/resources/assets/modid/models');
    Object.entries(project.models).forEach(([name, voxels]) => {
      models?.file(`${name.toLowerCase()}.json`, JSON.stringify(voxels, null, 2));
    });

    // Add manifest-like info
    zip.file('project_metadata.json', JSON.stringify({
      name: project.name,
      version: project.version,
      mcVersion: project.mcVersion,
      modType: project.modType
    }, null, 2));

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.zip`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const metadataFile = zip.file('project_metadata.json');
      if (!metadataFile) {
        alert('Invalid project zip: Missing project_metadata.json');
        return;
      }

      const metadata = JSON.parse(await metadataFile.async('text'));
      const files: any[] = [];
      const srcFolder = zip.folder('src/main/java');
      if (srcFolder) {
        const filePromises: Promise<void>[] = [];
        srcFolder.forEach((relativePath, zipFile) => {
          if (!zipFile.dir) {
            filePromises.push((async () => {
              const content = await zipFile.async('text');
              files.push({
                name: relativePath,
                content,
                language: relativePath.endsWith('.java') ? 'java' : 'json'
              });
            })());
          }
        });
        await Promise.all(filePromises);
      }

      setProject({
        ...metadata,
        id: Math.random().toString(36).substr(2, 9),
        files,
        models: {} // Models omitted for simplicity in this basic import
      });
    };
    reader.readAsArrayBuffer(file);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 bg-[grid-white/[0.02]] bg-[size:32px_32px]">
        <div className="absolute inset-0 bg-zinc-950 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full text-center relative z-10"
        >
          <div className="mb-12">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center border border-emerald-500/20 mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
              <Database size={40} className="text-emerald-400" />
            </div>
            <h1 className="text-5xl font-black mb-4 tracking-tight">ForgeCraft Studio</h1>
            <p className="text-zinc-400 text-lg leading-relaxed">
              Professional Minecraft mod development environment. 
              Sign in to sync your projects across devices.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={loginWithGoogle}
              className="flex items-center gap-3 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-2xl transition-all font-black text-lg w-full justify-center shadow-xl shadow-white/5 group"
            >
              <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
              Start Building with Google
            </button>
            <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-[0.3em] text-zinc-600 mt-4">
              <span>Secure Cloud Sync</span>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>AI Integration</span>
              <div className="w-1 h-1 rounded-full bg-zinc-800" />
              <span>Voxel Assets</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!project || view === 'dashboard') {
    return (
      <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
        {/* Dashboard Rail */}
        <div className="w-16 flex flex-col items-center py-6 gap-8 border-r border-zinc-900 bg-zinc-950 z-50">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
            <Database size={24} className="text-white" />
          </div>
          
          <div className="flex flex-col gap-6">
            <NavButton 
              active={activeTab === 'account'} 
              onClick={() => setActiveTab('account')} 
              icon={<UserIcon size={22} />} 
              title="Account"
            />
            <NavButton 
              active={activeTab === 'projects'} 
              onClick={() => setActiveTab('projects')} 
              icon={<FolderOpen size={22} />} 
              title="Projects"
            />
            <NavButton 
              active={activeTab === 'community'} 
              onClick={() => setActiveTab('community')} 
              icon={<Users size={22} />} 
              title="Community"
            />
            <NavButton 
              active={activeTab === 'ai'} 
              onClick={() => setActiveTab('ai')} 
              icon={<Sparkles size={22} />} 
              title="AI Academy"
            />
          </div>

          <div className="mt-auto">
            <NavButton 
              onClick={logout} 
              icon={<LogOut size={22} />} 
              className="text-zinc-600 hover:text-red-400"
              title="Logout"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent)]">
          <div className="max-w-6xl mx-auto p-12">
            <AnimatePresence mode="wait">
              {activeTab === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <div className="flex justify-between items-end mb-12">
                    <div>
                      <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Mod Dashboard</h1>
                      <p className="text-zinc-500 font-mono text-[10px] tracking-[0.4em] uppercase">ForgeCraft Studio Workspace</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer bg-zinc-900/50 border border-zinc-800 px-4 py-2 rounded-lg text-xs hover:border-zinc-700 transition-all">
                        <Upload size={14} /> Import ZIP
                        <input type="file" accept=".zip" onChange={handleImport} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {userProjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                      {userProjects.map(p => (
                        <motion.button
                          key={p.id}
                          whileHover={{ scale: 1.02, y: -4 }}
                          onClick={() => { setProject(p); setView('editor'); }}
                          className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-left transition-all hover:border-emerald-500/50 group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Code2 size={40} />
                          </div>
                          <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800">
                              <Sword size={20} className="text-emerald-500" />
                            </div>
                            <span className="text-[9px] font-mono bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded-full text-emerald-400">
                              {p.modType.toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold mb-1 truncate">{p.name}</h3>
                          <p className="text-zinc-500 text-[10px] font-mono">VERS: {p.version} • MC {p.mcVersion}</p>
                        </motion.button>
                      ))}
                      <button 
                        onClick={() => document.getElementById('template-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="border-2 border-dashed border-zinc-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-zinc-600 hover:text-emerald-400"
                      >
                        <Plus size={32} />
                        <span className="text-xs font-bold uppercase tracking-widest">New Mod</span>
                      </button>
                    </div>
                  ) : (
                    <div className="bg-zinc-900/30 border border-zinc-800 rounded-3xl p-16 text-center mb-16">
                      <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 mx-auto mb-6">
                        <FolderOpen size={32} className="text-zinc-700" />
                      </div>
                      <h2 className="text-xl font-bold mb-2">No Projects Found</h2>
                      <p className="text-zinc-500 text-sm mb-8 max-w-sm mx-auto">Start your journey by creating a new mod from one of our professional templates below.</p>
                      <button 
                        onClick={() => document.getElementById('template-section')?.scrollIntoView({ behavior: 'smooth' })}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20"
                      >
                        Create Your First Mod
                      </button>
                    </div>
                  )}

                  <div id="template-section" className="pt-12 border-t border-zinc-900">
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-[0.3em] mb-8">Base Engine Templates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { t: FORGE_TEMPLATE, icon: <Sword size={22} className="text-orange-400" />, label: "Forge" },
                        { t: FABRIC_TEMPLATE, icon: <Zap size={22} className="text-yellow-400" />, label: "Fabric" },
                        { t: NEOFORGE_TEMPLATE, icon: <Shield size={22} className="text-red-400" />, label: "NeoForge" },
                        { t: QUILT_TEMPLATE, icon: <Globe size={22} className="text-cyan-400" />, label: "Quilt" }
                      ].map((item, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02, y: -4 }}
                          onClick={() => setSelectedTemplate(item.t)}
                          className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl text-left hover:border-zinc-600 transition-all group"
                        >
                          <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center mb-4 border border-zinc-800 group-hover:border-zinc-700 transition-colors">
                            {item.icon}
                          </div>
                          <h3 className="text-lg font-bold mb-1">{item.label}</h3>
                          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Initialize Script</p>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Template Setup Modal */}
                  <AnimatePresence>
                    {selectedTemplate && (
                      <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
                          onClick={() => setSelectedTemplate(null)}
                        >
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                             <div className="flex justify-between items-start mb-8">
                               <div>
                                 <h2 className="text-2xl font-black italic tracking-tight">PROJECT SETUP</h2>
                                 <p className="text-zinc-500 text-[10px] uppercase font-mono tracking-widest mt-1">Configuring {selectedTemplate.modType} Engine</p>
                               </div>
                               <button onClick={() => setSelectedTemplate(null)} className="text-zinc-600 hover:text-white transition-colors">
                                 <X size={20} />
                               </button>
                             </div>

                             <div className="space-y-6">
                               <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Mod Name</label>
                                 <input 
                                   type="text"
                                   value={setupData.name}
                                   onChange={e => setSetupData(prev => ({ ...prev, name: e.target.value }))}
                                   className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all"
                                   placeholder="My Epic Mod"
                                 />
                               </div>

                               <div className="grid grid-cols-2 gap-4">
                               <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Minecraft Version</label>
                                 <select
                                   value={setupData.mcVersion}
                                   onChange={e => setSetupData(prev => ({ ...prev, mcVersion: e.target.value }))}
                                   className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all appearance-none"
                                 >
                                   <option value="1.21">1.21</option>
                                   <option value="1.20.4">1.20.4</option>
                                   <option value="1.20.1">1.20.1</option>
                                   <option value="1.19.4">1.19.4</option>
                                   <option value="1.18.2">1.18.2</option>
                                   <option value="1.16.5">1.16.5</option>
                                   <option value="1.12.2">1.12.2</option>
                                 </select>
                               </div>
                               <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Mod Version</label>
                                 <input 
                                   type="text"
                                   value={setupData.version}
                                   onChange={e => setSetupData(prev => ({ ...prev, version: e.target.value }))}
                                   className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm focus:border-emerald-500/50 outline-none transition-all"
                                 />
                               </div>
                               </div>

                               <button 
                                 onClick={createFromTemplate}
                                 className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black text-lg transition-all shadow-xl shadow-emerald-500/10 mt-4"
                               >
                                 INITIALIZE PROJECT
                               </button>
                             </div>
                          </motion.div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  <Community />
                </motion.div>
              )}

              {activeTab === 'ai' && (
                <motion.div
                  key="ai"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-2xl"
                >
                   <h1 className="text-4xl font-black mb-4 uppercase italic">AI Academy</h1>
                   <p className="text-zinc-500 mb-12">Learn how to prompt our Mod Architect for complex Minecraft features. The AI is built into every workspace via the assistant tab.</p>
                   
                   <div className="space-y-6">
                     {[
                       { q: "Create a sapphire ore that spawns in the nether", t: "Ore Generation" },
                       { q: "A sword that shoots lightning when you strike an entitiy", t: "Advanced Items" },
                       { q: "A machine that converts coal into diamonds over time", t: "Tile Entities" }
                     ].map((eg, i) => (
                       <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex items-center justify-between">
                         <div>
                           <div className="text-[10px] text-emerald-500 font-bold uppercase mb-1">{eg.t}</div>
                           <div className="text-sm italic text-zinc-300">"{eg.q}"</div>
                         </div>
                         <Sparkles size={20} className="text-zinc-700" />
                       </div>
                     ))}
                   </div>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="max-w-md"
                >
                   <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl text-center">
                     <div className="w-24 h-24 bg-zinc-950 rounded-full border-4 border-emerald-500/20 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                        {user.photoURL ? <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-zinc-700" />}
                     </div>
                     <h2 className="text-2xl font-bold mb-1">{user.displayName}</h2>
                     <p className="text-zinc-500 text-sm mb-8">{user.email}</p>
                     
                     <div className="grid grid-cols-2 gap-4 mb-8">
                       <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                         <div className="text-2xl font-bold text-emerald-500">{userProjects.length}</div>
                         <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Cloud Mods</div>
                       </div>
                       <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                         <div className="text-2xl font-bold text-blue-500">PRO</div>
                         <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mt-1">Tier Status</div>
                       </div>
                     </div>

                     <button 
                       onClick={logout}
                       className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all font-bold"
                     >
                       Sign Out of Session
                     </button>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-emerald-500/30 overflow-hidden">
      {/* Navigation Rail */}
      <div className="w-16 flex flex-col items-center py-6 gap-8 border-r border-zinc-900 bg-zinc-950 z-50">
        <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/20">
          <Database size={24} className="text-white" />
        </div>
        
        <div className="flex flex-col gap-4">
          <NavButton 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
            icon={<FolderOpen size={22} />} 
            title="Dashboard"
          />
          <div className="h-px bg-zinc-800 mx-3" />
          <NavButton 
            active={view === 'editor'} 
            onClick={() => setView('editor')} 
            icon={<Code2 size={22} />} 
            title="Code Editor"
          />
          <NavButton 
            active={view === 'modeler'} 
            onClick={() => setView('modeler')} 
            icon={<Box size={22} />} 
            title="Model Designer"
          />
          <NavButton 
            active={view === 'settings'} 
            onClick={() => setView('settings')} 
            icon={<Settings2 size={22} />} 
            title="Project Settings"
          />
        </div>

        <div className="mt-auto flex flex-col gap-4">
          {user && (
            <NavButton 
              onClick={handleSaveToCloud} 
              icon={isSyncing ? <Cloud size={22} className="animate-pulse" /> : <Save size={22} />} 
              className={isSyncing ? "text-emerald-400" : "text-emerald-400 hover:bg-emerald-500/10"}
              title="Save to Cloud"
            />
          )}
          <NavButton 
            onClick={handleExport} 
            icon={<Download size={22} />} 
            className="text-emerald-400 hover:bg-emerald-500/10"
            title="Export ZIP"
          />
          <NavButton 
            onClick={() => user ? logout() : useProjectStore.setState({ project: null })} 
            icon={<LogOut size={22} />} 
            className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
            title={user ? "Logout" : "Exit Project"}
          />
        </div>
      </div>

      {/* Sidebar */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-zinc-950 border-r border-zinc-900 h-full flex flex-col relative"
          >
            <div className="p-4 border-b border-zinc-900">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-zinc-500 mb-1">Active Mod</h2>
              <h3 className="font-bold truncate text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {project.name}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="p-4 flex flex-col h-full">
                <div className="flex-1">
                  <SectionHeader icon={<FileCode size={14} />} title="Core Logic" />
                  <div className="space-y-1 mt-3">
                    {project.files.map(file => (
                      <FileLink 
                        key={file.name}
                        active={activeFile === file.name && view === 'editor'}
                        onClick={() => {
                          setView('editor');
                          useProjectStore.setState({ activeFile: file.name });
                        }}
                        name={file.name}
                      />
                    ))}
                  </div>

                  <div className="mt-8">
                    <SectionHeader icon={<Shapes size={14} />} title="Resources" />
                    <div className="space-y-1 mt-3">
                      {Object.keys(project.models).map(name => (
                        <FileLink 
                          key={name}
                          active={activeModel === name && view === 'modeler'}
                          onClick={() => {
                            setView('modeler');
                            useProjectStore.setState({ activeModel: name });
                          }}
                          name={name}
                        />
                      ))}
                      <button 
                        onClick={() => {
                          const name = prompt('New Model Name:');
                          if (name) useProjectStore.getState().addModel(name);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 rounded-lg transition-all mt-1"
                      >
                        <Plus size={14} /> New Model Asset
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <AIAssistant />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Workspace Area */}
      <div className="flex-1 flex flex-col relative h-full">
        <div className="h-12 bg-zinc-950 border-b border-zinc-900 flex items-center px-4 gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <Layers size={18} />
          </button>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">
            {view === 'editor' ? `src.${activeFile}` : view === 'modeler' ? `res.models.${activeModel}` : 'sys.settings'}
          </div>
          
          <div className="ml-auto flex items-center gap-4">
             {user && (
               <button 
                 onClick={async () => {
                   const desc = prompt("Enter a description for your mod:");
                   if (desc !== null) {
                     setIsPublishing(true);
                     try {
                       await publishMod(project, desc);
                       alert("Published successfully!");
                     } catch (e) {
                       alert("Publish failed. Check console.");
                       console.error(e);
                     } finally {
                       setIsPublishing(false);
                     }
                   }
                 }}
                 disabled={isPublishing}
                 className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border border-emerald-500/20 disabled:opacity-50"
               >
                 {isPublishing ? <Loader2 size={12} className="animate-spin" /> : <Globe size={12} />}
                 Publish
               </button>
             )}
             <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {project.modType.toUpperCase()}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  MC {project.mcVersion}
                </div>
             </div>
          </div>
        </div>

        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + (activeFile || '') + (activeModel || '')}
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.995 }}
              transition={{ duration: 0.15 }}
              className="h-full w-full"
            >
              {view === 'editor' ? <CodeEditor /> : view === 'modeler' ? <VoxelModeler /> : <ProjectSettings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function NavButton({ active, icon, onClick, className = '', title }: any) {
  return (
    <button 
      onClick={onClick}
      title={title}
      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
        active 
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 px-2' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 px-2'
      } ${className}`}
    >
      {icon}
      {active && (
        <motion.div 
          layoutId="nav-glow"
          className="absolute inset-0 bg-emerald-400 blur-md opacity-20 -z-10"
        />
      )}
    </button>
  );
}

function SectionHeader({ icon, title }: any) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-600 font-bold border-b border-zinc-900/50 pb-2">
      {icon}
      <span>{title}</span>
    </div>
  );
}

function FileLink({ active, name, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center gap-2 group border ${
        active 
          ? 'bg-zinc-900 text-emerald-400 border-zinc-800 shadow-sm' 
          : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 border-transparent'
      }`}
    >
      <div className={`w-1 h-1 rounded-full ${active ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-transparent group-hover:bg-zinc-700'}`} />
      <span className="truncate">{name}</span>
    </button>
  );
}
