"use server"

import { createServerClient } from "@/lib/supabase"
import type { CartItem } from "../types"

export async function getCartItems(userId: string): Promise<CartItem[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      products (
        id,
        name,
        price,
        image_url,
        category
      )
    `)
    .eq("user_id", userId)

  if (error) {
    console.error("Error fetching cart items:", error)
    return []
  }

  return data.map((item) => ({
    id: item.products?.id || "",
    name: item.products?.name || "",
    price: Number(item.products?.price) || 0,
    imageUrl: item.products?.image_url || "/placeholder.svg?height=300&width=300",
    quantity: item.quantity,
    category: item.products?.category || "Uncategorized",
  }))
}

export async function addToCart(userId: string, item: CartItem) {
  const supabase = createServerClient()

  // Check if item already exists in cart
  const { data: existingItem, error: checkError } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_id", userId)
    .eq("product_id", item.id)
    .single()

  if (checkError && checkError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error checking cart item:", checkError)
    return { error: checkError.message }
  }

  if (existingItem) {
    // Update quantity
    const { error: updateError } = await supabase
      .from("cart_items")
      .update({ quantity: existingItem.quantity + item.quantity })
      .eq("id", existingItem.id)

    if (updateError) {
      console.error("Error updating cart item:", updateError)
      return { error: updateError.message }
    }
  } else {
    // Add new item
    const { error: insertError } = await supabase.from("cart_items").insert({
      user_id: userId,
      product_id: item.id,
      quantity: item.quantity,
    })

    if (insertError) {
      console.error("Error adding cart item:", insertError)
      return { error: insertError.message }
    }
  }

  return { success: true }
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  const supabase = createServerClient()

  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("user_id", userId)
    .eq("product_id", productId)

  if (error) {
    console.error("Error updating cart item quantity:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function removeFromCart(userId: string, productId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", productId)

  if (error) {
    console.error("Error removing cart item:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function clearCart(userId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("cart_items").delete().eq("user_id", userId)

  if (error) {
    console.error("Error clearing cart:", error)
    return { error: error.message }
  }

  return { success: true }
}

export async function syncCartWithServer(userId: string, localCartItems: CartItem[]) {
  // First, clear the server cart
  await clearCart(userId)

  // Then add all local items
  const supabase = createServerClient()

  const cartItems = localCartItems.map((item) => ({
    user_id: userId,
    product_id: item.id,
    quantity: item.quantity,
  }))

  if (cartItems.length === 0) {
    return { success: true }
  }

  const { error } = await supabase.from("cart_items").insert(cartItems)

  if (error) {
    console.error("Error syncing cart:", error)
    return { error: error.message }
  }

  return { success: true }
}
