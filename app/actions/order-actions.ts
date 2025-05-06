"use server"

import { createServerClient } from "@/lib/supabase"
import type { CartItem, Order, ShippingAddress } from "../types"

interface OrderData {
  items: CartItem[]
  shippingAddress: ShippingAddress
  paymentMethod: string
  subtotal: number
  shipping: number
  total: number
  userId?: string
}

export async function createOrder(orderData: OrderData): Promise<Order> {
  const supabase = createServerClient()

  // Generate a unique order number
  const orderNumber = `ORD-${Date.now().toString().slice(-8)}`

  // Get the user ID from the session if available
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id || orderData.userId || null

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: "pending",
      subtotal: orderData.subtotal,
      shipping: orderData.shipping,
      total: orderData.total,
      payment_method: orderData.paymentMethod,
      shipping_address: orderData.shippingAddress,
    })
    .select()
    .single()

  if (orderError) {
    console.error("Error creating order:", orderError)
    throw new Error("Failed to create order")
  }

  // Create order items
  const orderItems = orderData.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
  }))

  const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

  if (itemsError) {
    console.error("Error creating order items:", itemsError)
    throw new Error("Failed to create order items")
  }

  // Clear the user's cart if they're logged in
  if (userId) {
    const { error: clearCartError } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (clearCartError) {
      console.error("Error clearing cart after order:", clearCartError)
    }
  }

  // Return the created order
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    paymentMethod: order.payment_method || "",
    shippingAddress: order.shipping_address as ShippingAddress,
    items: orderData.items.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
    createdAt: order.created_at,
  }
}

export async function getOrders(): Promise<Order[]> {
  const supabase = createServerClient()

  // Get the user ID from the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    return []
  }

  // Get all orders for the user
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false })

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
    return []
  }

  // Get order items for each order
  const orderIds = orders.map((order) => order.id)

  if (orderIds.length === 0) {
    return []
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .in("order_id", orderIds)

  if (itemsError) {
    console.error("Error fetching order items:", itemsError)
    return []
  }

  // Map orders with their items
  return orders.map((order) => {
    const items = orderItems
      .filter((item) => item.order_id === order.id)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
      }))

    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      paymentMethod: order.payment_method || "",
      shippingAddress: order.shipping_address as ShippingAddress,
      items,
      trackingNumber: order.tracking_number || undefined,
      createdAt: order.created_at,
    }
  })
}

export async function getOrderById(id: string): Promise<Order | null> {
  const supabase = createServerClient()

  // Get the order
  const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", id).single()

  if (orderError) {
    console.error(`Error fetching order with id ${id}:`, orderError)
    return null
  }

  // Get the order items
  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id)

  if (itemsError) {
    console.error(`Error fetching items for order ${id}:`, itemsError)
    return null
  }

  // Map the order with its items
  return {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    total: Number(order.total),
    paymentMethod: order.payment_method || "",
    shippingAddress: order.shipping_address as ShippingAddress,
    items: orderItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
    trackingNumber: order.tracking_number || undefined,
    createdAt: order.created_at,
  }
}
