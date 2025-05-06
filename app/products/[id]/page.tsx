import Image from "next/image"
import { notFound } from "next/navigation"
import { getProductById, getRelatedProducts } from "../../actions/product-actions"
import { formatPrice } from "../../lib/utils"
import ProductGrid from "../../components/product-grid"
import ProductActions from "../../components/product-actions"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.id)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getRelatedProducts(product.id, product.category)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-muted-foreground">{product.category}</p>
          </div>

          <div>
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="ml-2 text-muted-foreground line-through">{formatPrice(product.oldPrice)}</span>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <ProductActions product={product} />

          <div className="border-t pt-6 mt-6">
            <h3 className="font-medium mb-2">Product Details</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex">
                <span className="font-medium w-24">SKU:</span>
                <span className="text-muted-foreground">{product.sku}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-24">Availability:</span>
                <span className="text-muted-foreground">{product.inStock ? "In Stock" : "Out of Stock"}</span>
              </li>
              <li className="flex">
                <span className="font-medium w-24">Weight:</span>
                <span className="text-muted-foreground">{product.weight}g</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t pt-12">
        <h2 className="text-2xl font-bold mb-8">Related Products</h2>
        <ProductGrid products={relatedProducts} />
      </div>
    </div>
  )
}
