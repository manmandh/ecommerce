"use client"

import { useState, useEffect } from "react"
import { formatPrice } from "../lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { Package } from "lucide-react"
import { useAuth } from "../providers/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Order } from "../types"
import { useToast } from "@/components/ui/use-toast"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setOrders([])
        setLoading(false)
        return
      }

      try {
        // Get all orders for the user
        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (ordersError) {
          throw ordersError
        }

        if (!ordersData || ordersData.length === 0) {
          setOrders([])
          setLoading(false)
          return
        }

        // Get order items for each order
        const orderIds = ordersData.map((order) => order.id)

        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .in("order_id", orderIds)

        if (itemsError) {
          throw itemsError
        }

        // Map orders with their items
        const mappedOrders = ordersData.map((order) => {
          const items = (orderItems || [])
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
            shippingAddress: order.shipping_address,
            items,
            trackingNumber: order.tracking_number || undefined,
            createdAt: order.created_at,
          }
        })

        setOrders(mappedOrders)
      } catch (error) {
        console.error("Error fetching orders:", error)
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [user, toast])

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">Sign In to View Orders</h1>
        <p className="text-muted-foreground mb-8">Please sign in to view your order history.</p>
        <Button asChild>
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading your orders...</div>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">No Orders Found</h1>
        <p className="text-muted-foreground mb-8">You haven't placed any orders yet.</p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

      <div className="space-y-8">
        {orders.map((order) => (
          <div key={order.id} className="border rounded-lg overflow-hidden">
            <div className="bg-muted/50 p-4 flex flex-col sm:flex-row justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Order #{order.orderNumber}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-2 sm:mt-0 flex flex-col sm:items-end">
                <div className="font-medium">{formatPrice(order.total)}</div>
                <div className="text-sm">
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs ${
                      order.status === "delivered" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4">
              <h3 className="font-medium mb-2">Items</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span>{item.name}</span>
                      <span className="text-muted-foreground"> × {item.quantity}</span>
                    </div>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/order-details/${order.id}`}>View Details</Link>
                </Button>
                {order.trackingNumber && (
                  <Button variant="ghost" size="sm">
                    Track Package
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
