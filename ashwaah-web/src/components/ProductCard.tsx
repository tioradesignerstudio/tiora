import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categorySlug: string;
  isCustomizable?: boolean;
}

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link 
      href={`/product/${product.id}`} 
      className="group relative flex flex-col w-full aspect-[4/5] bg-brand-light overflow-hidden hover:shadow-2xl transition-all duration-700"
    >
      {product.isCustomizable && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-brand/10 shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand">Customizable</span>
        </div>
      )}

      {/* Full Bleed Image */}
      <img 
        src={product.imageUrl || "/images/placeholder.png"} 
        alt={product.name} 
        className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000" 
      />
      
      {/* Bottom Text Overlay Banner */}
      <div className="absolute bottom-3 left-3 right-3 z-10 py-3 px-2 flex flex-col items-center justify-center bg-[#cd5533]/85 backdrop-blur-md text-white rounded-sm shadow-md">
        <h3 className="text-sm font-medium mb-1 line-clamp-1 text-white/90 tracking-wide text-center">
          {product.name}
        </h3>
        <div className="text-2xl md:text-3xl font-playfair font-bold tracking-tight mb-1 text-center">
          ₹{(product.price || 0).toLocaleString()}
        </div>
        <span className="text-sm font-medium text-white group-hover:underline transition-all text-center">
          Shop Now
        </span>
      </div>
    </Link>
  );
}
