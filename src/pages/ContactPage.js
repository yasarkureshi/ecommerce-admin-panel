import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { submitMessage } from "@/lib/supabaseApi";
import { MapPin, Phone, Mail } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    try {
      await submitMessage(form);
      toast.success("Message sent! We'll get back to you soon.");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div data-testid="contact-page" className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-text-secondary mb-3">
            Get in Touch
          </p>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl tracking-tight text-brand-text-primary font-light">
            Contact Us
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Form */}
          <div data-testid="contact-form">
            <h2 className="font-heading text-xl text-brand-text-primary mb-6">
              Send Us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  data-testid="contact-name-input"
                  placeholder="Your Name *"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-none border-brand-border font-body"
                  required
                />
                <Input
                  data-testid="contact-email-input"
                  placeholder="Email Address *"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-none border-brand-border font-body"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  data-testid="contact-phone-input"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-none border-brand-border font-body"
                />
                <Input
                  data-testid="contact-subject-input"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="rounded-none border-brand-border font-body"
                />
              </div>
              <Textarea
                data-testid="contact-message-input"
                placeholder="Your Message *"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="rounded-none border-brand-border font-body min-h-[150px]"
                required
              />
              <Button
                type="submit"
                data-testid="contact-submit-btn"
                disabled={submitting}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-8 py-4 font-body text-base"
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h2 className="font-heading text-xl text-brand-text-primary mb-6">
              Other Ways to Reach Us
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-secondary flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-body text-sm font-semibold text-brand-text-primary mb-1">Location</h3>
                  <p className="font-body text-sm text-brand-text-secondary">
                    Gujarat & Maharashtra, India
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-secondary flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-body text-sm font-semibold text-brand-text-primary mb-1">WhatsApp</h3>
                  <a
                    href="https://wa.me/919876543210"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-body text-sm text-brand-accent hover:underline"
                  >
                    +91 98765 43210
                  </a>
                  <p className="font-body text-xs text-brand-text-secondary mt-1">
                    Available Mon-Sat, 10 AM - 7 PM
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-brand-secondary flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-body text-sm font-semibold text-brand-text-primary mb-1">Email</h3>
                  <a
                    href="mailto:info@mmattarwala.com"
                    className="font-body text-sm text-brand-accent hover:underline"
                  >
                    info@mmattarwala.com
                  </a>
                  <p className="font-body text-xs text-brand-text-secondary mt-1">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <div className="bg-brand-secondary p-8 border border-brand-border">
              <h3 className="font-heading text-lg text-brand-text-primary mb-2">
                Need Quick Help?
              </h3>
              <p className="font-body text-sm text-brand-text-secondary mb-4">
                Chat with us on WhatsApp for instant assistance with your orders or fragrance recommendations.
              </p>
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%20need%20help%20with%20my%20order"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="contact-whatsapp-btn"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 text-sm font-body font-semibold hover:opacity-90 transition-opacity"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
