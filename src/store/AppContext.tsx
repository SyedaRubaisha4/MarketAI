import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type {
  BrandProfile, GeneratedContent, Notification, Platform, Product, ProductStatus,
  ScheduledPost, SocialAccount, Subscription, ToastData, User,
} from '../types'
import {
  buildMockContent, seedProducts, seedScheduledPosts, seedSocialAccounts, seedSubscription, DEFAULT_BRAND,
} from '../data/mockData'

const STORAGE_KEY = 'marketai-state-v1'
const SESSION_KEY = 'marketai-session-v1'

const uid = () => Math.random().toString(36).slice(2, 10)

interface PersistedState {
  user: User | null
  brand: BrandProfile
  products: Product[]
  contents: Record<string, GeneratedContent>
  socialAccounts: SocialAccount[]
  scheduledPosts: ScheduledPost[]
  subscription: Subscription
  notifications: Notification[]
}

interface AppContextValue extends PersistedState {
  session: boolean
  toasts: ToastData[]
  register: (data: { fullName: string; businessName: string; businessType: User['businessType']; email: string }) => void
  login: (email: string) => void
  logout: () => void
  completeOnboarding: (brand: BrandProfile) => void
  skipOnboarding: () => void
  updateProfile: (fullName: string, email: string) => void
  saveBrand: (brand: BrandProfile) => void
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => Product
  updateProduct: (id: string, patch: Partial<Product>) => void
  deleteProduct: (id: string) => void
  setProductStatus: (id: string, status: ProductStatus) => void
  setContent: (productId: string, content: GeneratedContent) => void
  updateContent: (productId: string, updater: (c: GeneratedContent) => GeneratedContent) => void
  removeContent: (productId: string) => void
  approveSection: (productId: string, key: keyof GeneratedContent['sections']) => void
  connectAccount: (platform: Platform, name: string, identifier: string) => void
  disconnectAccount: (platform: Platform) => void
  schedulePost: (post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>) => ScheduledPost
  updateScheduledPost: (id: string, patch: Partial<ScheduledPost>) => void
  deleteScheduledPost: (id: string) => void
  publishPostNow: (id: string) => void
  updateSubscription: (s: Subscription) => void
  addNotification: (title: string, description: string) => void
  markNotificationsRead: () => void
  toast: (title: string, opts?: { description?: string; variant?: ToastData['variant'] }) => void
  dismissToast: (id: number) => void
  resetAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as PersistedState
  } catch { /* ignore */ }
  const brand = DEFAULT_BRAND
  const products = seedProducts()
  const contents: Record<string, GeneratedContent> = {}
  for (const p of products) {
    if (!['needs_review', 'content_ready', 'approved', 'scheduled', 'published'].includes(p.status)) continue
    const content = buildMockContent(p, brand, 0)
    if (['approved', 'scheduled', 'published'].includes(p.status)) {
      for (const key of Object.keys(content.sections) as (keyof GeneratedContent['sections'])[]) {
        content.sections[key] = { key, approved: true }
      }
    }
    contents[p.id] = content
  }
  return {
    user: {
      id: 'u-demo',
      fullName: 'Ahmed Khan',
      email: 'ahmed@khan-electronics.pk',
      businessName: 'Khan Electronics',
      businessType: 'Electronics',
      onboarded: true,
    },
    brand,
    products,
    contents,
    socialAccounts: seedSocialAccounts(),
    scheduledPosts: seedScheduledPosts(),
    subscription: seedSubscription(),
    notifications: [],
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadPersisted)
  const [session, setSession] = useState(() => {
    const flag = localStorage.getItem(SESSION_KEY)
    return flag === null ? true : flag === '1'
  })
  const [toasts, setToasts] = useState<ToastData[]>([])
  const toastId = useRef(0)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch { /* ignore */ }
  }, [state])

  const toast = useCallback((title: string, opts?: { description?: string; variant?: ToastData['variant'] }) => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, title, description: opts?.description, variant: opts?.variant ?? 'success' }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const addNotification = useCallback((title: string, description: string) => {
    setState((s) => ({
      ...s,
      notifications: [{ id: uid(), title, description, createdAt: new Date().toISOString(), read: false }, ...s.notifications].slice(0, 20),
    }))
  }, [])

  const value: AppContextValue = useMemo(() => ({
    ...state,
    session,
    toasts,
    register: (data) => {
      const user: User = { id: uid(), onboarded: false, ...data }
      setState((s) => ({ ...s, user, brand: { ...s.brand, businessName: data.businessName, businessType: data.businessType } }))
      setSession(true)
      localStorage.setItem(SESSION_KEY, '1')
    },
    login: (email) => {
      setState((s) => ({
        ...s,
        user: s.user
          ? { ...s.user, email }
          : { id: uid(), fullName: 'Ahmed Khan', businessName: s.brand.businessName, businessType: s.brand.businessType, email, onboarded: s.brand.completed },
      }))
      setSession(true)
      localStorage.setItem(SESSION_KEY, '1')
    },
    logout: () => {
      setSession(false)
      localStorage.setItem(SESSION_KEY, '0')
    },
    completeOnboarding: (brand) => {
      setState((s) => ({ ...s, brand: { ...brand, completed: true }, user: s.user ? { ...s.user, onboarded: true } : s.user }))
    },
    skipOnboarding: () => {
      setState((s) => ({ ...s, user: s.user ? { ...s.user, onboarded: true } : s.user }))
    },
    updateProfile: (fullName, email) => setState((s) => ({ ...s, user: s.user ? { ...s.user, fullName, email } : s.user })),
    saveBrand: (brand) => setState((s) => ({
      ...s,
      brand: { ...brand, completed: true },
      user: s.user ? { ...s.user, businessName: brand.businessName, businessType: brand.businessType } : s.user,
    })),
    addProduct: (p) => {
      const product: Product = { ...p, id: `p-${uid()}`, status: 'draft', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setState((s) => ({ ...s, products: [product, ...s.products] }))
      return product
    },
    updateProduct: (id, patch) => setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p)),
    })),
    deleteProduct: (id) => setState((s) => {
      const contents = { ...s.contents }
      delete contents[id]
      return {
        ...s,
        products: s.products.filter((p) => p.id !== id),
        contents,
        scheduledPosts: s.scheduledPosts.filter((p) => p.productId !== id),
      }
    }),
    setProductStatus: (id, status) => setState((s) => ({
      ...s,
      products: s.products.map((p) => (p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p)),
    })),
    setContent: (productId, content) => setState((s) => ({ ...s, contents: { ...s.contents, [productId]: content } })),
    updateContent: (productId, updater) => setState((s) => {
      const current = s.contents[productId]
      if (!current) return s
      return { ...s, contents: { ...s.contents, [productId]: updater(current) } }
    }),
    removeContent: (productId) => setState((s) => {
      const contents = { ...s.contents }
      delete contents[productId]
      return { ...s, contents }
    }),
    approveSection: (productId, key) => setState((s) => {
      const current = s.contents[productId]
      if (!current) return s
      return {
        ...s,
        contents: {
          ...s.contents,
          [productId]: { ...current, sections: { ...current.sections, [key]: { key, approved: !current.sections[key].approved } } },
        },
      }
    }),
    connectAccount: (platform, name, identifier) => setState((s) => ({
      ...s,
      socialAccounts: s.socialAccounts.map((a) => (a.platform === platform ? { ...a, connected: true, accountName: name, identifier } : a)),
    })),
    disconnectAccount: (platform) => setState((s) => ({
      ...s,
      socialAccounts: s.socialAccounts.map((a) => (a.platform === platform ? { ...a, connected: false, accountName: '', identifier: '' } : a)),
    })),
    schedulePost: (post) => {
      const full: ScheduledPost = { ...post, id: `sp-${uid()}`, status: 'scheduled', createdAt: new Date().toISOString() }
      setState((s) => ({ ...s, scheduledPosts: [...s.scheduledPosts, full] }))
      return full
    },
    updateScheduledPost: (id, patch) => setState((s) => ({
      ...s,
      scheduledPosts: s.scheduledPosts.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),
    deleteScheduledPost: (id) => setState((s) => ({ ...s, scheduledPosts: s.scheduledPosts.filter((p) => p.id !== id) })),
    publishPostNow: (id) => setState((s) => ({
      ...s,
      scheduledPosts: s.scheduledPosts.map((p) => (p.id === id ? { ...p, status: 'published' as const } : p)),
    })),
    updateSubscription: (subscription) => setState((s) => ({ ...s, subscription })),
    addNotification,
    markNotificationsRead: () => setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
    toast,
    dismissToast,
    resetAll: () => {
      localStorage.removeItem(STORAGE_KEY)
      const fresh = loadPersisted()
      setState({ ...fresh, user: state.user })
    },
  }), [state, session, toasts, addNotification, toast, dismissToast])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useTrialStatus() {
  const { subscription } = useApp()
  if (subscription.mockState === 'expired') return 'expired'
  if (subscription.mockState === 'ending') return 'ending'
  const daysLeft = Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / 86400000)
  if (daysLeft <= 0) return 'expired'
  if (daysLeft <= 3) return 'ending'
  return 'normal'
}

export function buildContentFor(product: Product, brand: BrandProfile, variant = 0) {
  return buildMockContent(product, brand, variant)
}
