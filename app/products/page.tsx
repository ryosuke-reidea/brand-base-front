import { getAllProducts } from '@/lib/db-queries';
import { ProductsClient } from '@/components/products-client';

export const revalidate = 60;

export default async function ProductsPage() {
  const products = await getAllProducts();

  return <ProductsClient products={products} />;
}
