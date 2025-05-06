"use client"

import { useState, useEffect } from "react"
import { notFound, useParams, useRouter } from "next/navigation"
import { formatPrice } from "../../lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { ArrowLeft, Package, Truck } from "lucide-react"
import { useAuth } from "../../providers/auth-provider"
import { supabase } from "@/lib/supabase"
import type { Order } from "../../types"
import { useToast } from "@/components/ui/use-toast"

export default function OrderDetailsPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user) {
        router.push("/auth/signin?callbackUrl=" + encodeURIComponent(`/order-details/${params.id}`))
        return
      }

      try {
        // Get the order
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single()

        if (orderError) {
          if (orderError.code === "PGRST116") {
            // Order not found or doesn't belong to user
            return notFound()
          }
          throw orderError
        }

        // Get the order items
        const { data: orderItems, error: itemsError } = await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderData.id)

        if (itemsError) {
          throw itemsError
        }

        // Map the order with its items
        const mappedOrder: Order = {
          id: orderData.id,
          orderNumber: orderData.order_number,
          status: orderData.status,
          subtotal: Number(orderData.subtotal),
          shipping: Number(orderData.shipping),
          total: Number(orderData.total),
          paymentMethod: orderData.payment_method || "",
          shippingAddress: orderData.shipping_address,
          items: orderItems.map((item) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
          })),
          trackingNumber: orderData.tracking_number || undefined,
          createdAt: orderData.created_at,
        }

        setOrder(mappedOrder)
      } catch (error) {
        console.error(`Error fetching order with id ${params.id}:`, error)
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [params.id, user, router, toast])

  if (!user) {
    return null // Redirect happens in useEffect
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Order Details</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading order details...</div>
        </div>
      </div>
    )
  }

  if (!order) {
    return notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" size="icon" asChild>
          <Link href="/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Order Details</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <div className="border rounded-lg overflow-hidden">
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
              <h3 className="font-medium mb-4">Items</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">Quantity: {item.quantity}</div>
                    </div>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {order.trackingNumber && (
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="h-5 w-5" />
                <h3 className="font-medium">Shipping Information</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking Number:</span>
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carrier:</span>
                  <span>Demo Shipping Co.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" size="sm">
                  Track Package
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Shipping Address</h3>
            <div className="space-y-1">
              <p>
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-4">Payment Method</h3>
            <p>{order.paymentMethod}</p>
          </div>

          <Button variant="outline" className="w-full" asChild>
            <Link href="/contact">Need Help?</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
