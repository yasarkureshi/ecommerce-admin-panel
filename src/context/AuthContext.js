import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Build user object from Supabase session + profile
  const buildUser = async (session) => {
    if (!session) { setUser(false); return; }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();
    setUser({
      id: session.user.id,
      email: session.user.email,
      name: profile?.name || session.user.user_metadata?.name || session.user.email,
      phone: profile?.phone || "",
      role: profile?.role || "user",
      avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url || "",
    });
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      buildUser(session).finally(() => setLoading(false));
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      buildUser(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await buildUser(data.session);
    return data;
  };

  const register = async (name, email, password, phone) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    if (error) throw error;
    // Upsert profile (trigger may not have run yet)
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        name,
        email,
        phone: phone || "",
        role: "user",
      }, { onConflict: "id" });
    }
    await buildUser(data.session);
    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(false);
  };

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/auth/callback" },
    });
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");
    const { error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", session.user.id);
    if (error) throw error;
    setUser((prev) => ({ ...prev, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithGoogle, updateProfile, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
