import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer data-testid="site-footer" className="bg-brand-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 sm:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <h3 className="font-heading text-2xl font-light mb-4">M M Attarwala</h3>
            <p className="font-body text-sm text-white/70 leading-relaxed">
              A trusted fragrance house offering curated, high-quality, long-lasting perfumes and attars.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase font-bold text-white/50 mb-6">
              Quick Links
            </h4>
            <nav className="flex flex-col gap-3">
              {[
                { label: "Shop All", to: "/shop" },
                { label: "About Us", to: "/about" },
                { label: "Reviews", to: "/reviews" },
                { label: "Contact", to: "/contact" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-testid={`footer-${link.label.toLowerCase().replace(/\s/g, '-')}`}
                  className="font-body text-sm text-white/70 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase font-bold text-white/50 mb-6">
              Categories
            </h4>
            <nav className="flex flex-col gap-3">
              {["Pure Attars", "Eau de Parfum", "Everyday Fragrances", "Special Occasion"].map(
                (cat) => (
                  <Link
                    key={cat}
                    to="/shop"
                    className="font-body text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                )
              )}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase font-bold text-white/50 mb-6">
              Get in Touch
            </h4>
            <div className="flex flex-col gap-3 font-body text-sm text-white/70">
              <p>Gujarat & Maharashtra, India</p>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                WhatsApp: +91 98765 43210
              </a>
              <a
                href="mailto:info@mmattarwala.com"
                className="hover:text-white transition-colors"
              >
                info@mmattarwala.com
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-white/40">
            &copy; {new Date().getFullYear()} M M Attarwala. All rights reserved.
          </p>
          <p className="font-body text-xs text-white/40">
            Crafted with care in India
          </p>
        </div>
      </div>
    </footer>
  );
}
