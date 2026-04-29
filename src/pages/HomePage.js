import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";
import { getProducts, getReviews, getBanners } from "@/lib/supabaseApi";
import { ArrowRight, Droplets, Shield, Clock, Award, ChevronLeft, ChevronRight } from "lucide-react";
import { trackPageView } from "@/lib/supabaseApi";

// ─── Banner Slider ──────────────────────────────────────
function HeroSlider({ banners }) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const goTo = useCallback((idx) => {
    if (transitioning) return;
    setTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setTransitioning(false), 600);
  }, [transitioning]);

  const prev = () => goTo((current - 1 + banners.length) % banners.length);
  const next = useCallback(() => goTo((current + 1) % banners.length), [current, banners.length, goTo]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => next(), 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (!banners.length) return null;

  const slide = banners[current];

  return (
    <section className="relative overflow-hidden bg-brand-secondary" style={{ minHeight: "75vh" }}>
      {/* Slides */}
      {banners.map((b, i) => (
        <div key={b.id} className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100 z-10" : "opacity-0 z-0"}`}>
          <img src={b.image} alt={b.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center" style={{ minHeight: "75vh" }}>
        <div className="max-w-xl space-y-6 animate-fade-in-up py-20">
          <p className="font-body text-xs tracking-[0.25em] uppercase font-bold text-white/80">
            Premium Fragrances &middot; Since Generations
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] font-light text-white">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="font-body text-base sm:text-lg text-white/80 leading-relaxed">
              {slide.subtitle}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button asChild className="bg-white text-gray-900 hover:bg-white/90 rounded-none px-10 py-6 text-base font-body tracking-wide">
              <Link to={slide.link || "/shop"}>
                {slide.button_text || "Shop Now"} <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900 rounded-none px-10 py-6 text-base font-body tracking-wide transition-all duration-300">
              <Link to="/about">Our Story</Link>
            </Button>
          </div>
          <div className="flex flex-wrap gap-6 pt-2">
            {["100% Authentic", "8-12hr Lasting", "Free Shipping"].map((badge) => (
              <span key={badge} className="font-body text-xs tracking-wide text-white/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />{badge}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Arrows */}
      {banners.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
            {banners.map((_, i) => (
              <button key={i} onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

// ─── Fallback Hero (if no banners) ─────────────────────
function FallbackHero() {
  return (
    <section data-testid="hero-section" className="relative overflow-hidden bg-brand-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[75vh] py-16 sm:py-20">
          <div className="space-y-8 animate-fade-in-up">
            <p className="font-body text-xs tracking-[0.25em] uppercase font-bold text-brand-accent">
              Premium Fragrances &middot; Since Generations
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] font-light text-brand-text-primary">
              The Art of <br /><span className="italic text-gradient-accent">Timeless</span> Fragrance
            </h1>
            <p className="font-body text-base sm:text-lg text-brand-text-secondary leading-relaxed max-w-lg">
              Curated attars and perfumes crafted with generations of expertise. Every drop tells a story of quality, tradition, and lasting impression.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-10 py-6 text-base font-body tracking-wide btn-glow">
                <Link to="/shop">Shop Now <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary hover:text-white rounded-none px-10 py-6 text-base font-body tracking-wide transition-all duration-300">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              {["100% Authentic", "8-12hr Lasting", "Free Shipping"].map((badge) => (
                <span key={badge} className="font-body text-xs tracking-wide text-brand-text-secondary flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-brand-accent rounded-full" />{badge}
                </span>
              ))}
            </div>
          </div>
          <div className="relative animate-fade-in-up animation-delay-200">
            <img
              src="https://images.unsplash.com/photo-1743309043742-9b4976a16478?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
              alt="Premium perfume bottle"
              className="w-full max-h-[65vh] object-cover"
            />
            <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 border border-brand-border/50 animate-float">
              <p className="font-body text-[10px] tracking-[0.2em] uppercase text-brand-text-secondary">Starting from</p>
              <p className="font-heading text-2xl text-brand-text-primary">&#8377;799</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  const [bestsellers, setBestsellers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackPageView("/", "Home");
    const fetchData = async () => {
      try {
        const [prods, revs, bnrs] = await Promise.all([
          getProducts({ bestseller: true }),
          getReviews(),
          getBanners(),
        ]);
        setBestsellers(prods);
        setReviews(revs);
        setBanners(bnrs);
      } catch (err) {
        console.error("Failed to fetch homepage data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div data-testid="home-page">
      <Helmet>
        <title>M M Attarwala | Premium Fragrances & Attars</title>
        <meta name="description" content="Curated collection of high-quality, long-lasting perfumes and attars from a trusted heritage fragrance house." />
      </Helmet>

      {/* ─── Hero / Slider ─── */}
      {banners.length > 0 ? <HeroSlider banners={banners} /> : <FallbackHero />}

      {/* ─── Bestsellers ─── */}
      <section data-testid="bestsellers-section" className="py-20 sm:py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 sm:mb-16 gap-4">
            <div className="animate-fade-in-up">
              <p className="font-body text-xs tracking-[0.25em] uppercase font-bold text-brand-accent mb-3">Most Loved</p>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight text-brand-text-primary font-light">Our Bestsellers</h2>
              <div className="elegant-divider mt-4 !mx-0" />
            </div>
            <Link to="/shop" data-testid="view-all-products-link" className="font-body text-sm text-brand-accent hover:text-brand-primary flex items-center gap-2 transition-colors group">
              View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1,2,3,4,5,6].map(i => <div key={i}><div className="shimmer aspect-[3/4] mb-4" /><div className="shimmer h-3 w-1/2 mb-2" /><div className="shimmer h-4 w-3/4 mb-2" /><div className="shimmer h-3 w-1/3" /></div>)}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 stagger-children">
              {bestsellers.slice(0, 6).map(product => <ProductCard key={product.id} product={product} />)}
            </div>
          )}
        </div>
      </section>

      {/* ─── Brand Story ─── */}
      <section data-testid="brand-story-section" className="py-20 sm:py-28 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative animate-fade-in-up overflow-hidden">
              <img src="https://images.pexels.com/photos/8450240/pexels-photo-8450240.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940" alt="Natural perfume ingredients" className="w-full h-auto object-cover max-h-[520px] hover:scale-[1.02] transition-transform duration-700" />
            </div>
            <div className="space-y-6 animate-fade-in-up animation-delay-200">
              <p className="font-body text-xs tracking-[0.25em] uppercase font-bold text-brand-accent">Our Legacy</p>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight text-brand-text-primary font-light leading-snug">
                Generations of <br /><span className="italic">Fragrance Mastery</span>
              </h2>
              <div className="elegant-divider !mx-0" />
              <p className="font-body text-base text-brand-text-secondary leading-relaxed">
                M M Attarwala is not just a brand &mdash; it is a legacy. Rooted in the rich tradition of Indian perfumery, we bring you fragrances crafted with the same dedication and expertise that has defined our family for generations.
              </p>
              <p className="font-body text-base text-brand-text-secondary leading-relaxed">
                We source the finest ingredients &mdash; from Mysore sandalwood to Kannauj roses &mdash; and combine them using time-honored methods to create scents that are authentic, lasting, and truly memorable.
              </p>
              <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 text-base font-body btn-glow mt-2">
                <Link to="/about">Read Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why Choose Us ─── */}
      <section data-testid="why-choose-section" className="py-20 sm:py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14 sm:mb-20">
            <p className="font-body text-xs tracking-[0.25em] uppercase font-bold text-brand-accent mb-3">Why M M Attarwala</p>
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight text-brand-text-primary font-light">The M M Attarwala Promise</h2>
            <div className="elegant-divider mt-5" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 stagger-children">
            {[
              { icon: Droplets, title: "100% Pure", desc: "Every fragrance is crafted from genuine, premium ingredients with no synthetic shortcuts." },
              { icon: Clock, title: "Long-Lasting", desc: "Our formulations are designed to last 8-12 hours, giving you confidence throughout the day." },
              { icon: Shield, title: "Trusted Quality", desc: "Decades of expertise and thousands of satisfied customers stand behind every bottle." },
              { icon: Award, title: "Heritage Craft", desc: "Traditional methods passed down through generations, combined with modern perfumery science." },
            ].map(item => (
              <div key={item.title} className="text-center space-y-4 p-8 premium-card border border-transparent hover:border-brand-border bg-brand-surface">
                <div className="w-14 h-14 mx-auto flex items-center justify-center bg-brand-secondary text-brand-accent">
                  <item.icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading text-lg text-brand-text-primary">{item.title}</h3>
                <p className="font-body text-sm text-brand-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Reviews ─── */}
      <section data-testid="reviews-section" className="py-20 sm:py-28 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 sm:mb-16 gap-4">
            <div>
              <p className="font-body text-xs tracking-[0.25em] uppercase font-bold text-brand-accent mb-3">Customer Love</p>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight text-brand-text-primary font-light">What Our Customers Say</h2>
              <div className="elegant-divider mt-4 !mx-0" />
            </div>
            <Link to="/reviews" data-testid="view-all-reviews-link" className="font-body text-sm text-brand-accent hover:text-brand-primary flex items-center gap-2 transition-colors group">
              All Reviews <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 stagger-children">
              {reviews.slice(0, 3).map(review => (
                <div key={review.id} data-testid={`review-card-${review.id}`} className="bg-brand-surface p-8 border border-brand-border space-y-4 premium-card">
                  <StarRating rating={review.rating} />
                  <h4 className="font-heading text-base font-medium text-brand-text-primary">{review.title}</h4>
                  <p className="font-body text-sm text-brand-text-secondary leading-relaxed line-clamp-4">"{review.review_text}"</p>
                  <div className="pt-2">
                    <p className="font-body text-sm font-semibold text-brand-text-primary">{review.customer_name}</p>
                    <p className="font-body text-xs text-brand-text-secondary">{review.customer_location}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && <p className="text-center text-brand-text-secondary font-body">No reviews yet.</p>
          )}
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section data-testid="final-cta-section" className="py-20 sm:py-28 lg:py-36 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-bg to-brand-secondary/50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center relative z-10">
          <p className="font-body text-xs tracking-[0.25em] uppercase font-bold text-brand-accent mb-4">Discover Your Signature</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-brand-text-primary font-light mb-5">Find Your Signature Scent</h2>
          <div className="elegant-divider mb-6" />
          <p className="font-body text-base text-brand-text-secondary leading-relaxed max-w-lg mx-auto mb-10">
            Explore our curated collection of premium attars and perfumes. Each fragrance is crafted to leave a lasting impression.
          </p>
          <Button asChild data-testid="final-cta-shop-btn" className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-12 py-6 text-base font-body tracking-wide btn-glow">
            <Link to="/shop">Shop the Collection <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
