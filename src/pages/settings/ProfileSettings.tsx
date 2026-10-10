import { useState } from 'react';
import { LogOut, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../store/AppContext';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Field';

export function ProfileSettings() {
  const { user, updateProfile, logout, resetAll, toast } = useApp();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string }>({});
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const save = () => {
    const er: typeof errors = {};
    if (!fullName.trim()) er.fullName = 'Full name is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) er.email = 'Enter a valid email address.';
    setErrors(er);
    if (Object.keys(er).length) return;
    setSaving(true);
    setTimeout(() => {
      updateProfile(fullName.trim(), email.trim());
      setSaving(false);
      toast('Profile updated');
    }, 700);
  };

  const doLogout = () => {
    logout();
    navigate('/login');
  };

  const doReset = () => {
    setResetting(true);
    setTimeout(() => {
      resetAll();
      setResetting(false);
      setConfirmReset(false);
      toast('Demo data reset', { description: 'All mock products, content, and posts were restored.', variant: 'info' });
      navigate(0);
    }, 800);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-base font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Your sign-in details for this demo workspace.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Input
            label="Full Name"
            required
            error={errors.fullName}
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setErrors((er) => ({ ...er, fullName: undefined })); }}
          />
          <Input
            label="Email Address"
            type="email"
            required
            error={errors.email}
            value={email}
            onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: undefined })); }}
          />
          <Input label="Business Name" value={user.businessName} disabled />
          <Input label="Business Type" value={user.businessType} disabled />
        </div>
        <p className="mt-3 text-xs text-slate-400">Business details are edited under the Brand tab.</p>
        <div className="mt-5 flex justify-end">
          <Button onClick={save} loading={saving}>Save Changes</Button>
        </div>
      </div>

      <div className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Session</h2>
          <p className="mt-1 text-sm text-slate-500">Sign out of the demo, or restore the original sample data.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="h-4 w-4" /> Reset Demo Data
          </Button>
          <Button variant="ghost" onClick={doLogout}>
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </div>
      </div>

      <Dialog open={confirmReset} onClose={() => !resetting && setConfirmReset(false)} title="Reset demo data?">
        <p className="text-sm leading-relaxed text-slate-600">
          This restores the original sample products, content, social accounts, and scheduled posts. Anything you added
          will be removed.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmReset(false)} disabled={resetting}>Cancel</Button>
          <Button variant="danger" onClick={doReset} loading={resetting}>Reset Data</Button>
        </div>
      </Dialog>
    </div>
  );
}
