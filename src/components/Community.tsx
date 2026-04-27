import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Heart, 
  MessageSquare, 
  UserPlus, 
  Send,
  Loader2,
  Sword,
  Zap,
  Shield,
  Globe,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  getCommunityMods, 
  CommunityMod, 
  likeMod, 
  addComment, 
  getComments, 
  Comment,
  followUser,
  isFollowing
} from '../services/communityService';
import { auth } from '../lib/firebase';

export function Community() {
  const [mods, setMods] = useState<CommunityMod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMod, setSelectedMod] = useState<CommunityMod | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMods();
  }, []);

  const fetchMods = async () => {
    try {
      const data = await getCommunityMods();
      setMods(data);
      
      // Check following status for authors
      if (auth.currentUser) {
        const statuses: Record<string, boolean> = {};
        for (const mod of data) {
          if (!statuses[mod.authorId]) {
            statuses[mod.authorId] = await isFollowing(mod.authorId);
          }
        }
        setFollowingStatus(statuses);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (modId: string) => {
    try {
      await likeMod(modId);
      setMods(prev => prev.map(m => m.id === modId ? { ...m, likesCount: m.likesCount + 1 } : m));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFollow = async (authorId: string) => {
    try {
      await followUser(authorId);
      setFollowingStatus(prev => ({ ...prev, [authorId]: true }));
    } catch (e) {
      console.error(e);
    }
  };

  const openComments = async (mod: CommunityMod) => {
    setSelectedMod(mod);
    setComments([]);
    const data = await getComments(mod.id);
    setComments(data);
  };

  const handleAddComment = async () => {
    if (!selectedMod || !newComment.trim()) return;
    try {
      await addComment(selectedMod.id, newComment);
      setNewComment('');
      const data = await getComments(selectedMod.id);
      setComments(data);
      setMods(prev => prev.map(m => m.id === selectedMod.id ? { ...m, commentsCount: m.commentsCount + 1 } : m));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2 uppercase italic">Creators Feed</h1>
          <p className="text-zinc-500 font-mono text-[10px] tracking-[0.4em] uppercase">Discovery Collective</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mods.map((mod) => (
          <motion.div
            key={mod.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col"
          >
            <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-950/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                  {mod.authorPhoto ? (
                    <img src={mod.authorPhoto} alt={mod.authorName} className="w-full h-full object-cover" />
                  ) : (
                    <Users size={16} className="text-zinc-600 m-2" />
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold truncate max-w-[120px]">{mod.authorName}</div>
                  <div className="text-[9px] font-mono text-zinc-600 uppercase">CREATOR</div>
                </div>
              </div>
              {auth.currentUser && auth.currentUser.uid !== mod.authorId && (
                <button 
                  onClick={() => handleFollow(mod.authorId)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                    followingStatus[mod.authorId] 
                    ? 'bg-zinc-800 text-zinc-400 cursor-default' 
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
                >
                  {followingStatus[mod.authorId] ? <><UserCheck size={12} /> Following</> : <><UserPlus size={12} /> Follow</>}
                </button>
              )}
            </div>

            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                  {mod.modType === 'forge' && <Sword size={20} className="text-orange-400" />}
                  {mod.modType === 'fabric' && <Zap size={20} className="text-yellow-400" />}
                  {mod.modType === 'neoforge' && <Shield size={20} className="text-red-400" />}
                  {mod.modType === 'quilt' && <Globe size={20} className="text-cyan-400" />}
                </div>
                <div className="text-[10px] font-mono text-zinc-600 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                  MC {mod.mcVersion}
                </div>
              </div>
              <h3 className="text-lg font-bold mb-2 truncate">{mod.name}</h3>
              <p className="text-zinc-500 text-xs leading-relaxed line-clamp-3 mb-4">
                {mod.description}
              </p>
              <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400">
                <span className="uppercase">V{mod.version}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800" />
                <span>{new Date(mod.createdAt?.seconds * 1000).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="p-4 bg-zinc-950/50 border-t border-zinc-800 flex gap-4">
              <button 
                onClick={() => handleLike(mod.id)}
                className="flex items-center gap-2 text-zinc-500 hover:text-emerald-400 transition-colors"
                title="Like"
              >
                <Heart size={16} />
                <span className="text-xs font-mono">{mod.likesCount}</span>
              </button>
              <button 
                onClick={() => openComments(mod)}
                className="flex items-center gap-2 text-zinc-500 hover:text-blue-400 transition-colors"
                title="Comments"
              >
                <MessageSquare size={16} />
                <span className="text-xs font-mono">{mod.commentsCount}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comments Modal */}
      <AnimatePresence>
        {selectedMod && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedMod(null)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-xl h-[600px] flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-zinc-900 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{selectedMod.name}</h3>
                  <p className="text-xs text-zinc-500">Discussion Feed</p>
                </div>
                <button onClick={() => setSelectedMod(null)} className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-600 transition-colors">
                  <Users size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {comments.length > 0 ? comments.map(comment => (
                  <div key={comment.id} className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xs font-bold text-emerald-400">{comment.authorName}</div>
                      <div className="text-[10px] text-zinc-600 font-mono italic">
                        {comment.createdAt?.seconds ? new Date(comment.createdAt.seconds * 1000).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>
                    <p className="text-sm text-zinc-300 leading-relaxed">{comment.text}</p>
                  </div>
                )) : (
                  <div className="text-center py-20 text-zinc-600 font-mono text-xs">NO COMMENTS YET. BE THE FIRST?</div>
                )}
              </div>

              <div className="p-6 border-t border-zinc-900 bg-zinc-950">
                <div className="relative">
                  <input 
                    type="text" 
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                    placeholder="Type your comment..."
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pr-12 text-sm outline-none focus:border-emerald-500/50 transition-all"
                  />
                  <button 
                    onClick={handleAddComment}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-emerald-500 text-black rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                    disabled={!newComment.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
