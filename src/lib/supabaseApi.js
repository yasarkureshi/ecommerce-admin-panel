import { supabase } from "./supabase";

// ─── PRODUCTS ──────────────────────────────────────────
export const getProducts = async (filters = {}) => {
  let query = supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.featured) query = query.eq("featured", true);
  if (filters.bestseller) query = query.eq("bestseller", true);
  if (filters.occasion) query = query.eq("occasion", filters.occasion);
  if (filters.fragrance_type) query = query.eq("fragrance_type", filters.fragrance_type);
  if (filters.longevity) query = query.eq("longevity", filters.longevity);
  if (filters.search) query = query.ilike("name", `%${filters.search}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const getProduct = async (id) => {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

// Admin: get all products (including inactive)
export const adminGetProducts = async () => {
  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createProduct = async (product) => {
  const { data, error } = await supabase.from("products").insert([{ ...product, updated_at: new Date().toISOString() }]).select().single();
  if (error) throw error;
  return data;
};

export const updateProduct = async (id, updates) => {
  const { data, error } = await supabase.from("products").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

export const deleteProduct = async (id) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
};

// ─── CATEGORIES ────────────────────────────────────────
export const getCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
  if (error) throw error;
  return data || [];
};

export const adminGetCategories = async () => {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data || [];
};

export const createCategory = async (cat) => {
  const { data, error } = await supabase.from("categories").insert([cat]).select().single();
  if (error) throw error;
  return data;
};

export const updateCategory = async (id, updates) => {
  const { data, error } = await supabase.from("categories").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

export const deleteCategory = async (id) => {
  const { error } = await supabase.from("categories").update({ active: false }).eq("id", id);
  if (error) throw error;
};

// ─── ORDERS ────────────────────────────────────────────
export const createOrder = async (orderData) => {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.from("orders").insert([{
    ...orderData,
    user_id: session?.user?.id || null,
    updated_at: new Date().toISOString(),
  }]).select().single();
  if (error) throw error;
  return data;
};

export const getUserOrders = async () => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const getOrder = async (id) => {
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
};

// Admin
export const adminGetOrders = async () => {
  const { data, error } = await supabase.from("orders").select(`*, profiles(name, email, phone)`).order("created_at", { ascending: false });
  console.log(data, error);
  if (error) throw error;
  return data || [];
};
export const adminUpdateOrder = async (id, updates) => {
  const { data, error } = await supabase
    .from("orders")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) throw error;
  return data;
};

// ─── POPUPS ────────────────────────────────────────────
export const getActivePopups = async () => {
  const { data, error } = await supabase.from("popups").select("*").eq("active", true);
  if (error) return [];
  return data || [];
};

export const adminGetPopups = async () => {
  const { data, error } = await supabase.from("popups").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createPopup = async (popup) => {
  const { data, error } = await supabase.from("popups").insert([{ ...popup, updated_at: new Date().toISOString() }]).select().single();
  if (error) throw error;
  return data;
};

export const updatePopup = async (id, updates) => {
  const { data, error } = await supabase.from("popups").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

export const deletePopup = async (id) => {
  const { error } = await supabase.from("popups").delete().eq("id", id);
  if (error) throw error;
};

// ─── OFFERS / COUPONS ──────────────────────────────────
export const getActiveOffers = async () => {
  const { data, error } = await supabase.from("offers").select("*").eq("active", true);
  if (error) return [];
  return data || [];
};

export const adminGetOffers = async () => {
  const { data, error } = await supabase.from("offers").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const createOffer = async (offer) => {
  const { data, error } = await supabase.from("offers").insert([offer]).select().single();
  if (error) throw error;
  return data;
};

export const updateOffer = async (id, updates) => {
  const { data, error } = await supabase.from("offers").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

export const deleteOffer = async (id) => {
  const { error } = await supabase.from("offers").delete().eq("id", id);
  if (error) throw error;
};

export const validateCoupon = async (code, orderTotal) => {
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("active", true)
    .single();
  if (error || !data) throw new Error("Invalid coupon code");
  if (data.expires_at && new Date(data.expires_at) < new Date()) throw new Error("Coupon expired");
  if (data.min_order && orderTotal < data.min_order) throw new Error(`Minimum order ₹${data.min_order} required`);
  if (data.max_uses && data.uses_count >= data.max_uses) throw new Error("Coupon usage limit reached");
  return data;
};

// ─── MESSAGES ──────────────────────────────────────────
export const submitMessage = async (msg) => {
  const { data, error } = await supabase.from("messages").insert([msg]).select().single();
  if (error) throw error;
  return data;
};

export const adminGetMessages = async () => {
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const markMessageRead = async (id) => {
  const { error } = await supabase.from("messages").update({ read: true }).eq("id", id);
  if (error) throw error;
};

// ─── REVIEWS ───────────────────────────────────────────
export const getReviews = async (productId) => {
  let query = supabase.from("reviews").select("*").eq("approved", true).order("created_at", { ascending: false });
  if (productId) query = query.eq("product_id", productId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const submitReview = async (review) => {
  const { data: { session } } = await supabase.auth.getSession();
  const { data, error } = await supabase.from("reviews").insert([{
    ...review,
    user_id: session?.user?.id,
  }]).select().single();
  if (error) throw error;
  return data;
};

export const adminGetReviews = async () => {
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const approveReview = async (id, approved) => {
  const { error } = await supabase.from("reviews").update({ approved }).eq("id", id);
  if (error) throw error;
};

// ─── USERS (Admin) ─────────────────────────────────────
export const adminGetUsers = async () => {
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
};

export const adminUpdateUser = async (id, updates) => {
  const { error } = await supabase.from("profiles").update(updates).eq("id", id);
  if (error) throw error;
};

// ─── ADMIN STATS ───────────────────────────────────────
export const adminGetStats = async () => {
  const [orders, products, users, reviews, messages] = await Promise.all([
    supabase.from("orders").select("id, total, status, created_at, user_name").order("created_at", { ascending: false }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("reviews").select("id, approved", { count: "exact" }),
    supabase.from("messages").select("id, read", { count: "exact" }),
  ]);

  const allOrders = orders.data || [];
  const revenue = allOrders.filter(o => ["confirmed","processing","shipped","delivered"].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0);
  const recentOrders = allOrders.slice(0, 5).map(o => ({ id: o.id, user_name: o.user_name, total: o.total, status: o.status, created_at: o.created_at }));
  const pendingReviews = (reviews.data || []).filter(r => !r.approved).length;
  const unreadMessages = (messages.data || []).filter(m => !m.read).length;

  return {
    revenue,
    orders: allOrders.length,
    customers: users.count || 0,
    products: products.count || 0,
    reviews: (reviews.data || []).length,
    pending_reviews: pendingReviews,
    messages: (messages.data || []).length,
    unread_messages: unreadMessages,
    recent_orders: recentOrders,
  };
};

// ─── BANNERS ───────────────────────────────────────────
export const getBanners = async () => {
  const { data, error } = await supabase.from("banners").select("*").eq("active", true).order("sort_order");
  if (error) return [];
  return data || [];
};

export const adminGetBanners = async () => {
  const { data, error } = await supabase.from("banners").select("*").order("sort_order");
  if (error) throw error;
  return data || [];
};

export const createBanner = async (banner) => {
  const { data, error } = await supabase.from("banners").insert([banner]).select().single();
  if (error) throw error;
  return data;
};

export const updateBanner = async (id, updates) => {
  const { data, error } = await supabase.from("banners").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
};

export const deleteBanner = async (id) => {
  const { error } = await supabase.from("banners").delete().eq("id", id);
  if (error) throw error;
};

// ─── PAGE VIEWS / ANALYTICS ────────────────────────────
export const trackPageView = async (page_path, page_title, product_id) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    let session_id = sessionStorage.getItem("mm_session_id");
    if (!session_id) {
      session_id = Math.random().toString(36).substring(2) + Date.now();
      sessionStorage.setItem("mm_session_id", session_id);
    }
    await supabase.from("page_views").insert([{
      page_path,
      page_title,
      product_id: product_id || null,
      user_id: session?.user?.id || null,
      session_id,
    }]);
  } catch {}
};

export const adminGetAnalytics = async () => {
  const [views, topPages, topProducts] = await Promise.all([
    supabase.from("page_views").select("id, created_at, session_id", { count: "exact" }).order("created_at", { ascending: false }).limit(1000),
    supabase.from("page_views").select("page_path, page_title").order("created_at", { ascending: false }).limit(5000),
    supabase.from("page_views").select("product_id, page_title").not("product_id", "is", null).limit(5000),
  ]);

  const allViews = views.data || [];
  const totalViews = views.count || 0;
  const uniqueSessions = new Set(allViews.map(v => v.session_id)).size;

  // Top pages
  const pageCounts = {};
  (topPages.data || []).forEach(v => {
    const key = v.page_path;
    pageCounts[key] = (pageCounts[key] || 0) + 1;
  });
  const topPagesList = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Top products
  const productCounts = {};
  (topProducts.data || []).forEach(v => {
    if (!v.product_id) return;
    if (!productCounts[v.product_id]) productCounts[v.product_id] = { count: 0, title: v.page_title };
    productCounts[v.product_id].count++;
  });
  const topProductsList = Object.entries(productCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([id, d]) => ({ id, title: d.title, count: d.count }));

  // Daily views (last 14 days)
  const now = new Date();
  const daily = {};
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    daily[key] = 0;
  }
  allViews.forEach(v => {
    const key = v.created_at?.split("T")[0];
    if (key && key in daily) daily[key]++;
  });
  const dailyChart = Object.entries(daily).map(([date, count]) => ({ date, count }));

  return { totalViews, uniqueSessions, topPages: topPagesList, topProducts: topProductsList, dailyChart };
};

// ─── IMAGE UPLOAD ──────────────────────────────────────
export const uploadImage = async (file) => {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const { data, error } = await supabase.storage.from("product-images").upload(fileName, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(data.path);
  return publicUrl;
};
