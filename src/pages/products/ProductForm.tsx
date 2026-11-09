import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { Button, ButtonLink } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { ProductImageUploader } from '../../components/ProductImageUploader'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { PRODUCT_CATEGORIES } from '../../data/mockData'
import type { Product, ProductImageRef } from '../../types'

interface FormState {
  name: string
  category: string
  price: string
  currency: string
  details: { key: string; value: string }[]
  images: ProductImageRef[]
}

export default function ProductForm() {
  const { productId } = useParams()
  const isEdit = !!productId
  const navigate = useNavigate()
  const { products, addProduct, updateProduct, toast } = useApp()
   useEffect(() => {
    const savedBrand = localStorage.getItem('brand_id');
    if (!savedBrand) {
      toast("Business Details Required", { 
        description: "Please complete your business profile before adding products.", 
        variant: "error" 
      });
      
      // Redirect to onboarding
      navigate('/onboarding/brand', { replace: true });
    }
  }, [navigate, toast]); 
  const existing = isEdit ? products.find((p) => p.id === productId) : undefined

  const [form, setForm] = useState<FormState>({
    name: existing?.name ?? '',
    category: existing?.category ?? '',
    price: existing ? String(existing.price) : '',
    currency: existing?.currency ?? 'Rs',
    details: existing?.details?.length ? existing.details : [{ key: '', value: '' }],
    images: existing?.images ?? [],
  })
  const [errors, setErrors] = useState<{ name?: string; category?: string; price?: string }>({})
  const [confirmLeave, setConfirmLeave] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState<'none' | 'save' | 'generate'>('none')

  const patch = (p: Partial<FormState>) => { setForm((f) => ({ ...f, ...p })); setDirty(true) }

  const setDetail = (i: number, field: 'key' | 'value', v: string) => {
    const details = form.details.map((d, idx) => (idx === i ? { ...d, [field]: v } : d))
    patch({ details })
  }

  const validate = () => {
    const er: typeof errors = {}
    if (!form.name.trim()) er.name = 'Product name is required.'
    if (!form.category) er.category = 'Please select a category.'
    const price = Number(form.price)
    if (!form.price || Number.isNaN(price) || price <= 0) er.price = 'Enter a valid price greater than zero.'
    setErrors(er)
    return Object.keys(er).length === 0
  }

   const save = async (mode: 'save' | 'generate') => {
    if (!validate()) return
    setSaving(mode)
    
    const payload = {
      name: form.name.trim(),
      category: form.category,
      price: Number(form.price),
      currency: form.currency,
      details: form.details.filter((d) => d.key.trim() && d.value.trim()),
      images: form.images,
    }

    try {
      if (isEdit && existing) {
        // Assuming updateProduct is also async in AppContext
        await updateProduct(existing.id, payload)
        toast('Product updated', { description: form.name.trim() })
        navigate(mode === 'generate' ? `/products/${existing.id}/generate` : `/products/${existing.id}`)
      } else {
                const product = await addProduct(payload as any)
        
        if (!product || !product.id) {
           toast('Error', { description: 'Product could not be saved properly.', variant: 'error' })
           setSaving('none')
           return
        }

        toast('Product added', { description: `${payload.name} was added to your catalog.` })
        navigate(mode === 'generate' ? `/products/${product.id}/generate` : '/products')
      }
    } catch (error) {
      console.error("Save error", error)
    } finally {
      setSaving('none')
    }
  }

  const cancel = () => {
    if (dirty) setConfirmLeave(true)
    else navigate(isEdit ? `/products/${productId}` : '/products')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link to={isEdit ? `/products/${productId}` : '/products'} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Back to Products
        </Link>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        <p className="mt-1 text-sm text-slate-600">
          {isEdit ? 'Update your product details, then regenerate content if anything changed.' : 'Add the basics and AI will build a complete marketing package.'}
        </p>
      </div>

      <div className="card space-y-6 p-5 sm:p-7">
        <ProductImageUploader images={form.images} onChange={(images) => patch({ images })} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Product Name" placeholder="Wireless Earbuds Pro" value={form.name} onChange={(e) => { patch({ name: e.target.value }); setErrors((er) => ({ ...er, name: undefined })) }} error={errors.name} required />
          <Select
            label="Category"
            placeholder="Select a category"
            value={form.category}
            onChange={(e) => { patch({ category: e.target.value }); setErrors((er) => ({ ...er, category: undefined })) }}
            error={errors.category}
            required
            options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Price"
            type="number" min="0" step="0.01"
            placeholder="2499"
            value={form.price}
            onChange={(e) => { patch({ price: e.target.value }); setErrors((er) => ({ ...er, price: undefined })) }}
            error={errors.price}
            required
          />
            <Select
            label="Currency"
            value={form.currency}
            onChange={(e) => patch({ currency: e.target.value })}
            options={[
              { value: 'PKR', label: 'Rs — Pakistani Rupee' },
              { value: 'USD', label: '$ — US Dollar' },
              { value: 'EUR', label: '€ — Euro' },
              { value: 'GBP', label: '£ — British Pound' }
            ]}
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="block text-sm font-medium text-slate-700">Basic Details</span>
              <p className="text-xs text-slate-400">Specifications like color, battery, and size help AI write richer content.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => patch({ details: [...form.details, { key: '', value: '' }] })}>
              <Plus className="h-4 w-4" aria-hidden /> Add more details
            </Button>
          </div>
          {form.details.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input aria-label={`Detail ${i + 1} name`} placeholder="Color" value={d.key} onChange={(e) => setDetail(i, 'key', e.target.value)} className="!space-y-0" />
              <Input aria-label={`Detail ${i + 1} value`} placeholder="Black" value={d.value} onChange={(e) => setDetail(i, 'value', e.target.value)} className="!space-y-0" />
              <button
                type="button"
                onClick={() => patch({ details: form.details.filter((_, idx) => idx !== i) })}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove detail ${i + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={cancel} disabled={saving !== 'none'}>Cancel</Button>
        <Button variant="outline" onClick={() => save('save')} loading={saving === 'save'}>
          {isEdit ? 'Save Changes' : 'Save as Draft'}
        </Button>
        <Button onClick={() => save('generate')} loading={saving === 'generate'}>
          Save &amp; Generate
        </Button>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={() => navigate(isEdit ? `/products/${productId}` : '/products')}
        title="Leave without saving?"
        description="You have unsaved changes that will be lost if you leave this page."
        confirmLabel="Discard Changes"
        danger
      />
    </div>
  )
}
