import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Share2, Unlink, Zap } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { PLATFORM_META, PLATFORMS } from '../../data/mockData';
import type { Platform, SocialAccount } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { PlatformIcon } from '../../components/PlatformIcon';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Field';
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
      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        Demo connection only — no real account is linked. Publishing from this app is simulated.
      </p>
      <div className="mt-4">
        <Button variant="outline" size="sm" onClick={() => onDisconnect(account.platform)}>
          <Unlink className="h-3.5 w-3.5" /> Disconnect
        </Button>
      </div>
    </div>
  );
}

function ConnectModal({
  platform,
  onClose,
  onConnect,
}: {
  platform: Platform;
  onClose: () => void;
  onConnect: (name: string, identifier: string) => void;
}) {
  const [step, setStep] = useState<'form' | 'authorize'>('form');
  const [accountName, setAccountName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const meta = PLATFORM_META[platform];

  const next = () => {
    if (!accountName.trim()) {
      setError('Please enter your account name or handle.');
      return;
    }
    setError('');
    setStep('authorize');
  };

  return (
    <Dialog open onClose={onClose} title={`Connect ${meta.name}`}>
      {step === 'form' ? (
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-xl bg-primary-50 p-3 text-xs leading-relaxed text-primary-700">
            <Zap className="mt-0.5 h-4 w-4 shrink-0" />
            Frontend simulation — enter any name to mock-connect this platform. No OAuth, no real data is exchanged.
          </div>
          <Input
            label="Account name or handle"
            required
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            placeholder={platform === 'whatsapp' ? '+92 3XX XXXXXXX' : `${meta.handlePrefix}yourbusiness`}
            onKeyDown={(e) => e.key === 'Enter' && next()}
          />
          <Input
            label="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Khan Electronics"
          />
          {error && <p className="text-xs font-medium text-red-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={next}>Continue</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 text-center">
          <PlatformIcon platform={platform} className="mx-auto h-14 w-14 rounded-2xl" iconClassName="h-6 w-6" />
          <div>
            <p className="text-sm font-semibold text-slate-900">Authorize MarketAI (demo)</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">
              MarketAI is requesting permission to publish on your behalf. This step only simulates the authorization
              flow — nothing is sent anywhere.
            </p>
          </div>
          <div className="rounded-xl bg-slate-50 px-4 py-3 text-left text-xs text-slate-600">
            <p className="font-semibold text-slate-800">{accountName.trim()}</p>
            <p className="mt-1">Permissions (simulated): publish content, read profile name.</p>
          </div>
          <div className="flex justify-center gap-2">
            <Button variant="ghost" onClick={() => setStep('form')}>Back</Button>
            <Button onClick={() => onConnect(accountName.trim(), displayName.trim() || accountName.trim())}>
              Authorize & Connect
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}

export function SocialAccountsPage() {
  const { socialAccounts, connectAccount, disconnectAccount, toast } = useApp();
  const [connecting, setConnecting] = useState<Platform | null>(null);
  const [disconnecting, setDisconnecting] = useState<Platform | null>(null);
  const [busy, setBusy] = useState(false);

  const connected = socialAccounts.filter((a) => a.connected);
  const disconnected = PLATFORMS.filter((p) => !connected.some((a) => a.platform === p));

  const handleConnect = (p: Platform, name: string, identifier: string) => {
    setBusy(true);
    setTimeout(() => {
      connectAccount(p, name, identifier);
      setBusy(false);
      setConnecting(null);
      toast(`${PLATFORM_META[p].name} connected (simulated)`);
    }, 900);
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
        description={`Connect the platforms where you want to publish. ${connected.length} of ${PLATFORMS.length} connected (demo).`}
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
                  <Button variant="outline" size="sm" onClick={() => setConnecting(p)} disabled={busy}>
                    Connect
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-600">
        Connection and publishing flows in this prototype are simulated.{' '}
        <Link to="/settings" className="font-medium text-primary-700 hover:text-primary-700">
          Manage other settings
        </Link>
      </p>

      {connecting && (
        <ConnectModal
          platform={connecting}
          onClose={() => setConnecting(null)}
          onConnect={(name, identifier) => handleConnect(connecting, name, identifier)}
        />
      )}

      <Dialog
        open={disconnecting !== null}
        onClose={() => !busy && setDisconnecting(null)}
        title={`Disconnect ${disconnecting ? PLATFORM_META[disconnecting].name : ''}?`}
      >
        <p className="text-sm leading-relaxed text-slate-600">
          Scheduled posts to this platform will remain in your calendar, but publishing will be unavailable until you
          reconnect. This only affects the demo connection.
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
