import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const hasSizes = product.sizes && product.sizes.length > 1;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasSizes) {
      navigate(`/product/${product.id}`);
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart`);
  };

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <Link
      to={`/product/${product.id}`}
      data-testid={`product-card-${product.id}`}
      className="group block premium-card"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-brand-secondary aspect-[3/4] mb-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover product-card-image"
          loading="lazy"
        />
        {product.bestseller && (
          <span
            data-testid={`bestseller-badge-${product.id}`}
            className="absolute top-3 left-3 bg-brand-primary text-white text-[10px] tracking-[0.15em] uppercase font-bold px-3 py-1"
          >
            Bestseller
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-3 bg-brand-accent text-white text-[10px] tracking-wide font-bold px-2 py-1">
            -{discount}%
          </span>
        )}
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <Button
            onClick={handleAddToCart}
            data-testid={`add-to-cart-${product.id}`}
            className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none py-3 text-sm font-body tracking-wide"
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <p className="text-xs text-brand-text-secondary font-body tracking-[0.15em] uppercase">
          {product.category} &middot; {product.size}
        </p>
        <h3 className="font-heading text-base sm:text-lg text-brand-text-primary font-medium leading-snug">
          {product.name}
        </h3>
        <p className="font-body text-sm text-brand-text-secondary line-clamp-1">
          {product.short_description}
        </p>
        <div className="flex items-center gap-2 pt-1">
          <span className="font-body text-base font-semibold text-brand-text-primary">
            &#8377;{product.price.toLocaleString("en-IN")}
          </span>
          {product.original_price && (
            <span className="font-body text-sm text-brand-text-secondary line-through">
              &#8377;{product.original_price.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        {/* Rating */}
        <div className="flex items-center gap-1 pt-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <svg
              key={i}
              className={`w-3 h-3 ${i < Math.floor(product.rating) ? "star-filled" : "star-empty"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
          <span className="text-xs text-brand-text-secondary ml-1">({product.review_count})</span>
        </div>
      </div>
    </Link>
  );
}
