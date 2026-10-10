import { useRef, useState } from 'react'
import { ImagePlus, Star, Trash2, UploadCloud } from 'lucide-react'
import { cn } from '../lib/cn'
import type { ProductImageRef } from '../types'

const MAX_IMAGES = 10
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

let counter = 0
const imgId = () => `u-${Date.now()}-${counter++}`

interface UploaderProps {
  images: ProductImageRef[]
  onChange: (images: ProductImageRef[]) => void
  error?: string
}

export function ProductImageUploader({ images, onChange, error }: UploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const addFiles = (files: FileList | File[]) => {
    setLocalError(null)
    const list = Array.from(files)
    if (images.length + list.length > MAX_IMAGES) {
      setLocalError(`You can upload up to ${MAX_IMAGES} images.`)
      return
    }
    for (const file of list) {
      if (!ACCEPTED.includes(file.type)) {
        setLocalError('Only JPG, PNG, WebP or GIF images are supported.')
        return
      }
      if (file.size > MAX_BYTES) {
        setLocalError('Each image must be smaller than 5 MB.')
        return
      }
    }
    Promise.all(list.map((file) => new Promise<ProductImageRef>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve({ id: imgId(), url: String(reader.result), isPrimary: false })
      reader.readAsDataURL(file)
    }))).then((entries) => {
      onChange([
        ...images,
        ...entries.map((e, i) => ({ ...e, isPrimary: images.length === 0 && i === 0 })),
      ])
    })
  }

  const remove = (id: string) => {
    const next = images.filter((i) => i.id !== id)
    if (next.length && !next.some((i) => i.isPrimary)) next[0] = { ...next[0], isPrimary: true }
    onChange(next)
  }

  const setPrimary = (id: string) =>
    onChange(images.map((i) => ({ ...i, isPrimary: i.id === id })))

  return (
    <div className="space-y-1.5">
      <span className="block text-sm font-medium text-slate-700">Product Images</span>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files) }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-slate-50/60 hover:border-primary-400 hover:bg-primary-50/40',
          (error || localError) && 'border-red-400',
        )}
        aria-label="Upload product images"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-500 shadow-sm">
          <UploadCloud className="h-7 w-7" aria-hidden />
        </span>
        <p className="mt-4 text-sm font-semibold text-slate-700">
          Drop image here or <span className="text-primary-600 underline underline-offset-2">click to upload</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">Upload up to {MAX_IMAGES} images · JPG, PNG, WebP, GIF · max 5 MB each</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        multiple
        className="hidden"
        onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = '' }}
      />
      {(error || localError) && <p className="text-sm text-red-600" role="alert">{error ?? localError}</p>}
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3 pt-2 sm:grid-cols-4 md:grid-cols-5">
          {images.map((img) => (
            <li key={img.id} className={cn('group relative aspect-square overflow-hidden rounded-xl border-2', img.isPrimary ? 'border-primary-500' : 'border-transparent')}>
              <img src={img.url} alt="Product preview" className="h-full w-full object-cover" />
              {img.isPrimary && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-primary-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  <Star className="h-2.5 w-2.5 fill-current" aria-hidden /> Primary
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-slate-900/70 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                {!img.isPrimary && (
                  <button type="button" onClick={() => setPrimary(img.id)} className="rounded-md bg-white/90 p-1 text-xs font-medium text-slate-700 hover:bg-white" aria-label="Set as primary image">
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button type="button" onClick={() => remove(img.id)} className="rounded-md bg-white/90 p-1 text-red-600 hover:bg-white" aria-label="Remove image">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
          {images.length < MAX_IMAGES && (
            <li>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 text-slate-400 hover:border-primary-400 hover:text-primary-600"
                aria-label="Add more images"
              >
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs font-medium">Add more</span>
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
