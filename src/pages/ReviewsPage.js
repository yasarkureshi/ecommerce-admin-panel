import { useEffect, useState } from "react";
import StarRating from "@/components/StarRating";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { getReviews, submitReview } from "@/lib/supabaseApi";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customer_name: "",
    customer_location: "",
    rating: 5,
    title: "",
    review_text: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data);
      } catch (err) {
        console.error("Failed to fetch reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.review_text) return;
    setSubmitting(true);
    try {
      await submitReview(form);
      toast.success("Thank you! Your review has been submitted for approval.");
      setForm({ customer_name: "", customer_location: "", rating: 5, title: "", review_text: "" });
      setShowForm(false);
    } catch (err) {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div data-testid="reviews-page" className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-text-secondary mb-3">
            Customer Love
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-brand-text-primary font-light mb-4">
            Reviews
          </h1>
          {reviews.length > 0 && (
            <div className="flex items-center gap-4">
              <StarRating rating={Math.round(Number(avgRating))} size="w-5 h-5" />
              <span className="font-body text-base text-brand-text-primary font-semibold">
                {avgRating}
              </span>
              <span className="font-body text-sm text-brand-text-secondary">
                based on {reviews.length} review{reviews.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Write Review Toggle */}
        <div className="mb-10">
          <Button
            data-testid="write-review-toggle"
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body"
          >
            {showForm ? "Cancel" : "Write a Review"}
          </Button>
        </div>

        {/* Review Form */}
        {showForm && (
          <div className="max-w-lg mb-12 p-8 border border-brand-border bg-brand-surface" data-testid="review-form-container">
            <h3 className="font-heading text-xl text-brand-text-primary mb-6">Share Your Experience</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                data-testid="reviews-page-name-input"
                placeholder="Your Name *"
                value={form.customer_name}
                onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                className="rounded-none border-brand-border font-body"
                required
              />
              <Input
                data-testid="reviews-page-location-input"
                placeholder="Your City (optional)"
                value={form.customer_location}
                onChange={(e) => setForm({ ...form, customer_location: e.target.value })}
                className="rounded-none border-brand-border font-body"
              />
              <Input
                data-testid="reviews-page-title-input"
                placeholder="Review Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="rounded-none border-brand-border font-body"
              />
              <div>
                <p className="font-body text-sm text-brand-text-secondary mb-2">Rating</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm({ ...form, rating: star })}
                      className={`w-8 h-8 ${star <= form.rating ? "star-filled" : "star-empty"}`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                data-testid="reviews-page-text-input"
                placeholder="Tell us about your experience... *"
                value={form.review_text}
                onChange={(e) => setForm({ ...form, review_text: e.target.value })}
                className="rounded-none border-brand-border font-body min-h-[100px]"
                required
              />
              <Button
                type="submit"
                data-testid="reviews-page-submit-btn"
                disabled={submitting}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-brand-border p-6 animate-pulse">
                <div className="h-4 bg-brand-secondary w-1/4 mb-3" />
                <div className="h-4 bg-brand-secondary w-1/2 mb-3" />
                <div className="h-12 bg-brand-secondary w-full mb-3" />
                <div className="h-3 bg-brand-secondary w-1/3" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-heading text-xl text-brand-text-primary mb-2">No reviews yet</p>
            <p className="font-body text-sm text-brand-text-secondary">
              Be the first to share your experience with M M Attarwala fragrances.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                data-testid={`review-item-${review.id}`}
                className="border border-brand-border p-6 sm:p-8 space-y-3"
              >
                <StarRating rating={review.rating} />
                {review.title && (
                  <h4 className="font-heading text-base font-medium text-brand-text-primary">
                    {review.title}
                  </h4>
                )}
                <p className="font-body text-sm text-brand-text-secondary leading-relaxed">
                  "{review.review_text}"
                </p>
                <div className="pt-1">
                  <p className="font-body text-sm font-semibold text-brand-text-primary">
                    {review.customer_name}
                  </p>
                  {review.customer_location && (
                    <p className="font-body text-xs text-brand-text-secondary">{review.customer_location}</p>
                  )}
                  {review.product_name && (
                    <p className="font-body text-xs text-brand-accent mt-1">
                      Reviewed: {review.product_name}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
