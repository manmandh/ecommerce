"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../hooks/use-cart"
import type { Product } from "../types"
import { useToast } from "@/components/ui/use-toast"

interface ProductActionsProps {
  product: Product
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { addItem } = useCart()
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1))
  }

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1)
  }

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
    <div className="pt-4">
      <div className="flex items-center space-x-4 mb-4">
        <Button variant="outline" size="icon" onClick={decreaseQuantity}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="font-medium">{quantity}</span>
        <Button variant="outline" size="icon" onClick={increaseQuantity}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex space-x-4">
        <Button onClick={handleAddToCart} disabled={isAdding} className="flex-1">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isAdding ? "Adding..." : "Add to Cart"}
        </Button>
        <Button variant="outline">Add to Wishlist</Button>
      </div>
    </div>
  )
}
