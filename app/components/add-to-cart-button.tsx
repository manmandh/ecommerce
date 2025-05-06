"use client"

import { useState } from "react"
import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../hooks/use-cart"
import type { Product } from "../types"
import { useToast } from "@/components/ui/use-toast"

interface AddToCartButtonProps {
  product: Product
  quantity?: number
}

export default function AddToCartButton({ product, quantity = 1 }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)

    // Simulate a small delay for better UX
    setTimeout(() => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        quantity,
        category: product.category,
      })

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      })

      setIsAdding(false)
    }, 500)
  }

  return (
    <Button onClick={handleAddToCart} disabled={isAdding}>
      <ShoppingCart className="h-4 w-4 mr-2" />
      {isAdding ? "Adding..." : "Add to Cart"}
    </Button>
  )
}
