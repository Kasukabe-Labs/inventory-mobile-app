import { useQuery } from "@tanstack/react-query";
import { API_URL } from "@/constants/api";

export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: string;
  imageUrl: string;
  barcodeUrl: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse {
  success: boolean;
  data: Product[];
}

const fetchProducts = async (): Promise<Product[]> => {
  const response = await fetch(`${API_URL}/api/products/get-all`);
  const data: ApiResponse = await response.json();

  if (!data.success) {
    throw new Error("Failed to load products");
  }

  return data.data;
};

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
