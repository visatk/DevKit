import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, User, Clock, MessageCircle, Send, Flame, Bold, Italic, 
  Code, Pin, LockKeyhole, Trash2, ShieldAlert, Hash, Eye, Crown, 
  Shield, CheckCircle2, Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SeoHead } from '@/components/SeoHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// ==========================================
// Types & Utility
// ==========================================

const formatCategory = (cat: string) => {
  if (cat === 'all') return 'All';
  if (cat === 'bin-list') return 'BIN List';
  if (cat === 'vcc') return 'VCC';
  if (cat === 'bins') return 'BINS';
  if (cat === 'redeem-coupons-keys') return 'Redeem / Coupons / Keys';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

type Reply = { 
  id: number; content: string; author: string; authorId: number; 
  upvotes: number; isAcceptedAnswer?: boolean; createdAt: string; 
  authorIsVip: boolean; authorRole: string; 
};

type ThreadDetail = { 
  id: number; title: string; content: string; category: string; author: string; authorId: number; 
  upvotes: number; views: number; replyCount: number; isPinned: boolean; isLocked: boolean; createdAt: string; 
  hasLockedContent?: boolean; lockedContent?: string; unlockCost?: number;
  authorIsVip: boolean; authorRole: string;
  replies: Reply[]; 
};

// ==========================================
// Memoized Sub-Components (Performance)
// ==========================================

const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

const ReplyCard = memo(({ 
  reply, currentUserId, isModerator, onVote, onDelete 
}: { 
  reply: Reply; currentUserId?: number; isModerator: boolean; 
  onVote: (type: 'reply', id: number, authorId: number) => void;
  onDelete: (id: number) => void;
}) => {
  const isAuthor = currentUserId === reply.authorId;

  return (
    <article className={`relative glass border rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-8 ml-0 md:ml-12 flex flex-col sm:flex-row gap-5 md:gap-8 transition-all hover:shadow-xl shadow-[var(--orange-dim)] ${reply.isAcceptedAnswer ? 'border-emerald-500/50 bg-emerald-500/5' : reply.authorIsVip ? 'border-amber-500/30' : 'border-[var(--border)] hover:border-[var(--orange-border)]'}`}>
      
      {reply.isAcceptedAnswer && (
        <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-emerald-500 text-[#fff] p-1.5 md:p-2 rounded-xl shadow-lg border-2 border-[var(--bg)]" title="Accepted Output">
          <CheckCircle2 className="size-5 md:size-6" />
        </div>
      )}

      {(isModerator || isAuthor) && (
        <button onClick={() => onDelete(reply.id)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer shadow-sm" title="Wipe Reply">
          <Trash2 className="size-4" />
        </button>
      )}

      <aside className="flex sm:flex-col items-center justify-between sm:justify-start gap-4 sm:gap-2 shrink-0 border-b sm:border-b-0 sm:border-r border-[var(--border)] pb-4 sm:pb-0 sm:pr-6 md:pr-8">
        <div className="flex sm:flex-col items-center gap-3 sm:gap-2">
          <button 
            onClick={() => onVote('reply', reply.id, reply.authorId)} 
            disabled={isAuthor}
            className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all border border-transparent shadow-sm group ${isAuthor ? 'text-[var(--text-muted)] bg-[var(--surface-raised)] opacity-50 cursor-not-allowed' : 'text-[var(--text-muted)] hover:text-[var(--orange)] bg-[var(--surface-raised)] hover:border-[var(--orange-border)] cursor-pointer hover:-translate-y-1 hover:shadow-md'}`}
          >
            <Flame className="size-4 md:size-5 group-hover:scale-110 transition-transform" />
          </button>
          <span className="font-black text-lg md:text-xl text-[var(--text-primary)]">{reply.upvotes}</span>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 border-b border-[var(--border)] pb-3 md:pb-4">
          <Link to={`/profile/${reply.author}`} className="flex items-center gap-2.5 group bg-[var(--surface-raised)] px-2.5 md:px-3 py-1.5 rounded-lg border border-transparent hover:border-[var(--border-strong)] transition-colors">
            <div className="size-6 md:size-7 rounded-full bg-[var(--surface)] flex items-center justify-center shadow-sm shrink-0">
              {reply.authorRole === 'admin' ? <Shield className="size-3 md:size-3.5 text-red-500" /> : reply.authorIsVip ? <Crown className="size-3 md:size-3.5 text-amber-500" /> : <User className="size-3 md:size-3.5 text-[var(--text-muted)] group-hover:text-[var(--orange)] transition-colors" />}
            </div>
            <span className="font-bold text-xs md:text-sm truncate max-w-[120px] md:max-w-[200px] text-[var(--text-primary)] group-hover:text-[var(--orange)] transition-colors">{reply.author}</span>
          </Link>
          <time dateTime={new Date(reply.createdAt).toISOString()} className="text-[10px] md:text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-1 md:gap-1.5 ml-auto sm:ml-0">
            <Clock className="size-3 md:size-3.5" /> {new Date(reply.createdAt).toLocaleDateString()}
          </time>
        </header>
        <div className="prose prose-invert max-w-none prose-p:leading-relaxed text-sm md:text-base prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--border-strong)] prose-pre:rounded-xl break-words overflow-x-auto">
          <MemoizedMarkdown content={reply.content} />
        </div>
      </div>
    </article>
  );
});
ReplyCard.displayName = 'ReplyCard';

// ==========================================
// Isolated Editor Component (Performance)
// ==========================================

const ReplyEditor = ({ 
  threadId, onReplySuccess 
}: { 
  threadId: number; onReplySuccess: () => void;
}) => {
  const [content, setContent] = useState('');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertFormatting = useCallback((prefix: string, suffix: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const currentText = content;
    const selected = currentText.substring(start, end) || 'text';
    const newText = currentText.substring(0, start) + prefix + selected + suffix + currentText.substring(end);
    
    setContent(newText);
    setTimeout(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  }, [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsTransmitting(true);
    try {
      const res = await fetch(`/api/forum/threads/${threadId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      if (res.ok) {
        setContent('');
        onReplySuccess();
      } else {
        const data = await res.json() as { error?: string };
        toast(data.error || 'Failed to transmit reply.', 'error');
      }
    } catch {
      toast('Network failure during transmission.', 'error');
    } finally {
      setIsTransmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <div className="border border-[var(--border)] rounded-xl md:rounded-2xl overflow-hidden bg-[var(--surface-raised)] focus-within:ring-2 focus-within:ring-[var(--orange-dim)] focus-within:border-[var(--orange-border)] transition-all shadow-inner">
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-3 border-b border-[var(--border)] bg-[var(--surface)] backdrop-blur-sm overflow-x-auto">
          <button type="button" onClick={() => insertFormatting('**', '**')} className="p-1.5 md:p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-raised)] transition-colors shrink-0" title="Bold"><Bold className="size-4" /></button>
          <button type="button" onClick={() => insertFormatting('*', '*')} className="p-1.5 md:p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-raised)] transition-colors shrink-0" title="Italic"><Italic className="size-4" /></button>
          <div className="w-px h-4 md:h-5 bg-[var(--border-strong)] mx-1 md:mx-2 shrink-0"></div>
          <button type="button" onClick={() => insertFormatting('`', '`')} className="p-1.5 md:p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-raised)] transition-colors shrink-0" title="Code"><Code className="size-4" /></button>
        </div>
        <textarea 
          ref={textareaRef} required minLength={2} rows={5} 
          placeholder="Initiate response sequence (Markdown parsed)..." 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          className="w-full bg-transparent px-4 md:px-6 py-4 md:py-5 text-sm md:text-base outline-none resize-none placeholder:text-[var(--text-muted)] custom-scrollbar text-[var(--text-primary)]" 
        />
      </div>
      <div className="flex justify-end pt-2">
        <button disabled={isTransmitting || !content.trim()} className="w-full md:w-auto flex items-center justify-center gap-2.5 bg-[var(--text-primary)] hover:bg-[var(--orange)] text-[var(--bg)] font-bold px-8 md:px-10 py-3.5 md:py-4 rounded-xl md:rounded-2xl transition-all duration-300 disabled:opacity-50 shadow-xl hover:shadow-orange-500/20 active:scale-[0.98] cursor-pointer text-base md:text-lg group">
          {isTransmitting ? <><Loader2 className="size-5 animate-spin"/> Transmitting...</> : <>Execute Reply <Send className="size-4 md:size-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
        </button>
      </div>
    </form>
  );
};

// ==========================================
// Main Execution Component
// ==========================================

export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const isModerator = user?.role === 'admin' || user?.role === 'moderator';
  const isAuthor = user?.username === thread?.author;

  const fetchThread = useCallback(() => {
    fetch(`/api/forum/threads/${id}`)
      .then(res => res.json() as Promise<ThreadDetail & { error?: string }>)
      .then(data => { 
        if (data.error) {
          if (data.error === 'Target vector not found.') setNotFound(true);
          else toast(data.error, 'error');
        } else {
          setThread(data as ThreadDetail);
        }
      })
      .catch(() => toast('Failed to establish connection with the central node.', 'error'));
  }, [id, toast]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  const handleVote = useCallback(async (type: 'thread' | 'reply', targetId: number, authorId: number) => {
    if (!thread) return;
    if (!user) { toast("Authentication required to execute reputation protocol.", "error"); return; }
    if (user.id === authorId) return; // Prevented in UI, fallback check
    
    try {
      const res = await fetch(`/api/forum/vote/${type}/${targetId}`, { method: 'POST' });
      const data = await res.json() as { error?: string; success?: boolean };
      
      if (res.ok && data.success) {
          if (type === 'thread') {
              setThread(prev => prev ? { ...prev, upvotes: prev.upvotes + 1 } : prev);
          } else {
              setThread(prev => prev ? { 
                ...prev, 
                replies: prev.replies.map(r => r.id === targetId ? { ...r, upvotes: r.upvotes + 1 } : r) 
              } : prev);
          }
      } else {
          toast(data.error || "Cannot process transaction at this time.", "error");
      }
    } catch {
      toast("Execution fault during reputation update.", "error");
    }
  }, [thread, user, toast]);

  const handleModeration = useCallback(async (action: 'pin' | 'lock' | 'delete') => {
    if (!thread) return;
    if (action === 'delete') {
      if (!confirm('Confirm permanent deletion of this vector? Irreversible.')) return;
      try {
        const res = await fetch(`/api/forum/threads/${thread.id}`, { method: 'DELETE' });
        if (res.ok) navigate('/forum');
        else toast('Failed to wipe vector.', 'error');
      } catch {
        toast('Network fault during deletion.', 'error');
      }
      return;
    }

    try {
      const res = await fetch(`/api/forum/threads/${thread.id}/${action}`, { method: 'PATCH' });
      if (res.ok) {
        const updated = await res.json() as { isPinned: boolean; isLocked: boolean };
        setThread(prev => prev ? { ...prev, isPinned: updated.isPinned, isLocked: updated.isLocked } : prev);
      } else {
         toast(`Failed to execute ${action} protocol.`, 'error');
      }
    } catch {
      toast('Network fault during state mutation.', 'error');
    }
  }, [thread, navigate, toast]);

  const handleDeleteReply = useCallback(async (replyId: number) => {
    if (!confirm('Permanently wipe this transmission?')) return;
    try {
      const res = await fetch(`/api/forum/replies/${replyId}`, { method: 'DELETE' });
      if (res.ok) {
        setThread(prev => prev ? { 
          ...prev, 
          replyCount: prev.replyCount - 1, 
          replies: prev.replies.filter(r => r.id !== replyId) 
        } : prev);
      } else {
        toast('Failed to clear transmission.', 'error');
      }
    } catch {
      toast('Network fault during transmission deletion.', 'error');
    }
  }, [toast]);

  const handleUnlock = useCallback(async () => {
    if (!thread) return;
    setIsUnlocking(true);
    try {
      const res = await fetch(`/api/forum/threads/${thread.id}/unlock`, { method: 'POST' });
      const data = await res.json() as { success?: boolean; lockedContent?: string; error?: string };
      
      if (data.success && data.lockedContent) {
        setThread(prev => prev ? { ...prev, lockedContent: data.lockedContent } : prev);
        await refreshUser();
        toast("Payload Decrypted and Secured.", "success");
      } else {
        toast(data.error || 'Decryption sequence failed.', 'error');
      }
    } catch {
      toast("System execution failure during decryption.", "error");
    } finally { 
      setIsUnlocking(false); 
    }
  }, [thread, refreshUser, toast]);


  // ==========================================
  // Render Execution
  // ==========================================

  if (notFound) return (
    <div className="max-w-3xl mx-auto py-16 md:py-24 px-4 text-center animation-fade-in">
        <ShieldAlert className="size-12 md:size-16 text-[var(--text-muted)] mx-auto mb-4 md:mb-6 opacity-50" />
        <h1 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-[var(--text-primary)]">Target Vector Missing</h1>
        <p className="text-sm md:text-base text-[var(--text-secondary)] mb-6 md:mb-8 max-w-md mx-auto">The requested thread could not be located in the central database. It may have been relocated or wiped.</p>
        <Link to="/" className="px-5 md:px-6 py-2.5 md:py-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-xl text-sm md:text-base text-[var(--text-primary)] hover:border-[var(--orange)] transition-colors inline-flex items-center gap-2 shadow-sm">
            <ArrowLeft className="size-4" /> Return to Hub
        </Link>
    </div>
  );

  if (!thread) return (
    <div className="max-w-5xl mx-auto py-10 md:py-16 px-4 flex flex-col items-center animate-pulse">
      <div className="h-9 md:h-10 w-32 md:w-48 bg-[var(--surface-raised)] rounded-xl mb-6 md:mb-8 self-start"></div>
      <div className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-6 md:p-12 shadow-sm">
        <div className="flex gap-3 md:gap-4 mb-6 md:mb-8"><div className="h-5 md:h-6 w-20 md:w-24 bg-[var(--surface-raised)] rounded-md"></div><div className="h-5 md:h-6 w-28 md:w-32 bg-[var(--surface-raised)] rounded-md"></div></div>
        <div className="h-8 md:h-12 w-full md:w-4/5 bg-[var(--surface-raised)] rounded-xl mb-8 md:mb-10"></div>
        <div className="space-y-3 md:space-y-4"><div className="h-4 md:h-5 w-full bg-[var(--surface-raised)] rounded"></div><div className="h-4 md:h-5 w-full bg-[var(--surface-raised)] rounded"></div><div className="h-4 md:h-5 w-3/4 bg-[var(--surface-raised)] rounded"></div></div>
      </div>
    </div>
  );

  return (
    <article className="w-full max-w-5xl mx-auto py-6 md:py-8 px-4 sm:px-6 animation-fade-in overflow-x-hidden">
      <SeoHead title={`${thread.title} - Forum`} description={thread.content.substring(0, 160)} />
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 md:mb-8 border-b border-[var(--border)] pb-4 md:pb-6">
        <Link to="/" className="inline-flex items-center justify-center sm:justify-start gap-2 px-4 md:px-5 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-xs md:text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--orange)] shadow-sm transition-all w-full sm:w-fit group">
          <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform shrink-0" /> Back to Board
        </Link>
        
        {(isModerator || isAuthor) && (
          <div className="flex items-center justify-center sm:justify-end gap-2 bg-[var(--surface-raised)] p-1.5 rounded-xl border border-[var(--border)] shadow-inner w-full sm:w-auto">
            {isModerator && (
              <>
                <button onClick={() => handleModeration('pin')} className={`flex-1 sm:flex-none flex justify-center p-2 md:p-2.5 rounded-lg transition-all cursor-pointer ${thread.isPinned ? 'bg-[var(--orange)] text-[var(--bg)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] hover:shadow-sm'}`} title="Pin Thread">
                  <Pin className="size-4" />
                </button>
                <button onClick={() => handleModeration('lock')} className={`flex-1 sm:flex-none flex justify-center p-2 md:p-2.5 rounded-lg transition-all cursor-pointer ${thread.isLocked ? 'bg-red-500 text-[var(--bg)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)] hover:shadow-sm'}`} title="Lock Thread">
                  <LockKeyhole className="size-4" />
                </button>
              </>
            )}
            <button onClick={() => handleModeration('delete')} className="flex-1 sm:flex-none flex justify-center p-2 md:p-2.5 rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all sm:ml-1 cursor-pointer" title="Wipe Vector">
              <Trash2 className="size-4" />
            </button>
          </div>
        )}
      </header>

      {/* Main Thread Body */}
      <section className={`glass rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-10 shadow-xl shadow-[var(--orange-dim)] mb-8 md:mb-12 flex flex-col sm:flex-row gap-5 md:gap-10 ${thread.isPinned ? 'border-orange-500/50 bg-gradient-to-br from-[var(--orange-dim)] to-transparent' : thread.authorIsVip ? 'border-amber-500/40 shadow-amber-500/5' : 'border-[var(--border)]'}`}>
        
        {/* Desktop Upvote Sidebar */}
        <aside className="hidden sm:flex flex-col items-center gap-3 md:gap-4 pt-2 md:pt-4 shrink-0">
          <button onClick={() => handleVote('thread', thread.id, thread.authorId)} disabled={user?.id === thread.authorId} className={`p-3 md:p-3.5 rounded-2xl transition-all border border-transparent shadow-sm group ${user?.id === thread.authorId ? 'text-[var(--text-muted)] bg-[var(--surface-raised)] cursor-not-allowed opacity-50' : 'text-[var(--text-muted)] hover:text-[var(--orange)] bg-[var(--surface-raised)] hover:border-[var(--orange-border)] cursor-pointer hover:-translate-y-1 hover:shadow-md'}`}>
            <Flame className="size-5 md:size-6 group-hover:scale-110 transition-transform" />
          </button>
          <span className="font-black text-xl md:text-2xl text-[var(--text-primary)]">{thread.upvotes}</span>
        </aside>

        <div className="flex-1 min-w-0 w-full overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 md:mb-6">
             {thread.isPinned && <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-orange-500 bg-[var(--orange-dim)] px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-[var(--orange-border)] shadow-sm"><Pin className="size-3 md:size-3.5" /> Pinned</span>}
             {thread.isLocked && <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-red-500 bg-red-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-red-500/20 shadow-sm"><LockKeyhole className="size-3 md:size-3.5" /> Locked</span>}
             {thread.hasLockedContent && <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-emerald-500/20 shadow-sm"><LockKeyhole className="size-3 md:size-3.5" /> Premium</span>}
             <span className="px-2 md:px-3 py-1 md:py-1.5 bg-[var(--surface-raised)] text-[var(--text-secondary)] border border-[var(--border)] text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-md md:rounded-lg flex items-center gap-1 md:gap-1.5 shadow-sm">
               <Hash className="size-3 md:size-3.5" /> {formatCategory(thread.category)}
             </span>
             
             {/* Mobile Inline Upvote */}
             <div className="flex sm:hidden items-center gap-1.5 bg-[var(--surface-raised)] border border-[var(--border)] px-2 py-1 rounded-md ml-auto shadow-sm">
                <button onClick={() => handleVote('thread', thread.id, thread.authorId)} disabled={user?.id === thread.authorId} className={`p-0.5 rounded transition-all ${user?.id === thread.authorId ? 'text-[var(--text-muted)] opacity-50' : 'text-[var(--text-muted)] hover:text-[var(--orange)] active:scale-95'}`}>
                  <Flame className="size-3.5" />
                </button>
                <span className="font-black text-xs text-[var(--text-primary)]">{thread.upvotes}</span>
             </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-black mb-6 md:mb-8 text-balance leading-tight text-[var(--text-primary)] tracking-tight break-words" style={{ fontFamily: 'Syne, sans-serif' }}>{thread.title}</h1>
          
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed text-sm md:text-lg prose-headings:font-bold prose-a:text-[var(--orange)] hover:prose-a:text-orange-600 prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--border-strong)] prose-pre:rounded-xl md:prose-pre:rounded-2xl prose-pre:shadow-inner prose-code:text-[var(--orange)] prose-code:bg-[var(--orange-dim)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none break-words overflow-x-auto">
            <MemoizedMarkdown content={thread.content} />
          </div>
          
          {thread.hasLockedContent && (
            <div className="mt-8 md:mt-12 border border-[var(--orange-border)] bg-[var(--surface)] rounded-2xl md:rounded-3xl p-5 md:p-8 relative overflow-hidden shadow-2xl shadow-orange-500/5">
              <div className="absolute top-0 left-0 w-1 md:w-1.5 h-full bg-gradient-to-b from-orange-500 to-amber-400"></div>
              {thread.lockedContent ? (
                <div className="animation-fade-in pl-2 md:pl-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 mb-4 md:mb-6">
                       <h4 className="text-xs md:text-sm font-black text-[var(--orange)] uppercase tracking-widest flex items-center gap-1.5 md:gap-2">
                        <LockKeyhole className="size-4 md:size-5" /> Decrypted Payload Secured
                      </h4>
                      {(user?.isVip || user?.role === 'admin') && user?.id !== thread.authorId && (
                         <span className="flex items-center self-start sm:self-auto gap-1 md:gap-1.5 px-2.5 md:px-3 py-1 bg-[var(--orange-dim)] border border-[var(--orange-border)] text-[var(--orange)] text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                           <Crown className="size-2.5 md:size-3" /> VIP Override
                         </span>
                      )}
                  </div>
                  <div className="bg-[var(--bg)] p-4 md:p-6 rounded-xl md:rounded-2xl border border-[var(--border-strong)] overflow-x-auto shadow-inner">
                    <pre className="text-orange-50 font-mono text-xs md:text-sm whitespace-pre-wrap break-all m-0">{thread.lockedContent}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-6 md:gap-8 pl-2 md:pl-0">
                  <div className="text-center lg:text-left w-full lg:w-auto">
                    <h4 className="font-extrabold text-xl md:text-2xl text-[var(--text-primary)] flex items-center justify-center lg:justify-start gap-2 md:gap-3 mb-2"><LockKeyhole className="size-6 md:size-8 text-[var(--orange)] shrink-0" /> Encrypted Vector</h4>
                    <p className="text-sm md:text-base text-[var(--text-secondary)]">Requires <strong className="text-[var(--orange)]">{thread.unlockCost}</strong> reputation points to decrypt this node.</p>
                  </div>
                  {user ? (
                    <button onClick={handleUnlock} disabled={isUnlocking} className="shrink-0 w-full lg:w-auto flex items-center justify-center gap-2 bg-[var(--text-primary)] hover:bg-[var(--orange)] text-[var(--bg)] font-bold px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl transition-all shadow-xl hover:shadow-orange-500/20 active:scale-[0.98] cursor-pointer disabled:opacity-50 text-base md:text-lg group">
                      {isUnlocking ? <><Loader2 className="size-5 animate-spin"/> Decrypting...</> : <>Unlock Payload <LockKeyhole className="size-4 md:size-5 ml-1 group-hover:hidden"/><CheckCircle2 className="size-4 md:size-5 ml-1 hidden group-hover:block"/></>}
                    </button>
                  ) : (
                    <Link to="/login" className="shrink-0 w-full lg:w-auto flex items-center justify-center gap-2 bg-[var(--orange)] hover:opacity-90 text-[var(--bg)] font-bold px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98] text-base md:text-lg">
                      Authenticate to Unlock
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          <footer className="mt-8 md:mt-12 pt-5 md:pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-4 md:gap-6">
            <Link to={`/profile/${thread.author}`} className="flex items-center gap-3 md:gap-4 bg-[var(--surface-raised)] border border-[var(--border)] hover:border-[var(--orange)] transition-colors px-4 md:px-5 py-2.5 md:py-3 rounded-xl md:rounded-2xl group shadow-sm w-full sm:w-auto">
              <div className="size-8 md:size-10 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center transition-colors shadow-sm shrink-0">
                 {thread.authorRole === 'admin' ? <Shield className="size-4 md:size-5 text-red-500" /> : thread.authorIsVip ? <Crown className="size-4 md:size-5 text-amber-500" /> : <User className="size-4 md:size-5 text-[var(--text-muted)] group-hover:text-[var(--orange)]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] md:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none mb-1 md:mb-1.5">Transmitted By</span>
                <span className="text-sm md:text-base font-bold text-[var(--text-primary)] group-hover:text-[var(--orange)] transition-colors leading-none truncate">{thread.author}</span>
              </div>
            </Link>
            <div className="flex items-center justify-center sm:justify-start gap-4 md:gap-6 text-[10px] md:text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest bg-[var(--surface-raised)] px-4 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl border border-[var(--border)] w-full sm:w-auto">
              <time dateTime={new Date(thread.createdAt).toISOString()} className="flex items-center gap-1.5 md:gap-2 truncate"><Clock className="size-3 md:size-4 shrink-0" /> <span className="truncate">{new Date(thread.createdAt).toLocaleDateString()}</span></time>
              <span className="w-1 h-1 rounded-full bg-[var(--border-strong)] shrink-0"></span>
              <span className="flex items-center gap-1.5 md:gap-2 text-[var(--orange)] opacity-80 shrink-0"><Eye className="size-3 md:size-4" /> {thread.views}</span>
            </div>
          </footer>
        </div>
      </section>

      {/* Discussion Thread */}
      <section className="mb-10 md:mb-16">
        <header className="flex items-center justify-between mb-6 md:mb-8 px-1 md:px-2">
          <h3 className="font-extrabold text-2xl md:text-3xl flex items-center gap-3 md:gap-4 text-[var(--text-primary)]">
            <div className="p-1.5 md:p-2 bg-[var(--orange-dim)] rounded-lg md:rounded-xl border border-[var(--orange-border)] shadow-inner"><MessageCircle className="size-5 md:size-6 text-[var(--orange)]" /></div>
            Discussion <span className="text-[var(--text-muted)] font-medium text-xl md:text-2xl">({thread.replyCount})</span>
          </h3>
        </header>
        
        <div className="space-y-4 md:space-y-6">
          {thread.replies.length === 0 ? (
            <div className="bg-[var(--surface-raised)] border border-[var(--border)] border-dashed rounded-[1.5rem] md:rounded-[2rem] p-10 md:p-16 text-center shadow-sm mx-0 md:ml-12">
              <MessageCircle className="size-10 md:size-12 mx-auto mb-3 md:mb-4 opacity-20 text-[var(--text-muted)]" />
              <p className="font-bold text-base md:text-lg text-[var(--text-secondary)]">No transmissions recorded.</p>
              <p className="text-xs md:text-sm mt-2 text-[var(--text-muted)]">Be the first entity to append to this vector.</p>
            </div>
          ) : (
            thread.replies.map(reply => (
              <ReplyCard 
                key={reply.id} 
                reply={reply} 
                currentUserId={user?.id} 
                isModerator={isModerator} 
                onVote={handleVote} 
                onDelete={handleDeleteReply} 
              />
            ))
          )}
        </div>
      </section>

      {/* Reply Formulation Vector */}
      {thread.isLocked && !isModerator ? (
         <div className="flex flex-col items-center justify-center p-8 md:p-12 bg-[var(--surface-raised)] rounded-[1.5rem] md:rounded-[2rem] border border-[var(--border)] text-center shadow-inner mx-0 md:ml-12">
           <div className="size-16 md:size-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-4 md:mb-6 border border-red-500/20 shadow-inner"><ShieldAlert className="size-8 md:size-10 text-red-500" /></div>
           <h4 className="font-black text-xl md:text-2xl mb-2 md:mb-3 text-[var(--text-primary)] tracking-tight">Vector Locked</h4>
           <p className="text-[var(--text-secondary)] max-w-md text-sm md:text-lg px-4 md:px-0">System protocols have locked this discussion. Transmission rejected.</p>
         </div>
      ) : (
        <section className="glass rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-10 shadow-2xl shadow-[var(--orange-dim)] relative overflow-hidden mx-0 md:ml-12">
          <div className="absolute top-0 left-0 right-0 h-1 md:h-1.5 bg-gradient-to-r from-[var(--orange)] to-[var(--orange-dim)]"></div>
          <header className="flex items-center justify-between mb-6 md:mb-8">
            <h4 className="font-black text-xl md:text-2xl flex items-center gap-2 md:gap-3 text-[var(--text-primary)]">Transmit Reply</h4>
          </header>
          {user ? (
            <ReplyEditor threadId={thread.id} onReplySuccess={fetchThread} />
          ) : (
            <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-[var(--surface-raised)] rounded-2xl border border-[var(--border)] shadow-inner text-center">
               <div className="size-12 md:size-16 bg-[var(--surface)] rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-inner border border-[var(--border)]"><LockKeyhole className="size-6 md:size-8 text-[var(--text-muted)]" /></div>
               <p className="text-sm md:text-base font-bold text-[var(--text-secondary)] mb-6 md:mb-8 px-4">Authentication protocol required to append to this vector.</p>
               <Link to="/login" className="w-full sm:w-auto px-8 md:px-10 py-3.5 md:py-4 bg-[var(--orange)] hover:opacity-90 text-[var(--bg)] rounded-xl md:rounded-2xl font-bold transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98] text-base md:text-lg">Authenticate Entity</Link>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
