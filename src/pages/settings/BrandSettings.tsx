import { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { BrandFields, type BrandFieldErrors } from '../../components/BrandFields';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { BUSINESS_TYPES } from '../../data/mockData';
import type { BrandProfile } from '../../types';

export function BrandSettings() {
  const { brand, saveBrand, toast } = useApp();
  const [form, setForm] = useState<BrandProfile>({ ...brand });
  const [errors, setErrors] = useState<BrandFieldErrors>({});
  const [saving, setSaving] = useState(false);

  const update = (patch: Partial<BrandProfile>) => setForm((f) => ({ ...f, ...patch }));
  const setError = (key: keyof BrandFieldErrors, message?: string) => setErrors((er) => ({ ...er, [key]: message }));

  const save = () => {
    const er: BrandFieldErrors = {};
    if (form.description.trim().length < 20) er.description = 'Describe your business in at least 20 characters.';
    if (!form.targetCustomers.trim()) er.targetCustomers = 'Tell us who your customers are.';
    setErrors(er);
    if (Object.keys(er).length) return;
    if (form.tones.length === 0) {
      toast('Select at least one tone of voice', { variant: 'info' });
      return;
    }
    setSaving(true);
    setTimeout(() => {
      saveBrand(form);
      setSaving(false);
      toast('Brand profile saved', { description: 'AI content will now match your brand voice.' });
    }, 800);
  };

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Brand Profile</h2>
          <p className="mt-1 text-sm text-slate-600">
            This information shapes every description, caption, and headline the AI generates.
          </p>
        </div>
        {brand.completed && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Setup completed
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          label="Business Name"
          value={form.businessName}
          onChange={(e) => update({ businessName: e.target.value })}
        />
        <Select
          label="Business Type"
          value={form.businessType}
          onChange={(e) => update({ businessType: e.target.value as BrandProfile['businessType'] })}
          options={BUSINESS_TYPES.map((b) => ({ value: b, label: b }))}
        />
      </div>

      <div className="mt-8">
        <BrandFields form={form} update={update} errors={errors} setError={setError} />
      </div>

      <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
        <Button onClick={save} loading={saving}>Save Brand Profile</Button>
      </div>
    </div>
  );
}
