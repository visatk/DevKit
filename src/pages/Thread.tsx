import React, { useEffect, useState, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Clock, MessageCircle, Send, Flame, Code, 
  Pin, LockKeyhole, ShieldAlert, Eye, Crown, Shield, Loader2, Key, Terminal
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SeoHead } from '@/components/SeoHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// ==========================================
// Types & Utility Mapping
// ==========================================

const formatCategory = (cat: string) => {
  const map: Record<string, string> = {
    'all': 'All', 'general': 'General', 'bins': 'BINS', 
    'methods': 'Methods', 'bin-list': 'BIN List', 'vcc': 'VCC', 
    'redeem-coupons-keys': 'Redeems & Keys'
  };
  return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
};

type Reply = { 
  id: number; 
  content: string; 
  author: string; 
  authorId: number; 
  upvotes: number; 
  isAcceptedAnswer?: boolean; 
  createdAt: string; 
  authorIsVip: boolean; 
  authorRole: string; 
};

type ThreadDetail = { 
  id: number; 
  title: string; 
  content: string; 
  category: string; 
  author: string; 
  authorId: number; 
  upvotes: number; 
  views: number; 
  replyCount: number; 
  isPinned: boolean; 
  isLocked: boolean; 
  createdAt: string; 
  hasLockedContent?: boolean; 
  lockedContent?: string; 
  unlockCost?: number; 
  authorIsVip: boolean; 
  authorRole: string; 
  replies: Reply[]; 
};

// ==========================================
// Performance Optimized Markdown Component
// ==========================================

const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[var(--border)] prose-pre:shadow-inner prose-a:text-[var(--orange)] hover:prose-a:text-amber-400">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

// ==========================================
// Main Thread Execution Context
// ==========================================

export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Payload Resolution
  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/forum/threads/${id}`);
      if (!res.ok) {
        if (res.status === 404) navigate('/forum');
        throw new Error('Failed to resolve vector');
      }
      setThread(await res.json());
    } catch {
      toast('Matrix fetch error. Connection dropped.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, toast]);

  useEffect(() => { 
    fetchThread(); 
  }, [fetchThread]);

  // Network Write Protocol
  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;
    
    setIsReplying(true);
    try {
      const res = await fetch(`/api/forum/threads/${id}/replies`, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ content: replyText }) 
      });
      
      if (res.ok) { 
        setReplyText(''); 
        fetchThread(); 
        toast('Transmission successfully appended.', 'success'); 
      } else { 
        const d = await res.json() as any; 
        toast(d.error || 'Failed to dispatch to edge node.', 'error'); 
      }
    } catch {
      toast('Network anomaly detected.', 'error'); 
    } finally { 
      setIsReplying(false); 
    }
  };

  // Cryptographic Decryption Protocol
  const handleUnlock = async () => {
    if (!user) return navigate('/login');
    if (thread?.unlockCost === undefined) return;
    
    // Preliminary strict check to prevent unnecessary API burn
    if (user.points < thread.unlockCost && !user.isVip && user.role !== 'admin') {
       toast(`Insufficient node reputation. Requires ${thread.unlockCost} pts.`, 'error');
       return;
    }
    
    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/forum/threads/${id}/unlock`, { method: 'POST' });
      if (res.ok) {
        toast('Encrypted block decrypted successfully.', 'success');
        await refreshUser(); // Re-sync points
        fetchThread();       // Fetch the decrypted data
      } else {
        const d = await res.json() as any; 
        toast(d.error || 'Decryption protocol failed.', 'error');
      }
    } catch {
      toast('Decryption handshake failed.', 'error'); 
    } finally { 
      setIsUnlocking(false); 
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-12 text-[var(--orange)] animate-spin opacity-80" />
        <span className="badge-mono text-[var(--text-muted)]">Resolving encrypted vector...</span>
      </div>
    );
  }

  if (!thread) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 animation-fade-in relative isolate">
      <SeoHead title={`${thread.title} | DevKit Matrix`} description={thread.content.substring(0, 150)} />

      {/* Navigation Return */}
      <Link 
        to="/forum" 
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] bg-[var(--surface-raised)] hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)] transition-all mb-8 border border-[var(--border)] shadow-sm w-fit active:scale-95"
      >
        <ArrowLeft className="size-4" /> Return to Matrix
      </Link>

      {/* Main Payload Frame */}
      <article className="glass rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl shadow-black/50 mb-10">
        <div className={`h-1.5 w-full bg-gradient-to-r ${thread.isPinned ? 'from-[var(--orange)] to-amber-400' : 'from-[var(--text-muted)] to-[var(--border-strong)]'}`} />
        
        <div className="p-6 md:p-10">
          {/* Thread Badges */}
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            {thread.isPinned && (
              <span className="badge-mono flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--orange-dim)] text-[var(--orange)] border border-[var(--orange-border)]">
                <Pin className="size-3" /> Pinned
              </span>
            )}
            {thread.isLocked && (
              <span className="badge-mono flex items-center gap-1.5 px-3 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20">
                <LockKeyhole className="size-3" /> Locked
              </span>
            )}
            <span className="badge-mono px-3 py-1 rounded-md bg-[var(--surface-active)] border border-[var(--border-strong)] text-[var(--text-secondary)] uppercase">
              {formatCategory(thread.category)}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
            {thread.title}
          </h1>

          {/* Author Details & Analytics */}
          <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-y border-[var(--border)] bg-[var(--surface-raised)]/40 rounded-xl px-5">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center size-12 rounded-full bg-[var(--surface-active)] border-2 border-[var(--border-strong)]">
                {thread.authorRole === 'admin' ? (
                  <Shield className="size-5 text-red-500" />
                ) : thread.authorIsVip ? (
                  <Crown className="size-5 text-amber-500" />
                ) : (
                  <User className="size-5 text-[var(--text-muted)]" />
                )}
              </div>
              <div>
                <div className="font-bold text-sm text-[var(--text-primary)]">{thread.author}</div>
                <div className="text-[11px] font-semibold text-[var(--text-muted)] tracking-wider mt-0.5 uppercase">
                  <Clock className="inline size-3 mr-1 -mt-0.5" />
                  {new Date(thread.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-[var(--bg)] px-4 py-2 rounded-lg border border-[var(--border)] shadow-inner">
              <span className="flex items-center gap-2 text-[12px] font-black text-[var(--orange)]" title="Reputation Upvotes">
                <Flame className="size-4" /> {thread.upvotes}
              </span>
              <span className="w-px h-4 bg-[var(--border-strong)]" />
              <span className="flex items-center gap-2 text-[12px] font-black text-[var(--text-secondary)]" title="Vector Views">
                <Eye className="size-4" /> {thread.views}
              </span>
            </div>
          </div>

          {/* Core Markdown Execution */}
          <div className="mb-10 text-[var(--text-primary)] leading-relaxed">
            <MemoizedMarkdown content={thread.content} />
          </div>

          {/* Protected / Encrypted Payload Block */}
          {thread.hasLockedContent && (
            <div className={`mt-8 rounded-2xl overflow-hidden border ${thread.lockedContent ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--orange-border)] bg-[var(--orange-dim)]'} shadow-inner`}>
              <div className={`flex items-center justify-between px-5 py-3.5 border-b ${thread.lockedContent ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-[var(--orange-border)] bg-[var(--orange)]/10'}`}>
                <div className="flex items-center gap-2.5">
                  {thread.lockedContent ? <Key className="size-4.5 text-emerald-400" /> : <LockKeyhole className="size-4.5 text-[var(--orange)]" />}
                  <span className={`text-[11px] font-black uppercase tracking-widest ${thread.lockedContent ? 'text-emerald-400' : 'text-[var(--orange)]'}`}>
                    {thread.lockedContent ? 'Decrypted Payload Executed' : 'Encrypted Payload Detected'}
                  </span>
                </div>
                {!thread.lockedContent && thread.unlockCost! > 0 && (
                   <span className="badge-mono text-[10px] bg-[var(--surface-active)] px-2.5 py-1 rounded border border-[var(--border)] text-[var(--text-primary)]">
                     Cost: {thread.unlockCost} PTS
                   </span>
                )}
              </div>
              
              <div className="p-6 md:p-8 text-sm">
                {thread.lockedContent ? (
                  // Unlocked State
                  <div className="font-mono text-emerald-300 break-words whitespace-pre-wrap selection:bg-emerald-500/30">
                    {thread.lockedContent}
                  </div>
                ) : (
                  // Locked State
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ShieldAlert className="size-12 mb-4 text-[var(--orange)] opacity-90 drop-shadow-[0_0_15px_rgba(255,107,43,0.3)]" />
                    <p className="text-[var(--text-primary)] font-bold text-base mb-2">
                      Secure Configuration Node
                    </p>
                    <p className="text-[var(--text-secondary)] font-medium mb-6 max-w-sm leading-relaxed text-xs">
                      This vector contains a protected payload. Execute the decryption sequence using your accumulated reputation points to reveal the configuration data.
                    </p>
                    <button 
                      onClick={handleUnlock} 
                      disabled={isUnlocking} 
                      className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-[var(--orange)] hover:opacity-90 text-white font-black text-sm shadow-xl shadow-[var(--orange-dim)] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isUnlocking ? <Loader2 className="size-4.5 animate-spin" /> : <Terminal className="size-4.5" />} 
                      Execute Decryption {thread.unlockCost! > 0 ? `(-${thread.unlockCost} pts)` : '(Free)'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Discussion Frame */}
      <div className="space-y-6">
        <h3 className="text-xl font-black flex items-center gap-3 text-[var(--text-primary)] ml-2 mb-8" style={{ fontFamily: 'Syne, sans-serif' }}>
          <MessageCircle className="size-5 text-[var(--orange)]" /> Network Responses ({thread.replies.length})
        </h3>
        
        {thread.replies.map(reply => (
          <div key={reply.id} className="flex gap-4 group">
            <div className="flex flex-col items-center gap-3">
              <div className="size-11 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center shrink-0">
                {reply.authorRole === 'admin' ? (
                  <Shield className="size-4.5 text-red-500" />
                ) : reply.authorIsVip ? (
                  <Crown className="size-4.5 text-amber-500" />
                ) : (
                  <User className="size-4.5 text-[var(--text-muted)]" />
                )}
              </div>
              <div className="w-px h-full bg-gradient-to-b from-[var(--border-strong)] to-transparent group-last:opacity-0" />
            </div>
            
            <div className="flex-1 pb-8">
              <div className="glass p-5 md:p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-3 mb-3 border-b border-[var(--border)] pb-3">
                  <span className="font-black text-sm text-[var(--text-primary)]">{reply.author}</span>
                  {reply.authorRole === 'admin' && <span className="badge-mono text-[9px] text-red-500 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">Admin</span>}
                  {reply.authorIsVip && <span className="badge-mono text-[9px] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">VIP</span>}
                  <span className="text-[10px] badge-mono text-[var(--text-muted)] ml-auto">
                    {new Date(reply.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed prose prose-invert max-w-none">
                  <MemoizedMarkdown content={reply.content} />
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Reply Editor / Lock Status */}
        <div className="flex gap-4 mt-6">
           {user && !thread.isLocked ? (
              <>
               <div className="size-11 rounded-full bg-[var(--surface-active)] border-2 border-[var(--orange-border)] flex items-center justify-center shrink-0 shadow-[0_0_15px_var(--orange-dim)]">
                 <User className="size-5 text-[var(--orange)]" />
               </div>
               <div className="flex-1">
                  <form onSubmit={handleReply} className="glass p-2 rounded-2xl border-2 border-[var(--orange-border)] bg-[var(--surface-raised)] shadow-lg shadow-[var(--orange-dim)] focus-within:border-[var(--orange)] transition-colors">
                    <textarea 
                      rows={5} 
                      placeholder="Compile response protocol (Markdown enabled)..." 
                      value={replyText} 
                      onChange={e => setReplyText(e.target.value)} 
                      className="w-full bg-transparent p-4 text-sm font-medium outline-none resize-none custom-scrollbar text-[var(--text-primary)] placeholder-[var(--text-muted)]" 
                    />
                    <div className="flex justify-end p-2 border-t border-[var(--border)] bg-[var(--surface)] rounded-b-xl">
                      <button 
                        disabled={isReplying || !replyText.trim()} 
                        className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-[var(--text-primary)] hover:bg-[var(--orange)] text-[var(--bg)] hover:text-white font-black text-sm transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isReplying ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} 
                        Transmit Payload
                      </button>
                    </div>
                  </form>
               </div>
              </>
           ) : thread.isLocked ? (
              <div className="w-full glass p-8 rounded-2xl border border-red-500/20 bg-red-500/5 text-center flex flex-col items-center justify-center mx-12">
                 <LockKeyhole className="size-8 text-red-500 mb-3" />
                 <h4 className="font-black text-lg text-red-500 mb-1">Vector Locked</h4>
                 <p className="text-xs font-semibold text-[var(--text-secondary)]">System administrators have secured this thread. Protocol transmission rejected.</p>
              </div>
           ) : (
              <div className="w-full glass p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface-raised)] text-center flex flex-col items-center justify-center mx-12">
                 <ShieldAlert className="size-8 text-[var(--text-muted)] mb-3" />
                 <h4 className="font-black text-lg text-[var(--text-primary)] mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>Authentication Required</h4>
                 <p className="text-xs font-semibold text-[var(--text-secondary)] mb-6">You must establish a secure identity session to append to this vector.</p>
                 <Link 
                   to="/login" 
                   className="px-8 py-3 rounded-xl bg-[var(--orange)] text-white font-black text-sm hover:opacity-90 transition-all shadow-lg active:scale-95"
                 >
                   Authenticate
                 </Link>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
