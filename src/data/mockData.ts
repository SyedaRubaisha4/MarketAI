import type {
  BrandProfile, GeneratedContent, Platform, Product, SocialAccount,
  Subscription, BusinessType, GeneratedContent as GC,
} from '../types'

export const BUSINESS_TYPES: BusinessType[] = [
  'Fashion & Clothing', 'Electronics', 'Home & Furniture', 'Beauty & Cosmetics',
  'Food & Beverages', 'Books & Stationery', 'Toys & Games', 'Jewelry & Accessories',
  'Sports & Fitness', 'Health & Wellness', 'Pet Supplies', 'Baby Products',
  'Automotive', 'Tools & Hardware', 'Art & Crafts', 'Music & Instruments',
  'Office Supplies', 'Garden & Outdoor', 'Kitchen & Dining', 'Phones & Tablets',
  'Computers & Laptops', 'Shoes & Footwear', 'Bags & Luggage', 'Watches',
  'Eyewear', 'Other',
]

export const PRODUCT_CATEGORIES = [
  'Electronics', 'Fashion', 'Beauty', 'Home & Kitchen', 'Food & Beverages',
  'Sports & Fitness', 'Toys & Games', 'Health & Wellness', 'Accessories', 'Other',
]

export const TONES = ['Friendly', 'Professional', 'Luxury', 'Fun', 'Bold', 'Minimalist']

export const PLATFORM_META: Record<Platform, { name: string; color: string; bg: string; handlePrefix: string }> = {
  instagram: { name: 'Instagram', color: 'text-pink-600', bg: 'bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600', handlePrefix: '@' },
  facebook: { name: 'Facebook', color: 'text-blue-600', bg: 'bg-blue-600', handlePrefix: '' },
  whatsapp: { name: 'WhatsApp Business', color: 'text-green-600', bg: 'bg-green-500', handlePrefix: '' },
  tiktok: { name: 'TikTok', color: 'text-slate-900', bg: 'bg-slate-900', handlePrefix: '@' },
  pinterest: { name: 'Pinterest', color: 'text-red-600', bg: 'bg-red-600', handlePrefix: '' },
  linkedin: { name: 'LinkedIn', color: 'text-sky-700', bg: 'bg-sky-700', handlePrefix: '' },
}

export const PLATFORMS = Object.keys(PLATFORM_META) as Platform[]

export const DEFAULT_BRAND: BrandProfile = {
  businessName: 'Khan Electronics',
  businessType: 'Electronics',
  description: 'We sell quality electronics at affordable prices for Pakistani families.',
  tones: ['Friendly', 'Professional'],
  targetCustomers: 'Middle-class families, 25–45 years old.',
  language: 'English + Urdu',
  wordsToAvoid: ['cheap', 'fake', 'broken'],
  keywords: ['reliable', 'affordable', 'quality', 'trusted'],
  completed: false,
}

const day = 86400000
const now = Date.now()
const iso = (t: number) => new Date(t).toISOString()
const dateStr = (t: number) => new Date(t).toISOString().slice(0, 10)

export function seedProducts(): Product[] {
  return [
    {
      id: 'p-earbuds', name: 'Wireless Earbuds Pro', category: 'Electronics', price: 2499, currency: 'Rs',
      details: [
        { key: 'Color', value: 'Black' }, { key: 'Battery', value: '30 hours' },
        { key: 'Bluetooth', value: '5.3' }, { key: 'Waterproof', value: 'IPX5' },
      ],
      images: [{ id: 'img-e1', url: 'https://source.unsplash.com/800x800/?earbuds,electronics', isPrimary: true }],
      status: 'published', createdAt: iso(now - 9 * day), updatedAt: iso(now - 2 * day),
    },
    {
      id: 'p-bulb', name: 'Smart LED Bulb', category: 'Electronics', price: 899, currency: 'Rs',
      details: [
        { key: 'Wattage', value: '9W' }, { key: 'Brightness', value: '806 lm' },
        { key: 'Control', value: 'App + Voice' }, { key: 'Lifespan', value: '25,000 hours' },
      ],
      images: [{ id: 'img-b1', url: 'https://source.unsplash.com/800x800/?led,bulb', isPrimary: true }],
      status: 'scheduled', createdAt: iso(now - 8 * day), updatedAt: iso(now - 3 * day),
    },
    {
      id: 'p-cable', name: 'USB-C Cable 2m', category: 'Electronics', price: 499, currency: 'Rs',
      details: [
        { key: 'Length', value: '2 meters' }, { key: 'Material', value: 'Nylon braided' },
        { key: 'Charging', value: '60W fast charge' }, { key: 'Data', value: '480 Mbps' },
      ],
      images: [{ id: 'img-c1', url: 'https://source.unsplash.com/800x800/?usb,cable', isPrimary: true }],
      status: 'needs_review', createdAt: iso(now - 6 * day), updatedAt: iso(now - 1 * day),
    },
    {
      id: 'p-tshirt', name: 'Classic Cotton T-Shirt', category: 'Fashion', price: 1199, currency: 'Rs',
      details: [
        { key: 'Material', value: '100% combed cotton' }, { key: 'Fit', value: 'Regular' },
        { key: 'Sizes', value: 'S – XXL' }, { key: 'GSM', value: '180' },
      ],
      images: [{ id: 'img-t1', url: 'https://source.unsplash.com/800x800/?tshirt,fashion', isPrimary: true }],
      status: 'content_ready', createdAt: iso(now - 5 * day), updatedAt: iso(now - 4 * day),
    },
    {
      id: 'p-mug', name: 'Ceramic Coffee Mug', category: 'Home & Kitchen', price: 749, currency: 'Rs',
      details: [
        { key: 'Capacity', value: '350 ml' }, { key: 'Material', value: 'Stoneware ceramic' },
        { key: 'Dishwasher safe', value: 'Yes' }, { key: 'Colors', value: 'Cream, White' },
      ],
      images: [{ id: 'img-m1', url: 'https://source.unsplash.com/800x800/?coffee,mug', isPrimary: true }],
      status: 'draft', createdAt: iso(now - 4 * day), updatedAt: iso(now - 4 * day),
    },
    {
      id: 'p-earbuds2', name: 'Sport Neckband Earphones', category: 'Electronics', price: 1599, currency: 'Rs',
      details: [
        { key: 'Battery', value: '20 hours' }, { key: 'Bluetooth', value: '5.0' },
        { key: 'Waterproof', value: 'IPX4' },
      ],
      images: [{ id: 'img-n1', url: 'https://source.unsplash.com/800x800/?earphones', isPrimary: true }],
      status: 'approved', createdAt: iso(now - 3 * day), updatedAt: iso(now - 2 * day),
    },
    {
      id: 'p-bulb2', name: 'RGB Ambient Light Strip', category: 'Electronics', price: 1799, currency: 'Rs',
      details: [
        { key: 'Length', value: '5 meters' }, { key: 'Modes', value: '16 colors + music sync' },
      ],
      images: [{ id: 'img-l1', url: 'https://source.unsplash.com/800x800/?led,strip', isPrimary: true }],
      status: 'draft', createdAt: iso(now - 2 * day), updatedAt: iso(now - 2 * day),
    },
    {
      id: 'p-cable2', name: 'Braided Lightning Cable', category: 'Phones & Tablets', price: 699, currency: 'Rs',
      details: [{ key: 'Length', value: '1.5 meters' }, { key: 'Certified', value: 'MFi' }],
      images: [{ id: 'img-cl1', url: 'https://source.unsplash.com/800x800/?lightning,cable', isPrimary: true }],
      status: 'published', createdAt: iso(now - 12 * day), updatedAt: iso(now - 7 * day),
    },
  ]
}

export function buildMockContent(product: Product, brand: BrandProfile | null, variant = 0): GeneratedContent {
  const safeBrand = brand || {} as BrandProfile;
  
  const tone = safeBrand.tones ? safeBrand.tones.join(', ') : 'Friendly';
  const kw = safeBrand.keywords ? safeBrand.keywords : ['quality', 'trusted'];
  const business = safeBrand.businessName || 'our store';
  const targetCustomers = safeBrand.targetCustomers || 'everyone';
  const brandKeywords = safeBrand.keywords || ['quality', 'trusted'];

  const productDetails = (product.details || []).map(d => ({
    key: d.key || '',
    value: d.value || ''
  }));
  
  const v = variant % 2;

  const categoryKeyword = product.category ? product.category.toLowerCase().replace(/\s+/g, ',') : 'product';
  const productKeyword = product.name ? product.name.toLowerCase().replace(/\s+/g, ',') : 'item';
const uploadedImageUrl = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || null;
const nameIdeas = v === 0
    ? [`${product.name} — ${kw[0] ?? 'Pro'} Edition`, `${product.name} | Best at ${business}`, `${product.name} (Top Rated)`]
    : [`${product.name} — Customer Favorite`, `Premium ${product.name}`, `${product.name} • ${kw[1] ?? 'New'} Pick`];

  const shortDescription = v === 0
    ? `Meet the ${product.name}.`
    : `The ${product.name} delivers everyday value.`;

  const fullDescription = v === 0
    ? `The ${product.name} is designed for people who want dependable quality.`
    : `Looking for a product that simply works? The ${product.name} is great.`;

  const features = productDetails.map((d) => `${d.key}: ${d.value}`);

  return {
    productId: product.id,
    generatedAt: new Date().toISOString(),
    names: nameIdeas,
    selectedName: nameIdeas[0],
    shortDescription,
    fullDescription,
    features,
    seo: {
      title: `${product.name} — Buy Online at ${business} | ${product.currency} ${product.price.toLocaleString()}`.slice(0, 70),
      metaDescription: `Shop ${product.name} at ${product.currency} ${product.price.toLocaleString()}. ${kw.slice(0, 3).join(', ')} — order online from ${business} with fast delivery.`.slice(0, 160),
      keywords: [
        (product.name || '').toLowerCase(), 
        (product.category || 'general').toLowerCase(), 
        'buy online', 
        ...brandKeywords
      ].slice(0, 10),
    },
    instagram: {
      caption: v === 0
        ? `New arrival alert  The ${product.name} is here — only ${product.currency} ${product.price.toLocaleString()}! ${kw.slice(0, 2).map((k) => k[0].toUpperCase() + k.slice(1)).join(' and ')} quality you can trust from ${business}. Tap the link in bio to order today!`
        : `You asked, we delivered  ${product.name} restocked at ${business}. Perfect for ${targetCustomers}. DM us to order — ${product.currency} ${product.price.toLocaleString()} only!`,
      hashtags: ['#ShopNow', `#${(product.category || 'general').replace(/\s/g, '')}`, '#OnlineShopping', '#PakistanFashion', '#Deals', '#NewArrival'].slice(0, 6),
    },
    facebook: {
      caption: v === 0
        ? ` NOW AVAILABLE: ${product.name}\n\nPrice: ${product.currency} ${product.price.toLocaleString()}\n\n${features.join('\n')}\n\nWhy buy from ${business}? ${kw.slice(0, 3).map((k) => k[0].toUpperCase() + k.slice(1)).join(', ')} — every single time.\n\n Cash on delivery available nationwide\n Message us to place your order!`
        : ` ${product.name} — back in stock!\n\n${shortDescription}\n\nOrder now: ${product.currency} ${product.price.toLocaleString()}\nInbox us or call to order. Limited stock!`,
      hashtags: ['#SmallBusiness', '#ShopLocal', '#Ecommerce'],
    },
    whatsapp: {
      message: `*${product.name}*\n_${business}_\n\nPrice: *${product.currency} ${product.price.toLocaleString()}*\n\n${features.join('\n')}\n\nReply *ORDER* to book yours. Cash on delivery available!`,
    },
imageUrl: uploadedImageUrl,
    sections: {
      product_name: { key: 'product_name', approved: false },
      short_description: { key: 'short_description', approved: false },
      full_description: { key: 'full_description', approved: false },
      seo: { key: 'seo', approved: false },
      instagram: { key: 'instagram', approved: false },
      facebook: { key: 'facebook', approved: false },
      whatsapp: { key: 'whatsapp', approved: false },
      image: { key: 'image', approved: false },
    },
  };
}

export function seedSocialAccounts(): SocialAccount[] {
  return [
    { platform: 'instagram', connected: true, accountName: '@khan_electronics', identifier: '@khan_electronics' },
    { platform: 'facebook', connected: true, accountName: 'Khan Electronics', identifier: 'Khan Electronics' },
    { platform: 'whatsapp', connected: true, accountName: '+92 300 1234567', identifier: '+92 300 1234567' },
    { platform: 'tiktok', connected: false, accountName: '', identifier: '' },
    { platform: 'pinterest', connected: false, accountName: '', identifier: '' },
    { platform: 'linkedin', connected: false, accountName: '', identifier: '' },
  ]
}

export function seedSubscription(): Subscription {
  return {
    plan: 'trial',
    trialStartedAt: iso(now - 9 * day),
    trialEndsAt: iso(now + 5 * day),
    mockState: 'normal',
  }
}

export const TRIAL_DAYS = 14

export function seedScheduledPosts(): import('../types').ScheduledPost[] {
  return [
    { id: 'sp-1', productId: 'p-bulb', platform: 'instagram', date: dateStr(now + day), time: '18:30', title: 'Smart LED Bulb — Launch Post', imageUrl: 'https://source.unsplash.com/800x800/?led,bulb', status: 'scheduled', createdAt: iso(now - 2 * day) },
    { id: 'sp-2', productId: 'p-bulb', platform: 'facebook', date: dateStr(now + day), time: '19:00', title: 'Smart LED Bulb — Promo', imageUrl: 'https://source.unsplash.com/800x800/?led,bulb', status: 'scheduled', createdAt: iso(now - 2 * day) },
    { id: 'sp-3', productId: 'p-tshirt', platform: 'whatsapp', date: dateStr(now + 2 * day), time: '12:00', title: 'Classic Cotton T-Shirt — Broadcast', imageUrl: 'https://source.unsplash.com/800x800/?tshirt,fashion', status: 'scheduled', createdAt: iso(now - day) },
    { id: 'sp-4', productId: 'p-earbuds', platform: 'instagram', date: dateStr(now - 3 * day), time: '17:00', title: 'Wireless Earbuds Pro — Restock', imageUrl: 'https://source.unsplash.com/800x800/?earbuds,electronics', status: 'published', createdAt: iso(now - 6 * day) },
    { id: 'sp-5', productId: 'p-cable', platform: 'facebook', date: dateStr(now + 4 * day), time: '20:00', title: 'USB-C Cable 2m — Weekend Deal', imageUrl: 'https://source.unsplash.com/800x800/?usb,cable', status: 'scheduled', createdAt: iso(now - day) },
    { id: 'sp-6', productId: 'p-cable2', platform: 'instagram', date: dateStr(now - 7 * day), time: '16:00', title: 'Braided Lightning Cable — In Stock', imageUrl: 'https://source.unsplash.com/800x800/?lightning,cable', status: 'published', createdAt: iso(now - 10 * day) },
  ]
}

export type { GC }