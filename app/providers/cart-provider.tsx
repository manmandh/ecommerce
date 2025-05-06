"use client"

import type React from "react"

import { createContext, useState, useEffect } from "react"
import type { CartItem } from "../types"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/use-toast"

interface CartContextType {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isLoading: boolean
}

export const CartContext = createContext<CartContextType | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  // Load cart from server or localStorage
  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true)

      if (user) {
        // Load from server
        try {
          const { data, error } = await supabase
            .from("cart_items")
            .select(`
              id,
              quantity,
              product_id,
              products (
                id,
                name,
                price,
                image_url,
                category
              )
            `)
            .eq("user_id", user.id)

          if (error) {
            throw error
          }

          const cartItems: CartItem[] = data.map((item) => ({
            id: item.product_id || "",
            name: item.products?.name || "",
            price: Number(item.products?.price) || 0,
            imageUrl: item.products?.image_url || "/placeholder.svg?height=300&width=300",
            quantity: item.quantity,
            category: item.products?.category || "Uncategorized",
          }))

          setItems(cartItems)
        } catch (error) {
          console.error("Error loading cart from server:", error)
          toast({
            title: "Error",
            description: "Failed to load your cart. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        // Load from localStorage
        const storedCart = localStorage.getItem("cart")
        if (storedCart) {
          try {
            setItems(JSON.parse(storedCart))
          } catch (error) {
            console.error("Failed to parse cart from localStorage:", error)
            localStorage.removeItem("cart")
          }
        }
      }

      setIsLoading(false)
    }

    loadCart()
  }, [user, toast])

  // Save cart to localStorage when it changes (for non-logged in users)
  useEffect(() => {
    if (!user && !isLoading) {
      localStorage.setItem("cart", JSON.stringify(items))
    }
  }, [items, user, isLoading])

  // Sync local cart with server when user logs in
  useEffect(() => {
    const syncCart = async () => {
      if (user && !isLoading && items.length > 0) {
        // Check if we have items from localStorage that need to be synced
        const storedCart = localStorage.getItem("cart")
        if (storedCart) {
          try {
            const localItems = JSON.parse(storedCart)

            // Clear server cart first
            const { error: clearError } = await supabase.from("cart_items").delete().eq("user_id", user.id)

            if (clearError) {
              throw clearError
            }

            // Add local items to server
            const cartItems = localItems.map((item: CartItem) => ({
              user_id: user.id,
              product_id: item.id,
              quantity: item.quantity,
            }))

            if (cartItems.length > 0) {
              const { error: insertError } = await supabase.from("cart_items").insert(cartItems)

              if (insertError) {
                throw insertError
              }
            }

            // Clear localStorage cart
            localStorage.removeItem("cart")
          } catch (error) {
            console.error("Error syncing cart with server:", error)
            toast({
              title: "Error",
              description: "Failed to sync your cart. Please try again.",
              variant: "destructive",
            })
          }
        }
      }
    }

    syncCart()
  }, [user, isLoading, items.length, toast])

  const addItem = async (item: CartItem) => {
    if (user) {
      // Add to server
      try {
        // Check if item already exists
        const { data: existingItem, error: checkError } = await supabase
          .from("cart_items")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", item.id)
          .single()

        if (checkError && checkError.code !== "PGRST116") {
          // PGRST116 is "no rows returned"
          throw checkError
        }

        if (existingItem) {
          // Update quantity
          const { error: updateError } = await supabase
            .from("cart_items")
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq("id", existingItem.id)

          if (updateError) {
            throw updateError
          }
        } else {
          // Add new item
          const { error: insertError } = await supabase.from("cart_items").insert({
            user_id: user.id,
            product_id: item.id,
            quantity: item.quantity,
          })

          if (insertError) {
            throw insertError
          }
        }

        // Refresh cart
        const { data, error } = await supabase
          .from("cart_items")
          .select(`
            id,
            quantity,
            product_id,
            products (
              id,
              name,
              price,
              image_url,
              category
            )
          `)
          .eq("user_id", user.id)

        if (error) {
          throw error
        }

        const cartItems: CartItem[] = data.map((item) => ({
          id: item.product_id || "",
          name: item.products?.name || "",
          price: Number(item.products?.price) || 0,
          imageUrl: item.products?.image_url || "/placeholder.svg?height=300&width=300",
          quantity: item.quantity,
          category: item.products?.category || "Uncategorized",
        }))

        setItems(cartItems)
      } catch (error) {
        console.error("Error adding item to cart:", error)
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      // Add to local state
      setItems((prevItems) => {
        const existingItem = prevItems.find((i) => i.id === item.id)

        if (existingItem) {
          // Update quantity if item already exists
          return prevItems.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i))
        } else {
          // Add new item
          return [...prevItems, item]
        }
      })
    }
  }

  const removeItem = async (id: string) => {
    if (user) {
      // Remove from server
      try {
        const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id).eq("product_id", id)

        if (error) {
          throw error
        }

        setItems((prevItems) => prevItems.filter((item) => item.id !== id))
      } catch (error) {
        console.error("Error removing item from cart:", error)
        toast({
          title: "Error",
          description: "Failed to remove item from cart. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      // Remove from local state
      setItems((prevItems) => prevItems.filter((item) => item.id !== id))
    }
  }

  const updateQuantity = async (id: string, quantity: number) => {
    if (user) {
      // Update on server
      try {
        const { error } = await supabase
          .from("cart_items")
          .update({ quantity })
          .eq("user_id", user.id)
          .eq("product_id", id)

        if (error) {
          throw error
        }

        setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
      } catch (error) {
        console.error("Error updating cart item quantity:", error)
        toast({
          title: "Error",
          description: "Failed to update item quantity. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      // Update in local state
      setItems((prevItems) => prevItems.map((item) => (item.id === id ? { ...item, quantity } : item)))
    }
  }

  const clearCart = async () => {
    if (user) {
      // Clear on server
      try {
        const { error } = await supabase.from("cart_items").delete().eq("user_id", user.id)

        if (error) {
          throw error
        }

        setItems([])
      } catch (error) {
        console.error("Error clearing cart:", error)
        toast({
          title: "Error",
          description: "Failed to clear your cart. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      // Clear local state
      setItems([])
    }
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
