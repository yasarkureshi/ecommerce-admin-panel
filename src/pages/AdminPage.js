import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Package, MessageSquare, Mail, Trash2, ShoppingCart, Users, BarChart3,
  Eye, EyeOff, Upload, Check, X, Bell, Percent, RefreshCw,
  Edit2, Truck, TrendingUp, Clock, Grid, Image, ChevronRight,
  Download, Search, FileText, Activity, Home, LogOut, Star,
  ArrowUp, ArrowDown, ExternalLink, Settings,
} from "lucide-react";
import {
  adminGetStats, adminGetProducts, createProduct, updateProduct, deleteProduct,
  adminGetCategories, createCategory, updateCategory, deleteCategory,
  adminGetOrders, adminUpdateOrder,
  adminGetPopups, createPopup, updatePopup, deletePopup,
  adminGetOffers, createOffer, updateOffer, deleteOffer,
  adminGetMessages, markMessageRead,
  adminGetReviews, approveReview,
  adminGetUsers, adminUpdateUser,
  adminGetBanners, createBanner, updateBanner, deleteBanner,
  adminGetAnalytics,
  uploadImage,
} from "@/lib/supabaseApi";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ─── CSV Export Utility ────────────────────────────────
function exportCSV(data, filename) {
  if (!data || !data.length) { toast.error("No data to export"); return; }
  const keys = Object.keys(data[0]);
  const header = keys.join(",");
  const rows = data.map(row =>
    keys.map(k => {
      const val = row[k] ?? "";
      const str = typeof val === "object" ? JSON.stringify(val) : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename + ".csv"; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${data.length} rows`);
}

// ─── Date Filter Utility ───────────────────────────────
function filterByDate(items, field, from, to) {
  return items.filter(item => {
    const d = new Date(item[field]);
    if (from && d < new Date(from)) return false;
    if (to && d > new Date(to + "T23:59:59")) return false;
    return true;
  });
}

// ─── Stat Card ─────────────────────────────────────────
function StatCard({ label, value, icon: Icon, gradient, trend }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${gradient}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      {trend && (
        <span className={`text-xs font-semibold flex items-center gap-0.5 ${trend > 0 ? "text-emerald-600" : "text-red-500"}`}>
          {trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  );
}

const statusColors = {
  pending:    "bg-yellow-100 text-yellow-800",
  confirmed:  "bg-blue-100 text-blue-800",
  processing: "bg-indigo-100 text-indigo-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-emerald-100 text-emerald-800",
  cancelled:  "bg-red-100 text-red-800",
};

// ─── DASHBOARD TAB ─────────────────────────────────────
function DashboardTab() {
  const [stats, setStats] = useState(null);
  useEffect(() => { adminGetStats().then(setStats).catch(() => {}); }, []);
  if (!stats) return <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Revenue" value={`₹${stats.revenue?.toLocaleString("en-IN") || 0}`} icon={TrendingUp} gradient="bg-gradient-to-br from-brand-accent to-brand-primary" />
        <StatCard label="Total Orders" value={stats.orders} icon={ShoppingCart} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
        <StatCard label="Customers" value={stats.customers} icon={Users} gradient="bg-gradient-to-br from-emerald-500 to-teal-600" />
        <StatCard label="Products" value={stats.products} icon={Package} gradient="bg-gradient-to-br from-orange-500 to-amber-600" />
        <StatCard label="Reviews" value={stats.reviews} icon={Star} gradient="bg-gradient-to-br from-pink-500 to-rose-600" />
        <StatCard label="Pending Reviews" value={stats.pending_reviews} icon={Clock} gradient="bg-gradient-to-br from-yellow-500 to-orange-500" />
        <StatCard label="Messages" value={stats.messages} icon={Mail} gradient="bg-gradient-to-br from-teal-500 to-cyan-600" />
        <StatCard label="Unread Msgs" value={stats.unread_messages} icon={Bell} gradient="bg-gradient-to-br from-red-500 to-pink-600" />
      </div>
      {stats.recent_orders?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left">Order ID</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats.recent_orders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-gray-500">#{o.id?.slice(0,8).toUpperCase()}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{o.user_name}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">₹{o.total?.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[o.status]}`}>{o.status}</span></td>
                    <td className="px-5 py-3 text-gray-500">{new Date(o.created_at).toLocaleDateString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ANALYTICS TAB ─────────────────────────────────────
function AnalyticsTab() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    adminGetAnalytics().then(setAnalytics).catch(() => {}).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;
  if (!analytics) return <p className="text-gray-500 text-sm">No analytics data yet. Analytics will appear after users visit the site.</p>;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Total Page Views" value={analytics.totalViews?.toLocaleString()} icon={Activity} gradient="bg-gradient-to-br from-brand-accent to-brand-primary" />
        <StatCard label="Unique Sessions" value={analytics.uniqueSessions?.toLocaleString()} icon={Users} gradient="bg-gradient-to-br from-blue-500 to-cyan-600" />
      </div>
      {analytics.dailyChart?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Page Views – Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analytics.dailyChart} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => [v, "Views"]} labelFormatter={l => `Date: ${l}`} />
              <Bar dataKey="count" fill="#9A6B46" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-accent" />
            <h3 className="font-semibold text-gray-800">Top Pages</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(analytics.topPages || []).map((p, i) => (
              <div key={p.path} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs w-5 h-5 rounded-full bg-amber-50 text-brand-accent flex items-center justify-center font-bold">{i+1}</span>
                  <span className="text-sm text-gray-700 font-mono">{p.path}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{p.count}</span>
              </div>
            ))}
            {!analytics.topPages?.length && <p className="px-5 py-4 text-sm text-gray-400">No data yet</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <Package className="w-4 h-4 text-orange-600" />
            <h3 className="font-semibold text-gray-800">Most Visited Products</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {(analytics.topProducts || []).map((p, i) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold">{i+1}</span>
                  <span className="text-sm text-gray-700">{p.title || "Product"}</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">{p.count} views</span>
              </div>
            ))}
            {!analytics.topProducts?.length && <p className="px-5 py-4 text-sm text-gray-400">No product views yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BANNERS TAB ───────────────────────────────────────
function BannersTab() {
  const [banners, setBanners] = useState([]);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const emptyForm = { title: "", subtitle: "", image: "", link: "/shop", button_text: "Shop Now", active: true, sort_order: 0 };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => { adminGetBanners().then(setBanners).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setForm(f => ({...f, image: url})); toast.success("Uploaded!"); }
    catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateBanner(editing, form); toast.success("Banner updated!"); }
      else { await createBanner(form); toast.success("Banner added!"); }
      setForm(emptyForm); setEditing(null); load();
    } catch(err) { toast.error(err.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete banner?")) return;
    try { await deleteBanner(id); toast.success("Deleted"); load(); } catch { toast.error("Failed"); }
  };

  const toggleActive = async (id, current) => {
    try { await updateBanner(id, { active: !current }); load(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit Banner" : "Add Banner"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input placeholder="Banner Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required className="rounded-lg border-gray-200" />
          <Input placeholder="Subtitle (optional)" value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})} className="rounded-lg border-gray-200" />
          <div className="space-y-2">
            <Input placeholder="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} className="rounded-lg border-gray-200" />
            <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-accent text-sm text-gray-500">
              <Upload className="w-4 h-4" />{uploading ? "Uploading..." : "Or Upload Image"}
              <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
            </label>
            {form.image && <img src={form.image} alt="" className="h-24 rounded-lg object-cover border" />}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Link (e.g. /shop)" value={form.link} onChange={e=>setForm({...form,link:e.target.value})} className="rounded-lg border-gray-200" />
            <Input placeholder="Button Text" value={form.button_text} onChange={e=>setForm({...form,button_text:e.target.value})} className="rounded-lg border-gray-200" />
            <Input type="number" placeholder="Sort Order" value={form.sort_order} onChange={e=>setForm({...form,sort_order:parseInt(e.target.value)||0})} className="rounded-lg border-gray-200" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Active (visible on homepage)
          </label>
          <div className="flex gap-3">
            <Button type="submit" className="bg-brand-accent hover:bg-brand-primary text-white rounded-lg">{editing ? "Update Banner" : "Add Banner"}</Button>
            {editing && <Button type="button" variant="outline" onClick={()=>{setEditing(null);setForm(emptyForm);}} className="rounded-lg">Cancel</Button>}
          </div>
        </form>
      </div>
      <div className="space-y-3">
        {banners.map(b => (
          <div key={b.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 p-4">
            {b.image && <img src={b.image} alt={b.title} className="w-20 h-12 object-cover rounded-lg border shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800">{b.title}</p>
              {b.subtitle && <p className="text-xs text-gray-500">{b.subtitle}</p>}
              <p className="text-xs text-gray-400">{b.link} · Sort: {b.sort_order}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggleActive(b.id, b.active)} className={`px-3 py-1 rounded-full text-xs font-semibold ${b.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {b.active ? "Active" : "Hidden"}
              </button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(b.id); setForm({title:b.title,subtitle:b.subtitle||"",image:b.image,link:b.link||"/shop",button_text:b.button_text||"Shop Now",active:b.active,sort_order:b.sort_order||0}); }} className="rounded-lg text-xs"><Edit2 className="w-3 h-3" /></Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(b.id)} className="rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No banners yet. Add one above!</p>}
      </div>
    </div>
  );
}

// ─── PRODUCTS TAB ──────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [uploading, setUploading] = useState(false);
  const emptyForm = { name:"",description:"",short_description:"",price:"",original_price:"",category:"perfume",occasion:"everyday",fragrance_type:"woody",longevity:"long-lasting",size:"50ml",image:"",bestseller:false,featured:false,active:true,notes_top:"",notes_middle:"",notes_base:"",stock:"100",sizes:[] };
  const [form, setForm] = useState(emptyForm);
  const [newSizeLabel, setNewSizeLabel] = useState("");
  const [newSizePrice, setNewSizePrice] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetProducts().then(setProducts).catch(() => toast.error("Failed")).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase()));

  const handleEdit = (p) => {
    setEditing(p.id);
    setForm({ name:p.name,description:p.description||"",short_description:p.short_description||"",price:String(p.price),original_price:p.original_price?String(p.original_price):"",category:p.category,occasion:p.occasion,fragrance_type:p.fragrance_type,longevity:p.longevity,size:p.size||"50ml",image:p.image||"",bestseller:!!p.bestseller,featured:!!p.featured,active:p.active!==false,notes_top:p.notes_top||"",notes_middle:p.notes_middle||"",notes_base:p.notes_base||"",stock:String(p.stock||100),sizes:p.sizes||[] });
    setNewSizeLabel(""); setNewSizePrice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const addSize = () => {
    if (!newSizeLabel.trim() || !newSizePrice) return;
    const price = parseFloat(newSizePrice);
    if (isNaN(price)) return;
    setForm(f => ({ ...f, sizes: [...f.sizes, { label: newSizeLabel.trim(), price }] }));
    setNewSizeLabel(""); setNewSizePrice("");
  };

  const removeSize = (idx) => {
    setForm(f => ({ ...f, sizes: f.sizes.filter((_, i) => i !== idx) }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setForm(prev => ({...prev, image: url})); toast.success("Uploaded!"); }
    catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), original_price: form.original_price ? parseFloat(form.original_price) : null, stock: parseInt(form.stock) || 100, sizes: form.sizes };
    try {
      if (editing) { await updateProduct(editing, payload); toast.success("Updated!"); }
      else { await createProduct(payload); toast.success("Added!"); }
      setForm(emptyForm); setEditing(null); setNewSizeLabel(""); setNewSizePrice(""); load();
    } catch(err) { toast.error(err.message || "Failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product? This cannot be undone.")) return;
    try { await deleteProduct(id); toast.success("Product deleted"); load(); } catch(err) { toast.error(err.message || "Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit Product" : "Add New Product"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Product Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required className="rounded-lg border-gray-200" />
            <div className="space-y-2">
              <Input placeholder="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} className="rounded-lg border-gray-200" />
              <label className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-accent text-xs text-gray-500">
                <Upload className="w-3 h-3" />{uploading ? "Uploading..." : "Upload Image"}
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
              {form.image && <img src={form.image} alt="" className="w-12 h-12 object-cover rounded-lg border" />}
            </div>
          </div>
          <Input placeholder="Short Description" value={form.short_description} onChange={e=>setForm({...form,short_description:e.target.value})} className="rounded-lg border-gray-200" />
          <Textarea placeholder="Full Description *" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} required className="rounded-lg border-gray-200 min-h-[60px]" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Input placeholder="Price (₹) *" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} required className="rounded-lg border-gray-200" />
            <Input placeholder="MRP (₹)" type="number" value={form.original_price} onChange={e=>setForm({...form,original_price:e.target.value})} className="rounded-lg border-gray-200" />
            <Input placeholder="Size (e.g. 50ml)" value={form.size} onChange={e=>setForm({...form,size:e.target.value})} className="rounded-lg border-gray-200" />
            <Input placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} className="rounded-lg border-gray-200" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="h-9 px-3 border border-gray-200 bg-white text-sm rounded-lg">
              <option value="perfume">Perfume</option><option value="attar">Attar</option>
            </select>
            <select value={form.occasion} onChange={e=>setForm({...form,occasion:e.target.value})} className="h-9 px-3 border border-gray-200 bg-white text-sm rounded-lg">
              <option value="everyday">Everyday</option><option value="evening">Evening</option><option value="special">Special</option>
            </select>
            <select value={form.fragrance_type} onChange={e=>setForm({...form,fragrance_type:e.target.value})} className="h-9 px-3 border border-gray-200 bg-white text-sm rounded-lg">
              <option value="woody">Woody</option><option value="floral">Floral</option><option value="oriental">Oriental</option><option value="fresh">Fresh</option><option value="earthy">Earthy</option>
            </select>
            <select value={form.longevity} onChange={e=>setForm({...form,longevity:e.target.value})} className="h-9 px-3 border border-gray-200 bg-white text-sm rounded-lg">
              <option value="long-lasting">Long-Lasting</option><option value="moderate">Moderate</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input placeholder="Top Notes" value={form.notes_top} onChange={e=>setForm({...form,notes_top:e.target.value})} className="rounded-lg border-gray-200" />
            <Input placeholder="Heart Notes" value={form.notes_middle} onChange={e=>setForm({...form,notes_middle:e.target.value})} className="rounded-lg border-gray-200" />
            <Input placeholder="Base Notes" value={form.notes_base} onChange={e=>setForm({...form,notes_base:e.target.value})} className="rounded-lg border-gray-200" />
          </div>

          {/* Sizes */}
          <div className="border border-gray-200 rounded-lg p-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Sizes / Variants <span className="text-xs text-gray-400 font-normal">(optional — if product has multiple sizes)</span></p>
            {form.sizes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.sizes.map((s, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-sm text-gray-700">
                    {s.label} — ₹{s.price}
                    <button type="button" onClick={() => removeSize(i)} className="text-red-400 hover:text-red-600 ml-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input placeholder="Label (e.g. 30ml)" value={newSizeLabel} onChange={e=>setNewSizeLabel(e.target.value)} className="rounded-lg border-gray-200 text-sm h-8" />
              <Input placeholder="Price (₹)" type="number" value={newSizePrice} onChange={e=>setNewSizePrice(e.target.value)} className="rounded-lg border-gray-200 text-sm h-8 w-28" />
              <Button type="button" size="sm" variant="outline" onClick={addSize} className="rounded-lg h-8 text-xs shrink-0">+ Add</Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-5 text-sm text-gray-600">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.bestseller} onChange={e=>setForm({...form,bestseller:e.target.checked})} /> Bestseller</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e=>setForm({...form,featured:e.target.checked})} /> Featured</label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Active</label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="text-white rounded-lg" style={{ backgroundColor: "#9A6B46" }} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#7d5337"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="#9A6B46"} data-dummy="">{editing ? "Update Product" : "Add Product"}</Button>
            {editing && <Button type="button" variant="outline" onClick={() => { setForm(emptyForm); setEditing(null); }} className="rounded-lg">Cancel</Button>}
          </div>
        </form>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search products..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 rounded-lg border-gray-200" />
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.map(p => ({Name:p.name,Price:p.price,MRP:p.original_price||"",Category:p.category,Stock:p.stock,Active:p.active?"Yes":"No",Bestseller:p.bestseller?"Yes":"No"})), "products")} className="rounded-lg gap-2">
          <Download className="w-4 h-4" />CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={load} className="rounded-lg"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      {loading ? <p className="text-sm text-gray-400">Loading...</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-left">Price</th><th className="px-4 py-3 text-left">Stock</th><th className="px-4 py-3 text-left">Tags</th><th className="px-4 py-3 text-left">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg border shrink-0" />}
                      <div>
                        <p className="font-medium text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-800">₹{p.price?.toLocaleString("en-IN")}</p>
                    {p.original_price && <p className="text-xs text-gray-400 line-through">₹{p.original_price}</p>}
                    {p.sizes?.length > 0 && <p className="text-xs text-brand-accent">{p.sizes.length} sizes</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.stock ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {p.bestseller && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">Bestseller</span>}
                      {p.featured && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Featured</span>}
                      {!p.active && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Inactive</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(p)} className="rounded-lg text-xs"><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(p.id)} className="rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No products found</p>}
        </div>
      )}
    </div>
  );
}

// ─── CATEGORIES TAB ────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", slug:"", description:"", active:true, sort_order:0 });

  const load = useCallback(() => { adminGetCategories().then(setCategories).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updateCategory(editing, form); toast.success("Updated!"); }
      else { await createCategory(form); toast.success("Added!"); }
      setForm({ name:"", slug:"", description:"", active:true, sort_order:0 }); setEditing(null); load();
    } catch(err) { toast.error(err.message || "Failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit Category" : "Add Category"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Category Name *" value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:editing?form.slug:e.target.value.toLowerCase().replace(/\s+/g,"-")})} required className="rounded-lg border-gray-200" />
            <Input placeholder="Slug (e.g. attar)" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} required className="rounded-lg border-gray-200" />
          </div>
          <Textarea placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="rounded-lg border-gray-200 min-h-[50px]" />
          <div className="flex items-center gap-4">
            <Input type="number" placeholder="Sort Order" value={form.sort_order} onChange={e=>setForm({...form,sort_order:parseInt(e.target.value)||0})} className="rounded-lg border-gray-200 w-32" />
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Active</label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="text-white rounded-lg" style={{ backgroundColor: "#9A6B46" }} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#7d5337"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="#9A6B46"} data-dummy="">{editing ? "Update" : "Add Category"}</Button>
            {editing && <Button type="button" variant="outline" onClick={()=>{setEditing(null);setForm({name:"",slug:"",description:"",active:true,sort_order:0});}} className="rounded-lg">Cancel</Button>}
          </div>
        </form>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-50">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400">/{c.slug} · Sort: {c.sort_order}</p>
              </div>
              <div className="flex items-center gap-2">
                {!c.active && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Inactive</span>}
                <Button size="sm" variant="outline" onClick={() => { setEditing(c.id); setForm({ name:c.name, slug:c.slug, description:c.description||"", active:c.active, sort_order:c.sort_order||0 }); }} className="rounded-lg text-xs"><Edit2 className="w-3 h-3 mr-1" />Edit</Button>
                <Button size="sm" variant="ghost" onClick={async () => { if(!window.confirm("Delete?")) return; try { await deleteCategory(c.id); toast.success("Deleted"); load(); } catch { toast.error("Failed"); } }} className="rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── INVOICE ───────────────────────────────────────────
function InvoiceModal({ order, onClose }) {
  const printRef = useRef();
  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Invoice #${order.id?.slice(0,8).toUpperCase()}</title>
      <style>body{font-family:Arial,sans-serif;padding:30px;color:#111}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.total{font-weight:bold;font-size:18px}</style>
      </head><body>${content}<script>window.print();window.close();</script></body></html>`);
    w.document.close();
  };

  const addr = order.shipping_address || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2"><FileText className="w-5 h-5 text-brand-accent" />Invoice</h3>
          <div className="flex gap-2">
            <Button onClick={handlePrint} size="sm" className="text-white rounded-lg" style={{ backgroundColor: "#9A6B46" }} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#7d5337"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="#9A6B46"} data-dummy=" gap-2"><Download className="w-4 h-4" />Print / Download</Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-lg"><X className="w-4 h-4" /></Button>
          </div>
        </div>
        <div ref={printRef} className="p-6 space-y-6">
          <div className="flex justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">M M Attarwala</h2>
              <p className="text-sm text-gray-500">Premium Fragrances</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">INVOICE</p>
              <p className="text-sm text-gray-500">#{order.id?.slice(0,8).toUpperCase()}</p>
              <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
            </div>
          </div>
          {addr.name && (
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Bill To</p>
              <p className="font-medium text-gray-800">{addr.name}</p>
              <p className="text-sm text-gray-500">{addr.phone}</p>
              <p className="text-sm text-gray-500">{addr.address_line}, {addr.city}, {addr.state} – {addr.pincode}</p>
            </div>
          )}
          <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs text-gray-500 uppercase">Item</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Qty</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Price</th>
                <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.name}{item.size ? <span className="ml-1 text-xs text-brand-accent">({item.size})</span> : ""}</td>
                  <td className="px-4 py-3 text-right text-gray-600">{item.quantity}</td>
                  <td className="px-4 py-3 text-right text-gray-600">₹{item.price?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">₹{(item.price * item.quantity)?.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr><td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">Subtotal</td><td className="px-4 py-2 text-right text-sm text-gray-700">₹{order.subtotal?.toLocaleString("en-IN")}</td></tr>
              <tr><td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-500">Shipping</td><td className="px-4 py-2 text-right text-sm text-gray-700">{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</td></tr>
              <tr><td colSpan={3} className="px-4 py-2 text-right font-bold text-gray-800">Total</td><td className="px-4 py-2 text-right font-bold text-lg text-brand-accent">₹{order.total?.toLocaleString("en-IN")}</td></tr>
            </tfoot>
          </table>
          <div className="flex justify-between text-sm text-gray-500">
            <div>
              <p className="font-medium text-gray-700">Payment Method</p>
              <p>{order.payment_method?.toUpperCase() || "COD"}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-700">Status</p>
              <p className="capitalize">{order.status}</p>
            </div>
          </div>
          <p className="text-center text-xs text-gray-400 pt-4 border-t border-gray-100">Thank you for shopping with M M Attarwala!</p>
        </div>
      </div>
    </div>
  );
}

// ─── ORDER ROW ─────────────────────────────────────────
function OrderRow({ order, expanded, onToggle, onStatusChange, onTrackingUpdate, updating, onInvoice }) {
  const [trackNum, setTrackNum] = useState(order.tracking_number || "");
  const [trackUrl, setTrackUrl] = useState(order.tracking_url || "");
  const [estDel, setEstDel] = useState(order.estimated_delivery || "");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={onToggle}>
        <span className="font-mono text-xs text-gray-400 w-24">#{order.id?.slice(0,8).toUpperCase()}</span>
        <span className="font-medium text-gray-800 flex-1 min-w-[120px]">{order.user_name || order.user_email}</span>
        <span className="font-semibold text-gray-800">₹{order.total?.toLocaleString("en-IN")}</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || ""}`}>{order.status}</span>
        <span className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString("en-IN")}</span>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/50">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Items</p>
            {(order.items || []).map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border" />}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.name}{item.size ? <span className="ml-1 text-xs text-brand-accent">({item.size})</span> : ""}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
          {order.shipping_address && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Shipping To</p>
              <p className="text-sm font-medium text-gray-800">{order.shipping_address.name} · {order.shipping_address.phone}</p>
              <p className="text-sm text-gray-500">{order.shipping_address.address_line}, {order.shipping_address.city}, {order.shipping_address.state} – {order.shipping_address.pincode}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Update Status</p>
            <div className="flex flex-wrap gap-2">
              {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => (
                <button key={s} onClick={() => onStatusChange(order.id, s)} disabled={updating || order.status === s}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${order.status === s ? "bg-brand-accent text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-brand-accent hover:text-brand-accent"}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Tracking Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
              <Input placeholder="Tracking Number" value={trackNum} onChange={e=>setTrackNum(e.target.value)} className="rounded-lg border-gray-200 text-sm" />
              <Input placeholder="Tracking URL" value={trackUrl} onChange={e=>setTrackUrl(e.target.value)} className="rounded-lg border-gray-200 text-sm" />
              <Input placeholder="Est. Delivery (e.g. 20 Apr 2026)" value={estDel} onChange={e=>setEstDel(e.target.value)} className="rounded-lg border-gray-200 text-sm" />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onTrackingUpdate(order.id, trackNum, trackUrl, estDel)} disabled={updating} className="text-white rounded-lg" style={{ backgroundColor: "#9A6B46" }} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#7d5337"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="#9A6B46"} data-dummy=" gap-2">
                <Truck className="w-3 h-3" /> Update Tracking
              </Button>
              <Button size="sm" variant="outline" onClick={() => onInvoice(order)} className="rounded-lg gap-2">
                <FileText className="w-3 h-3" /> Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ORDERS TAB ────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    adminGetOrders().then(setOrders).catch(() => {}).finally(() => setLoading(false));

    console.log("Orders loaded:", orders);
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    if (search && !o.user_name?.toLowerCase().includes(search.toLowerCase()) && !o.user_email?.toLowerCase().includes(search.toLowerCase()) && !o.id?.includes(search)) return false;
    if (statusFilter && o.status !== statusFilter) return false;
    return true;
  });
  const dateFiltered = filterByDate(filtered, "created_at", fromDate, toDate);

  const handleStatusChange = async (id, status) => {
    setUpdating(id);
    try { await adminUpdateOrder(id, { status }); toast.success("Status updated!"); load(); }
    catch { toast.error("Failed"); }
    finally { setUpdating(null); }
  };

  const handleTrackingUpdate = async (id, tracking_number, tracking_url, estimated_delivery) => {
    setUpdating(id);
    try { await adminUpdateOrder(id, { tracking_number, tracking_url, estimated_delivery }); toast.success("Tracking updated!"); load(); }
    catch { toast.error("Failed"); }
    finally { setUpdating(null); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search orders..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 rounded-lg border-gray-200" />
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-600">
          <option value="">All Status</option>
          {["pending","confirmed","processing","shipped","delivered","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Button variant="outline" size="sm" onClick={() => exportCSV(dateFiltered.map(o => ({ ID:o.id?.slice(0,8), Customer:o.user_name||o.user_email, Total:o.total, Status:o.status, Date:new Date(o.created_at).toLocaleDateString("en-IN") })), "orders")} className="rounded-lg gap-2">
          <Download className="w-4 h-4" />CSV
        </Button>
        <Button variant="ghost" size="sm" onClick={load} className="rounded-lg"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      <p className="text-sm text-gray-500">{dateFiltered.length} orders</p>
      {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div> : dateFiltered.length === 0 ? (
        <div className="text-center py-16 text-gray-400"><ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" /><p>No orders found</p></div>
      ) : (
        <div className="space-y-3">
          {dateFiltered.map(order => (
            <OrderRow key={order.id} order={order} expanded={expanded===order.id} onToggle={()=>setExpanded(expanded===order.id?null:order.id)} onStatusChange={handleStatusChange} onTrackingUpdate={handleTrackingUpdate} updating={updating===order.id} onInvoice={setInvoiceOrder} />
          ))}
        </div>
      )}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}

// ─── POPUPS TAB ────────────────────────────────────────
function PopupsTab() {
  const [popups, setPopups] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ type:"banner", title:"", description:"", code:"", active:true });

  const load = useCallback(() => { adminGetPopups().then(setPopups).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await updatePopup(editing, form); toast.success("Updated!"); }
      else { await createPopup(form); toast.success("Created!"); }
      setForm({ type:"banner", title:"", description:"", code:"", active:true }); setEditing(null); load();
    } catch(err) { toast.error(err.message || "Failed"); }
  };

  const typeLabels = { banner: "Top Banner", welcome: "Welcome Popup", exit_intent: "Exit Intent" };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit Popup" : "Create Popup"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full h-9 px-3 border border-gray-200 bg-white text-sm rounded-lg">
            <option value="banner">Top Banner</option>
            <option value="welcome">Welcome Popup (3 sec delay)</option>
            <option value="exit_intent">Exit Intent Popup</option>
          </select>
          <Input placeholder="Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required className="rounded-lg border-gray-200" />
          <Textarea placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="rounded-lg border-gray-200 min-h-[50px]" />
          <Input placeholder="Coupon Code (optional)" value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} className="rounded-lg border-gray-200" />
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Active
          </label>
          <div className="flex gap-3">
            <Button type="submit" className="text-white rounded-lg" style={{ backgroundColor: "#9A6B46" }} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#7d5337"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="#9A6B46"} data-dummy="">{editing ? "Update" : "Create Popup"}</Button>
            {editing && <Button type="button" variant="outline" onClick={()=>{setEditing(null);setForm({type:"banner",title:"",description:"",code:"",active:true});}} className="rounded-lg">Cancel</Button>}
          </div>
        </form>
      </div>
      <div className="space-y-3">
        {popups.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 px-5 py-4">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800">{p.title}</p>
              <p className="text-xs text-gray-400">{typeLabels[p.type]}{p.code && ` · ${p.code}`}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={async () => { try { await updatePopup(p.id, { active: !p.active }); load(); } catch {} }} className={`px-3 py-1 rounded-full text-xs font-semibold ${p.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                {p.active ? "Active" : "Hidden"}
              </button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(p.id); setForm({ type:p.type, title:p.title, description:p.description||"", code:p.code||"", active:p.active }); }} className="rounded-lg text-xs"><Edit2 className="w-3 h-3" /></Button>
              <Button size="sm" variant="ghost" onClick={async () => { if(!window.confirm("Delete?")) return; try { await deletePopup(p.id); toast.success("Deleted"); load(); } catch { toast.error("Failed"); } }} className="rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── OFFERS TAB ────────────────────────────────────────
function OffersTab() {
  const [offers, setOffers] = useState([]);
  const [editing, setEditing] = useState(null);
  const emptyForm = { title:"", description:"", code:"", discount_type:"percent", discount_value:"", min_order:"0", max_uses:"", active:true, expires_at:"" };
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(() => { adminGetOffers().then(setOffers).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, code: form.code.toUpperCase(), discount_value: parseFloat(form.discount_value), min_order: parseFloat(form.min_order)||0, max_uses: form.max_uses ? parseInt(form.max_uses) : null, expires_at: form.expires_at || null };
    try {
      if (editing) { await updateOffer(editing, payload); toast.success("Updated!"); }
      else { await createOffer(payload); toast.success("Created!"); }
      setForm(emptyForm); setEditing(null); load();
    } catch(err) { toast.error(err.message || "Code already exists?"); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">{editing ? "Edit Offer" : "Create Coupon / Offer"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Offer Title *" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} required className="rounded-lg border-gray-200" />
            <Input placeholder="Coupon Code *" value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})} required className="rounded-lg border-gray-200" />
          </div>
          <Textarea placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} className="rounded-lg border-gray-200 min-h-[50px]" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <select value={form.discount_type} onChange={e=>setForm({...form,discount_type:e.target.value})} className="h-9 px-3 border border-gray-200 bg-white text-sm rounded-lg">
              <option value="percent">Percent (%)</option><option value="fixed">Fixed (₹)</option>
            </select>
            <Input placeholder="Value" type="number" value={form.discount_value} onChange={e=>setForm({...form,discount_value:e.target.value})} required className="rounded-lg border-gray-200" />
            <Input placeholder="Min Order (₹)" type="number" value={form.min_order} onChange={e=>setForm({...form,min_order:e.target.value})} className="rounded-lg border-gray-200" />
            <Input placeholder="Max Uses" type="number" value={form.max_uses} onChange={e=>setForm({...form,max_uses:e.target.value})} className="rounded-lg border-gray-200" />
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <div><label className="text-xs text-gray-500 block mb-1">Expiry Date</label><Input type="date" value={form.expires_at} onChange={e=>setForm({...form,expires_at:e.target.value})} className="rounded-lg border-gray-200" /></div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer mt-4"><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Active</label>
          </div>
          <div className="flex gap-3">
            <Button type="submit" className="text-white rounded-lg" style={{ backgroundColor: "#9A6B46" }} onMouseEnter={e=>e.currentTarget.style.backgroundColor="#7d5337"} onMouseLeave={e=>e.currentTarget.style.backgroundColor="#9A6B46"} data-dummy="">{editing ? "Update" : "Create Offer"}</Button>
            {editing && <Button type="button" variant="outline" onClick={()=>{setEditing(null);setForm(emptyForm);}} className="rounded-lg">Cancel</Button>}
          </div>
        </form>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{offers.length} offers</p>
        <Button variant="outline" size="sm" onClick={() => exportCSV(offers.map(o => ({Title:o.title,Code:o.code,Type:o.discount_type,Value:o.discount_value,MinOrder:o.min_order,Used:o.uses_count,Active:o.active?"Yes":"No"})), "offers")} className="rounded-lg gap-2"><Download className="w-4 h-4" />CSV</Button>
      </div>
      <div className="space-y-3">
        {offers.map(o => (
          <div key={o.id} className="bg-white rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 px-5 py-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0"><Percent className="w-5 h-5 text-brand-accent" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium text-gray-800">{o.title}</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-brand-accent">{o.code}</span>
                <span className="text-xs text-gray-500">{o.discount_type === "percent" ? `${o.discount_value}% off` : `₹${o.discount_value} off`}</span>
              </div>
              <p className="text-xs text-gray-400">Min: ₹{o.min_order} · Used: {o.uses_count}/{o.max_uses || "∞"}{o.expires_at && ` · Expires: ${new Date(o.expires_at).toLocaleDateString("en-IN")}`}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={async () => { try { await updateOffer(o.id, { active: !o.active }); load(); } catch {} }} className={`px-3 py-1 rounded-full text-xs font-semibold ${o.active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{o.active ? "Active" : "Off"}</button>
              <Button size="sm" variant="outline" onClick={() => { setEditing(o.id); setForm({ title:o.title, description:o.description||"", code:o.code, discount_type:o.discount_type, discount_value:String(o.discount_value), min_order:String(o.min_order||0), max_uses:o.max_uses?String(o.max_uses):"", active:o.active, expires_at:o.expires_at?o.expires_at.split("T")[0]:"" }); }} className="rounded-lg text-xs"><Edit2 className="w-3 h-3" /></Button>
              <Button size="sm" variant="ghost" onClick={async () => { if(!window.confirm("Delete?")) return; try { await deleteOffer(o.id); toast.success("Deleted"); load(); } catch { toast.error("Failed"); } }} className="rounded-lg text-red-500 hover:bg-red-50"><Trash2 className="w-3 h-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MESSAGES TAB ──────────────────────────────────────
function MessagesTab() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    adminGetMessages().then(setMessages).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = filterByDate(
    messages.filter(m => !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.email?.toLowerCase().includes(search.toLowerCase())),
    "created_at", fromDate, toDate
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 rounded-lg border-gray-200" />
        </div>
        <Input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.map(m => ({Name:m.name,Email:m.email,Phone:m.phone||"",Message:m.message,Date:new Date(m.created_at).toLocaleDateString("en-IN")})), "messages")} className="rounded-lg gap-2"><Download className="w-4 h-4" />CSV</Button>
        <Button variant="ghost" size="sm" onClick={load} className="rounded-lg"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      <p className="text-sm text-gray-500">{filtered.filter(m=>!m.read).length} unread of {filtered.length}</p>
      {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div> : (
        <div className="space-y-3">
          {filtered.map(m => (
            <div key={m.id} className={`rounded-xl border p-5 ${!m.read ? "bg-amber-50 border-amber-200" : "bg-white border-gray-100"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800">{m.name}</span>
                    <span className="text-xs text-gray-500">{m.email}</span>
                    {m.phone && <span className="text-xs text-gray-400">{m.phone}</span>}
                    {!m.read && <span className="text-[10px] bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full font-bold">NEW</span>}
                  </div>
                  <p className="text-sm text-gray-700">{m.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(m.created_at).toLocaleString("en-IN")}</p>
                </div>
                {!m.read && (
                  <Button size="sm" variant="outline" onClick={async () => { try { await markMessageRead(m.id); setMessages(ms => ms.map(x => x.id === m.id ? {...x, read:true} : x)); } catch {} }} className="rounded-lg text-xs shrink-0">
                    <Check className="w-3 h-3 mr-1" />Read
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No messages</p>}
        </div>
      )}
    </div>
  );
}

// ─── REVIEWS TAB ───────────────────────────────────────
function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(() => {
    setLoading(true);
    adminGetReviews().then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = filterByDate(
    reviews.filter(r => filter === "all" || (filter === "pending" ? !r.approved : r.approved)),
    "created_at", fromDate, toDate
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={filter} onChange={e=>setFilter(e.target.value)} className="h-9 px-3 border border-gray-200 rounded-lg bg-white text-sm text-gray-600">
          <option value="all">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
        </select>
        <Input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.map(r => ({Name:r.customer_name,Rating:r.rating,Title:r.title||"",Review:r.review_text,Product:r.product_name||"",Approved:r.approved?"Yes":"No",Date:new Date(r.created_at).toLocaleDateString("en-IN")})), "reviews")} className="rounded-lg gap-2"><Download className="w-4 h-4" />CSV</Button>
        <Button variant="ghost" size="sm" onClick={load} className="rounded-lg"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      <p className="text-sm text-gray-500">{reviews.filter(r=>!r.approved).length} pending · {filtered.length} shown</p>
      {loading ? <div className="space-y-3">{[1,2].map(i=><div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div> : (
        <div className="space-y-3">
          {filtered.map(r => (
            <div key={r.id} className={`rounded-xl border p-5 ${!r.approved ? "bg-yellow-50 border-yellow-200" : "bg-white border-gray-100"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-800">{r.customer_name}</span>
                    <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span>
                    {r.title && <span className="text-sm italic text-gray-500">"{r.title}"</span>}
                    {!r.approved && <span className="text-[10px] bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full font-bold">PENDING</span>}
                  </div>
                  <p className="text-sm text-gray-600">{r.review_text}</p>
                  {r.product_name && <p className="text-xs text-brand-accent mt-1">Product: {r.product_name}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString("en-IN")}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!r.approved ? (
                    <Button size="sm" onClick={async () => { try { await approveReview(r.id, true); toast.success("Approved!"); load(); } catch { toast.error("Failed"); } }} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs">
                      <Check className="w-3 h-3 mr-1" />Approve
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={async () => { try { await approveReview(r.id, false); toast.success("Hidden"); load(); } catch { toast.error("Failed"); } }} className="rounded-lg text-xs text-red-500 border-red-200">
                      <X className="w-3 h-3 mr-1" />Hide
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-center py-12 text-gray-400 text-sm">No reviews</p>}
        </div>
      )}
    </div>
  );
}

// ─── USERS TAB ─────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const { user: currentUser } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    adminGetUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false));
  }, []);
  useEffect(() => { load(); }, [load]);

  const filtered = filterByDate(
    users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())),
    "created_at", fromDate, toDate
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-9 rounded-lg border-gray-200" />
        </div>
        <Input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} className="rounded-lg border-gray-200 w-36" />
        <Button variant="outline" size="sm" onClick={() => exportCSV(filtered.map(u => ({Name:u.name||"",Email:u.email,Phone:u.phone||"",Role:u.role,Joined:new Date(u.created_at).toLocaleDateString("en-IN")})), "users")} className="rounded-lg gap-2"><Download className="w-4 h-4" />CSV</Button>
        <Button variant="ghost" size="sm" onClick={load} className="rounded-lg"><RefreshCw className="w-4 h-4" /></Button>
      </div>
      <p className="text-sm text-gray-500">{filtered.length} users</p>
      {loading ? <div className="space-y-3">{[1,2,3].map(i=><div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr><th className="px-5 py-3 text-left">User</th><th className="px-5 py-3 text-left">Email</th><th className="px-5 py-3 text-left">Phone</th><th className="px-5 py-3 text-left">Role</th><th className="px-5 py-3 text-left">Joined</th><th className="px-5 py-3 text-left">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-brand-accent">{(u.name||u.email||"?")[0].toUpperCase()}</span>
                      </div>
                      <span className="font-medium text-gray-800">{u.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-500">{u.email}</td>
                  <td className="px-5 py-3 text-gray-500">{u.phone || "—"}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === "admin" ? "bg-amber-50 text-brand-accent" : "bg-gray-100 text-gray-600"}`}>{u.role}</span></td>
                  <td className="px-5 py-3 text-gray-400 text-xs">{new Date(u.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-5 py-3">
                    {u.id !== currentUser?.id && (
                      <Button size="sm" variant="outline" onClick={async () => {
                        const newRole = u.role === "admin" ? "user" : "admin";
                        if (!window.confirm(`Change role to ${newRole}?`)) return;
                        try { await adminUpdateUser(u.id, { role: newRole }); toast.success("Role updated"); load(); } catch { toast.error("Failed"); }
                      }} className="rounded-lg text-xs">
                        {u.role === "admin" ? "Remove Admin" : "Make Admin"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">No users found</p>}
        </div>
      )}
    </div>
  );
}

// ─── SETTINGS TAB ─────────────────────────────────────
function SettingsTab() {
  const [logoUrl, setLogoUrl] = useState(localStorage.getItem("mm_logo_url") || "");
  const [siteName, setSiteName] = useState(localStorage.getItem("mm_site_name") || "M M Attarwala");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try { const url = await uploadImage(file); setLogoUrl(url); toast.success("Logo uploaded!"); }
    catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const handleSave = () => {
    localStorage.setItem("mm_logo_url", logoUrl);
    localStorage.setItem("mm_site_name", siteName);
    toast.success("Settings saved! Refresh the site to see logo changes.");
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="font-semibold text-gray-800">Site Branding</h3>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-1">Site Name</label>
          <Input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="M M Attarwala" className="rounded-lg border-gray-200" />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wider block mb-2">Logo</label>
          <Input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Logo image URL" className="rounded-lg border-gray-200 mb-2" />
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-brand-accent text-sm text-gray-500">
            <Upload className="w-4 h-4" />{uploading ? "Uploading..." : "Upload Logo Image"}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          {logoUrl && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <img src={logoUrl} alt="Logo preview" className="h-10 object-contain" />
              <span className="text-xs text-gray-500">Logo preview</span>
            </div>
          )}
        </div>
        <Button onClick={handleSave} className="bg-brand-accent hover:bg-brand-primary text-white rounded-lg">Save Settings</Button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-700">Note: Logo is stored in browser localStorage. For permanent logo changes, update the Header component directly.</p>
      </div>
    </div>
  );
}

// ─── SIDEBAR NAV ───────────────────────────────────────
const navItems = [
  { id:"dashboard",  label:"Dashboard",  icon:BarChart3  },
  { id:"analytics",  label:"Analytics",  icon:Activity   },
  { id:"banners",    label:"Banners",    icon:Image      },
  { id:"categories", label:"Categories", icon:Grid       },
  { id:"products",   label:"Products",   icon:Package    },
  { id:"orders",     label:"Orders",     icon:ShoppingCart },
  { id:"popups",     label:"Popups",     icon:Bell       },
  { id:"offers",     label:"Offers",     icon:Percent    },
  { id:"messages",   label:"Messages",   icon:Mail       },
  { id:"reviews",    label:"Reviews",    icon:Star       },
  { id:"users",      label:"Users",      icon:Users      },
  { id:"settings",   label:"Settings",   icon:Settings   },
];

// ─── MAIN ADMIN PAGE ───────────────────────────────────
export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-4 border-brand-accent border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== "admin") return <Navigate to="/login" replace />;

  const tabContent = {
    dashboard: <DashboardTab />,
    analytics: <AnalyticsTab />,
    banners:   <BannersTab />,
    products:  <ProductsTab />,
    categories:<CategoriesTab />,
    orders:    <OrdersTab />,
    popups:    <PopupsTab />,
    offers:    <OffersTab />,
    messages:  <MessagesTab />,
    reviews:   <ReviewsTab />,
    users:     <UsersTab />,
    settings:  <SettingsTab />,
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden">
      {/* Sidebar Overlay (mobile) */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 z-50 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto lg:shrink-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ backgroundColor: "#1A2E24" }}>
        {/* Logo */}
        <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: "1px solid #264235" }}>
          <p className="text-white font-bold text-lg tracking-tight font-heading">M M Attarwala</p>
          <p className="text-xs mt-0.5" style={{ color: "#7a9a88" }}>Admin Panel</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${activeTab === id ? "text-white shadow-sm" : "hover:text-white"}`}
              style={activeTab === id ? { backgroundColor: "#9A6B46" } : { color: "#7a9a88" }}
              onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.backgroundColor = "#264235"; }}
              onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.backgroundColor = "transparent"; }}>
              <Icon className="w-4 h-4 shrink-0" />{label}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 flex-shrink-0 space-y-3" style={{ borderTop: "1px solid #264235" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#9A6B46" }}>
              <span className="text-white text-xs font-bold">{(user.name||user.email||"A")[0].toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs truncate" style={{ color: "#7a9a88" }}>{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white hover:text-white" style={{ backgroundColor: "#264235" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2d4d3a"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#264235"}>
              <Home className="w-3.5 h-3.5" /> Store
            </Link>
            <button onClick={logout} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-white" style={{ backgroundColor: "#264235" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = "#c0392b"}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = "#264235"}>
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center gap-4 flex-shrink-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600">
            <Grid className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-gray-800 text-lg capitalize">{activeTab}</h1>
            <p className="text-xs text-gray-400 hidden sm:block">Welcome back, {user.name} · {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long" })}</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: "#9A6B46" }}>
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> Admin
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {tabContent[activeTab]}
        </main>
      </div>
    </div>
  );
}
