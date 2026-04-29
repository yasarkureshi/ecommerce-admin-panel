import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ArrowLeft, ShoppingBag, CheckCircle, Tag } from "lucide-react";
import { createOrder, validateCoupon } from "@/lib/supabaseApi";

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || "", phone: user?.phone || "", address_line: "", city: "", state: "", pincode: "",
  });

  if (cartItems.length === 0 && !orderPlaced) {
    navigate("/cart");
    return null;
  }

  const discount = coupon
    ? coupon.discount_type === "percent"
      ? Math.round(cartTotal * coupon.discount_value / 100)
      : coupon.discount_value
    : 0;
  const finalTotal = Math.max(0, cartTotal - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const offer = await validateCoupon(couponCode, cartTotal);
      setCoupon(offer);
      toast.success(`Coupon applied! ${offer.discount_type === "percent" ? `${offer.discount_value}% off` : `₹${offer.discount_value} off`}`);
    } catch(err) {
      toast.error(err.message || "Invalid coupon");
      setCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.name || !address.phone || !address.address_line || !address.city || !address.pincode) {
      toast.error("Please fill all required address fields");
      return;
    }
    setProcessing(true);
    try {
      const orderData = {
        user_name: user?.name || address.name,
        user_email: user?.email || "",
        items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, size: i.size, image: i.image })),
        subtotal: cartTotal,
        shipping: 0,
        total: finalTotal,
        shipping_address: address,
        payment_method: "cod",
        status: "pending",
      };

      const order = await createOrder(orderData);
      setOrderId(order.id);
      clearCart();
      setOrderPlaced(true);
      toast.success("Order placed successfully!");
    } catch(err) {
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (orderPlaced) {
    return (
      <div data-testid="order-success" className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="font-heading text-3xl text-brand-text-primary font-light mb-3">Order Confirmed!</h1>
          {orderId && <p className="font-body text-xs text-brand-text-secondary mb-1">Order #{orderId.slice(0,8).toUpperCase()}</p>}
          <p className="font-body text-base text-brand-text-secondary mb-8">
            Thank you! We'll contact you on WhatsApp with delivery details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body">
              <Link to="/orders">View My Orders</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-none px-8 py-4 font-body border-brand-border">
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="checkout-page" className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-12">
        <button onClick={() => navigate("/cart")} className="inline-flex items-center gap-2 text-brand-text-secondary hover:text-brand-primary font-body text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </button>

        <h1 className="font-heading text-3xl sm:text-4xl tracking-tight text-brand-text-primary font-light mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Shipping Address */}
          <div className="lg:col-span-3 space-y-6" data-testid="shipping-form">
            <h2 className="font-heading text-xl text-brand-text-primary">Shipping Address</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input placeholder="Full Name *" value={address.name} onChange={e=>setAddress({...address,name:e.target.value})} className="rounded-none border-brand-border font-body py-5" required data-testid="checkout-name" />
              <Input placeholder="Phone Number *" value={address.phone} onChange={e=>setAddress({...address,phone:e.target.value})} className="rounded-none border-brand-border font-body py-5" required data-testid="checkout-phone" />
            </div>
            <Input placeholder="Address Line *" value={address.address_line} onChange={e=>setAddress({...address,address_line:e.target.value})} className="rounded-none border-brand-border font-body py-5" required data-testid="checkout-address" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input placeholder="City *" value={address.city} onChange={e=>setAddress({...address,city:e.target.value})} className="rounded-none border-brand-border font-body py-5" required data-testid="checkout-city" />
              <Input placeholder="State" value={address.state} onChange={e=>setAddress({...address,state:e.target.value})} className="rounded-none border-brand-border font-body py-5" data-testid="checkout-state" />
              <Input placeholder="PIN Code *" value={address.pincode} onChange={e=>setAddress({...address,pincode:e.target.value})} className="rounded-none border-brand-border font-body py-5" required data-testid="checkout-pincode" />
            </div>

            {/* Coupon Code */}
            <div className="border border-brand-border p-4 bg-brand-surface">
              <p className="font-body text-sm font-medium text-brand-text-primary mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-brand-accent" /> Apply Coupon
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={e=>setCouponCode(e.target.value.toUpperCase())}
                  className="rounded-none border-brand-border font-body uppercase"
                />
                <Button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode} variant="outline" className="rounded-none border-brand-border font-body shrink-0">
                  {couponLoading ? "..." : "Apply"}
                </Button>
              </div>
              {coupon && (
                <div className="flex items-center justify-between mt-2">
                  <p className="font-body text-xs text-emerald-600 font-medium">
                    {coupon.title} — {coupon.discount_type === "percent" ? `${coupon.discount_value}% off` : `₹${coupon.discount_value} off`}
                  </p>
                  <button onClick={() => { setCoupon(null); setCouponCode(""); }} className="text-xs text-red-500 font-body">Remove</button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="border border-brand-border p-6 bg-brand-surface sticky top-24" data-testid="order-summary">
              <h2 className="font-heading text-xl text-brand-text-primary mb-4">Order Summary</h2>
              <div className="space-y-3 mb-4">
                {cartItems.map(item => (
                  <div key={item.cartKey || item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover bg-brand-secondary shrink-0 border border-brand-border" />
                      <div className="min-w-0">
                        <p className="font-body text-sm text-brand-text-primary truncate">{item.name}</p>
                        <p className="font-body text-xs text-brand-text-secondary">
                          {item.size && <span className="font-semibold text-brand-accent mr-1">{item.size}</span>}
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-body text-sm font-semibold text-brand-text-primary shrink-0 ml-2">
                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="bg-brand-border my-4" />
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="font-body text-sm text-brand-text-secondary">Subtotal</span>
                  <span className="font-body text-sm text-brand-text-primary">₹{cartTotal.toLocaleString("en-IN")}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="font-body text-sm text-emerald-600">Discount ({coupon?.code})</span>
                    <span className="font-body text-sm text-emerald-600">−₹{discount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="font-body text-sm text-brand-text-secondary">Shipping</span>
                  <span className="font-body text-sm text-emerald-600">Free</span>
                </div>
              </div>
              <Separator className="bg-brand-border mb-4" />
              <div className="flex justify-between mb-6">
                <span className="font-heading text-lg text-brand-text-primary">Total</span>
                <span className="font-heading text-lg text-brand-text-primary" data-testid="checkout-total">
                  ₹{finalTotal.toLocaleString("en-IN")}
                </span>
              </div>
              <Button
                data-testid="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none py-5 text-base font-body tracking-wide"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {processing ? "Processing..." : "Place Order"}
              </Button>
              <p className="font-body text-xs text-brand-text-secondary text-center mt-3">
                Payment will be arranged via WhatsApp after order.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
