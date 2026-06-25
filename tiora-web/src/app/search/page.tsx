"use client";

import { useEffect, useState, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getFirstProductImageUrl, getProductImageUrls } from "@/utils/product";

import { Loader2, Search as SearchIcon, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: string;
  description: string;
  salePrice: number;
  basePrice: number;
  images: string; // JSON string
  colors: string | null;
  gender: string | null;
  category?: string;
  isFeatured: boolean | number | null;
  isCustomizable: boolean | number | null;
  sizes?: string[];
}

const COLOR_MAP: Record<string, string> = {
  white: "#FFFFFF",
  black: "#171717",
  red: "#EF4444",
  blue: "#3B82F6",
  "sky blue": "#0EA5E9",
  navy: "#1E3A8A",
  grey: "#737373",
  gray: "#737373",
  brown: "#78350F",
  maroon: "#5C1D16",
  pink: "#EC4899",
  beige: "#EADED2",
  gold: "#C5A059",
  "forest green": "#1B3022",
  green: "#22C55E",
  yellow: "#EAB308",
};

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Price Limits Computation
  const [minLimit, maxLimit] = useMemo(() => {
    if (products.length === 0) return [0, 10000];
    let min = Infinity;
    let max = -Infinity;
    products.forEach((p) => {
      const price = p.salePrice || p.basePrice || 0;
      if (price < min) min = price;
      if (price > max) max = price;
    });
    if (min === Infinity || max === -Infinity) return [0, 10000];
    if (min === max) return [Math.max(0, min - 100), min + 100];
    return [Math.floor(min), Math.ceil(max)];
  }, [products]);

  // Filter and Sorting states
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsFiltersOpen(true);
    }
  }, []);
  const [activeThumb, setActiveThumb] = useState<"min" | "max">("min");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setPriceRange([minLimit, maxLimit]);
  }, [minLimit, maxLimit]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedColors, selectedSizes, priceRange, sortBy]);

  useEffect(() => {
    async function performSearch() {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setLoading(false);
      }
    }

    performSearch();
    // Reset filters on query change
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy("default");
    setCurrentPage(1);
  }, [query]);

  // Helper to identify if a product is home decor
  const isHomeDecor = (p: any) => {
    const cat = (p.category || "").toLowerCase();
    const nm = (p.name || "").toLowerCase();
    
    // Explicit keywords for home decor
    const homeKeywords = ["decor", "home", "cushion", "pillow", "bedsheet", "candle", "vase", "rug", "lamp", "clock", "frame", "pot", "curtain", "tapestry", "blanket", "bedding"];
    const isHomeKeyword = homeKeywords.some(kw => cat.includes(kw) || nm.includes(kw));
    
    // Make sure we don't treat personal wearables/items as home decor
    const personalItemKeywords = ["watch", "bag", "belt", "shoe", "boot", "sandal", "slipper", "footwear", "shirt", "trousers", "kurti", "bodycon", "kurta", "pant", "jogger", "dress", "clothing", "apparel"];
    const isPersonalItem = personalItemKeywords.some(kw => cat.includes(kw) || nm.includes(kw));
    
    return isHomeKeyword && !isPersonalItem;
  };

  // Check if all results are home decor
  const allResultsAreHomeDecor = useMemo(() => {
    if (products.length === 0) return false;
    return products.every((p) => isHomeDecor(p));
  }, [products]);

  // Color options and counts
  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      try {
        const parsed = JSON.parse(p.colors || "[]");
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            const trimmed = c.trim();
            if (trimmed) {
              counts[trimmed] = (counts[trimmed] || 0) + 1;
            }
          });
        } else if (p.colors && typeof p.colors === "string") {
          const trimmed = p.colors.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      } catch {
        if (p.colors && typeof p.colors === "string") {
          const trimmed = p.colors.trim();
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
        }
      }
    });
    return counts;
  }, [products]);

  const availableColors = useMemo(() => {
    return Object.keys(colorCounts).sort();
  }, [colorCounts]);

  // Size options and counts
  const sizeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      const pSizes = p.sizes || [];
      pSizes.forEach((s) => {
        const normalized = s.toUpperCase().trim();
        // Exclude generic size values from filters to keep them relevant
        const genericSizes = ["STANDARD", "ONE SIZE", "FREE SIZE", "NO SIZE", "DEFAULT"];
        if (normalized && !genericSizes.includes(normalized)) {
          counts[normalized] = (counts[normalized] || 0) + 1;
        }
      });
    });
    return counts;
  }, [products]);

  const availableSizes = useMemo(() => {
    const order = ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
    return Object.keys(sizeCounts).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }, [sizeCounts]);

  // Filtering and Sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...products];

    // 2. Color filter: Multi-select
    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        try {
          const parsed = JSON.parse(p.colors || "[]");
          if (Array.isArray(parsed)) {
            return parsed.some((c) => selectedColors.includes(c.trim()));
          }
          return selectedColors.includes(String(p.colors).trim());
        } catch {
          return selectedColors.includes(String(p.colors).trim());
        }
      });
    }

    // 3. Size filter: Multi-select
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        const pSizes = (p.sizes || []).map((s) => s.toUpperCase().trim());
        return selectedSizes.some((sz) => pSizes.includes(sz));
      });
    }

    // 3.5 Price Range filter
    list = list.filter((p) => {
      const price = p.salePrice || p.basePrice || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // 4. Sort by price
    if (sortBy === "price-asc") {
      list.sort((a, b) => {
        const priceA = a.salePrice || a.basePrice || 0;
        const priceB = b.salePrice || b.basePrice || 0;
        return priceA - priceB;
      });
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => {
        const priceA = a.salePrice || a.basePrice || 0;
        const priceB = b.salePrice || b.basePrice || 0;
        return priceB - priceA;
      });
    }

    return list;
  }, [products, selectedColors, selectedSizes, sortBy, priceRange]);

  const productsPerPage = 20;
  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredAndSortedProducts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleColorToggle = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const handleClearFilters = () => {
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy("default");
    setPriceRange([minLimit, maxLimit]);
  };

  const isPriceFilterActive = priceRange[0] !== minLimit || priceRange[1] !== maxLimit;

  const isFilterOrSortActive =
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    sortBy !== "default" ||
    isPriceFilterActive;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-48 w-full">
        <Loader2 className="animate-spin text-[#C5A059] mb-4" size={48} strokeWidth={1.5} />
        <p className="text-[#333333]/40 font-black uppercase tracking-[0.3em] text-[10px]">Scouring our collections...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="py-32 text-center bg-[#faf8f0] rounded-[3rem] border border-[#333333]/5 shadow-sm max-w-xl mx-auto px-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <SearchIcon size={32} className="text-[#333333]/20" />
          </div>
          <h3 className="text-2xl font-playfair font-bold text-[#333333] mb-4">No Matches Found</h3>
          <p className="text-[#333333]/60 mb-8 leading-relaxed text-sm">
            We couldn't find any products matching your search for "{query}". Try checking your spelling or using more general terms.
          </p>
          <Link 
            href="/" 
            className="inline-block px-10 py-4 bg-[#333333] text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-[#32451B] transition-all shadow-md"
          >
            Browse All Collections
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative z-30 flex items-stretch">
      {/* Desktop Inline Sidebar */}
      {isFiltersOpen && (
        <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#faf8f0] border-r border-[#333333]/10 p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#333333]/5 mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#333333]">Filters</h2>
            {isFilterOrSortActive && (
              <button
                onClick={handleClearFilters}
                className="text-[10px] font-black uppercase text-red-600 hover:text-red-700 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* Section 2: Colors */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 mb-3 ml-1">Color</h3>
                <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                  {availableColors.map((color) => {
                    const count = colorCounts[color] || 0;
                    const isChecked = selectedColors.includes(color);
                    const lowerColor = color.toLowerCase();
                    const hexCode = COLOR_MAP[lowerColor] || (color.startsWith("#") ? color : "#CCCCCC");
                    const isWhite = lowerColor === "white" || hexCode === "#FFFFFF";

                    return (
                      <label
                        key={color}
                        className="flex items-center gap-3 text-xs font-bold text-[#333333]/75 cursor-pointer hover:text-[#333333] transition-colors select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleColorToggle(color)}
                          className="rounded border-[#333333]/20 accent-[#333333] w-4 h-4 cursor-pointer"
                        />
                        {/* Circle Swatch */}
                        <span
                          className={`w-3.5 h-3.5 rounded-full inline-block border shadow-sm flex-shrink-0 ${
                            isWhite ? "border-[#333333]/20" : "border-transparent"
                          }`}
                          style={{ backgroundColor: hexCode }}
                        />
                        <span className="flex-1 capitalize">{color}</span>
                        <span className="text-[#333333]/35 text-[10px] font-medium">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3: Sizes */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 mb-3 ml-1">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const count = sizeCounts[size] || 0;
                    const isChecked = selectedSizes.includes(size);

                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`h-9 min-w-[2.25rem] px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          isChecked
                            ? "bg-[#333333] text-white border-transparent shadow-sm"
                            : "bg-[#faf8f0] text-[#333333]/70 border-[#333333]/10 hover:border-[#333333]/30"
                        }`}
                      >
                        <span>{size}</span>
                        <span className={`text-[8px] font-medium ${isChecked ? "text-white/60" : "text-[#333333]/35"}`}>
                          ({count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range Slider */}
            <div className="pb-4 border-b border-[#333333]/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 ml-1">Price Range</h3>
                <span className="text-xs font-bold text-[#333333]/80">
                  ₹{priceRange[0].toLocaleString("en-IN")} - ₹{priceRange[1].toLocaleString("en-IN")}{priceRange[1] >= maxLimit ? "+" : ""}
                </span>
              </div>
              
              <div className="range-slider-container relative w-full h-5 flex items-center px-1">
                {/* Track background */}
                <div className="absolute left-1 right-1 h-1 bg-[#333333]/10 rounded-full pointer-events-none" />
                {/* Highlight track */}
                <div
                  className="absolute h-1 bg-[#FF4E20] rounded-full pointer-events-none"
                  style={{
                    left: `${((priceRange[0] - minLimit) / (maxLimit - minLimit || 1)) * 100}%`,
                    right: `${100 - ((priceRange[1] - minLimit) / (maxLimit - minLimit || 1)) * 100}%`
                  }}
                />
                <input
                  type="range"
                  min={minLimit}
                  max={maxLimit}
                  value={priceRange[0]}
                  onMouseDown={() => setActiveThumb("min")}
                  onTouchStart={() => setActiveThumb("min")}
                  onChange={(e) => {
                    const val = Math.min(Number(e.target.value), priceRange[1]);
                    setPriceRange([val, priceRange[1]]);
                  }}
                  style={{ zIndex: activeThumb === "min" ? 25 : 20 }}
                  className="absolute left-0 w-full top-0 h-5 appearance-none bg-transparent cursor-pointer pointer-events-none"
                />
                <input
                  type="range"
                  min={minLimit}
                  max={maxLimit}
                  value={priceRange[1]}
                  onMouseDown={() => setActiveThumb("max")}
                  onTouchStart={() => setActiveThumb("max")}
                  onChange={(e) => {
                    const val = Math.max(Number(e.target.value), priceRange[0]);
                    setPriceRange([priceRange[0], val]);
                  }}
                  style={{ zIndex: activeThumb === "max" ? 25 : 20 }}
                  className="absolute left-0 w-full top-0 h-5 appearance-none bg-transparent cursor-pointer pointer-events-none"
                />
              </div>
            </div>

            {/* Section 4: Sort Products */}
            <div className="pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 mb-3 ml-1">Sort Products</h3>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-[#faf8f0] text-xs font-bold text-[#333333] border border-[#333333]/10 rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="default" className="text-[#333333] bg-[#faf8f0]">Default</option>
                  <option value="price-asc" className="text-[#333333] bg-[#faf8f0]">Price: Low to High</option>
                  <option value="price-desc" className="text-[#333333] bg-[#faf8f0]">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333333]/50 pointer-events-none" />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Sliding Drawer & Floating Button */}
      <div className="lg:hidden">
        {/* Floating Open Button */}
        {filteredAndSortedProducts.length > 0 && !isFiltersOpen && (
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="fixed top-24 left-4 sm:left-6 z-40 w-14 h-14 rounded-full bg-white shadow-xl border border-black/5 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Filters"
          >
            <SlidersHorizontal size={20} className="text-[#B18E35]" />
          </button>
        )}

        {/* Filters Sidebar Drawer (Sliding in from left) */}
        <AnimatePresence>
          {isFiltersOpen && (
            <>
              {/* Backdrop Overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFiltersOpen(false)}
                className="fixed inset-0 bg-black z-40 pointer-events-auto"
              />

              {/* Sliding Sidebar Panel */}
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-80 bg-[#faf8f0] border-r border-[#333333]/10 z-50 flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-[#333333]/5 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#333333]">Filters</h2>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="p-1.5 hover:bg-black/5 rounded transition-colors text-brand/80 hover:text-brand cursor-pointer"
                    title="Hide Filters"
                  >
                    <SlidersHorizontal size={18} className="text-[#B18E35]" />
                  </button>
                </div>

                {/* Scrollable Filters Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {/* Section 2: Colors */}
                  {availableColors.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 mb-3 ml-1">Color</h3>
                      <div className="flex flex-col gap-2.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                        {availableColors.map((color) => {
                          const count = colorCounts[color] || 0;
                          const isChecked = selectedColors.includes(color);
                          const lowerColor = color.toLowerCase();
                          const hexCode = COLOR_MAP[lowerColor] || (color.startsWith("#") ? color : "#CCCCCC");
                          const isWhite = lowerColor === "white" || hexCode === "#FFFFFF";

                          return (
                            <label
                              key={color}
                              className="flex items-center gap-3 text-xs font-bold text-[#333333]/75 cursor-pointer hover:text-[#333333] transition-colors select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleColorToggle(color)}
                                className="rounded border-[#333333]/20 accent-[#333333] w-4 h-4 cursor-pointer"
                              />
                              {/* Circle Swatch */}
                              <span
                                className={`w-3.5 h-3.5 rounded-full inline-block border shadow-sm flex-shrink-0 ${
                                  isWhite ? "border-[#333333]/20" : "border-transparent"
                                }`}
                                style={{ backgroundColor: hexCode }}
                              />
                              <span className="flex-1 capitalize">{color}</span>
                              <span className="text-[#333333]/35 text-[10px] font-medium">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Sizes */}
                  {availableSizes.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 mb-3 ml-1">Sizes</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                          const count = sizeCounts[size] || 0;
                          const isChecked = selectedSizes.includes(size);

                          return (
                            <button
                              key={size}
                              onClick={() => handleSizeToggle(size)}
                              className={`h-9 min-w-[2.25rem] px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                                isChecked
                                  ? "bg-[#333333] text-white border-transparent shadow-sm"
                                  : "bg-[#faf8f0] text-[#333333]/70 border-[#333333]/10 hover:border-[#333333]/30"
                              }`}
                            >
                              <span>{size}</span>
                              <span className={`text-[8px] font-medium ${isChecked ? "text-white/60" : "text-[#333333]/35"}`}>
                                ({count})
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Price Range Slider */}
                  <div className="pb-4 border-b border-[#333333]/5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 ml-1">Price Range</h3>
                      <span className="text-xs font-bold text-[#333333]/80">
                        ₹{priceRange[0].toLocaleString("en-IN")} - ₹{priceRange[1].toLocaleString("en-IN")}{priceRange[1] >= maxLimit ? "+" : ""}
                      </span>
                    </div>
                    
                    <div className="range-slider-container relative w-full h-5 flex items-center px-1">
                      {/* Track background */}
                      <div className="absolute left-1 right-1 h-1 bg-[#333333]/10 rounded-full pointer-events-none" />
                      {/* Highlight track */}
                      <div
                        className="absolute h-1 bg-[#FF4E20] rounded-full pointer-events-none"
                        style={{
                          left: `${((priceRange[0] - minLimit) / (maxLimit - minLimit || 1)) * 100}%`,
                          right: `${100 - ((priceRange[1] - minLimit) / (maxLimit - minLimit || 1)) * 100}%`
                        }}
                      />
                      <input
                        type="range"
                        min={minLimit}
                        max={maxLimit}
                        value={priceRange[0]}
                        onMouseDown={() => setActiveThumb("min")}
                        onTouchStart={() => setActiveThumb("min")}
                        onChange={(e) => {
                          const val = Math.min(Number(e.target.value), priceRange[1]);
                          setPriceRange([val, priceRange[1]]);
                        }}
                        style={{ zIndex: activeThumb === "min" ? 25 : 20 }}
                        className="absolute left-0 w-full top-0 h-5 appearance-none bg-transparent cursor-pointer pointer-events-none"
                      />
                      <input
                        type="range"
                        min={minLimit}
                        max={maxLimit}
                        value={priceRange[1]}
                        onMouseDown={() => setActiveThumb("max")}
                        onTouchStart={() => setActiveThumb("max")}
                        onChange={(e) => {
                          const val = Math.max(Number(e.target.value), priceRange[0]);
                          setPriceRange([priceRange[0], val]);
                        }}
                        style={{ zIndex: activeThumb === "max" ? 25 : 20 }}
                        className="absolute left-0 w-full top-0 h-5 appearance-none bg-transparent cursor-pointer pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Section 4: Sort Products */}
                  <div className="pt-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333]/40 mb-3 ml-1">Sort Products</h3>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-[#faf8f0] text-xs font-bold text-[#333333] border border-[#333333]/10 rounded-xl px-3 py-2.5 outline-none appearance-none cursor-pointer transition-all shadow-sm"
                      >
                        <option value="default" className="text-[#333333] bg-[#faf8f0]">Default</option>
                        <option value="price-asc" className="text-[#333333] bg-[#faf8f0]">Price: Low to High</option>
                        <option value="price-desc" className="text-[#333333] bg-[#faf8f0]">Price: High to Low</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333333]/50 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Bottom Drawer Actions (Clear All and Apply & Close) */}
                <div className="p-6 border-t border-[#333333]/5 bg-white flex items-center gap-4 flex-shrink-0">
                  <button
                    onClick={() => {
                      handleClearFilters();
                    }}
                    className="flex-1 px-4 py-3 bg-white border border-[#333333]/10 hover:bg-neutral-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0E2C2C]/50 hover:text-[#0E2C2C] transition-all cursor-pointer text-center"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFiltersOpen(false)}
                    className="flex-1 px-4 py-3 bg-[#0E2C2C] text-[#C5A059] hover:bg-[#0A2222] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer text-center shadow-lg shadow-[#0E2C2C]/10"
                  >
                    Apply & Close
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Right Column: Products Grid & Header */}
      <div className="flex-grow min-w-0 px-6 sm:px-8 lg:px-12 py-8 lg:py-10 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-[#333333]/5 pb-6">
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <SearchIcon className="text-[#C5A059]" size={24} />
              <h1 className="text-3xl md:text-4xl font-playfair font-black text-[#333333] tracking-wide">
                Search Results
              </h1>
            </div>
            <p className="text-[#333333]/60 italic text-sm">
              Found {filteredAndSortedProducts.length} elegant {filteredAndSortedProducts.length === 1 ? "piece" : "pieces"} for "{query}"
            </p>
          </div>

          {/* Desktop Filter Toggle Button */}
          {products.length > 0 && (
            <div className="hidden lg:flex flex-shrink-0 justify-center">
              <button
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-2 bg-white border border-black/10 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0E2C2C] hover:bg-neutral-50 transition-colors shadow-sm cursor-pointer"
              >
                <SlidersHorizontal size={14} className="text-[#B18E35]" />
                {isFiltersOpen ? "Hide Filters" : "Show Filters"}
              </button>
            </div>
          )}
        </div>

        {/* Product Grid / Empty Filter State */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="py-24 text-center bg-[#faf8f0] rounded-[2.5rem] border border-[#333333]/5 shadow-sm max-w-md mx-auto px-6">
            <div className="w-16 h-16 bg-[#333333]/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <SlidersHorizontal size={24} className="text-[#333333]/40" />
            </div>
            <h3 className="text-lg font-bold text-[#333333] mb-2">No Matching Filters</h3>
            <p className="text-[#333333]/60 mb-6 text-xs leading-relaxed">
              We couldn't find any products in your search results matching the selected filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-[#333333] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#32451B] transition-colors cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => {
                const parsedImages = getProductImageUrls(product.images, product.colors);
                const firstImage = getFirstProductImageUrl(product.images, product.colors);

                return (
                  <ProductCard 
                    key={product.id} 
                    product={{
                      id: product.id.toString(),
                      name: product.name,
                      description: product.description || "",
                      price: product.salePrice || product.basePrice,
                      basePrice: product.basePrice,
                      salePrice: product.salePrice,
                      imageUrl: firstImage,
                      images: parsedImages,
                      categorySlug: product.category || "all"
                    }} 
                  />
                );
              })}
            </div>

            {/* Global Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-8 border-t border-[#333333]/5">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-xl border border-[#333333]/10 text-xs font-bold text-[#333333] hover:bg-[#333333]/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  Prev
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-[#333333] text-[#C5A059] shadow-md scale-105"
                          : "border border-[#333333]/10 text-[#333333] hover:bg-[#333333]/5"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-xl border border-[#333333]/10 text-xs font-bold text-[#333333] hover:bg-[#333333]/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-brand-light">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-[#C5A059]" size={40} />
        </div>
      }>
        <SearchResults />
      </Suspense>
    </main>
  );
}
