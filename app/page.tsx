import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductGrid from "./components/product-grid";
import { getProducts } from "./actions/product-actions";
import ChatwootWidget from "@/components/ChatwootWidget";

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="container mx-auto px-4 py-8">
      <ChatwootWidget />
      <section className="py-12 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Welcome to ShopEase
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing products at unbeatable prices. Shop with
            confidence.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg">
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <h2 className="text-2xl font-bold mb-8">Featured Products</h2>
        <ProductGrid products={products.slice(0, 4)} />
      </section>

      <section className="py-12 bg-muted rounded-lg p-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="font-medium">✓ Free Shipping</span>
                <span className="ml-2 text-muted-foreground">
                  on orders over $50
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-medium">✓ Secure Payments</span>
                <span className="ml-2 text-muted-foreground">
                  protected by encryption
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-medium">✓ 30-Day Returns</span>
                <span className="ml-2 text-muted-foreground">
                  hassle-free return policy
                </span>
              </li>
              <li className="flex items-start">
                <span className="font-medium">✓ 24/7 Support</span>
                <span className="ml-2 text-muted-foreground">
                  we're always here to help
                </span>
              </li>
            </ul>
          </div>
          <div className="bg-background p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-medium mb-4">
              Subscribe to our Newsletter
            </h3>
            <p className="text-muted-foreground mb-4">
              Get the latest updates on new products and upcoming sales.
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
