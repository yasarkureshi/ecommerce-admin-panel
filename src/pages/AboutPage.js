import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      {/* Hero */}
      <section className="py-16 sm:py-24 lg:py-32 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-3xl">
            <p className="font-body text-xs tracking-[0.2em] uppercase font-bold text-brand-text-secondary mb-4">
              Our Story
            </p>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl tracking-tight text-brand-text-primary font-light leading-tight mb-6">
              Crafting Fragrances <br />
              <span className="italic text-brand-accent">Since Generations</span>
            </h1>
            <p className="font-body text-base sm:text-lg text-brand-text-secondary leading-relaxed">
              M M Attarwala is a trusted fragrance house rooted in the rich heritage of Indian
              perfumery. We are not a trendy brand — we are a mature, quality-focused house that
              believes in the power of an honest, well-crafted fragrance.
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <img
              src="https://images.pexels.com/photos/8450466/pexels-photo-8450466.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
              alt="Fragrance craftsmanship"
              className="w-full h-auto object-cover max-h-[500px]"
            />
            <div className="space-y-6">
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight text-brand-text-primary font-light">
                The M M Attarwala Tradition
              </h2>
              <p className="font-body text-base text-brand-text-secondary leading-relaxed">
                Our journey began in the fragrance capital of India, where the art of attar-making
                has been practiced for centuries. Through generations, our family has preserved and
                perfected the traditional methods of distillation, while embracing the finest raw
                materials from across India.
              </p>
              <p className="font-body text-base text-brand-text-secondary leading-relaxed">
                From the sacred sandalwood of Mysore to the exquisite roses of Kannauj, from the
                rare saffron of Kashmir to the aged oud of Assam — every ingredient in our collection
                is carefully sourced and artfully blended.
              </p>
              <p className="font-body text-base text-brand-text-secondary leading-relaxed">
                Today, we serve discerning customers across Gujarat and Maharashtra who value
                authenticity over trends, and quality over quantity. Our curated selection of
                12-18 fragrances represents the very best of what Indian perfumery has to offer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator className="max-w-7xl mx-auto bg-brand-border" />

      {/* Values */}
      <section className="py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl tracking-tight text-brand-text-primary font-light text-center mb-12 sm:mb-16">
            What We Stand For
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                title: "Uncompromised Quality",
                desc: "We never cut corners. Every fragrance undergoes rigorous quality checks before it reaches you. If it doesn't meet our standards, it doesn't leave our workshop.",
              },
              {
                title: "Honest Pricing",
                desc: "No inflated MRPs, no deceptive discounts. Our prices reflect the true value of the ingredients and craftsmanship that go into each bottle.",
              },
              {
                title: "Customer First",
                desc: "Your satisfaction is our priority. From WhatsApp support to hassle-free returns, we ensure your experience with us is as pleasant as our fragrances.",
              },
            ].map((v) => (
              <div key={v.title} className="bg-brand-surface border border-brand-border p-8 sm:p-10 space-y-4">
                <h3 className="font-heading text-xl text-brand-text-primary">{v.title}</h3>
                <p className="font-body text-sm text-brand-text-secondary leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 bg-brand-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl tracking-tight text-brand-text-primary font-light mb-4">
            Experience the Difference
          </h2>
          <p className="font-body text-base text-brand-text-secondary mb-8 max-w-lg mx-auto">
            Discover why thousands of customers trust M M Attarwala for their fragrance needs.
          </p>
          <Button asChild data-testid="about-shop-cta" className="bg-brand-primary text-white hover:bg-brand-primary-hover rounded-none px-10 py-6 text-base font-body">
            <Link to="/shop">
              Explore Our Collection <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
