import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquarePlus, MessageCircle, Search, Flame, Eye,
  LockKeyhole, Pin, ChevronLeft, ChevronRight, Crown,
  Shield, Layers, TrendingUp, Users, Send
} from 'lucide-react';
import { SeoHead } from '@/components/SeoHead';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const CATEGORIES = ['all', 'general', 'bins', 'methods', 'bin-list', 'vcc', 'redeem-coupons-keys'];

const formatCategory = (cat: string) => {
  const m: Record<string, string> = {
    all: 'All', 'bin-list': 'BIN List', vcc: 'VCC',
    bins: 'BINS', 'redeem-coupons-keys': 'Redeem / Keys',
  };
  return m[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
};

type Thread = {
  id: number; title: string; category: string; author: string; upvotes: number;
  views: number; replyCount: number; isPinned: boolean; isLocked: boolean;
  hasLockedContent: boolean; createdAt: string; authorIsVip: boolean; authorRole: string;
};

type PaginationMeta = { page: number; limit: number; total: number; totalPages: number; };

function StatPill({ icon: Icon, value, color }: { icon: any; value: number; color: string }) {
  // If color is a css variable like var(--text-secondary), inline style might be awkward, but we'll leave this one since it accepts a dynamic hex color for orange.
  return (
    <div
      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-colors"
      style={{ background: color.startsWith('var') ? `color-mix(in srgb, ${color} 10%, transparent)` : `${color}10`, border: `1px solid ${color.startsWith('var') ? `color-mix(in srgb, ${color} 20%, transparent)` : `${color}20`}`, color }}
    >
      <Icon className="size-3.5 shrink-0" />
      <span>{value}</span>
    </div>
  );
}

function ThreadSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
      <div className="flex gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-14 skeleton rounded" />
            <div className="h-5 w-20 skeleton rounded" />
          </div>
          <div className="h-6 w-3/4 skeleton rounded-md" />
          <div className="h-5 w-28 skeleton rounded" />
        </div>
        <div className="w-20 space-y-2 shrink-0">
          <div className="h-8 skeleton rounded-lg" />
          <div className="h-8 skeleton rounded-lg" />
          <div className="h-8 skeleton rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function Forum() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({ page: 1, limit: 15, total: 0, totalPages: 1 });
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
      .then(r => r.json() as Promise<{ data: Thread[]; meta: PaginationMeta }>)
      .then(res => { setThreads(res.data || []); if (res.meta) setMeta(res.meta); })
      .catch(() => toast('Failed to load threads.', 'error'))
      .finally(() => setIsLoading(false));
  }, [searchQuery, activeCategory, toast]);

  useEffect(() => {
    const t = setTimeout(() => fetchThreads(1), 350);
    return () => clearTimeout(t);
  }, [fetchThreads]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newThread.title.trim() || !newThread.content.trim()) return;
    setIsPosting(true);
    try {
      const res = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newThread),
      });
      const data = await res.json() as { error?: string };
      if (res.ok) {
        toast('Thread published successfully.', 'success');
        setNewThread({ title: '', content: '', category: 'general', lockedContent: '', unlockCost: 0 });
        fetchThreads(1);
      } else {
        toast(data.error || 'Failed to publish.', 'error');
      }
    } catch {
      toast('Network error.', 'error');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="w-full animation-fade-in">
      <SeoHead
        title="Visatk | Community Forum"
        description="Exclusive technical methods, BIN lists, and secure infrastructure configurations."
      />

      {/* ── Page Header ── */}
      <header className="mb-8 pb-6 border-b border-[var(--border)]">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full badge-mono mb-4 bg-[var(--orange-dim)] border border-[var(--orange-border)] text-[var(--orange)]">
              <Layers className="size-3" />
              Discussion
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
              Visatk
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)]">
              Discover and discuss premium methods, configurations, and technical resources.
            </p>
          </div>

          {/* Search */}
          <div className="w-full lg:w-80 relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 transition-colors text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search threads..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_var(--orange-dim)]"
            />
          </div>
        </div>
      </header>

      {/* ── Main Grid ── */}
      <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-8 items-start">

        {/* ── Thread List (left/main) ── */}
        <main className="w-full lg:col-span-8 space-y-5">

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar -mx-4 px-4 md:mx-0 md:px-0 sticky z-20 top-[56px]">
            <div className="flex gap-2 min-w-max py-2 px-1 bg-[var(--bg)]">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${activeCategory === cat ? 'bg-[var(--text-primary)] text-[var(--bg)] -translate-y-px shadow-md' : 'bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)]'}`}
                >
                  {formatCategory(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Thread count */}
          {!isLoading && (
            <div className="flex items-center justify-between">
              <p className="badge-mono text-[var(--text-muted)]">
                {meta.total} thread{meta.total !== 1 ? 's' : ''}
                {activeCategory !== 'all' ? ` in ${formatCategory(activeCategory)}` : ''}
              </p>
              <div className="flex items-center gap-1 text-[var(--text-muted)]">
                <TrendingUp className="size-3.5" />
                <span className="badge-mono text-[10px]">Most Recent</span>
              </div>
            </div>
          )}

          {/* Threads */}
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <ThreadSkeleton key={i} />)
            ) : threads.length === 0 ? (
              <div className="py-20 text-center rounded-2xl bg-[var(--surface)] border border-dashed border-[var(--border-strong)]">
                <div className="mx-auto size-14 rounded-full flex items-center justify-center mb-4 bg-[var(--surface-raised)] border border-[var(--border)]">
                  <Search className="size-6 text-[var(--text-muted)]" />
                </div>
                <h3 className="text-lg font-bold mb-1 text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  No Results Found
                </h3>
                <p className="text-sm text-[var(--text-secondary)]">
                  Try adjusting your search or changing the category filter.
                </p>
              </div>
            ) : (
              <>
                {threads.map((thread, idx) => (
                  <article
                    key={thread.id}
                    className="animation-fade-up"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    <Link
                      to={`/forum/${thread.id}`}
                      className={`group flex flex-col sm:flex-row gap-4 p-5 rounded-2xl transition-all duration-200 glass card-interactive ${thread.isPinned ? 'border-[var(--orange-border)] bg-gradient-to-br from-[var(--orange-dim)] to-transparent' : thread.authorIsVip ? 'border-amber-500/20' : 'border-[var(--border)] hover:border-[var(--orange-border)]'}`}
                    >
                      <div className="flex-1 min-w-0">
                        {/* Badges row */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
                          {thread.isPinned && (
                            <span className="badge-mono flex items-center gap-1 px-2 py-0.5 rounded text-[var(--orange)] bg-[var(--orange-dim)] border border-[var(--orange-border)]">
                              <Pin className="size-2.5" /> Pinned
                            </span>
                          )}
                          {thread.isLocked && (
                            <span className="badge-mono flex items-center gap-1 px-2 py-0.5 rounded text-red-500 bg-red-500/10 border border-red-500/20">
                              <LockKeyhole className="size-2.5" /> Locked
                            </span>
                          )}
                          {thread.hasLockedContent && (
                            <span className="badge-mono flex items-center gap-1 px-2 py-0.5 rounded text-emerald-500 bg-emerald-500/10 border border-emerald-500/20">
                              <LockKeyhole className="size-2.5" /> Encrypted
                            </span>
                          )}
                          <span className="badge-mono px-2 py-0.5 rounded bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
                            {formatCategory(thread.category)}
                          </span>
                          <time
                            dateTime={new Date(thread.createdAt).toISOString()}
                            className="text-xs ml-auto text-[var(--text-muted)]"
                          >
                            {new Date(thread.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </time>
                        </div>

                        {/* Title */}
                        <h2 className="font-bold text-base sm:text-lg mb-2.5 line-clamp-2 leading-snug transition-colors group-hover:text-[var(--orange)] text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
                          {thread.title}
                        </h2>

                        {/* Author */}
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold truncate max-w-[200px] bg-[var(--surface-raised)] border border-[var(--border)] text-[var(--text-secondary)]">
                            {thread.authorRole === 'admin'
                              ? <Shield className="size-3 text-red-500 shrink-0" />
                              : thread.authorIsVip
                              ? <Crown className="size-3 text-amber-500 shrink-0" />
                              : <Users className="size-3 shrink-0 text-[var(--text-muted)]" />
                            }
                            <span className="truncate">{thread.author}</span>
                          </span>
                        </div>
                      </div>

                      {/* Stats column */}
                      <div className="flex sm:flex-col justify-end sm:justify-center items-center gap-2 pt-3 sm:pt-0 sm:pl-5 shrink-0 sm:border-l border-t sm:border-t-0 border-[var(--border)]">
                        <StatPill icon={Flame} value={thread.upvotes} color="#F38020" />
                        <StatPill icon={MessageCircle} value={thread.replyCount || 0} color={`var(--text-secondary)`} />
                        <StatPill icon={Eye} value={thread.views} color={`var(--text-secondary)`} />
                      </div>
                    </Link>
                  </article>
                ))}

                {/* Pagination */}
                {meta.totalPages > 1 && (
                  <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-4 pb-8">
                    <button
                      onClick={() => fetchThreads(meta.page - 1)}
                      disabled={meta.page === 1}
                      className="size-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 active:scale-95 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--orange)]"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span className="badge-mono px-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)]">
                      {meta.page} / {meta.totalPages}
                    </span>
                    <button
                      onClick={() => fetchThreads(meta.page + 1)}
                      disabled={meta.page === meta.totalPages}
                      className="size-9 flex items-center justify-center rounded-xl transition-all disabled:opacity-30 active:scale-95 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--orange)]"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </main>

        {/* ── Sidebar: New Thread / Login CTA ── */}
        <aside className="w-full lg:col-span-4 lg:sticky lg:top-6">
          <div className="glass rounded-2xl overflow-hidden border-[var(--border)] shadow-xl shadow-[var(--orange-dim)]">
            {/* Top accent */}
            <div className="h-px w-full bg-gradient-to-r from-[var(--orange)] via-amber-400/40 to-transparent" />

            {user ? (
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-[var(--border)]">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--orange-dim)] border border-[var(--orange-border)]">
                    <MessageSquarePlus className="size-4.5 text-[var(--orange)]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
                      New Thread
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">Share with the community</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Category */}
                  <div>
                    <label className="badge-mono block mb-1.5 text-[var(--text-muted)]">Category</label>
                    <select
                      value={newThread.category}
                      onChange={e => setNewThread({ ...newThread, category: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-3 text-sm font-semibold outline-none transition-all appearance-none cursor-pointer bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_var(--orange-dim)]"
                    >
                      {CATEGORIES.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{formatCategory(cat)}</option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="badge-mono block mb-1.5 text-[var(--text-muted)]">Title</label>
                    <input
                      required
                      minLength={5}
                      type="text"
                      placeholder="Thread title..."
                      value={newThread.title}
                      onChange={e => setNewThread({ ...newThread, title: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-3 text-sm font-medium outline-none transition-all bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_var(--orange-dim)]"
                    />
                  </div>

                  {/* Content */}
                  <div>
                    <label className="badge-mono block mb-1.5 text-[var(--text-muted)]">Content (Markdown)</label>
                    <textarea
                      required
                      minLength={10}
                      rows={5}
                      placeholder="Describe your thread..."
                      value={newThread.content}
                      onChange={e => setNewThread({ ...newThread, content: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-3 text-sm outline-none resize-none custom-scrollbar transition-all bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--orange)] focus:shadow-[0_0_0_3px_var(--orange-dim)]"
                    />
                  </div>

                  {/* Encrypted payload */}
                  <div className="pt-3 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="badge-mono flex items-center gap-1 text-[var(--orange)]">
                        <LockKeyhole className="size-3" /> Encrypted Payload
                      </label>
                      {user.isVip && (
                        <span className="badge-mono flex items-center gap-1 text-amber-500 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                          <Crown className="size-2.5" /> VIP
                        </span>
                      )}
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Hidden content (BINs, configs)..."
                      value={newThread.lockedContent}
                      onChange={e => setNewThread({ ...newThread, lockedContent: e.target.value })}
                      className="w-full rounded-xl px-3.5 py-3 text-sm outline-none resize-none custom-scrollbar bg-[var(--orange-dim)] border border-[var(--orange-border)] text-[var(--text-primary)] placeholder-[var(--orange-border)]"
                    />

                    <div className="mt-2.5 flex items-center justify-between rounded-xl px-3.5 py-3 bg-[var(--surface-raised)] border border-[var(--border)]">
                      <span className="text-sm font-semibold text-[var(--text-secondary)]">Unlock Cost</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={newThread.unlockCost}
                          onChange={e => setNewThread({ ...newThread, unlockCost: parseInt(e.target.value) || 0 })}
                          className="w-20 rounded-lg px-3 py-1.5 text-sm font-bold outline-none text-right transition-all bg-[var(--surface)] border border-[var(--border-strong)] text-[var(--text-primary)] focus:border-[var(--orange)]"
                        />
                        <span className="badge-mono text-[var(--orange)]">pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    disabled={isPosting || !newThread.title.trim() || !newThread.content.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 active:scale-[0.98] group bg-[var(--text-primary)] hover:bg-[var(--orange)] text-[var(--bg)] hover:text-white"
                  >
                    {isPosting ? (
                      <span className="animate-pulse">Publishing...</span>
                    ) : (
                      <><Send className="size-4" /> Publish Thread</>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto size-16 rounded-2xl flex items-center justify-center mb-5 bg-[var(--orange-dim)] border border-[var(--orange-border)]">
                  <LockKeyhole className="size-7 text-[var(--orange)]" />
                </div>
                <h3 className="font-bold text-xl mb-2 text-[var(--text-primary)]" style={{ fontFamily: 'Syne, sans-serif' }}>
                  Sign In Required
                </h3>
                <p className="text-sm mb-6 leading-relaxed text-[var(--text-secondary)]">
                  Create an account to post threads, access encrypted content, and earn reputation points.
                </p>
                <div className="space-y-2.5">
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-[var(--orange)] text-[#fff] hover:opacity-90"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="flex items-center justify-center w-full py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98] bg-[var(--surface-raised)] border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--surface)]"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
