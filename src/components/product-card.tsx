import Image from "next/image";
import Link from "next/link";

import { formatPrice, type Product } from "@/lib/catalog";

type ProductCardProps = {
  product: Product;
  sizes: string;
};

export function ProductCard({ product, sizes }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="media media-zoom">
        <Image src={product.image} alt={product.imageAlt} fill sizes={sizes} />
        {product.badge && (
          <span className="absolute top-3 left-3 text-micro uppercase">
            {product.badge}
          </span>
        )}
      </div>
      <div className="product-caption mt-3 flex flex-col gap-0.5 px-1">
        <h3 className="group-hover:underline group-hover:underline-offset-4">
          {product.name}
        </h3>
        <p className="text-muted">{product.detail}</p>
        <p className="mt-1">{formatPrice(product.price)}</p>
      </div>
    </Link>
  );
}
