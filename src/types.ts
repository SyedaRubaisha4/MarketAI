export type BusinessType =
  | 'Fashion & Clothing' | 'Electronics' | 'Home & Furniture' | 'Beauty & Cosmetics'
  | 'Food & Beverages' | 'Books & Stationery' | 'Toys & Games' | 'Jewelry & Accessories'
  | 'Sports & Fitness' | 'Health & Wellness' | 'Pet Supplies' | 'Baby Products'
  | 'Automotive' | 'Tools & Hardware' | 'Art & Crafts' | 'Music & Instruments'
  | 'Office Supplies' | 'Garden & Outdoor' | 'Kitchen & Dining' | 'Phones & Tablets'
  | 'Computers & Laptops' | 'Shoes & Footwear' | 'Bags & Luggage' | 'Watches'
  | 'Eyewear' | 'Other'

export interface User {
  id: string
  fullName: string
  businessName: string
  businessType: BusinessType
  email: string
  onboarded: boolean
}

export interface BrandProfile {
  businessName: string
  businessType: BusinessType
  description: string
  tones: string[]
  targetCustomers: string
  language: 'English' | 'Urdu' | 'English + Urdu'
  wordsToAvoid: string[]
  keywords: string[]
  completed: boolean
}

export type ProductStatus =
  | 'draft' | 'generating' | 'content_ready' | 'needs_review' | 'approved'
  | 'scheduled' | 'published' | 'generation_failed'

export interface ProductImageRef {
  id: string
  url: string
  isPrimary: boolean
}

export interface Product {
  id: string
  name: string
  category: string
  price: number
  currency: string
  details: { key: string; value: string }[]
  images: ProductImageRef[]
  status: ProductStatus
  createdAt: string
  updatedAt: string
}

export type ContentSectionKey =
  | 'product_name' | 'short_description' | 'full_description' | 'seo'
  | 'instagram' | 'facebook' | 'whatsapp' | 'image'

export interface ContentSection {
  key: ContentSectionKey
  approved: boolean
}

export interface SeoContent {
  title: string
  metaDescription: string
  keywords: string[]
}

export interface SocialCaption {
  caption: string
  hashtags: string[]
}

export interface WhatsAppContent {
  message: string
}

export interface GeneratedContent {
  productId: string
  generatedAt: string
  names: string[]
  selectedName: string
  shortDescription: string
  fullDescription: string
  features: string[]
  seo: SeoContent
  instagram: SocialCaption
  facebook: SocialCaption
  whatsapp: WhatsAppContent
  imageUrl: string | null
  sections: Record<ContentSectionKey, ContentSection>
}

export type Platform = 'instagram' | 'facebook' | 'whatsapp' | 'tiktok' | 'pinterest' | 'linkedin'

export interface SocialAccount {
  platform: Platform
  connected: boolean
  accountName: string
  identifier: string
}

export type PostStatus = 'scheduled' | 'published' | 'failed'

export interface ScheduledPost {
  id: string
  productId: string
  platform: Platform
  date: string // YYYY-MM-DD
  time: string // HH:mm
  title: string
  imageUrl: string | null
  status: PostStatus
  createdAt: string
}

export interface PublishedPost extends ScheduledPost {
  publishedAt: string
}

export interface Subscription {
  plan: 'trial' | 'starter' | 'pro'
  trialStartedAt: string
  trialEndsAt: string
  /** dev-only mock switch: 'normal' | 'ending' | 'expired' */
  mockState: 'normal' | 'ending' | 'expired'
}

export interface Notification {
  id: string
  title: string
  description: string
  createdAt: string
  read: boolean
}

export interface ToastData {
  id: number
  title: string
  description?: string
  variant: 'success' | 'error' | 'info'
}
