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
    <article className={`relative bg-zinc-900 border rounded-2xl md:rounded-3xl p-5 md:p-8 ml-0 md:ml-12 flex flex-col sm:flex-row gap-5 md:gap-8 transition-colors ${reply.isAcceptedAnswer ? 'border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]' : reply.authorIsVip ? 'border-amber-500/30' : 'border-zinc-800'}`}>
      
      {reply.isAcceptedAnswer && (
        <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-emerald-500 text-zinc-950 p-1.5 md:p-2 rounded-xl shadow-lg border-2 border-zinc-950" title="Accepted Output">
          <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" />
        </div>
      )}

      {(isModerator || isAuthor) && (
        <button onClick={() => onDelete(reply.id)} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer" title="Wipe Reply">
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <aside className="flex sm:flex-col items-center justify-between sm:justify-start gap-4 sm:gap-2 shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-800 pb-4 sm:pb-0 sm:pr-6 md:pr-8">
        <div className="flex sm:flex-col items-center gap-2">
          <button 
            onClick={() => onVote('reply', reply.id, reply.authorId)} 
            disabled={isAuthor}
            className={`p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-all group ${isAuthor ? 'text-zinc-600 bg-zinc-800/50 cursor-not-allowed' : 'text-zinc-500 hover:text-orange-500 bg-zinc-800 hover:bg-orange-500/10 cursor-pointer active:scale-95'}`}
          >
            <Flame className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <span className="font-black text-lg md:text-xl text-zinc-100">{reply.upvotes}</span>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex flex-wrap items-center gap-3 md:gap-4 mb-4 border-b border-zinc-800/50 pb-3 md:pb-4">
          <Link to={`/profile/${reply.author}`} className="flex items-center gap-2 group bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors">
            <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center shrink-0">
              {reply.authorRole === 'admin' ? <Shield className="w-3.5 h-3.5 text-red-500" /> : reply.authorIsVip ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <User className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-500 transition-colors" />}
            </div>
            <span className="font-bold text-sm truncate max-w-[120px] md:max-w-[200px] text-zinc-300 group-hover:text-zinc-100 transition-colors">{reply.author}</span>
          </Link>
          <time className="text-[10px] md:text-[11px] font-mono font-bold text-zinc-500 uppercase flex items-center gap-1.5 ml-auto sm:ml-0">
            <Clock className="w-3.5 h-3.5" /> {new Date(reply.createdAt).toLocaleDateString()}
          </time>
        </header>
        <div className="prose prose-invert max-w-none text-zinc-300 prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-xl break-words overflow-x-auto">
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

const ReplyEditor = ({ threadId, onReplySuccess }: { threadId: number; onReplySuccess: () => void; }) => {
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
      <div className="border border-zinc-800 rounded-xl md:rounded-2xl overflow-hidden bg-zinc-950 focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500 transition-all">
        <div className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 bg-zinc-900 border-b border-zinc-800">
          <button type="button" onClick={() => insertFormatting('**', '**')} className="p-1.5 md:p-2 text-zinc-500 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors shrink-0" title="Bold"><Bold className="w-4 h-4" /></button>
          <button type="button" onClick={() => insertFormatting('*', '*')} className="p-1.5 md:p-2 text-zinc-500 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors shrink-0" title="Italic"><Italic className="w-4 h-4" /></button>
          <div className="w-px h-4 bg-zinc-700 mx-1 md:mx-2 shrink-0" />
          <button type="button" onClick={() => insertFormatting('`', '`')} className="p-1.5 md:p-2 text-zinc-500 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors shrink-0" title="Code"><Code className="w-4 h-4" /></button>
        </div>
        <textarea 
          ref={textareaRef} required minLength={2} rows={5} 
          placeholder="Initiate response sequence (Markdown parsed)..." 
          value={content} 
          onChange={e => setContent(e.target.value)} 
          className="w-full bg-transparent px-4 md:px-6 py-4 md:py-5 text-sm md:text-base outline-none resize-none placeholder:text-zinc-600 text-zinc-100" 
        />
      </div>
      <div className="flex justify-end pt-2">
        <button disabled={isTransmitting || !content.trim()} className="w-full md:w-auto flex items-center justify-center gap-2 bg-zinc-100 hover:bg-orange-500 text-zinc-950 hover:text-white font-bold px-8 py-3.5 rounded-xl transition-all disabled:opacity-50 active:scale-[0.98] cursor-pointer group">
          {isTransmitting ? <><Loader2 className="w-5 h-5 animate-spin"/> Transmitting...</> : <>Execute Reply <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
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
    if (user.id === authorId) return;
    
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
    <div className="max-w-3xl mx-auto py-16 md:py-24 px-4 text-center animate-fade-in-up">
        <ShieldAlert className="w-16 h-16 text-zinc-600 mx-auto mb-6" />
        <h1 className="text-3xl font-bold mb-4 text-zinc-100">Target Vector Missing</h1>
        <p className="text-zinc-500 mb-8 max-w-md mx-auto">The requested thread could not be located in the central database. It may have been relocated or wiped.</p>
        <Link to="/" className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Return to Hub
        </Link>
    </div>
  );

  if (!thread) return (
    <div className="max-w-5xl mx-auto py-10 md:py-16 px-4 flex flex-col items-center animate-pulse">
      <div className="h-10 w-32 bg-zinc-900 rounded-xl mb-8 self-start" />
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-12">
        <div className="flex gap-4 mb-8"><div className="h-6 w-24 bg-zinc-800 rounded-md" /><div className="h-6 w-32 bg-zinc-800 rounded-md" /></div>
        <div className="h-12 w-4/5 bg-zinc-800 rounded-xl mb-10" />
        <div className="space-y-4"><div className="h-5 w-full bg-zinc-800 rounded" /><div className="h-5 w-full bg-zinc-800 rounded" /><div className="h-5 w-3/4 bg-zinc-800 rounded" /></div>
      </div>
    </div>
  );

  return (
    <article className="w-full max-w-5xl mx-auto py-6 md:py-8 px-4 sm:px-6 animate-fade-in-up overflow-x-hidden">
      <SeoHead title={`${thread.title} - Forum`} description={thread.content.substring(0, 160)} />
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 mb-6 md:mb-8 border-b border-zinc-800/50 pb-4 md:pb-6">
        <Link to="/" className="inline-flex items-center justify-center sm:justify-start gap-2 px-5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 transition-colors w-full sm:w-fit group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform shrink-0" /> Back to Board
        </Link>
        
        {(isModerator || isAuthor) && (
          <div className="flex items-center justify-center sm:justify-end gap-2 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 w-full sm:w-auto">
            {isModerator && (
              <>
                <button onClick={() => handleModeration('pin')} className={`flex-1 sm:flex-none flex justify-center p-2 md:p-2.5 rounded-lg transition-colors cursor-pointer ${thread.isPinned ? 'bg-orange-500 text-white' : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800'}`} title="Pin Thread">
                  <Pin className="w-4 h-4" />
                </button>
                <button onClick={() => handleModeration('lock')} className={`flex-1 sm:flex-none flex justify-center p-2 md:p-2.5 rounded-lg transition-colors cursor-pointer ${thread.isLocked ? 'bg-red-500 text-white' : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800'}`} title="Lock Thread">
                  <LockKeyhole className="w-4 h-4" />
                </button>
              </>
            )}
            <button onClick={() => handleModeration('delete')} className="flex-1 sm:flex-none flex justify-center p-2 md:p-2.5 rounded-lg text-zinc-500 hover:text-red-500 hover:bg-red-500/10 transition-colors sm:ml-1 cursor-pointer" title="Wipe Vector">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* Main Thread Body */}
      <section className={`bg-zinc-900/80 backdrop-blur-xl border rounded-[1.5rem] md:rounded-[2rem] p-5 sm:p-6 md:p-10 mb-8 md:mb-12 flex flex-col sm:flex-row gap-5 md:gap-10 ${thread.isPinned ? 'border-orange-500/40 shadow-[0_0_20px_rgba(243,128,32,0.05)] bg-gradient-to-br from-orange-500/5 to-transparent' : thread.authorIsVip ? 'border-amber-500/30' : 'border-zinc-800'}`}>
        
        {/* Desktop Upvote Sidebar */}
        <aside className="hidden sm:flex flex-col items-center gap-3 md:gap-4 pt-2 shrink-0">
          <button onClick={() => handleVote('thread', thread.id, thread.authorId)} disabled={user?.id === thread.authorId} className={`p-3 md:p-3.5 rounded-2xl transition-all group ${user?.id === thread.authorId ? 'text-zinc-600 bg-zinc-800/50 cursor-not-allowed' : 'text-zinc-500 hover:text-orange-500 bg-zinc-800 hover:bg-orange-500/10 cursor-pointer active:scale-95'}`}>
            <Flame className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
          <span className="font-black text-2xl text-zinc-100">{thread.upvotes}</span>
        </aside>

        <div className="flex-1 min-w-0 w-full overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6">
             {thread.isPinned && <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold uppercase tracking-widest rounded-lg"><Pin className="w-3.5 h-3.5" /> Pinned</span>}
             {thread.isLocked && <span className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest rounded-lg"><LockKeyhole className="w-3.5 h-3.5" /> Locked</span>}
             {thread.hasLockedContent && <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest rounded-lg"><LockKeyhole className="w-3.5 h-3.5" /> Premium</span>}
             <span className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 border border-zinc-800 text-zinc-400 text-[10px] font-mono font-bold uppercase rounded-lg">
               <Hash className="w-3.5 h-3.5" /> {formatCategory(thread.category)}
             </span>
             
             {/* Mobile Inline Upvote */}
             <div className="flex sm:hidden items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg ml-auto">
                <button onClick={() => handleVote('thread', thread.id, thread.authorId)} disabled={user?.id === thread.authorId} className={`p-1 rounded transition-colors ${user?.id === thread.authorId ? 'text-zinc-600' : 'text-zinc-500 hover:text-orange-500'}`}>
                  <Flame className="w-4 h-4" />
                </button>
                <span className="font-black text-sm text-zinc-100">{thread.upvotes}</span>
             </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-8 text-zinc-50 leading-tight tracking-tight break-words">{thread.title}</h1>
          
          <div className="prose prose-invert max-w-none text-zinc-300 prose-headings:text-zinc-100 prose-a:text-orange-500 hover:prose-a:text-orange-400 prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-zinc-800 prose-pre:rounded-2xl prose-code:text-orange-400 prose-code:bg-orange-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md break-words overflow-x-auto">
            <MemoizedMarkdown content={thread.content} />
          </div>
          
          {thread.hasLockedContent && (
            <div className="mt-12 border border-orange-500/30 bg-zinc-950 rounded-3xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-orange-500 to-amber-500" />
              {thread.lockedContent ? (
                <div className="animate-fade-in pl-2 md:pl-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h4 className="text-sm font-black text-orange-500 uppercase tracking-widest flex items-center gap-2">
                        <LockKeyhole className="w-5 h-5" /> Decrypted Payload Secured
                      </h4>
                      {(user?.isVip || user?.role === 'admin') && user?.id !== thread.authorId && (
                         <span className="flex items-center self-start sm:self-auto gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-bold uppercase tracking-wider rounded-lg">
                           <Crown className="w-3 h-3" /> VIP Override
                         </span>
                      )}
                  </div>
                  <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-zinc-800 overflow-x-auto">
                    <pre className="text-orange-100 font-mono text-sm whitespace-pre-wrap break-all m-0">{thread.lockedContent}</pre>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 pl-2 md:pl-0">
                  <div className="text-center lg:text-left w-full lg:w-auto">
                    <h4 className="font-extrabold text-2xl text-zinc-100 flex items-center justify-center lg:justify-start gap-3 mb-2">
                      <LockKeyhole className="w-8 h-8 text-orange-500 shrink-0" /> Encrypted Vector
                    </h4>
                    <p className="text-zinc-400">Requires <strong className="text-orange-500">{thread.unlockCost}</strong> reputation points to decrypt this node.</p>
                  </div>
                  {user ? (
                    <button onClick={handleUnlock} disabled={isUnlocking} className="shrink-0 w-full lg:w-auto flex items-center justify-center gap-2 bg-zinc-100 hover:bg-orange-500 text-zinc-950 hover:text-white font-bold px-10 py-5 rounded-2xl transition-all disabled:opacity-50 active:scale-[0.98] group">
                      {isUnlocking ? <><Loader2 className="w-5 h-5 animate-spin"/> Decrypting...</> : <>Unlock Payload <LockKeyhole className="w-5 h-5 ml-1 group-hover:hidden"/><CheckCircle2 className="w-5 h-5 ml-1 hidden group-hover:block"/></>}
                    </button>
                  ) : (
                    <Link to="/login" className="shrink-0 w-full lg:w-auto flex items-center justify-center bg-orange-500 text-white font-bold px-10 py-5 rounded-2xl transition-colors hover:bg-orange-600">
                      Authenticate to Unlock
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
          
          <footer className="mt-12 pt-6 border-t border-zinc-800 flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-6">
            <Link to={`/profile/${thread.author}`} className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 hover:border-zinc-600 transition-colors px-5 py-3 rounded-2xl group w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                 {thread.authorRole === 'admin' ? <Shield className="w-5 h-5 text-red-500" /> : thread.authorIsVip ? <Crown className="w-5 h-5 text-amber-500" /> : <User className="w-5 h-5 text-zinc-500 group-hover:text-orange-500" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1.5">Transmitted By</span>
                <span className="text-base font-bold text-zinc-300 group-hover:text-zinc-100 transition-colors leading-none truncate">{thread.author}</span>
              </div>
            </Link>
            <div className="flex items-center justify-center sm:justify-start gap-6 text-xs font-mono font-bold text-zinc-500 uppercase bg-zinc-950 px-5 py-3 rounded-xl border border-zinc-800 w-full sm:w-auto">
              <time className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(thread.createdAt).toLocaleDateString()}</time>
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="flex items-center gap-2 text-orange-500/80"><Eye className="w-4 h-4" /> {thread.views}</span>
            </div>
          </footer>
        </div>
      </section>

      {/* Discussion Thread */}
      <section className="mb-16">
        <header className="flex items-center justify-between mb-8 px-2">
          <h3 className="font-extrabold text-3xl flex items-center gap-4 text-zinc-100">
            <div className="p-2 bg-orange-500/10 rounded-xl border border-orange-500/20"><MessageCircle className="w-6 h-6 text-orange-500" /></div>
            Discussion <span className="text-zinc-600 font-medium">({thread.replyCount})</span>
          </h3>
        </header>
        
        <div className="space-y-6">
          {thread.replies.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-[2rem] p-16 text-center mx-0 md:ml-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
              <p className="font-bold text-lg text-zinc-400">No transmissions recorded.</p>
              <p className="text-sm mt-2 text-zinc-600">Be the first entity to append to this vector.</p>
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
         <div className="flex flex-col items-center justify-center p-12 bg-zinc-900 rounded-[2rem] border border-zinc-800 text-center mx-0 md:ml-12">
           <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20"><ShieldAlert className="w-10 h-10 text-red-500" /></div>
           <h4 className="font-black text-2xl mb-3 text-zinc-100 tracking-tight">Vector Locked</h4>
           <p className="text-zinc-500 max-w-md text-lg">System protocols have locked this discussion. Transmission rejected.</p>
         </div>
      ) : (
        <section className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 md:p-10 relative overflow-hidden mx-0 md:ml-12">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
          <header className="mb-8">
            <h4 className="font-black text-2xl text-zinc-100">Transmit Reply</h4>
          </header>
          {user ? (
            <ReplyEditor threadId={thread.id} onReplySuccess={fetchThread} />
          ) : (
            <div className="flex flex-col items-center justify-center p-10 bg-zinc-950 rounded-2xl border border-zinc-800 text-center">
               <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-6 border border-zinc-800"><LockKeyhole className="w-8 h-8 text-zinc-600" /></div>
               <p className="font-bold text-zinc-400 mb-8">Authentication protocol required to append to this vector.</p>
               <Link to="/login" className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors">Authenticate Entity</Link>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
