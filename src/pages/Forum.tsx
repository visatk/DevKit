import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquarePlus, MessageCircle, Search, Loader2, Flame, LockKeyhole, Pin, ChevronLeft, ChevronRight, Crown, Shield, Layers, Users, Send, Database, CreditCard, Key } from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const CATEGORIES = [
  { id: 'all', label: 'All Vectors', icon: Layers },
  { id: 'general', label: 'General', icon: Users },
  { id: 'bins', label: 'BINS', icon: Database },
  { id: 'methods', label: 'Methods', icon: Flame },
  { id: 'vcc', label: 'VCC', icon: CreditCard },
  { id: 'redeem-coupons-keys', label: 'Keys & Redeems', icon: Key },
];

const formatCategory = (catId: string) => CATEGORIES.find(c => c.id === catId)?.label || catId;

type Thread = { id: number; title: string; category: string; author: string; upvotes: number; views: number; replyCount: number; isPinned: boolean; isLocked: boolean; hasLockedContent: boolean; createdAt: string; authorIsVip: boolean; authorRole: string; };

export default function Forum() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [isPosting, setIsPosting] = useState(false);
  const [newThread, setNewThread] = useState({ title: '', content: '', category: 'general', lockedContent: '', unlockCost: 0 });

  const fetchThreads = useCallback((page = 1) => {
    setIsLoading(true);
    const p = new URLSearchParams({ page: page.toString(), limit: '15' });
    if (searchQuery) p.append('q', searchQuery);
    if (activeCategory !== 'all') p.append('category', activeCategory);
    fetch(`/api/forum/threads?${p}`)
      .then(r => r.json() as any)
      .then(res => { setThreads(res.data || []); if (res.meta) setMeta(res.meta); })
      .catch(() => toast('Thread compilation fault.', 'error'))
      .finally(() => setIsLoading(false));
  }, [searchQuery, activeCategory, toast]);

  useEffect(() => { const t = setTimeout(() => fetchThreads(1), 300); return () => clearTimeout(t); }, [fetchThreads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newThread.title.trim() || !newThread.content.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch('/api/forum/threads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newThread) });
      if (res.ok) {
        toast('Thread propagated to edge.', 'success');
        setNewThread({ title: '', content: '', category: 'general', lockedContent: '', unlockCost: 0 });
        fetchThreads(1);
      } else {
        const d = await res.json() as any; toast(d.error || 'Failed to dispatch.', 'error');
      }
    } catch { toast('Network error.', 'error'); } finally { setIsPosting(false); }
  };

  return (
    <div className="w-full animation-fade-in max-w-7xl mx-auto py-6">
      <SeoHead title="Community Matrix | DevKit" description="Encrypted methods, BIN logs, and infrastructure discussion." />

      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 glass p-6 md:p-8 rounded-3xl border border-[var(--border)] relative overflow-hidden isolate">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--orange-dim)] rounded-full blur-[100px] -z-10" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
            Data Matrix
          </h1>
          <p className="text-sm font-medium text-[var(--text-muted)]">Secure communication and resource aggregation point.</p>
        </div>
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
          <input type="text" placeholder="Query threads..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full rounded-2xl py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition-all bg-[var(--surface-active)] border border-[var(--border-strong)] focus:border-[var(--orange)] focus:shadow-[0_0_0_4px_var(--orange-dim)] text-[var(--text-primary)]" />
        </div>
      </header>

      <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8">
        <main className="w-full lg:col-span-8">
          <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-2 sticky top-0 z-20 bg-[var(--bg)]/90 backdrop-blur-md pt-2">
            {CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border uppercase tracking-wider ${activeCategory === cat.id ? 'bg-[var(--orange-dim)] border-[var(--orange)] text-[var(--orange)]' : 'bg-[var(--surface-raised)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                <cat.icon className="size-3.5" /> {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {isLoading ? (
               Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-2xl skeleton" />)
            ) : threads.length === 0 ? (
               <div className="py-20 text-center glass rounded-3xl border border-dashed border-[var(--border-strong)]"><p className="badge-mono text-[var(--text-muted)]">No payloads matching query.</p></div>
            ) : (
               threads.map(thread => (
                <Link key={thread.id} to={`/forum/${thread.id}`} className={`block group p-5 rounded-2xl transition-all duration-300 glass card-interactive ${thread.isPinned ? 'border-[var(--orange)] shadow-[0_0_20px_var(--orange-dim)]' : thread.hasLockedContent ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-[var(--border)] hover:border-[var(--border-strong)]'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {thread.isPinned && <span className="badge-mono text-[10px] flex items-center gap-1 px-2 py-0.5 rounded bg-[var(--orange-dim)] text-[var(--orange)] border border-[var(--orange-border)]"><Pin className="size-2.5" /> Pinned</span>}
                        {thread.hasLockedContent && <span className="badge-mono text-[10px] flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><LockKeyhole className="size-2.5" /> Encrypted</span>}
                        <span className="badge-mono text-[10px] px-2 py-0.5 rounded bg-[var(--surface-active)] text-[var(--text-secondary)] border border-[var(--border)]">{formatCategory(thread.category)}</span>
                      </div>
                      <h2 className="font-bold text-lg mb-2 truncate group-hover:text-[var(--orange)] transition-colors text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>{thread.title}</h2>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="flex items-center gap-1 font-semibold text-[var(--text-secondary)]">
                          {thread.authorRole === 'admin' ? <Shield className="size-3 text-red-500" /> : thread.authorIsVip ? <Crown className="size-3 text-amber-500" /> : <Users className="size-3" />}
                          {thread.author}
                        </span>
                        <span className="text-[var(--border-strong)]">•</span>
                        <time className="font-mono text-[10px] text-[var(--text-muted)]">{new Date(thread.createdAt).toLocaleDateString()}</time>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 bg-[var(--surface-raised)] p-2.5 rounded-xl border border-[var(--border)]">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[var(--orange-dim)] text-[var(--orange)] font-bold text-xs"><Flame className="size-3.5" />{thread.upvotes}</div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded text-[var(--text-secondary)] font-bold text-xs"><MessageCircle className="size-3.5" />{thread.replyCount}</div>
                    </div>
                  </div>
                </Link>
              ))
            )}
            
            {meta.totalPages > 1 && (
              <nav className="flex justify-center gap-2 pt-6">
                <button onClick={() => fetchThreads(meta.page - 1)} disabled={meta.page === 1} className="size-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 active:scale-95"><ChevronLeft className="size-4" /></button>
                <div className="flex items-center justify-center px-4 badge-mono text-[var(--text-secondary)] border border-[var(--border)] rounded-xl bg-[var(--surface)]">{meta.page} / {meta.totalPages}</div>
                <button onClick={() => fetchThreads(meta.page + 1)} disabled={meta.page === meta.totalPages} className="size-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)] disabled:opacity-30 active:scale-95"><ChevronRight className="size-4" /></button>
              </nav>
            )}
          </div>
        </main>

        <aside className="w-full lg:col-span-4 lg:sticky lg:top-6">
          <div className="glass rounded-3xl overflow-hidden border-[var(--border)] shadow-xl shadow-black/40">
            <div className="h-1.5 w-full bg-gradient-to-r from-[var(--orange)] to-[var(--orange-light)]" />
            {user ? (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6 border-b border-[var(--border)] pb-5">
                  <div className="size-10 rounded-xl bg-[var(--orange-dim)] border border-[var(--orange-border)] flex items-center justify-center"><MessageSquarePlus className="size-5 text-[var(--orange)]" /></div>
                  <div><h3 className="font-bold text-lg text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>Inject Payload</h3><p className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-black">New Thread</p></div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <select value={newThread.category} onChange={e => setNewThread({...newThread, category: e.target.value})} className="w-full rounded-xl px-4 py-3.5 text-sm font-bold bg-[var(--surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)] outline-none focus:border-[var(--orange)] appearance-none">
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                  <input required minLength={5} type="text" placeholder="Vector Title..." value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})} className="w-full rounded-xl px-4 py-3.5 text-sm font-medium bg-[var(--surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)] outline-none focus:border-[var(--orange)]" />
                  <textarea required minLength={10} rows={5} placeholder="Initiate sequence (Markdown supported)..." value={newThread.content} onChange={e => setNewThread({...newThread, content: e.target.value})} className="w-full rounded-xl px-4 py-3.5 text-sm bg-[var(--surface-active)] border border-[var(--border-strong)] text-[var(--text-primary)] outline-none focus:border-[var(--orange)] resize-none custom-scrollbar" />
                  <div className="pt-4 border-t border-[var(--border)] space-y-3">
                    <label className="badge-mono flex items-center justify-between text-emerald-500"><span><LockKeyhole className="inline size-3 mr-1" /> Encrypted Block</span> {user.isVip && <span className="bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20">VIP Node</span>}</label>
                    <textarea rows={3} placeholder="Hidden configs/BINs..." value={newThread.lockedContent} onChange={e => setNewThread({...newThread, lockedContent: e.target.value})} className="w-full rounded-xl px-4 py-3.5 text-sm bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 outline-none focus:border-emerald-500 resize-none custom-scrollbar placeholder-emerald-500/30" />
                    <div className="flex items-center justify-between bg-[var(--surface-active)] rounded-xl p-3 border border-[var(--border)]">
                      <span className="text-xs font-bold text-[var(--text-secondary)]">Unlock Cost (Pts)</span>
                      <input type="number" min="0" max="10000" value={newThread.unlockCost} onChange={e => setNewThread({...newThread, unlockCost: parseInt(e.target.value) || 0})} className="w-20 rounded-lg px-2 py-1.5 text-sm font-bold bg-[var(--surface)] border border-[var(--border-strong)] text-right outline-none focus:border-[var(--orange)] text-[var(--text-primary)]" />
                    </div>
                  </div>
                  <button disabled={isPosting || !newThread.title || !newThread.content} className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-sm font-black transition-all active:scale-[0.98] disabled:opacity-50 bg-[var(--orange)] text-[#fff] shadow-lg shadow-[var(--orange-dim)] hover:shadow-[var(--orange-border)] mt-4">
                    {isPosting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Compile & Inject
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center">
                <LockKeyhole className="size-10 mx-auto mb-4 text-[var(--text-muted)] opacity-50" />
                <h3 className="font-bold text-lg mb-2 text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>System Access Required</h3>
                <p className="text-xs text-[var(--text-secondary)] mb-6">You must authenticate to append vectors to the matrix.</p>
                <Link to="/login" className="block w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-[var(--orange)] text-white shadow-lg shadow-[var(--orange-dim)] mb-3">Authenticate</Link>
                <Link to="/register" className="block w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)]">Construct Identity</Link>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
