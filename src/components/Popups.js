import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getActivePopups } from "@/lib/supabaseApi";

export function BannerOffer() {
  const [banner, setBanner] = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("mm-banner-dismissed");
    if (dismissed) { setVisible(false); return; }
    getActivePopups().then(popups => {
      const b = popups.find(p => p.type === "banner");
      if (b) setBanner(b);
    }).catch(() => {});
  }, []);

  if (!visible || !banner) return null;

  return (
    <div data-testid="banner-offer" className="bg-brand-primary text-white py-2.5 px-4 text-center relative">
      <p className="font-body text-xs sm:text-sm tracking-wide">
        {banner.title}
        {banner.code && <span className="ml-2 font-bold bg-white/20 px-2 py-0.5 text-xs">{banner.code}</span>}
      </p>
      <button
        onClick={() => { setVisible(false); sessionStorage.setItem("mm-banner-dismissed", "1"); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
        data-testid="banner-dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function WelcomePopup() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("mm-welcome-shown");
    if (shown) return;
    const timer = setTimeout(() => {
      getActivePopups().then(popups => {
        const w = popups.find(p => p.type === "welcome");
        if (w) { setPopup(w); setVisible(true); }
      }).catch(() => {});
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => { setVisible(false); sessionStorage.setItem("mm-welcome-shown", "1"); };

  if (!visible || !popup) return null;

  return (
    <div data-testid="welcome-popup-overlay" className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={dismiss}>
      <div onClick={e => e.stopPropagation()} className="bg-brand-surface max-w-md w-full p-8 sm:p-10 relative animate-scale-in border border-brand-border" data-testid="welcome-popup">
        <button onClick={dismiss} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary" data-testid="welcome-popup-close">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center space-y-4">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-brand-accent font-bold">Special Offer</p>
          <h2 className="font-heading text-2xl sm:text-3xl text-brand-text-primary font-light">{popup.title}</h2>
          {popup.description && <p className="font-body text-sm text-brand-text-secondary">{popup.description}</p>}
          {popup.code && (
            <div className="bg-brand-secondary border border-brand-border p-4">
              <p className="font-body text-xs text-brand-text-secondary mb-1">Your Code</p>
              <p className="font-heading text-2xl text-brand-accent tracking-wider">{popup.code}</p>
            </div>
          )}
          <Button onClick={dismiss} className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body w-full btn-glow" data-testid="welcome-popup-shop">
            Start Shopping
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ExitIntentPopup() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("mm-exit-shown");
    if (shown) return;
    getActivePopups().then(popups => {
      const e = popups.find(p => p.type === "exit_intent");
      if (e) setPopup(e);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.clientY <= 5 && !triggered.current && popup) {
        triggered.current = true;
        setVisible(true);
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, [popup]);

  const dismiss = () => { setVisible(false); sessionStorage.setItem("mm-exit-shown", "1"); };

  if (!visible || !popup) return null;

  return (
    <div data-testid="exit-popup-overlay" className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4" onClick={dismiss}>
      <div onClick={e => e.stopPropagation()} className="bg-brand-surface max-w-md w-full p-8 sm:p-10 relative animate-scale-in border border-brand-border" data-testid="exit-popup">
        <button onClick={dismiss} className="absolute top-4 right-4 text-brand-text-secondary hover:text-brand-text-primary">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center space-y-4">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-brand-error font-bold">Wait!</p>
          <h2 className="font-heading text-2xl sm:text-3xl text-brand-text-primary font-light">{popup.title}</h2>
          {popup.description && <p className="font-body text-sm text-brand-text-secondary">{popup.description}</p>}
          {popup.code && (
            <div className="bg-brand-secondary border border-brand-border p-4">
              <p className="font-body text-xs text-brand-text-secondary mb-1">Exclusive Code</p>
              <p className="font-heading text-2xl text-brand-accent tracking-wider">{popup.code}</p>
            </div>
          )}
          <Button onClick={dismiss} className="bg-brand-accent text-white hover:bg-brand-accent/90 rounded-none px-8 py-4 font-body w-full">
            Claim Offer
          </Button>
        </div>
      </div>
    </div>
  );
}
