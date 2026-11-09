import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Share2, Unlink } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { PLATFORM_META, PLATFORMS } from '../../data/mockData';
import type { Platform, SocialAccount } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { PlatformIcon } from '../../components/PlatformIcon';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/EmptyState';

function ConnectedCard({ account, onDisconnect }: { account: SocialAccount; onDisconnect: (p: Platform) => void }) {
  const meta = PLATFORM_META[account.platform];
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <PlatformIcon platform={account.platform} className="h-11 w-11 rounded-xl" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{meta.name}</p>
            <p className="mt-0.5 truncate text-xs text-slate-600">{account.accountName}</p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
          <CheckCircle2 className="h-3 w-3" /> Connected
        </span>
      </div>
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={() => onDisconnect(account.platform)}>
          <Unlink className="h-3.5 w-3.5" /> Disconnect
        </Button>
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
      window.location.href = `http://localhost:8000/api/social/facebook/connect/?brand_id=${savedBrandId}`;
    } else if (p === 'instagram') {
      window.location.href = `http://localhost:8000/api/social/instagram/connect/?brand_id=${savedBrandId}`;
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
    <div className="space-y-6">
      <PageHeader
        title="Social Accounts"
        description={`Connect the platforms where you want to publish. ${connected.length} of ${PLATFORMS.length} connected.`}
      />

      {connected.length === 0 ? (
        <EmptyState
          icon={Share2}
          title="No accounts connected"
          description="Connect at least one social platform to publish or schedule your generated content."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {connected.map((a) => (
            <ConnectedCard key={a.platform} account={a} onDisconnect={setDisconnecting} />
          ))}
        </div>
      )}

      {disconnected.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Available platforms</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {disconnected.map((p) => {
              const meta = PLATFORM_META[p];
              return (
                <div key={p} className="card flex items-center justify-between gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <PlatformIcon platform={p} className="h-11 w-11 rounded-xl" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{meta.name}</p>
                      <p className="text-xs text-slate-600">Not connected</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleConnect(p)} disabled={busy}>
                    Connect
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600">
        <Link to="/settings" className="font-medium text-primary-700 hover:text-primary-700">
          Manage other settings
        </Link>
      </p>

      <Dialog
        open={disconnecting !== null}
        onClose={() => !busy && setDisconnecting(null)}
        title={`Disconnect ${disconnecting ? PLATFORM_META[disconnecting].name : ''}?`}
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Scheduled posts to this platform will remain in your calendar, but publishing will be unavailable until you
          reconnect.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDisconnecting(null)} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={confirmDisconnect} loading={busy}>
            Disconnect
          </Button>
        </div>
      </Dialog>
    </div>
  );
}