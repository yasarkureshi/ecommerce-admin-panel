import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { User, ShoppingBag, Phone, Mail, Save, LogOut, ChevronRight, Lock, Eye, EyeOff, Settings } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [edited, setEdited] = useState(false);

  // Change password
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });

  useEffect(() => {
    if (!loading && !user) { navigate("/login"); return; }
    if (user) setForm({ name: user.name || "", phone: user.phone || "" });
  }, [user, loading, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name: form.name, phone: form.phone });
      toast.success("Profile updated!");
      setEdited(false);
    } catch(err) {
      toast.error(err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPw !== pwForm.confirm) { toast.error("New passwords don't match"); return; }
    if (pwForm.newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setPwSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: pwForm.newPw });
      if (error) throw error;
      toast.success("Password changed successfully!");
      setPwForm({ current: "", newPw: "", confirm: "" });
    } catch(err) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    toast.success("Logged out");
  };

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user) return null;

  const tabs = [
    { id: "profile", label: "Edit Profile", icon: User },
    { id: "password", label: "Change Password", icon: Lock },
    { id: "orders", label: "Order History", icon: ShoppingBag, link: "/orders" },
    ...(user.role === "admin" ? [{ id: "admin", label: "Admin Panel", icon: Settings, link: "/admin" }] : []),
  ];

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8">
          <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-accent mb-2">Your Account</p>
          <h1 className="font-heading text-3xl sm:text-4xl tracking-tight text-brand-text-primary font-light">My Profile</h1>
        </div>

        {/* Avatar Card */}
        <div className="flex items-center gap-4 mb-8 p-5 border border-brand-border bg-brand-surface">
          <div className="w-14 h-14 rounded-full bg-brand-secondary flex items-center justify-center shrink-0">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <span className="font-heading text-xl text-brand-accent">{(user.name||user.email||"?")[0].toUpperCase()}</span>
            )}
          </div>
          <div>
            <p className="font-heading text-lg text-brand-text-primary">{user.name}</p>
            <p className="font-body text-sm text-brand-text-secondary">{user.email}</p>
            {user.role === "admin" && <span className="text-xs bg-brand-primary text-white px-2 py-0.5 mt-1 inline-block">Admin</span>}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 border border-brand-border bg-brand-secondary p-1 overflow-x-auto">
          {tabs.filter(t => !t.link).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 font-body text-sm whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-brand-primary text-white" : "text-brand-text-secondary hover:text-brand-primary"}`}>
              <tab.icon className="w-3.5 h-3.5" />{tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "profile" && (
          <div className="border border-brand-border p-5 bg-brand-surface">
            <h2 className="font-heading text-lg text-brand-text-primary mb-4">Edit Profile</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-body text-xs text-brand-text-secondary uppercase tracking-wider block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <Input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setEdited(true); }} placeholder="Your full name" className="pl-9 rounded-none border-brand-border font-body" />
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-brand-text-secondary uppercase tracking-wider block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <Input value={form.phone} onChange={e => { setForm({...form, phone: e.target.value}); setEdited(true); }} placeholder="Your phone number" className="pl-9 rounded-none border-brand-border font-body" />
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-brand-text-secondary uppercase tracking-wider block mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <Input value={user.email} disabled className="pl-9 rounded-none border-brand-border font-body opacity-60" />
                </div>
                <p className="font-body text-xs text-brand-text-secondary mt-1">Email cannot be changed here</p>
              </div>
              <Button type="submit" disabled={saving || !edited} className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-6 font-body disabled:opacity-50">
                <Save className="w-4 h-4 mr-2" />{saving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </div>
        )}

        {activeTab === "password" && (
          <div className="border border-brand-border p-5 bg-brand-surface">
            <h2 className="font-heading text-lg text-brand-text-primary mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="font-body text-xs text-brand-text-secondary uppercase tracking-wider block mb-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <Input
                    type={showPw.newPw ? "text" : "password"}
                    value={pwForm.newPw}
                    onChange={e => setPwForm({...pwForm, newPw: e.target.value})}
                    placeholder="New password (min 6 chars)"
                    className="pl-9 pr-10 rounded-none border-brand-border font-body"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({...p, newPw: !p.newPw}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">
                    {showPw.newPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="font-body text-xs text-brand-text-secondary uppercase tracking-wider block mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
                  <Input
                    type={showPw.confirm ? "text" : "password"}
                    value={pwForm.confirm}
                    onChange={e => setPwForm({...pwForm, confirm: e.target.value})}
                    placeholder="Confirm new password"
                    className="pl-9 pr-10 rounded-none border-brand-border font-body"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({...p, confirm: !p.confirm}))} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-secondary">
                    {showPw.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pwForm.newPw && pwForm.confirm && pwForm.newPw !== pwForm.confirm && (
                  <p className="font-body text-xs text-red-500 mt-1">Passwords don't match</p>
                )}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded">
                <p className="font-body text-xs text-amber-700">Note: You will remain logged in after changing your password.</p>
              </div>
              <Button type="submit" disabled={pwSaving || !pwForm.newPw || !pwForm.confirm} className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-6 font-body disabled:opacity-50">
                <Lock className="w-4 h-4 mr-2" />{pwSaving ? "Changing..." : "Change Password"}
              </Button>
            </form>
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-6 border border-brand-border bg-brand-surface divide-y divide-brand-border">
          <Link to="/orders" className="flex items-center justify-between p-4 hover:bg-brand-secondary/30 transition-colors group">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-brand-accent" />
              <div>
                <p className="font-body text-sm font-medium text-brand-text-primary">Order History</p>
                <p className="font-body text-xs text-brand-text-secondary">View and track your orders</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-brand-text-secondary group-hover:text-brand-accent transition-colors" />
          </Link>
          {user.role === "admin" && (
            <Link to="/admin" className="flex items-center justify-between p-4 hover:bg-brand-secondary/30 transition-colors group">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-brand-accent" />
                <div>
                  <p className="font-body text-sm font-medium text-brand-text-primary">Admin Panel</p>
                  <p className="font-body text-xs text-brand-text-secondary">Manage products, orders & more</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-brand-text-secondary group-hover:text-brand-accent transition-colors" />
            </Link>
          )}
        </div>

        {/* Logout */}
        <Button onClick={handleLogout} variant="outline" className="w-full mt-4 rounded-none border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-body">
          <LogOut className="w-4 h-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
