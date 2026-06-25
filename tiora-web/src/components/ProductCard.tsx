"use client";

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { usePathname } from 'next/navigation';
import HoverImageCarousel from './HoverImageCarousel';

interface Product {
  id: string;
  name: string;
  description: string;
  price?: number;
  basePrice?: number;
  salePrice?: number;
  imageUrl: string;
  images?: string[];
  categorySlug: string;
  isCustomizable?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  const basePrice = product.basePrice ?? product.price ?? 0;
  const salePrice = product.salePrice ?? product.price ?? 0;
  
  // Active price to display
  const activePrice = salePrice > 0 && salePrice < basePrice ? salePrice : basePrice;
  const originalPrice = basePrice;
  
  // Calculate discount percentage automatically
  const discount = originalPrice > 0 && activePrice < originalPrice
    ? Math.round(((originalPrice - activePrice) / originalPrice) * 100)
    : 0;

  const pathname = usePathname();
  const isWishlisted = useWishlistStore((state) => state.items.some((item) => item.productId === Number(product.id)));
  const addItem = useWishlistStore((state) => state.addItem);
  const removeItem = useWishlistStore((state) => state.removeItem);
  const isAuthenticated = useWishlistStore((state) => state.isAuthenticated);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = `/login?redirect=${encodeURIComponent(pathname)}`;
      return;
    }

    if (isWishlisted) {
      await removeItem(Number(product.id));
    } else {
      await addItem(Number(product.id));
    }
  };

  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group flex flex-col w-full bg-white rounded-none border-0 shadow-none transition-all duration-300 overflow-hidden"
    >
      {/* Top Image Section */}
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-50 rounded-none">
        {product.isCustomizable && (
          <div className="absolute top-3 left-3 z-10 bg-[#111111] text-white px-2 py-0.5 rounded-none shadow-sm">
            <span className="text-[8px] font-medium uppercase tracking-[0.15em]">Customizable</span>
          </div>
        )}
        
        {/* Wishlist Button Overlay */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 bg-white/80 p-2 rounded-full hover:bg-white hover:scale-110 transition-all duration-300 flex-shrink-0 cursor-pointer shadow-sm"
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={14} className={isWishlisted ? "fill-red-500 text-red-500" : "text-neutral-700"} />
        </button>

        <HoverImageCarousel 
          images={product.images || []}
          defaultImage={product.imageUrl || "/images/placeholder.png"}
          alt={product.name}
          className="transform group-hover:scale-105 transition-transform duration-700" 
        />
      </div>
      
      {/* Bottom Content Section */}
      <div className="pt-4 pb-2 px-1 flex flex-col flex-1 items-center text-center">
        <h3 className="text-[10px] md:text-[11px] font-medium tracking-[0.2em] text-neutral-800 uppercase line-clamp-1 w-full mb-1">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-center gap-2 mt-auto">
          <span className="text-xs font-semibold text-neutral-900">
            ₹{activePrice.toLocaleString()}
          </span>
          {discount > 0 && (
            <>
              <span className="text-[10px] text-neutral-400 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
              <span className="text-[9px] font-semibold text-brand-accent">
                ({discount}% OFF)
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
