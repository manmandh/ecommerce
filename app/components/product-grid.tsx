"use client"

import Link from "next/link"
import Image from "next/image"
import type { Product } from "../types"
import { formatPrice } from "../lib/utils"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import { useCart } from "../hooks/use-cart"
import { useToast } from "@/components/ui/use-toast"

interface ProductGridProps {
  products: Product[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product: Product) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: 1,
      category: product.category,
    })

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          <Link href={`/products/${product.id}`} className="block aspect-square overflow-hidden">
            <Image
              src={product.imageUrl || "/placeholder.svg"}
              alt={product.name}
              width={300}
              height={300}
              className="object-cover w-full h-full transition-transform group-hover:scale-105"
            />
          </Link>
          <div className="p-4">
            <h3 className="font-medium text-lg truncate">
              <Link href={`/products/${product.id}`}>{product.name}</Link>
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 h-10 mb-2">{product.description}</p>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{formatPrice(product.price)}</span>
              <Button size="sm" variant="outline" onClick={() => handleAddToCart(product)}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
