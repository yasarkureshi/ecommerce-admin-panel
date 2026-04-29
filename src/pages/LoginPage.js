import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

function formatError(err) {
  if (!err) return "Something went wrong. Please try again.";
  const msg = err.message || String(err);
  if (msg.includes("Invalid login credentials")) return "Invalid email or password.";
  if (msg.includes("Email not confirmed")) return "Please check your email and confirm your account first.";
  if (msg.includes("User already registered")) return "An account with this email already exists. Please sign in.";
  return msg;
}

export default function LoginPage() {
  const { login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password, form.phone);
      } else {
        await login(form.email, form.password);
      }
      navigate(redirectTo, { replace: true });
      toast.success(isRegister ? "Account created!" : "Welcome back!");
    } catch (err) {
      setError(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="font-heading text-2xl text-brand-primary">M M Attarwala</Link>
          <h1 className="font-heading text-3xl sm:text-4xl text-brand-text-primary font-light mt-6 tracking-tight">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="font-body text-sm text-brand-text-secondary mt-2">
            {isRegister ? "Join us for a premium fragrance experience" : "Sign in to your account"}
          </p>
        </div>

        {/* Google Login */}
        <Button
          data-testid="google-login-btn"
          onClick={loginWithGoogle}
          variant="outline"
          className="w-full rounded-none border-brand-border py-5 font-body text-base hover:bg-brand-secondary transition-colors"
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </Button>

        <div className="flex items-center gap-4">
          <Separator className="flex-1 bg-brand-border" />
          <span className="font-body text-xs text-brand-text-secondary uppercase tracking-wider">or</span>
          <Separator className="flex-1 bg-brand-border" />
        </div>

        {/* Email Form */}
        {error && (
          <div className="bg-red-50 border border-red-200 p-3 text-sm text-red-700 font-body" data-testid="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <Input
              data-testid="register-name-input"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-none border-brand-border font-body py-5"
              required
            />
          )}
          <Input
            data-testid="login-email-input"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rounded-none border-brand-border font-body py-5"
            required
          />
          <Input
            data-testid="login-password-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rounded-none border-brand-border font-body py-5"
            required
            minLength={6}
          />
          {isRegister && (
            <Input
              data-testid="register-phone-input"
              placeholder="Phone Number (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-none border-brand-border font-body py-5"
            />
          )}
          <Button
            type="submit"
            data-testid="auth-submit-btn"
            disabled={loading}
            className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none py-5 text-base font-body tracking-wide"
          >
            {loading ? "Please wait..." : isRegister ? "Create Account" : "Sign In"}
          </Button>
        </form>

        <p className="text-center font-body text-sm text-brand-text-secondary">
          {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            data-testid="toggle-auth-mode"
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-brand-accent hover:underline font-medium"
          >
            {isRegister ? "Sign In" : "Create Account"}
          </button>
        </p>
      </div>
    </div>
  );
}
