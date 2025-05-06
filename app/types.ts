export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  category: string
  inStock: boolean
  sku: string
  weight: number
  oldPrice?: number
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  category: string
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shipping: number
  total: number
  paymentMethod: string
  shippingAddress: ShippingAddress
  items: {
    id: string
    name: string
    price: number
    quantity: number
  }[]
  trackingNumber?: string
  createdAt: string
}
