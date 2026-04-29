import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/lib/supabaseApi";
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

const OCCASIONS = ["all", "everyday", "evening", "special"];
const TYPES = ["all", "woody", "floral", "oriental", "fresh", "earthy"];
const LONGEVITY = ["all", "long-lasting", "moderate"];
const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹1000", min: 500, max: 1000 },
  { label: "₹1000 – ₹2000", min: 1000, max: 2000 },
  { label: "₹2000+", min: 2000, max: Infinity },
];

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-brand-border pb-4 mb-4">
      <button
        className="w-full flex items-center justify-between py-1 font-body text-xs tracking-[0.15em] uppercase font-semibold text-brand-text-secondary hover:text-brand-primary transition-colors"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left px-3 py-1.5 text-sm font-body rounded transition-colors ${
        active
          ? "bg-brand-primary text-white"
          : "text-brand-text-secondary hover:text-brand-primary hover:bg-brand-secondary"
      }`}
    >
      {label}
    </button>
  );
}

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [occasion, setOccasion] = useState("all");
  const [fragType, setFragType] = useState("all");
  const [longevity, setLongevity] = useState("all");
  const [priceRange, setPriceRange] = useState(0);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const filters = {};
        if (occasion !== "all") filters.occasion = occasion;
        if (fragType !== "all") filters.fragrance_type = fragType;
        if (longevity !== "all") filters.longevity = longevity;
        if (search.trim()) filters.search = search.trim();
        const data = await getProducts(filters);
        setProducts(data);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    const timer = setTimeout(fetchProducts, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [occasion, fragType, longevity, search]);

  const selectedRange = PRICE_RANGES[priceRange];
  const filteredProducts = products.filter(
    p => p.price >= selectedRange.min && p.price <= selectedRange.max
  );

  const hasActiveFilters = occasion !== "all" || fragType !== "all" || longevity !== "all" || priceRange !== 0 || search.trim();

  const clearAll = () => {
    setOccasion("all"); setFragType("all"); setLongevity("all");
    setPriceRange(0); setSearch("");
  };

  const FilterPanel = () => (
    <div className="space-y-0">
      <FilterSection title="Price Range">
        {PRICE_RANGES.map((r, i) => (
          <FilterPill key={i} label={r.label} active={priceRange === i} onClick={() => setPriceRange(i)} />
        ))}
      </FilterSection>

      <FilterSection title="Occasion">
        {OCCASIONS.map(o => (
          <FilterPill key={o}
            label={o === "all" ? "All Occasions" : o.charAt(0).toUpperCase() + o.slice(1)}
            active={occasion === o}
            onClick={() => setOccasion(o)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Fragrance Type">
        {TYPES.map(t => (
          <FilterPill key={t}
            label={t === "all" ? "All Types" : t.charAt(0).toUpperCase() + t.slice(1)}
            active={fragType === t}
            onClick={() => setFragType(t)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Longevity">
        {LONGEVITY.map(l => (
          <FilterPill key={l}
            label={l === "all" ? "All" : l.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join("-")}
            active={longevity === l}
            onClick={() => setLongevity(l)}
          />
        ))}
      </FilterSection>

      {hasActiveFilters && (
        <button onClick={clearAll} className="w-full mt-2 px-3 py-2 border border-red-200 text-red-500 text-xs font-body hover:bg-red-50 transition-colors rounded flex items-center justify-center gap-1">
          <X className="w-3 h-3" /> Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <div data-testid="shop-page" className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Page Header */}
        <div className="mb-8 sm:mb-12">
          <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-text-secondary mb-3">Our Collection</p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-brand-text-primary font-light">Shop Fragrances</h1>
        </div>

        {/* Search bar + mobile filter toggle */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-secondary" />
            <Input
              data-testid="search-input"
              placeholder="Search fragrances..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 rounded-none border-brand-border font-body"
            />
          </div>
          {/* Mobile filter toggle */}
          <button
            data-testid="filter-toggle"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className={`lg:hidden flex items-center gap-2 px-4 py-2 border font-body text-sm transition-colors ${mobileFiltersOpen ? "border-brand-primary bg-brand-primary text-white" : "border-brand-border text-brand-text-secondary hover:border-brand-primary"}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {hasActiveFilters && <span className="w-4 h-4 bg-brand-accent text-white text-[9px] rounded-full flex items-center justify-center font-bold">!</span>}
          </button>
        </div>

        {/* Mobile filter panel (expandable) */}
        {mobileFiltersOpen && (
          <div className="lg:hidden mb-6 p-4 border border-brand-border bg-brand-surface">
            <FilterPanel />
          </div>
        )}

        <div className="flex gap-8 lg:gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-52 xl:w-60 shrink-0">
            <div className="sticky top-6">
              <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-text-secondary mb-4">Filters</p>
              <FilterPanel />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            <p className="font-body text-sm text-brand-text-secondary mb-6" data-testid="product-count">
              {loading ? "Loading..." : `${filteredProducts.length} fragrance${filteredProducts.length !== 1 ? "s" : ""}`}
              {hasActiveFilters && !loading && (
                <button onClick={clearAll} className="ml-3 text-brand-accent hover:underline text-xs">Clear filters</button>
              )}
            </p>

            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-brand-secondary aspect-[3/4] mb-4" />
                    <div className="h-3 bg-brand-secondary w-1/2 mb-2" />
                    <div className="h-4 bg-brand-secondary w-3/4" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20" data-testid="no-products">
                <p className="font-heading text-xl text-brand-text-primary mb-2">No fragrances found</p>
                <p className="font-body text-sm text-brand-text-secondary mb-4">Try adjusting your filters or search.</p>
                <button onClick={clearAll} className="text-brand-accent font-body text-sm hover:underline">Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
