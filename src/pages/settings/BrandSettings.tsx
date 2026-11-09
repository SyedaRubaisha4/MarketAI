import { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { BrandFields, type BrandFieldErrors } from '../../components/BrandFields';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Field';
import { BUSINESS_TYPES } from '../../data/mockData';
import type { BrandProfile } from '../../types';
import { api } from '../../api/client';

export function BrandSettings() {
  const { brand, toast } = useApp();
  
  const [form, setForm] = useState<BrandProfile>({
    businessName: brand?.businessName || '',
    businessType: brand?.businessType || 'Electronics',
    description: brand?.description || '',
    targetCustomers: brand?.targetCustomers || '',
    language: brand?.language || 'English',
    tones: brand?.tones || [],
    wordsToAvoid: brand?.wordsToAvoid || [],
    keywords: brand?.keywords || [],
    completed: brand?.completed || false,
  } as BrandProfile);

  const [errors, setErrors] = useState<BrandFieldErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (brand) {
      setForm({
        businessName: brand.businessName || '',
        businessType: brand.businessType || 'Electronics',
        description: brand.description || '',
        targetCustomers: brand.targetCustomers || '',
        language: brand.language || 'English',
        tones: brand.tones || [],
        wordsToAvoid: brand.wordsToAvoid || [],
        keywords: brand.keywords || [],
        completed: brand.completed || false,
      } as BrandProfile);
    }
  }, [brand]);

  const update = (patch: Partial<BrandProfile>) => setForm((f) => ({ ...f, ...patch }));
  const setError = (key: keyof BrandFieldErrors, message?: string) => setErrors((er) => ({ ...er, [key]: message }));

  const save = async () => {
    const er: BrandFieldErrors = {};
    
    if ((form.description || '').trim().length < 20) {
      er.description = 'Describe your business in at least 20 characters.';
    }
    if (!(form.targetCustomers || '').trim()) {
      er.targetCustomers = 'Tell us who your customers are.';
    }
    if (!(form.businessName || '').trim()) {
       toast('Business name is required', { variant: 'error' });
       return;
    }
    if (!(form.tones || []).length) {
      toast('Select at least one tone of voice', { variant: 'info' });
      return;
    }

    setErrors(er);
    if (Object.keys(er).length) return;

    setSaving(true);
    try {
      const brandId = localStorage.getItem('brand_id');
      if (!brandId) {
        toast('Error', { description: 'Brand ID not found.', variant: 'error' });
        return;
      }

      const token = localStorage.getItem('access_token');
      
      await api.patch(`brands/${brandId}/update/`, {
        business_name: form.businessName,
        business_type: form.businessType,
        description: form.description,
        target_customer_class: form.targetCustomers,
        tone_of_voice: form.tones?.join(', '),
        language: form.language,
        words_to_avoid: form.wordsToAvoid,
        brand_keywords: form.keywords,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast('Brand profile saved', { description: 'AI content will now match your brand voice.' });
    } catch (e) {
      console.error("Brand save error", e);
      toast('Error', { description: 'Brand update failed', variant: 'error' });
    } finally {
      setSaving(false);
    }
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
        {brand?.completed && (
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            Setup completed
          </span>
        )}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input
          label="Business Name"
          value={form.businessName || ''}
          onChange={(e) => update({ businessName: e.target.value })}
          required
        />
        <Select
          label="Business Type"
          value={form.businessType || 'Electronics'}
          onChange={(e) => update({ businessType: e.target.value as BrandProfile['businessType'] })}
          options={BUSINESS_TYPES.map((b) => ({ value: b, label: b }))}
          required
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