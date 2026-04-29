import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import StarRating from "@/components/StarRating";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { getProduct, getReviews, submitReview, trackPageView } from "@/lib/supabaseApi";
import { ShoppingBag, Minus, Plus, ArrowLeft, Clock, Droplets } from "lucide-react";

export default function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [reviewForm, setReviewForm] = useState({ customer_name: "", rating: 5, title: "", review_text: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [prod, revs] = await Promise.all([
          getProduct(id),
          getReviews(id),
        ]);
        setProduct(prod);
        setReviews(revs);
        if (prod) {
          trackPageView(`/product/${id}`, prod.name, id);
          if (prod.sizes && prod.sizes.length > 0) setSelectedSize(prod.sizes[0]);
        }
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const hasSizes = product?.sizes && product.sizes.length > 1;
  const displayPrice = selectedSize ? selectedSize.price : product?.price;

  const handleAddToCart = () => {
    if (product) {
      if (hasSizes && !selectedSize) { toast.error("Please select a size"); return; }
      addToCart(product, quantity, hasSizes ? selectedSize : null);
      toast.success(`${product.name}${selectedSize ? ` (${selectedSize.label})` : ""} added to cart`);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.customer_name || !reviewForm.review_text) return;
    setSubmitting(true);
    try {
      await submitReview({
        ...reviewForm,
        product_id: id,
        product_name: product?.name,
      });
      toast.success("Review submitted! It will appear after approval.");
      setReviewForm({ customer_name: "", rating: 5, title: "", review_text: "" });
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="bg-brand-secondary aspect-[3/4] animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 bg-brand-secondary w-1/3 animate-pulse" />
            <div className="h-8 bg-brand-secondary w-2/3 animate-pulse" />
            <div className="h-4 bg-brand-secondary w-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-16 text-center">
        <h2 className="font-heading text-2xl text-brand-text-primary mb-4">Product Not Found</h2>
        <Button asChild className="bg-brand-primary text-white rounded-none">
          <Link to="/shop">Back to Shop</Link>
        </Button>
      </div>
    );
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null;

  return (
    <div data-testid="product-page" className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Breadcrumb */}
        <Link to="/shop" data-testid="back-to-shop" className="inline-flex items-center gap-2 text-brand-text-secondary hover:text-brand-primary font-body text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="bg-brand-secondary overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto max-h-[70vh] object-cover"
              data-testid="product-image"
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-text-secondary mb-2">
                {product.category} &middot; {product.size}
              </p>
              <h1 data-testid="product-name" className="font-heading text-3xl sm:text-4xl tracking-tight text-brand-text-primary font-light">
                {product.name}
              </h1>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={Math.floor(product.rating)} size="w-5 h-5" />
              <span className="font-body text-sm text-brand-text-secondary">
                {product.rating} ({product.review_count} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4" data-testid="product-price">
              <span className="font-body text-2xl font-semibold text-brand-text-primary">
                &#8377;{(displayPrice ?? product.price).toLocaleString("en-IN")}
              </span>
              {!hasSizes && product.original_price && (
                <>
                  <span className="font-body text-lg text-brand-text-secondary line-through">
                    &#8377;{product.original_price.toLocaleString("en-IN")}
                  </span>
                  <span className="bg-brand-accent/10 text-brand-accent text-xs font-bold px-2 py-1">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Size / ML Selector */}
            {hasSizes && (
              <div data-testid="size-selector">
                <p className="font-body text-xs tracking-[0.15em] uppercase font-semibold text-brand-text-secondary mb-2">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 border text-sm font-body transition-colors ${selectedSize?.label === s.label ? "border-brand-primary bg-brand-primary text-white" : "border-brand-border text-brand-text-secondary hover:border-brand-primary"}`}
                    >
                      {s.label} — &#8377;{s.price.toLocaleString("en-IN")}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Separator className="bg-brand-border" />

            {/* Description */}
            <p className="font-body text-base text-brand-text-secondary leading-relaxed" data-testid="product-description">
              {product.description}
            </p>

            {/* Fragrance Notes */}
            {(product.notes_top || product.notes_middle || product.notes_base) && (
              <div className="space-y-3" data-testid="fragrance-notes">
                <h3 className="font-heading text-lg text-brand-text-primary">Fragrance Notes</h3>
                {product.notes_top && (
                  <div className="flex gap-2">
                    <span className="font-body text-xs tracking-[0.1em] uppercase text-brand-accent font-bold w-16 shrink-0">Top</span>
                    <span className="font-body text-sm text-brand-text-secondary">{product.notes_top}</span>
                  </div>
                )}
                {product.notes_middle && (
                  <div className="flex gap-2">
                    <span className="font-body text-xs tracking-[0.1em] uppercase text-brand-accent font-bold w-16 shrink-0">Heart</span>
                    <span className="font-body text-sm text-brand-text-secondary">{product.notes_middle}</span>
                  </div>
                )}
                {product.notes_base && (
                  <div className="flex gap-2">
                    <span className="font-body text-xs tracking-[0.1em] uppercase text-brand-accent font-bold w-16 shrink-0">Base</span>
                    <span className="font-body text-sm text-brand-text-secondary">{product.notes_base}</span>
                  </div>
                )}
              </div>
            )}

            {/* Details pills */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-brand-text-secondary">
                <Droplets className="w-4 h-4 text-brand-accent" />
                <span className="font-body text-xs uppercase tracking-wide">{product.fragrance_type}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-brand-secondary text-brand-text-secondary">
                <Clock className="w-4 h-4 text-brand-accent" />
                <span className="font-body text-xs uppercase tracking-wide">{product.longevity}</span>
              </div>
            </div>

            <Separator className="bg-brand-border" />

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center border border-brand-border">
                <button
                  data-testid="qty-decrease"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-secondary transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span data-testid="qty-value" className="w-12 h-10 flex items-center justify-center font-body text-sm border-x border-brand-border">
                  {quantity}
                </span>
                <button
                  data-testid="qty-increase"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-brand-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <Button
                data-testid="add-to-cart-btn"
                onClick={handleAddToCart}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-5 text-base font-body tracking-wide flex-1 sm:flex-initial"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Add to Cart &mdash; &#8377;{((displayPrice ?? product.price) * quantity).toLocaleString("en-IN")}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 sm:mt-24">
          <Separator className="bg-brand-border mb-12" />
          <h2 className="font-heading text-2xl sm:text-3xl text-brand-text-primary font-light mb-8">
            Customer Reviews
          </h2>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {reviews.map((review) => (
                <div key={review.id} className="border border-brand-border p-6 space-y-3">
                  <StarRating rating={review.rating} />
                  <h4 className="font-heading text-base text-brand-text-primary">{review.title}</h4>
                  <p className="font-body text-sm text-brand-text-secondary leading-relaxed">
                    "{review.review_text}"
                  </p>
                  <p className="font-body text-xs text-brand-text-secondary">
                    &mdash; {review.customer_name}
                    {review.customer_location && `, ${review.customer_location}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-brand-text-secondary mb-12">
              No reviews yet for this product. Be the first!
            </p>
          )}

          {/* Review Form */}
          <div className="max-w-lg" data-testid="review-form">
            <h3 className="font-heading text-xl text-brand-text-primary mb-6">Write a Review</h3>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <Input
                data-testid="review-name-input"
                placeholder="Your Name"
                value={reviewForm.customer_name}
                onChange={(e) => setReviewForm({ ...reviewForm, customer_name: e.target.value })}
                className="rounded-none border-brand-border font-body"
                required
              />
              <Input
                data-testid="review-title-input"
                placeholder="Review Title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                className="rounded-none border-brand-border font-body"
              />
              <div>
                <p className="font-body text-sm text-brand-text-secondary mb-2">Rating</p>
                <div className="flex gap-1" data-testid="review-rating-input">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      className={`w-8 h-8 ${star <= reviewForm.rating ? "star-filled" : "star-empty"}`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                data-testid="review-text-input"
                placeholder="Share your experience with this fragrance..."
                value={reviewForm.review_text}
                onChange={(e) => setReviewForm({ ...reviewForm, review_text: e.target.value })}
                className="rounded-none border-brand-border font-body min-h-[100px]"
                required
              />
              <Button
                type="submit"
                data-testid="submit-review-btn"
                disabled={submitting}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
