"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("orderId")
  const [orderNumber, setOrderNumber] = useState("")

  useEffect(() => {
    // Generate a random order number for demo purposes
    setOrderNumber(
      `ORD-${Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0")}`,
    )
  }, [])

  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="flex flex-col items-center space-y-6">
        <div className="rounded-full bg-primary/10 p-3">
          <CheckCircle className="h-12 w-12 text-primary" />
        </div>

        <h1 className="text-3xl font-bold">Order Confirmed!</h1>

        <p className="text-muted-foreground">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        <div className="bg-muted p-6 rounded-lg w-full">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Order Number:</span>
              <span>{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span>{orderId || "Unknown"}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          A confirmation email has been sent to your email address with all the details of your order.
        </p>

        <div className="flex gap-4 pt-4">
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/orders">View Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
