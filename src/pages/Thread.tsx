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

// Types omitted for brevity, assuming identical

const formatCategory = (cat: string) => {
  if (cat === 'all') return 'All';
  if (cat === 'bin-list') return 'BIN List';
  if (cat === 'vcc') return 'VCC';
  if (cat === 'bins') return 'BINS';
  if (cat === 'redeem-coupons-keys') return 'Redeem / Keys';
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const MemoizedMarkdown = memo(({ content }: { content: string }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
));
MemoizedMarkdown.displayName = 'MemoizedMarkdown';

const ReplyCard = memo(({ reply, currentUserId, isModerator, onVote, onDelete }: any) => {
  const isAuthor = currentUserId === reply.authorId;

  return (
    <article className={`relative bg-zinc-900 border rounded-2xl md:rounded-3xl p-5 md:p-8 ml-0 md:ml-12 flex flex-col sm:flex-row gap-5 md:gap-8 transition-colors ${reply.isAcceptedAnswer ? 'border-emerald-500/40 bg-emerald-500/5' : reply.authorIsVip ? 'border-amber-500/30' : 'border-zinc-800'}`}>
      {(isModerator || isAuthor) && (
        <button onClick={() => onDelete(reply.id)} className="absolute top-4 right-4 p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors" aria-label="Delete Reply">
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <aside className="flex sm:flex-col items-center justify-between sm:justify-start gap-4 sm:gap-2 shrink-0 border-b sm:border-b-0 sm:border-r border-zinc-800 pb-4 sm:pb-0 sm:pr-6">
        <div className="flex sm:flex-col items-center gap-2">
          <button onClick={() => onVote('reply', reply.id, reply.authorId)} disabled={isAuthor} className={`p-2.5 rounded-xl transition-all ${isAuthor ? 'text-zinc-600 bg-zinc-800/50 cursor-not-allowed' : 'text-zinc-400 bg-zinc-800 hover:bg-orange-500/10 hover:text-orange-500'}`}>
            <Flame className="w-5 h-5" />
          </button>
          <span className="font-bold text-xl text-zinc-100">{reply.upvotes}</span>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-800/50">
          <Link to={`/profile/${reply.author}`} className="flex items-center gap-2 group bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors">
            <div className="w-6 h-6 rounded bg-zinc-900 flex items-center justify-center shrink-0">
              {reply.authorRole === 'admin' ? <Shield className="w-3.5 h-3.5 text-red-500" /> : reply.authorIsVip ? <Crown className="w-3.5 h-3.5 text-amber-500" /> : <User className="w-3.5 h-3.5 text-zinc-500 group-hover:text-orange-500" />}
            </div>
            <span className="font-bold text-sm text-zinc-300 group-hover:text-zinc-100 transition-colors">{reply.author}</span>
          </Link>
          <time className="text-[10px] font-mono text-zinc-500 ml-auto">
            {new Date(reply.createdAt).toLocaleDateString()}
          </time>
        </header>
        <div className="prose prose-invert max-w-none text-zinc-300 prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-zinc-800">
          <MemoizedMarkdown content={reply.content} />
        </div>
      </div>
    </article>
  );
});
ReplyCard.displayName = 'ReplyCard';

// Main Thread Output structure heavily optimized for rendering speed
export default function Thread() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  
  const [thread, setThread] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  // Simplified fetch logic for readability
  const fetchThread = useCallback(() => {
    fetch(`/api/forum/threads/${id}`)
      .then(res => res.json())
      .then(data => { if (data.error) setNotFound(true); else setThread(data); })
      .catch(() => toast('Connection failed.', 'error'));
  }, [id, toast]);

  useEffect(() => { fetchThread(); }, [fetchThread]);

  if (notFound) return (
    <div className="max-w-xl mx-auto py-24 px-4 text-center">
        <ShieldAlert className="w-16 h-16 text-zinc-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Vector Missing</h1>
        <p className="text-zinc-500 mb-8">The requested thread could not be located in the central database.</p>
        <Link to="/" className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white hover:border-zinc-600 transition-colors">Return to Hub</Link>
    </div>
  );

  if (!thread) return (
    <div className="max-w-5xl mx-auto py-16 px-4 animate-pulse">
      <div className="h-10 w-32 bg-zinc-900 rounded-xl mb-8" />
      <div className="w-full bg-zinc-900/50 border border-zinc-800 rounded-3xl p-10">
        <div className="h-12 w-3/4 bg-zinc-800 rounded-xl mb-8" />
        <div className="space-y-4"><div className="h-4 bg-zinc-800 rounded" /><div className="h-4 bg-zinc-800 rounded" /><div className="h-4 w-5/6 bg-zinc-800 rounded" /></div>
      </div>
    </div>
  );

  return (
    <article className="w-full max-w-5xl mx-auto py-8 px-4">
      <SeoHead title={`${thread.title} - Forum`} description={thread.content.substring(0, 160)} />
      
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-semibold text-zinc-400 hover:text-zinc-100 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
      </header>

      <section className={`bg-zinc-900/80 border rounded-[2rem] p-6 md:p-10 mb-12 flex flex-col sm:flex-row gap-6 md:gap-10 ${thread.isPinned ? 'border-orange-500/30 shadow-[0_0_30px_rgba(243,128,32,0.05)]' : 'border-zinc-800'}`}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-6">
             <span className="px-3 py-1 bg-zinc-950 text-zinc-400 border border-zinc-800 text-[10px] font-mono font-bold uppercase rounded-lg">
               <Hash className="w-3.5 h-3.5 inline mr-1" /> {formatCategory(thread.category)}
             </span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black mb-8 text-zinc-50 leading-tight tracking-tight">{thread.title}</h1>
          
          <div className="prose prose-invert max-w-none text-zinc-300 prose-a:text-orange-500 prose-pre:bg-[#0a0a0a] prose-pre:border prose-pre:border-zinc-800 prose-code:text-orange-400 prose-code:bg-orange-500/10">
            <MemoizedMarkdown content={thread.content} />
          </div>
        </div>
      </section>
    </article>
  );
}
