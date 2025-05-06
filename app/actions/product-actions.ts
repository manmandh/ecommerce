"use server"

import { createServerClient } from "@/lib/supabase"
import type { Product } from "../types"

// Map database product to application product
function mapDbProductToProduct(dbProduct: any): Product {
  return {
    id: dbProduct.id,
    name: dbProduct.name,
    description: dbProduct.description || "",
    price: Number.parseFloat(dbProduct.price),
    imageUrl: dbProduct.image_url || "/placeholder.svg?height=300&width=300",
    category: dbProduct.category || "Uncategorized",
    inStock: dbProduct.in_stock,
    sku: dbProduct.sku || `SKU-${dbProduct.id.substring(0, 8)}`,
    weight: dbProduct.weight || 0,
    oldPrice: dbProduct.old_price ? Number.parseFloat(dbProduct.old_price) : undefined,
    createdAt: dbProduct.created_at,
    updatedAt: dbProduct.updated_at,
  }
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return data.map(mapDbProductToProduct)
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("products").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching product with id ${id}:`, error)
    return undefined
  }

  return mapDbProductToProduct(data)
}

export async function getRelatedProducts(id: string, category: string): Promise<Product[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("products").select("*").eq("category", category).neq("id", id).limit(4)

  if (error) {
    console.error("Error fetching related products:", error)
    return []
  }

  return data.map(mapDbProductToProduct)
}

export async function searchProducts(query: string): Promise<Product[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching products:", error)
    return []
  }

  return data.map(mapDbProductToProduct)
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(`Error fetching products in category ${category}:`, error)
    return []
  }

  return data.map(mapDbProductToProduct)
}
