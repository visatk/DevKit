import React, { useEffect, useState, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Clock, MessageCircle, Send, Flame, Code, Pin, LockKeyhole, ShieldAlert, Hash, Eye, Crown, Shield, Loader2, Key } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SeoHead } from '@/components/SeoHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type Reply = { id: number; content: string; author: string; authorId: number; upvotes: number; createdAt: string; authorIsVip: boolean; authorRole: string; };
type ThreadDetail = { id: number; title: string; content: string; category: string; author: string; authorId: number; upvotes: number; views: number; replyCount: number; isPinned: boolean; isLocked: boolean; createdAt: string; hasLockedContent?: boolean; lockedContent?: string; unlockCost?: number; authorIsVip: boolean; authorRole: string; replies: Reply[]; };

const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <div className="prose prose-invert prose-sm md:prose-base max-w-none prose-pre:bg-[#0d1117] prose-pre:border prose-pre:border-[var(--border)] prose-pre:shadow-inner prose-a:text-[var(--orange)] hover:prose-a:text-amber-400">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

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

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/forum/threads/${id}`);
      if (!res.ok) { if (res.status === 404) navigate('/forum'); throw new Error('Failed to resolve vector'); }
      setThread(await res.json());
    } catch { toast('Matrix fetch error.', 'error'); } finally { setIsLoading(false); }
  }, [id, navigate, toast]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;
    setIsReplying(true);
    try {
      const res = await fetch(`/api/forum/threads/${id}/replies`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: replyText }) });
      if (res.ok) { setReplyText(''); fetchThread(); toast('Transmission successful.', 'success'); }
      else { const d = await res.json() as any; toast(d.error || 'Failed to dispatch.', 'error'); }
    } catch { toast('Network anomaly.', 'error'); } finally { setIsReplying(false); }
  };

  const handleUnlock = async () => {
    if (!user) return navigate('/login');
    if (!thread?.unlockCost) return;
    if (user.points < thread.unlockCost && !user.isVip && user.role !== 'admin') {
       toast(`Insufficient points. Requires ${thread.unlockCost} pts.`, 'error');
       return;
    }
    
    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/forum/threads/${id}/unlock`, { method: 'POST' });
      if (res.ok) {
        toast('Encrypted block unlocked.', 'success');
        await refreshUser();
        fetchThread();
      } else {
        const d = await res.json() as any; toast(d.error || 'Decryption failed.', 'error');
      }
    } catch { toast('Decryption handshake failed.', 'error'); } finally { setIsUnlocking(false); }
  };

  if (isLoading) return <div className="flex justify-center py-32"><Loader2 className="size-10 text-[var(--orange)] animate-spin" /></div>;
  if (!thread) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 animation-fade-in relative isolate">
      <SeoHead title={`${thread.title} | DevKit Forum`} description={thread.content.substring(0, 150)} />

      <Link to="/forum" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-[var(--text-secondary)] bg-[var(--surface-raised)] hover:bg-[var(--surface-active)] hover:text-[var(--text-primary)] transition-all mb-8 border border-[var(--border)] shadow-sm w-fit active:scale-95">
        <ArrowLeft className="size-4" /> Return to Matrix
      </Link>

      <article className="glass rounded-3xl overflow-hidden border border-[var(--border)] shadow-2xl shadow-black/50 mb-10">
        <div className={`h-1.5 w-full bg-gradient-to-r ${thread.isPinned ? 'from-[var(--orange)] to-amber-400' : 'from-[var(--text-muted)] to-[var(--border-strong)]'}`} />
        <div className="p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-2.5 mb-6">
            {thread.isPinned && <span className="badge-mono flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--orange-dim)] text-[var(--orange)] border border-[var(--orange-border)]"><Pin className="size-3" /> Pinned</span>}
            <span className="badge-mono px-2.5 py-1 rounded bg-[var(--surface-active)] border border-[var(--border-strong)] text-[var(--text-secondary)] uppercase">{thread.category}</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
            {thread.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 mb-8 border-y border-[var(--border)] bg-[var(--surface-raised)]/30 rounded-xl px-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-full bg-[var(--surface-active)] border border-[var(--border-strong)]">
                {thread.authorRole === 'admin' ? <Shield className="size-4 text-red-500" /> : thread.authorIsVip ? <Crown className="size-4 text-amber-500" /> : <User className="size-4 text-[var(--text-muted)]" />}
              </div>
              <div>
                <div className="font-bold text-sm text-[var(--text-primary)]">{thread.author}</div>
                <div className="text-[10px] text-[var(--text-muted)] badge-mono"><Clock className="inline size-3 mr-1 -mt-0.5" />{new Date(thread.createdAt).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[var(--bg)] px-3 py-1.5 rounded-lg border border-[var(--border)]">
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--orange)]"><Flame className="size-3" /> {thread.upvotes}</span>
              <span className="w-px h-3 bg-[var(--border-strong)]" />
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--text-secondary)]"><Eye className="size-3" /> {thread.views}</span>
            </div>
          </div>

          <div className="mb-10 text-[var(--text-primary)] leading-relaxed">
            <MemoizedMarkdown content={thread.content} />
          </div>

          {/* Encrypted Locked Content Area */}
          {thread.hasLockedContent && (
            <div className={`mt-8 rounded-2xl overflow-hidden border ${thread.lockedContent ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-[var(--orange-border)] bg-[var(--orange-dim)]'} shadow-inner`}>
              <div className={`flex items-center justify-between px-5 py-3 border-b ${thread.lockedContent ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-[var(--orange-border)] bg-[var(--orange)]/10'}`}>
                <div className="flex items-center gap-2">
                  {thread.lockedContent ? <Key className="size-4 text-emerald-400" /> : <LockKeyhole className="size-4 text-[var(--orange)]" />}
                  <span className={`text-xs font-black uppercase tracking-widest ${thread.lockedContent ? 'text-emerald-400' : 'text-[var(--orange)]'}`}>
                    {thread.lockedContent ? 'Decrypted Payload' : 'Encrypted Payload Locked'}
                  </span>
                </div>
                {!thread.lockedContent && thread.unlockCost! > 0 && (
                   <span className="badge-mono text-[10px] bg-[var(--surface-active)] px-2 py-1 border border-[var(--border)] text-[var(--text-primary)]">Cost: {thread.unlockCost} PTS</span>
                )}
              </div>
              <div className="p-6 text-sm">
                {thread.lockedContent ? (
                  <div className="font-mono text-emerald-300 break-words whitespace-pre-wrap selection:bg-emerald-500/30">{thread.lockedContent}</div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <ShieldAlert className="size-10 mb-3 text-[var(--orange)] opacity-80" />
                    <p className="text-[var(--text-secondary)] font-medium mb-5 max-w-sm">This vector contains a secure payload. Execute decryption protocol to access the underlying configurations or keys.</p>
                    <button onClick={handleUnlock} disabled={isUnlocking} className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[var(--orange)] hover:opacity-90 text-white font-bold text-sm shadow-lg shadow-[var(--orange-dim)] transition-all active:scale-95 disabled:opacity-50">
                      {isUnlocking ? <Loader2 className="size-4 animate-spin" /> : <LockKeyhole className="size-4" />} Unlock Payload
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Discussion Thread */}
      <div className="space-y-6">
        <h3 className="text-xl font-black flex items-center gap-3 text-[var(--text-primary)] ml-2" style={{ fontFamily: 'Syne, sans-serif' }}>
          <MessageCircle className="size-5 text-[var(--text-muted)]" /> Node Discussion ({thread.replies.length})
        </h3>
        
        {thread.replies.map(reply => (
          <div key={reply.id} className="flex gap-4 group">
            <div className="flex flex-col items-center gap-2">
              <div className="size-10 rounded-full bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center shrink-0">
                {reply.authorRole === 'admin' ? <Shield className="size-4 text-red-500" /> : reply.authorIsVip ? <Crown className="size-4 text-amber-500" /> : <User className="size-4 text-[var(--text-muted)]" />}
              </div>
              <div className="w-px h-full bg-[var(--border)] group-last:bg-transparent" />
            </div>
            <div className="flex-1 pb-8">
              <div className="glass p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-bold text-sm text-[var(--text-primary)]">{reply.author}</span>
                  <span className="text-[10px] badge-mono text-[var(--text-muted)]">{new Date(reply.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-[var(--text-secondary)] leading-relaxed"><MemoizedMarkdown content={reply.content} /></div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Reply Editor */}
        <div className="flex gap-4 mt-4">
           <div className="size-10 rounded-full bg-[var(--surface-active)] border border-[var(--orange-border)] flex items-center justify-center shrink-0 shadow-[0_0_15px_var(--orange-dim)]">
             <User className="size-4 text-[var(--orange)]" />
           </div>
           <div className="flex-1">
             {user ? (
                <form onSubmit={handleReply} className="glass p-2 rounded-2xl border border-[var(--orange-border)] bg-[var(--surface-raised)] shadow-lg shadow-[var(--orange-dim)] focus-within:ring-2 focus-within:ring-[var(--orange)] transition-all">
                  <textarea rows={4} placeholder="Transmit response sequence..." value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full bg-transparent p-4 text-sm font-medium outline-none resize-none custom-scrollbar text-[var(--text-primary)]" />
                  <div className="flex justify-end p-2 border-t border-[var(--border)]">
                    <button disabled={isReplying || !replyText.trim()} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--text-primary)] hover:bg-[var(--orange)] text-[var(--bg)] hover:text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50">
                      {isReplying ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Transmit
                    </button>
                  </div>
                </form>
             ) : (
                <div className="glass p-8 rounded-2xl border border-[var(--border)] text-center flex flex-col items-center justify-center">
                   <LockKeyhole className="size-6 text-[var(--text-muted)] mb-3" />
                   <p className="text-sm font-bold text-[var(--text-secondary)] mb-4">Authentication required to append to vector.</p>
                   <Link to="/login" className="px-6 py-2.5 rounded-xl bg-[var(--orange)] text-white font-bold text-sm hover:opacity-90 transition-all shadow-md active:scale-95">Authenticate</Link>
                </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
