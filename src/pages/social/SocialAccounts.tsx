import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Share2, Unlink, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { PLATFORM_META, PLATFORMS } from '../../data/mockData';
import type { Platform, SocialAccount } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { PlatformIcon } from '../../components/PlatformIcon';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';

const PLATFORM_STYLES: Record<string, { iconBg: string, iconColor: string, hoverGlow: string, borderHover: string }> = {
  instagram: { iconBg: 'bg-pink-50', iconColor: 'text-pink-600', hoverGlow: 'hover:shadow-pink-500/10', borderHover: 'hover:border-pink-200' },
  facebook: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', hoverGlow: 'hover:shadow-blue-500/10', borderHover: 'hover:border-blue-200' },
  whatsapp: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', hoverGlow: 'hover:shadow-emerald-500/10', borderHover: 'hover:border-emerald-200' },
  tiktok: { iconBg: 'bg-slate-100', iconColor: 'text-slate-900', hoverGlow: 'hover:shadow-slate-500/10', borderHover: 'hover:border-slate-300' },
  pinterest: { iconBg: 'bg-red-50', iconColor: 'text-red-600', hoverGlow: 'hover:shadow-red-500/10', borderHover: 'hover:border-red-200' },
  linkedin: { iconBg: 'bg-sky-50', iconColor: 'text-sky-700', hoverGlow: 'hover:shadow-sky-500/10', borderHover: 'hover:border-sky-200' },
}

function ConnectedCard({ account, onDisconnect }: { account: SocialAccount; onDisconnect: (p: Platform) => void }) {
  const meta = PLATFORM_META[account.platform];
  const styles = PLATFORM_STYLES[account.platform] || { iconBg: 'bg-slate-100', iconColor: 'text-slate-600', hoverGlow: '', borderHover: '' };
  
  return (
    <div className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${styles.borderHover}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor} shadow-sm`}>
            <PlatformIcon platform={account.platform} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900">{meta.name}</p>
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">@{account.accountName}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Connected
        </span>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
          <Sparkles className="h-3 w-3 text-emerald-500" /> Ready
        </span>
        <button 
          onClick={() => onDisconnect(account.platform)}
          className="flex items-center gap-1 rounded-lg text-[11px] font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 px-2 py-1"
        >
          <Unlink className="h-3 w-3" /> Disconnect
        </button>
      </div>
    </div>
  );
}

export function SocialAccountsPage() {
  const { socialAccounts, disconnectAccount, toast } = useApp();
  const [disconnecting, setDisconnecting] = useState<Platform | null>(null);
  const [busy, setBusy] = useState(false);

  const connected = (socialAccounts || []).filter((a) => a.connected);
  const disconnected = PLATFORMS.filter((p) => !connected.some((a) => a.platform === p));

  const handleConnect = (p: Platform) => {
    const savedBrandId = localStorage.getItem('brand_id');
    if (!savedBrandId) {
      toast("Error", { description: "Brand not found. Please setup your brand first.", variant: "error" });
      return;
    }
    if (p === 'facebook') {
      window.location.href = `https://market-ai-backend-p143.onrender.com/api/social/facebook/connect/?brand_id=${savedBrandId}`;
    } else if (p === 'instagram') {
      window.location.href = `https://market-ai-backend-p143.onrender.com/api/social/instagram/connect/?brand_id=${savedBrandId}`;
    } else {
      toast(`${PLATFORM_META[p].name} integration coming soon!`, { variant: 'info' });
    }
  };

  const confirmDisconnect = () => {
    if (!disconnecting) return;
    setBusy(true);
    setTimeout(() => {
      disconnectAccount(disconnecting);
      setBusy(false);
      setDisconnecting(null);
      toast(`${PLATFORM_META[disconnecting].name} disconnected`, { variant: 'info' });
    }, 700);
  };

  return (
    // Height lock aur spacing kam ki hai taake bina scroll ke fit ho jaye
    <div className="mx-auto max-w-6xl h-[calc(100vh-100px)] flex flex-col space-y-4 pb-4 pt-2">
      <PageHeader
        title="Social Accounts"
        description={`Connect the platforms where you want to publish. ${connected.length} of ${PLATFORMS.length} connected.`}
      />

      {connected.length === 0 ? (
        <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-sm">
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-indigo-50 blur-[80px]" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-pink-50 blur-[80px]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100 mb-4">
              <Share2 className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">No accounts connected</h2>
            <p className="mt-2 max-w-sm text-sm font-medium text-slate-500">
              Connect at least one social platform to start publishing your AI content.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1 content-start">
          {connected.map((a) => (
            <ConnectedCard key={a.platform} account={a} onDisconnect={setDisconnecting} />
          ))}
        </div>
      )}

      {disconnected.length > 0 && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Available Platforms</h2>
            <span className="text-[11px] font-semibold text-slate-400">{disconnected.length} remaining</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 flex-1 content-start overflow-y-auto pr-1 pb-1">
            {disconnected.map((p) => {
              const meta = PLATFORM_META[p];
              const styles = PLATFORM_STYLES[p] || { iconBg: 'bg-slate-100', iconColor: 'text-slate-600', hoverGlow: '', borderHover: '' };
              
              return (
                <div key={p} className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${styles.borderHover}`}>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor} shadow-sm`}>
                      <PlatformIcon platform={p} className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{meta.name}</p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Not connected</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Available</span>
                    <Button 
                      className="rounded-lg bg-slate-900 text-white hover:bg-slate-800 shadow-sm h-8 px-3 text-[11px] font-bold transition-all duration-300 hover:scale-105" 
                      onClick={() => handleConnect(p)} 
                      disabled={busy}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Dialog
        open={disconnecting !== null}
        onClose={() => !busy && setDisconnecting(null)}
        title={`Disconnect ${disconnecting ? PLATFORM_META[disconnecting].name : ''}?`}
      >
        <p className="text-sm font-medium leading-relaxed text-slate-500">
          Scheduled posts to this platform will remain in your calendar, but publishing will be unavailable until you reconnect.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" className="rounded-xl font-bold text-slate-500 hover:bg-slate-100" onClick={() => setDisconnecting(null)} disabled={busy}>
            Cancel
          </Button>
          <Button className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-sm" onClick={confirmDisconnect} loading={busy}>
            Disconnect
          </Button>
        </div>
      </Dialog>
    </div>
  );
}