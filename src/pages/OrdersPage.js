import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserOrders } from "@/lib/supabaseApi";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, ExternalLink, FileText, X, Download } from "lucide-react";

// ─── Invoice Modal ──────────────────────────────────────
function InvoiceModal({ order, onClose }) {
  const printRef = useRef();
  const handlePrint = () => {
    const content = printRef.current.innerHTML;
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Invoice #${order.id?.slice(0,8).toUpperCase()}</title>
      <style>*{box-sizing:border-box}body{font-family:Arial,sans-serif;padding:30px;color:#111;font-size:14px}h2{margin:0 0 4px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #e0e0e0;padding:10px;text-align:left}th{background:#f5f5f5;font-weight:600}.total-row td{font-weight:bold;font-size:16px}.footer{margin-top:24px;text-align:center;color:#999;font-size:12px}</style>
      </head><body>${content}<script>setTimeout(()=>{window.print();window.close();},300);</script></body></html>`);
    w.document.close();
  };
  const addr = order.shipping_address || {};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-heading text-lg text-brand-text-primary flex items-center gap-2"><FileText className="w-5 h-5 text-brand-accent" />Order Invoice</h3>
          <div className="flex gap-2">
            <Button size="sm" onClick={handlePrint} className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none gap-2 font-body">
              <Download className="w-4 h-4" />Print / PDF
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="rounded-none"><X className="w-4 h-4" /></Button>
          </div>
        </div>
        <div ref={printRef} className="p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-heading text-2xl font-light text-brand-text-primary">M M Attarwala</h2>
              <p className="font-body text-sm text-brand-text-secondary">Premium Fragrances</p>
            </div>
            <div className="text-right">
              <p className="font-body text-xs uppercase tracking-widest text-brand-text-secondary">Invoice</p>
              <p className="font-heading text-lg text-brand-text-primary">#{order.id?.slice(0,8).toUpperCase()}</p>
              <p className="font-body text-sm text-brand-text-secondary">{new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
            </div>
          </div>
          {addr.name && (
            <div className="p-4 bg-brand-secondary border border-brand-border">
              <p className="font-body text-xs uppercase tracking-widest text-brand-text-secondary mb-2">Bill To</p>
              <p className="font-body font-medium text-brand-text-primary">{addr.name}</p>
              <p className="font-body text-sm text-brand-text-secondary">{addr.phone}</p>
              <p className="font-body text-sm text-brand-text-secondary">{addr.address_line}, {addr.city}, {addr.state} – {addr.pincode}</p>
            </div>
          )}
          <table className="w-full text-sm border border-brand-border">
            <thead className="bg-brand-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-body text-xs uppercase tracking-wider text-brand-text-secondary">Item</th>
                <th className="px-4 py-3 text-right font-body text-xs uppercase tracking-wider text-brand-text-secondary">Qty</th>
                <th className="px-4 py-3 text-right font-body text-xs uppercase tracking-wider text-brand-text-secondary">Price</th>
                <th className="px-4 py-3 text-right font-body text-xs uppercase tracking-wider text-brand-text-secondary">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {(order.items || []).map((item, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 font-body font-medium text-brand-text-primary">
                    {item.name}{item.size ? <span className="ml-1 text-xs text-brand-accent font-normal">({item.size})</span> : ""}
                  </td>
                  <td className="px-4 py-3 text-right font-body text-brand-text-secondary">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-body text-brand-text-secondary">₹{item.price?.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3 text-right font-body font-medium text-brand-text-primary">₹{(item.price * item.quantity)?.toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-brand-secondary">
              <tr><td colSpan={3} className="px-4 py-2 text-right font-body text-sm text-brand-text-secondary">Subtotal</td><td className="px-4 py-2 text-right font-body text-sm">₹{order.subtotal?.toLocaleString("en-IN")}</td></tr>
              <tr><td colSpan={3} className="px-4 py-2 text-right font-body text-sm text-brand-text-secondary">Shipping</td><td className="px-4 py-2 text-right font-body text-sm">{order.shipping === 0 ? "Free" : `₹${order.shipping}`}</td></tr>
              <tr className="border-t-2 border-brand-border"><td colSpan={3} className="px-4 py-3 text-right font-body font-bold text-brand-text-primary">Total</td><td className="px-4 py-3 text-right font-heading text-lg text-brand-primary">₹{order.total?.toLocaleString("en-IN")}</td></tr>
            </tfoot>
          </table>
          <div className="flex justify-between text-sm font-body text-brand-text-secondary">
            <div><p className="font-medium text-brand-text-primary mb-0.5">Payment</p><p className="uppercase">{order.payment_method || "COD"}</p></div>
            <div className="text-right"><p className="font-medium text-brand-text-primary mb-0.5">Status</p><p className="capitalize">{order.status}</p></div>
          </div>
          <p className="text-center font-body text-xs text-brand-text-secondary pt-4 border-t border-brand-border">Thank you for shopping with M M Attarwala!</p>
        </div>
      </div>
    </div>
  );
}

const statusConfig = {
  pending:    { label: "Order Placed",   color: "bg-yellow-50 text-yellow-700 border-yellow-200",   icon: Clock,         step: 1 },
  confirmed:  { label: "Confirmed",      color: "bg-blue-50 text-blue-700 border-blue-200",          icon: CheckCircle,   step: 2 },
  processing: { label: "Processing",     color: "bg-indigo-50 text-indigo-700 border-indigo-200",    icon: Package,       step: 3 },
  shipped:    { label: "Shipped",        color: "bg-purple-50 text-purple-700 border-purple-200",    icon: Truck,         step: 4 },
  delivered:  { label: "Delivered",      color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle,   step: 5 },
  cancelled:  { label: "Cancelled",      color: "bg-red-50 text-red-700 border-red-200",             icon: XCircle,       step: 0 },
};

const trackSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

function TrackingBar({ status }) {
  if (status === "cancelled") return (
    <div className="flex items-center gap-2 py-2">
      <XCircle className="w-4 h-4 text-red-500" />
      <span className="font-body text-sm text-red-600">Order Cancelled</span>
    </div>
  );
  const currentStep = statusConfig[status]?.step || 1;
  return (
    <div className="py-3">
      <div className="flex items-center gap-0">
        {trackSteps.map((s, idx) => {
          const cfg = statusConfig[s];
          const done = cfg.step <= currentStep;
          const active = cfg.step === currentStep;
          return (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className={`relative flex flex-col items-center`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-brand-primary border-brand-primary" : "bg-white border-brand-border"}`}>
                  {done ? <CheckCircle className="w-3.5 h-3.5 text-white" /> : <div className="w-2 h-2 rounded-full bg-brand-border" />}
                </div>
                <span className={`absolute top-8 font-body text-[9px] whitespace-nowrap ${active ? "text-brand-primary font-bold" : done ? "text-brand-text-secondary" : "text-brand-border"}`}>
                  {cfg.label}
                </span>
              </div>
              {idx < trackSteps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 transition-all ${statusConfig[trackSteps[idx+1]].step <= currentStep ? "bg-brand-primary" : "bg-brand-border"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderCard({ order, onInvoice }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = cfg.icon;

  return (
    <div className="border border-brand-border bg-brand-surface">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5">
        <div>
          <p className="font-body text-xs text-brand-text-secondary">Order #{order.id?.slice(0, 8).toUpperCase()}</p>
          <p className="font-body text-xs text-brand-text-secondary">{new Date(order.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase border ${cfg.color}`}>
            <StatusIcon className="w-3 h-3" />{cfg.label}
          </span>
          <span className="font-heading text-lg text-brand-text-primary">₹{order.total?.toLocaleString("en-IN")}</span>
          <button onClick={() => setExpanded(!expanded)} className="text-brand-text-secondary hover:text-brand-primary transition-colors">
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Tracking Bar */}
      <div className="px-4 sm:px-5 pb-1">
        <TrackingBar status={order.status} />
      </div>

      {/* Tracking Info */}
      {order.tracking_number && (
        <div className="mx-4 sm:mx-5 mb-3 mt-8 p-3 bg-purple-50 border border-purple-100 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-body text-xs text-purple-700 font-bold uppercase tracking-wider">Tracking Number</p>
            <p className="font-body text-sm text-purple-800 font-medium">{order.tracking_number}</p>
            {order.estimated_delivery && (
              <p className="font-body text-xs text-purple-600">Est. Delivery: {order.estimated_delivery}</p>
            )}
          </div>
          {order.tracking_url && (
            <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 underline font-body">
              Track Package <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Invoice Button */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-4">
          <Button size="sm" variant="outline" onClick={() => onInvoice(order)} className="rounded-none font-body gap-2 text-xs">
            <FileText className="w-3.5 h-3.5" />Download Invoice
          </Button>
        </div>
      )}

      {/* Expanded: Items + Address */}
      {expanded && (
        <div className="border-t border-brand-border px-4 sm:px-5 py-4 space-y-4">
          <div className="space-y-2">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="w-12 h-12 object-cover bg-brand-secondary shrink-0 border border-brand-border" />
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`} className="font-body text-sm font-medium text-brand-text-primary hover:text-brand-accent transition-colors">
                    {item.name}
                  </Link>
                  <p className="font-body text-xs text-brand-text-secondary">Qty: {item.quantity} · ₹{item.price?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
          <Separator className="bg-brand-border" />
          <div className="flex flex-wrap justify-between gap-4">
            {order.shipping_address && (
              <div>
                <p className="font-body text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-1">Shipping To</p>
                <p className="font-body text-sm text-brand-text-primary">{order.shipping_address.name}</p>
                <p className="font-body text-xs text-brand-text-secondary">{order.shipping_address.address_line}, {order.shipping_address.city}, {order.shipping_address.state} – {order.shipping_address.pincode}</p>
                {order.shipping_address.phone && <p className="font-body text-xs text-brand-text-secondary">{order.shipping_address.phone}</p>}
              </div>
            )}
            <div className="text-right">
              <p className="font-body text-xs font-bold uppercase tracking-wider text-brand-text-secondary mb-1">Summary</p>
              <p className="font-body text-xs text-brand-text-secondary">Subtotal: ₹{order.subtotal?.toLocaleString("en-IN")}</p>
              <p className="font-body text-xs text-brand-text-secondary">Shipping: {order.shipping === 0 ? "Free" : `₹${order.shipping}`}</p>
              <p className="font-body text-sm font-bold text-brand-text-primary mt-1">Total: ₹{order.total?.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [invoiceOrder, setInvoiceOrder] = useState(null);

  useEffect(() => {
    if (!loading && !user) { navigate("/login"); return; }
    if (user) {
      getUserOrders()
        .then(setOrders)
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [user, loading, navigate]);

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="mb-10 flex items-start justify-between gap-4">
          <div>
            <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-accent mb-2">Your Account</p>
            <h1 className="font-heading text-3xl sm:text-4xl tracking-tight text-brand-text-primary font-light">Order History</h1>
          </div>
          <Link to="/profile" className="font-body text-sm text-brand-text-secondary hover:text-brand-accent transition-colors mt-2">
            ← Back to Profile
          </Link>
        </div>

        {fetching ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="shimmer h-24" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 mx-auto text-brand-border mb-6" />
            <h2 className="font-heading text-2xl text-brand-text-primary font-light mb-3">No Orders Yet</h2>
            <p className="font-body text-sm text-brand-text-secondary mb-8">Start exploring our premium fragrance collection.</p>
            <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body">
              <Link to="/shop">Shop Now</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-body text-sm text-brand-text-secondary">{orders.length} order{orders.length !== 1 ? "s" : ""} — click any order to expand details</p>
            {orders.map(order => <OrderCard key={order.id} order={order} onInvoice={setInvoiceOrder} />)}
          </div>
        )}
        {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
      </div>
    </div>
  );
}
