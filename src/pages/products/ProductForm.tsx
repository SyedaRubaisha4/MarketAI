import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Image as ImageIcon, Sparkles, CheckCircle2, Save } from 'lucide-react'
import { useApp } from '../../store/AppContext'
import { Button } from '../../components/ui/Button'
import { Input, Select } from '../../components/ui/Field'
import { ProductImageUploader } from '../../components/ProductImageUploader'
import { ConfirmDialog } from '../../components/ui/Dialog'
import { PRODUCT_CATEGORIES } from '../../data/mockData'
import type { ProductImageRef } from '../../types'

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
      navigate('/onboarding/brand', { replace: true });
    }
  }, [navigate, toast]); 

  const existing = isEdit ? products.find((p) => p.id === productId) : undefined

  const [form, setForm] = useState<FormState>({
    name: existing?.name ?? '',
    category: existing?.category ?? '',
    price: existing ? String(existing.price) : '',
    currency: existing?.currency ?? 'PKR',
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
    <div className="mx-auto max-w-6xl animate-in fade-in duration-500 h-[calc(100vh-100px)] flex flex-col">
      
      {/* Header - Compact */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <Link to={isEdit ? `/products/${productId}` : '/products'} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to Products
          </Link>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid gap-6 lg:grid-cols-3 flex-1 min-h-0">
        
        {/* Left Column: Form (2 Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-y-auto pr-2 pb-2">
          
          {/* Image Upload Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shrink-0">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <ImageIcon className="h-4 w-4 text-indigo-500" /> Product Images
            </h2>
            <div className="rounded-xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 p-1">
              <ProductImageUploader images={form.images} onChange={(images) => patch({ images })} />
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shrink-0 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 mb-1">Basic Information</h2>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <Input 
                label="Product Name *" 
                placeholder="Wireless Earbuds Pro" 
                value={form.name} 
                onChange={(e) => { patch({ name: e.target.value }); setErrors((er) => ({ ...er, name: undefined })) }} 
                error={errors.name} 
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm"
              />
              <Select
                label="Category *"
                placeholder="Select a category"
                value={form.category}
                onChange={(e) => { patch({ category: e.target.value }); setErrors((er) => ({ ...er, category: undefined })) }}
                error={errors.category}
                options={PRODUCT_CATEGORIES.map((c) => ({ value: c, label: c }))}
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm cursor-pointer hover:bg-slate-100 transition-colors"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Price *"
                type="number" min="0" step="0.01"
                placeholder="2499"
                value={form.price}
                onChange={(e) => { patch({ price: e.target.value }); setErrors((er) => ({ ...er, price: undefined })) }}
                error={errors.price}
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm"
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
                className="bg-slate-50 border-slate-200 focus:bg-white focus:border-indigo-500 rounded-lg text-sm cursor-pointer hover:bg-slate-100 transition-colors"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Basic Details</h2>
                <p className="text-[11px] font-medium text-slate-500">Specifications help AI write richer content.</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-lg border-indigo-100 text-indigo-600 hover:bg-indigo-50 h-8 text-xs" onClick={() => patch({ details: [...form.details, { key: '', value: '' }] })}>
                <Plus className="h-3.5 w-3.5 mr-1" aria-hidden /> Add Detail
              </Button>
            </div>
            
            <div className="space-y-2">
              {form.details.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input aria-label={`Detail ${i + 1} name`} placeholder="Color" value={d.key} onChange={(e) => setDetail(i, 'key', e.target.value)} className="!space-y-0 bg-slate-50 border-slate-200 focus:bg-white rounded-lg text-sm h-9" />
                  <Input aria-label={`Detail ${i + 1} value`} placeholder="Black" value={d.value} onChange={(e) => setDetail(i, 'value', e.target.value)} className="!space-y-0 bg-slate-50 border-slate-200 focus:bg-white rounded-lg text-sm h-9" />
                  <button
                    type="button"
                    onClick={() => patch({ details: form.details.filter((_, idx) => idx !== i) })}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Summary (1 Column) */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden sticky top-24">
            
            <div className="border-b border-slate-100 bg-slate-50/50 p-5">
              <h3 className="font-bold text-slate-900 text-sm">Summary & AI Generation</h3>
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-600">AI will write the product name, description, and SEO tags.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-600">Social media captions for Instagram and Facebook.</p>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-xs font-medium text-slate-600">Takes about 60 seconds to generate.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 p-5 space-y-3 bg-slate-50/30">
              <Button 
                onClick={() => save('generate')} 
                loading={saving === 'generate'} 
                className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all py-5 text-sm font-bold"
              >
                <Sparkles className="h-4 w-4 mr-2" /> {isEdit ? 'Save & Regenerate' : 'Save & Generate AI'}
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold h-10 text-xs" onClick={cancel} disabled={saving !== 'none'}>
                  Cancel
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold h-10 text-xs" onClick={() => save('save')} loading={saving === 'save'}>
                  <Save className="h-3.5 w-3.5 mr-1.5" /> Draft
                </Button>
              </div>
            </div>

          </div>
        </div>

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