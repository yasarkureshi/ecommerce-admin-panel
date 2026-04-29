import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { ShoppingBag, Menu, User, LogOut, Package, Settings } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Reviews", to: "/reviews" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header data-testid="site-header" className="sticky top-0 z-50 bg-brand-bg/80 backdrop-blur-2xl border-b border-brand-border/40 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-16 sm:h-20">
        <Link to="/" data-testid="logo-link" className="flex items-center gap-2 group">
          <span className="font-heading text-xl sm:text-2xl font-semibold text-brand-primary tracking-tight group-hover:text-brand-accent transition-colors duration-300">
            M M Attarwala
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8" data-testid="desktop-nav">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-testid={`nav-${link.label.toLowerCase()}`}
              className={`relative font-body text-sm tracking-wide transition-colors duration-300 after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-brand-accent after:transition-all after:duration-300 hover:after:w-full ${
                location.pathname === link.to
                  ? "text-brand-primary font-semibold after:w-full"
                  : "text-brand-text-secondary hover:text-brand-primary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* User Menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="user-menu-trigger" className="relative text-brand-primary hover:text-brand-accent hover:bg-brand-secondary/50">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-none border-brand-border bg-brand-surface">
                <div className="px-3 py-2">
                  <p className="font-body text-sm font-semibold text-brand-text-primary truncate">{user.name}</p>
                  <p className="font-body text-xs text-brand-text-secondary truncate">{user.email}</p>
                  {user.role === "admin" && <span className="text-[10px] bg-brand-primary text-white px-1.5 py-0.5 mt-1 inline-block">Admin</span>}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="font-body text-sm cursor-pointer flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> My Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="font-body text-sm cursor-pointer flex items-center gap-2">
                    <Package className="w-3.5 h-3.5" /> My Orders
                  </Link>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="font-body text-sm cursor-pointer flex items-center gap-2">
                        <Settings className="w-3.5 h-3.5" /> Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} data-testid="logout-btn" className="font-body text-sm cursor-pointer text-red-600 flex items-center gap-2">
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" data-testid="login-link" className="hidden md:inline-flex items-center gap-2 font-body text-sm text-brand-text-secondary hover:text-brand-primary transition-colors">
              <User className="w-4 h-4" /> Sign In
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart" data-testid="cart-link" className="relative text-brand-primary hover:text-brand-accent transition-colors duration-300">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span data-testid="cart-count-badge" className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in-50 duration-200">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" data-testid="mobile-menu-trigger" className="hover:bg-brand-secondary/50">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-brand-bg w-72">
              <SheetHeader>
                <SheetTitle className="font-heading text-brand-primary text-left">M M Attarwala</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-5 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} data-testid={`mobile-nav-${link.label.toLowerCase()}`} onClick={() => setMobileOpen(false)}
                    className={`font-body text-base transition-colors ${location.pathname === link.to ? "text-brand-primary font-semibold" : "text-brand-text-secondary hover:text-brand-primary"}`}>
                    {link.label}
                  </Link>
                ))}
                <Link to="/cart" onClick={() => setMobileOpen(false)} data-testid="mobile-nav-cart" className="text-brand-text-secondary hover:text-brand-primary font-body text-base flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Cart {cartCount > 0 && `(${cartCount})`}
                </Link>
                {user ? (
                  <>
                    <div className="pt-3 border-t border-brand-border">
                      <p className="font-body text-sm font-semibold text-brand-text-primary">{user.name}</p>
                      <p className="font-body text-xs text-brand-text-secondary">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setMobileOpen(false)} className="text-brand-text-secondary hover:text-brand-primary font-body text-base flex items-center gap-2">
                      <User className="w-4 h-4" /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setMobileOpen(false)} className="text-brand-text-secondary hover:text-brand-primary font-body text-base flex items-center gap-2">
                      <Package className="w-4 h-4" /> My Orders
                    </Link>
                    {user.role === "admin" && (
                      <Link to="/admin" onClick={() => setMobileOpen(false)} className="text-brand-text-secondary hover:text-brand-primary font-body text-base flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Admin Panel
                      </Link>
                    )}
                    <button onClick={() => { logout(); setMobileOpen(false); }} className="text-red-600 font-body text-base text-left flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} data-testid="mobile-login-link" className="text-brand-accent font-body text-base flex items-center gap-2">
                    <User className="w-4 h-4" /> Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
