import { createContext, useCallback, useContext, useEffect, useMemo, useState, useRef, type ReactNode } from 'react'
import type {
  BrandProfile, GeneratedContent, Notification, Platform, Product, ProductStatus,
  ScheduledPost, SocialAccount, Subscription, ToastData, User,
} from '../types'
import { api } from '../api/client'
import { buildMockContent } from '../data/mockData' 

const SESSION_KEY = 'marketai-session-v1'
const uid = () => Math.random().toString(36).slice(2, 10)

interface AppContextValue {
  user: User | null
  brand: BrandProfile | null
  products: Product[]
  contents: Record<string, GeneratedContent>
  socialAccounts: SocialAccount[]
  scheduledPosts: ScheduledPost[]
  subscription: Subscription | null
  notifications: Notification[]
  loading: boolean
  session: boolean
  toasts: ToastData[]
  dashboardStats: any
  
  // API Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => void;
  completeOnboarding: (brand: any) => void;
  skipOnboarding: () => void;
  saveBrand: (brand: any) => void;
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { details?: any[] }) => Promise<Product | null>
  deleteProduct: (id: string) => Promise<void>
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>
  setContent: (productId: string, content: GeneratedContent) => void;
  updateContent: (productId: string, updater: (c: any) => any) => void;
  approveSection: (productId: string, key: any) => void;
  schedulePost: (post: Omit<ScheduledPost, 'id' | 'createdAt' | 'status'>) => Promise<ScheduledPost | null>
  setProductStatus: (id: string, status: ProductStatus) => Promise<void>;
  toast: (title: string, opts?: { description?: string; variant?: ToastData['variant'] }) => void
  dismissToast: (id: number) => void
  resetAll: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [brand, setBrand] = useState<BrandProfile | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([])
  const [contents, setContents] = useState<Record<string, GeneratedContent>>({})
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>({
    plan: 'Free Trial',
    status: 'active',
    mockState: 'normal', 
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), 
  } as any) 
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const [dashboardStats, setDashboardStats] = useState<any>({
    total_products: 0, drafts: 0, published: 0, scheduled: 0, generated: 0, pending: 0
  }); 

  const [session, setSession] = useState(() => {
    const flag = localStorage.getItem(SESSION_KEY)
    return flag === '1' 
  })

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        
        // 1. Fetch User Profile
        try {
          const userRes = await api.get('profile/get/')
          const profile = userRes.data.user || userRes.data;
          setUser({
            ...profile,
            fullName: profile.full_name || profile.name || profile.username || 'User',
            businessName: 'My Business',
            businessType: 'Retail',
            onboarded: profile.is_onboarded === true 
          })

          if (profile.brand_id) {
            localStorage.setItem('brand_id', profile.brand_id);
          }
        } catch(e) { console.log("User fetch error", e) }

        // 2. Fetch Products
        const prodRes = await api.get('product/get/')
        const productList = prodRes.data.result || [] 
        
              const mappedProducts: Product[] = productList.map((p: any) => {
          let detailsString = '';
          if (Array.isArray(p.basic_details)) {
            detailsString = p.basic_details.map((d: any) => `${d.key}: ${d.value}`).join(', ');
          } else if (p.basic_details && typeof p.basic_details === 'object') {
            detailsString = Object.entries(p.basic_details).map(([key, value]) => `${key}: ${value}`).join(', ');
          }

          return {
            id: p.id,
            name: p.name || 'Untitled',
            description: detailsString, 
            price: Number(p.price) || 0,
            currency: p.currency || 'PKR',
            status: p.status === 'Active' ? 'draft' : 'draft',
            createdAt: p.created_on || new Date().toISOString(),
            updatedAt: p.updated_on || new Date().toISOString(),
            
            category: p.category || 'General',
            details: Array.isArray(p.basic_details) ? p.basic_details : [],
            features: Array.isArray(p.features) ? p.features : [],

            images: (p.images && p.images.length > 0) 
              ? p.images.map((img: any) => ({
                  id: img.id,
                  url: img.image_url?.startsWith('http') ? img.image_url : `http://localhost:8000${img.image_url}`,
                  isPrimary: img.is_primary
                }))
              : [
                  { 
                    id: 'fallback', 
                    url: `https://picsum.photos/seed/${p.id}/800/800`,
                    isPrimary: true 
                  }
                ]
          };
        })
        
        setProducts(mappedProducts)

        // 3. Fetch Stats
        try {
          const statsRes = await api.get('dashboard/stats/');
          setDashboardStats(statsRes.data);
        } catch (e) {
          console.log("Stats fetch error:", e);
        }

        // 4. Fetch Scheduled Posts
        try {
          const schedRes = await api.get('schedule/get/') 
          setScheduledPosts(schedRes.data.result || schedRes.data) 
        } catch(e) { console.log("Schedule fetch error", e) }

      } catch (error) {
        console.error("Failed to fetch initial data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [])
  
  const toastCounter = useRef(0)

  const toast = useCallback((title: string, opts?: { description?: string; variant?: ToastData['variant'] }) => {
    toastCounter.current += 1
    const id = toastCounter.current
    
    setToasts((t) => [...t, { id, title, description: opts?.description, variant: opts?.variant ?? 'success' }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500)
  }, [])

  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const value: AppContextValue = useMemo(() => ({
    user, brand, products, contents, socialAccounts, scheduledPosts, subscription, notifications, loading, session, toasts,dashboardStats,
    
    login: async (email: string, password: string) => {
      try {
        const res = await api.post('auth/login/', { email, password });

        const access  = res.data.tokens?.access  || res.data.access  || res.data.token;
        const refresh = res.data.tokens?.refresh || res.data.refresh;

        if (access)  localStorage.setItem('access_token', access);
        if (refresh) localStorage.setItem('refresh_token', refresh);
        localStorage.setItem(SESSION_KEY, '1');

        const userRes = await api.get('profile/get/');
        const profileData = userRes.data.user || userRes.data;
        
        const userData = {
          ...profileData,
          fullName: profile.name || profile.full_name || profile.username || profile.user?.name || profile.user?.username || 'User',
          onboarded: profileData.is_onboarded === true, 
        };

        if (profileData.brand_id) {
           localStorage.setItem('brand_id', profileData.brand_id);
        }

        setUser(userData);
        setSession(true);

      } catch (error: any) {
        console.error("Login failed:", error.response?.data);
        toast("Login failed", {
          description: error.response?.data?.errors || "Invalid email or password",
          variant: "error",
        });
        throw error;
      }
    },

    setProductStatus: async (id, status) => {
      try {
        await api.patch(`product/${id}/update/`, { status });
        setProducts((prev) => prev.map(p => p.id === id ? { ...p, status } : p));
      } catch (e) {
        console.error("Status update error:", e);
        toast("Error", { description: "Status updation has failed", variant: "error" });
      }
    },
    logout: () => {
      setSession(false)
      localStorage.clear()
    },
setContent: (productId, content) => {
  setContents((prev) => ({
    ...prev,
    [productId]: content,
  }));
},
        updateContent: (productId, updater) => {
      setContents((prev) => {
        const current = prev[productId];
        if (!current) return prev;
        return { ...prev, [productId]: updater(current) };
      });
    },
    
    approveSection: (productId, key) => {
      setContents((prev) => {
        const current = prev[productId];
        if (!current) return prev;
        
        const section = current.sections[key];
        return {
          ...prev,
          [productId]: {
            ...current,
            sections: {
              ...current.sections,
              [key]: { 
                key: key, 
                approved: !section?.approved 
              }
            }
          }
        };
      });
    },
  
    register: async (data) => {
      try {
        await api.post('auth/register/', {
          username: data.email.split('@')[0],
          name: data.fullName,
          email: data.email,
          password: data.password,
        });

        const loginRes = await api.post('auth/login/', {
          email: data.email,
          password: data.password,
        });

        const accessToken = loginRes.data.tokens?.access || loginRes.data.access;
        const refreshToken = loginRes.data.tokens?.refresh || loginRes.data.refresh;

        if (accessToken) localStorage.setItem('access_token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);

        setUser({ ...data, id: loginRes.data.user?.id || 'u-new', onboarded: false } as any);
        setSession(true);
        localStorage.setItem(SESSION_KEY, '1');

        toast("Account Created", { description: "Please enter your business details." });
      } catch (e: any) {
        console.error("Register Error:", e.response?.data);
        const errMsg = e.response?.data?.errors || "Registration failed";
        toast("Error", { description: String(errMsg), variant: "error" });
        throw e;
      }
    },

    completeOnboarding: async (brandData) => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            toast("Error", { description: "You are not logged In . Please login again.", variant: "error" });
            return;
        }

        const res = await api.post('brands/create/', {  
          business_name: brandData.businessName,
          business_type: brandData.businessType,
          description: brandData.description,
          target_customer_class: brandData.targetCustomers,
          tone_of_voice: brandData.tones?.join(', '), 
          language: brandData.language,
          words_to_avoid: brandData.wordsToAvoid,
          brand_keywords: brandData.keywords,
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setBrand({ ...brandData, completed: true } as any);
        
        if (res.data && res.data.id) {
           localStorage.setItem('brand_id', res.data.id);
        }

        if (user) setUser({ ...user, onboarded: true, brandId: res.data.id });
        
        toast("Onboarding Complete", { description: "Brand details have been saved!" });
      } catch (e: any) {
        console.error("Brand save error:", e.response?.data);
        const errMsg = e.response?.data?.errors || "Brand did not save";
        toast("Error", { description: String(errMsg), variant: "error" });
        throw e; 
      }
    },

    skipOnboarding: () => {
      localStorage.setItem('onboarding_skipped', 'true');
    },
    saveBrand: (brandData) => {
      setBrand({ ...brandData, completed: true } as any)
      toast("Brand Saved")
    },

        addProduct: async (p) => {
      try {
        const savedBrand = localStorage.getItem('brand_id'); 

        if (!savedBrand) {
           toast("Error", { description: "Brand ID not found. Please create brand first.", variant: "error" });
           return null;
        }

        const detailsString = p.details?.map((d: any) => `${d.key}: ${d.value}`).join(', ') || '';

        const res = await api.post('product/add/', { 
          name: p.name,
          description: detailsString || p.description || 'No description provided',
          price: Number(p.price),
          currency: p.currency === 'Rs' ? 'PKR' : 
                    p.currency === '$' ? 'USD' : 
                    p.currency === '€' ? 'EUR' : 
                    p.currency === '£' ? 'GBP' : 'PKR',       
          brand_id: savedBrand, 
          category_id: 1, 
        })
        
        const newId = 
          res.data?.result?.product?.id ||  
          res.data?.result?.id || 
          res.data?.product?.id || 
          res.data?.id;

        if (!newId) {
          console.error("No ID returned from backend:", res.data);
          toast("Error", { description: "Product saved but ID not found.", variant: "error" });
          return null;
        }

        const newProduct: Product = {
          id: newId, 
          name: p.name,
          price: Number(p.price),
          currency: p.currency || 'Rs',
          category: p.category,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          images: (p.images && p.images.length > 0) ? p.images : [
            { 
              id: 'default-img', 
              url: `https://picsum.photos/seed/${newId}/800/800`, 
              isPrimary: true 
            }
          ]
        }
        
        setProducts((prev) => [newProduct, ...prev])
        toast("Product Added", { description: " Product has been saved in Database" })
        
        return newProduct
      } catch (e: any) {
        console.error("Add product error:", e.response?.data || e)
        const errMsg = e.response?.data?.message || "Product save nahi hua"
        toast("Error", { description: String(errMsg), variant: "error" })
        return null
      }
    },
        updateProduct: async (id, patch) => {
      try {
        await api.patch(`product/${id}/update/`, patch) 
        setProducts((prev) => prev.map(p => p.id === id ? { ...p, ...patch } : p))
      } catch (e) {
        toast("Error", { description: " Product Updation  failed", variant: "error" })
      }
    },
deleteProduct: async (id) => {
  try {
    await api.delete(`product/delete/${id}/`)
    setProducts((prev) => prev.filter((p) => p.id !== id))
    
    setDashboardStats((prev: any) => ({
      ...prev,
      total_products: Math.max(0, (prev.total_products || 1) - 1),
    }))
    
    toast("Product Deleted")
  } catch (e) {
    toast("Error", { description: "Product deletion failed", variant: "error" })
  }
},

       schedulePost: async (post) => {
      try {
        const res = await api.post('schedule/create/', post) 
        
        const newPost: ScheduledPost = {
          ...post,
          id: res.data.id || res.data.result?.id, 
          status: 'scheduled',
          createdAt: new Date().toISOString()
        }
        setScheduledPosts((prev) => [...prev, newPost])
        return newPost
      } catch (e) {
         toast("Error", { description: "Schedule fail ho gaya", variant: "error" })
         return null
      }
    },

    toast,
    dismissToast,
    resetAll: () => {
      localStorage.clear()
      window.location.reload()
    },
  }), [user, brand, products, contents, socialAccounts, scheduledPosts, subscription, notifications, loading, session, toasts, toast, dismissToast, dashboardStats])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
export function buildContentFor(product: Product, brand: BrandProfile, variant = 0) {
  return buildMockContent(product, brand, variant)
}
export function useTrialStatus() {
  const { subscription } = useApp()
  if (!subscription) return 'normal'
  if (subscription.mockState === 'expired') return 'expired'
  return 'normal'
}