import { Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();

  if (cartItems.length === 0) {
    return (
      <div data-testid="cart-page-empty" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-brand-border mb-6" />
          <h1 className="font-heading text-2xl sm:text-3xl text-brand-text-primary font-light mb-4">
            Your Cart is Empty
          </h1>
          <p className="font-body text-base text-brand-text-secondary mb-8">
            Discover our curated collection of premium fragrances.
          </p>
          <Button asChild data-testid="empty-cart-shop-btn" className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body">
            <Link to="/shop">Start Shopping</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="cart-page" className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-text-secondary mb-2">
              Shopping
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl tracking-tight text-brand-text-primary font-light">
              Your Cart
            </h1>
          </div>
          <Link to="/shop" data-testid="continue-shopping-link" className="font-body text-sm text-brand-accent hover:text-brand-primary flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Continue Shopping
          </Link>
        </div>

        {/* Cart Items */}
        <div className="space-y-0">
          {cartItems.map((item) => {
            const key = item.cartKey || item.id;
            return (
            <div key={key} data-testid={`cart-item-${item.id}`}>
              <div className="flex gap-4 sm:gap-6 py-6">
                {/* Image */}
                <Link to={`/product/${item.id}`} className="shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 sm:w-28 sm:h-28 object-cover bg-brand-secondary"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-heading text-base sm:text-lg text-brand-text-primary hover:text-brand-accent transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="font-body text-xs text-brand-text-secondary mt-1">
                    {item.category} &middot; <span className="font-semibold text-brand-accent">{item.size}</span>
                  </p>
                  <p className="font-body text-base font-semibold text-brand-text-primary mt-2">
                    &#8377;{item.price.toLocaleString("en-IN")}
                  </p>

                  {/* Quantity + Remove */}
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-brand-border">
                      <button
                        data-testid={`cart-qty-decrease-${item.id}`}
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-brand-secondary transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center font-body text-sm border-x border-brand-border">
                        {item.quantity}
                      </span>
                      <button
                        data-testid={`cart-qty-increase-${item.id}`}
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-brand-secondary transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      data-testid={`cart-remove-${item.id}`}
                      onClick={() => removeFromCart(key)}
                      className="text-brand-text-secondary hover:text-brand-error transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Line Total */}
                <div className="text-right shrink-0">
                  <p className="font-body text-base font-semibold text-brand-text-primary">
                    &#8377;{(item.price * item.quantity).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <Separator className="bg-brand-border" />
            </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-body text-base text-brand-text-secondary">Subtotal</span>
            <span className="font-body text-lg font-semibold text-brand-text-primary" data-testid="cart-subtotal">
              &#8377;{cartTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="font-body text-xs text-brand-text-secondary">
            Shipping calculated at checkout. No COD available.
          </p>
          <Separator className="bg-brand-border" />
          <div className="flex justify-between items-center">
            <span className="font-heading text-xl text-brand-text-primary">Total</span>
            <span className="font-heading text-2xl text-brand-text-primary" data-testid="cart-total">
              &#8377;{cartTotal.toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              asChild
              data-testid="checkout-btn"
              className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-5 text-base font-body tracking-wide flex-1 btn-glow"
            >
              <Link to="/checkout">Proceed to Checkout</Link>
            </Button>
            <Button
              variant="outline"
              data-testid="clear-cart-btn"
              onClick={clearCart}
              className="border-brand-border text-brand-text-secondary hover:bg-brand-secondary rounded-none px-6 py-5 font-body"
            >
              Clear Cart
            </Button>
          </div>

          <p className="font-body text-xs text-brand-text-secondary text-center pt-4">
            For assistance, reach us on{" "}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-accent underline"
            >
              WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
