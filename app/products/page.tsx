import { getProducts } from "../actions/product-actions"
import ProductGrid from "../components/product-grid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Products</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search products..." className="pl-8" />
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <h3 className="font-medium">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Electronics</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Clothing</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Home & Kitchen</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" className="rounded border-gray-300" />
                <span>Books</span>
              </label>
            </div>

            <h3 className="font-medium pt-2">Price Range</h3>
            <div className="grid grid-cols-2 gap-2">
              <Input type="number" placeholder="Min" />
              <Input type="number" placeholder="Max" />
            </div>
            <Button className="w-full">Apply Filters</Button>
          </div>
        </div>

        <div className="flex-1">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  )
}
