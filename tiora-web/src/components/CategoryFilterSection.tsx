"use client";

import React, { useState, useMemo, useEffect } from "react";
import { SlidersHorizontal, ChevronDown, Check, X, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCarousel from "@/components/ProductCarousel";
import ProductCard from "@/components/ProductCard";
import { getFirstProductImageUrl, getProductImageUrls } from "@/utils/product";


interface Product {
  id: any;
  name: string;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  images: string | null;
  imageUrl: string | null;
  colors: string | null;
  category: string | null;
  filterCategory?: string | null;
  gender: string | null;
  isCustomizable: boolean | null;
  tags?: string | null;
  sizes?: string[];
}

interface Section {
  id: any;
  title: string;
  menuId: number;
  productIds: string;
  displayOrder: number;
  products: Product[];
}

interface CategoryFilterSectionProps {
  initialSections: Section[];
  initialDisplayProducts: Product[];
  categoryName: string;
  slug: string;
  filterTypes?: string | null;
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

export default function CategoryFilterSection({
  initialSections,
  initialDisplayProducts,
  categoryName,
  slug,
  filterTypes,
}: CategoryFilterSectionProps) {
  // 1. Flatten and deduplicate all products for filtering
  const allProducts = useMemo(() => {
    const map = new Map<string, Product>();

    initialDisplayProducts.forEach((p) => {
      map.set(String(p.id), p);
    });

    initialSections.forEach((section) => {
      (section.products || []).forEach((p) => {
        map.set(String(p.id), p);
      });
    });

    return Array.from(map.values());
  }, [initialSections, initialDisplayProducts]);

  // Parse admin configured filter types
  const adminFilterTypes = useMemo(() => {
    if (!filterTypes) return null;
    return filterTypes
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
  }, [filterTypes]);

  // Helper to check if a product matches a type, with special handling for T-Shirt vs Shirt
  const isTypeMatch = (type: string, name: string, category: string, tags: string) => {
    const lowerType = type.toLowerCase();
    const lowerName = name.toLowerCase();
    const lowerCategory = category.toLowerCase();
    const lowerTags = tags.toLowerCase();

    // Special handling: "T-Shirt" (or T-Shirts / Tshirt) covers Sweatshirts, Hoodies, Polos, Tees, and T-Shirts
    if (
      lowerType === "t-shirt" ||
      lowerType === "t-shirts" ||
      lowerType === "timages" ||
      lowerType === "tshirts" ||
      lowerType === "tshirt"
    ) {
      if (
        lowerName.includes("sweatshirt") ||
        lowerName.includes("hoodie") ||
        lowerName.includes("t-shirt") ||
        lowerName.includes("tshirt") ||
        lowerName.includes("polo") ||
        lowerName.includes("tee")
      ) {
        return true;
      }
    }

    // Special handling: "Shirt" should NOT match "Sweatshirt"
    if (lowerType === "shirt" || lowerType === "shirts") {
      if (lowerName.includes("sweatshirt")) {
        return false;
      }
    }

    return (
      lowerCategory.includes(lowerType) ||
      lowerTags.includes(lowerType) ||
      lowerName.includes(lowerType)
    );
  };

  // Helper for default type classification
  const classifyTypeFallback = (name: string, category: string) => {
    const lowerName = name.toLowerCase();
    const lowerCategory = category.toLowerCase();

    if (
      lowerName.includes("sweatshirt") ||
      lowerName.includes("hoodie") ||
      lowerName.includes("t-shirt") ||
      lowerName.includes("tshirt") ||
      lowerName.includes("polo") ||
      lowerName.includes("tee")
    ) {
      return "T-Shirt";
    } else if (lowerName.includes("shirt")) {
      return "Shirt";
    } else if (
      lowerCategory.includes("ethnic") ||
      lowerName.includes("kurta") ||
      lowerName.includes("kurti") ||
      lowerName.includes("lehenga") ||
      lowerName.includes("saree") ||
      lowerName.includes("sharara") ||
      lowerName.includes("anarkali")
    ) {
      return "Ethnic Wear";
    } else if (
      lowerCategory.includes("suitings") ||
      lowerCategory.includes("work wear") ||
      lowerCategory.includes("office wear") ||
      lowerCategory.includes("corporate") ||
      lowerName.includes("blazer") ||
      lowerName.includes("suit") ||
      lowerName.includes("formal")
    ) {
      return "Workwear";
    } else if (lowerName.includes("dress") || lowerName.includes("gown") || lowerName.includes("bodycon") || lowerCategory.includes("dresses")) {
      return "Dresses";
    } else if (lowerName.includes("jogger") || lowerName.includes("pants") || lowerName.includes("cargo") || lowerName.includes("trousers")) {
      return "Pants & Joggers";
    }
    return category || "Other";
  };

  // 2. Classify product types dynamically
  const productsWithTypes = useMemo(() => {
    return allProducts.map((p) => {
      let types: string[] = [];
      if (p.filterCategory) {
        types = p.filterCategory.split(",").map((s) => s.trim()).filter(Boolean);
      }

      if (types.length === 0) {
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const tags = (p.tags || "").toLowerCase();

        let type = "Other";
        if (adminFilterTypes && adminFilterTypes.length > 0) {
          // Sort types by length descending to match most specific first
          const sortedAdminTypes = [...adminFilterTypes].sort((a, b) => b.length - a.length);
          const matchedType = sortedAdminTypes.find((t) => isTypeMatch(t, name, category, tags));
          type = matchedType || "Other";
        } else {
          type = classifyTypeFallback(name, category);
        }
        types = [type];
      }

      return { ...p, classifiedTypes: types };
    });
  }, [allProducts, adminFilterTypes]);

  // 3. Extract unique types and colors dynamically
  const availableTypes = useMemo(() => {
    if (adminFilterTypes && adminFilterTypes.length > 0) {
      const hasOther = productsWithTypes.some((p) => p.classifiedTypes.includes("Other"));
      return hasOther ? [...adminFilterTypes, "Other"] : adminFilterTypes;
    }
    const typesSet = new Set<string>();
    productsWithTypes.forEach((p) => {
      p.classifiedTypes.forEach((type) => {
        if (type) typesSet.add(type);
      });
    });
    return Array.from(typesSet).sort();
  }, [productsWithTypes, adminFilterTypes]);

  const availableColors = useMemo(() => {
    const colorsSet = new Set<string>();
    productsWithTypes.forEach((p) => {
      try {
        const parsed = JSON.parse(p.colors || "[]");
        if (Array.isArray(parsed)) {
          parsed.forEach((c) => {
            if (c && typeof c === "string" && c.trim()) {
              colorsSet.add(c.trim());
            }
          });
        } else if (typeof p.colors === "string" && p.colors.trim()) {
          colorsSet.add(p.colors.trim());
        }
      } catch {
        if (typeof p.colors === "string" && p.colors.trim()) {
          colorsSet.add(p.colors.trim());
        }
      }
    });
    return Array.from(colorsSet).sort();
  }, [productsWithTypes]);

  // 3.5 Dynamic Price Limits Computation
  const [minLimit, maxLimit] = useMemo(() => {
    if (productsWithTypes.length === 0) return [0, 10000];
    let min = Infinity;
    let max = -Infinity;
    productsWithTypes.forEach((p) => {
      const price = p.salePrice || p.basePrice || 0;
      if (price < min) min = price;
      if (price > max) max = price;
    });
    if (min === Infinity || max === -Infinity) return [0, 10000];
    if (min === max) return [Math.max(0, min - 100), min + 100];
    return [Math.floor(min), Math.ceil(max)];
  }, [productsWithTypes]);

  // 4. State Management (Multi-select arrays)
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
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
  }, [selectedTypes, selectedColors, selectedSizes, priceRange, sortBy]);

  const isPriceFilterActive = priceRange[0] !== minLimit || priceRange[1] !== maxLimit;
  const isFilterOrSortActive =
    selectedTypes.length > 0 ||
    selectedColors.length > 0 ||
    selectedSizes.length > 0 ||
    sortBy !== "default" ||
    isPriceFilterActive;

  // Determine if this is a shoes/footwear category
  const isShoesCategory = useMemo(() => {
    const term = (categoryName || slug || "").toLowerCase();
    return term.includes("shoe") || term.includes("footwear") || term.includes("slipper") || term.includes("sandal") || term.includes("flip-flop") || term.includes("flip flop");
  }, [categoryName, slug]);

  const availableSizes = useMemo(() => {
    return isShoesCategory 
      ? ["5", "6", "7", "8", "9", "10", "11", "12"]
      : ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"];
  }, [isShoesCategory]);

  // 5. Calculate counts dynamically based on the current collection
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
      p.classifiedTypes.forEach((type) => {
        counts[type] = (counts[type] || 0) + 1;
      });
    });
    return counts;
  }, [productsWithTypes]);

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
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
  }, [productsWithTypes]);

  const sizeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    productsWithTypes.forEach((p) => {
      const sizes = p.sizes || [];
      sizes.forEach((s) => {
        const normalized = s.toUpperCase().trim();
        counts[normalized] = (counts[normalized] || 0) + 1;
      });
    });
    return counts;
  }, [productsWithTypes]);

  // 6. Filtering and Sorting logic
  const filteredAndSortedProducts = useMemo(() => {
    let list = [...productsWithTypes];

    // Filter by selected types (OR logic: show products matching any selected type)
    if (selectedTypes.length > 0) {
      list = list.filter((p) => p.classifiedTypes.some((type) => selectedTypes.includes(type)));
    }

    // Filter by selected colors (OR logic: show products matching any selected color)
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

    // Filter by selected sizes (OR logic: show products matching any selected size)
    if (selectedSizes.length > 0) {
      list = list.filter((p) => {
        const pSizes = (p.sizes || []).map((s) => s.toUpperCase().trim());
        return selectedSizes.some((sz) => pSizes.includes(sz.toUpperCase().trim()));
      });
    }

    // Filter by price range
    list = list.filter((p) => {
      const price = p.salePrice || p.basePrice || 0;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort by Price (salePrice if available, otherwise basePrice)
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
  }, [productsWithTypes, selectedTypes, selectedColors, selectedSizes, sortBy, priceRange]);

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

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
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
    setSelectedTypes([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setSortBy("default");
    setPriceRange([minLimit, maxLimit]);
  };

  return (
    <div className="w-full relative z-30 flex items-stretch">
      {/* Desktop Inline Sidebar */}
      {isFiltersOpen && (
        <aside className="hidden lg:flex w-64 flex-shrink-0 bg-[#faf8f0] border-r border-brand/10 p-6 sticky top-16 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between pb-4 border-b border-brand/5 mb-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand">Filters</h2>
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
            {/* Section 1: Categories / Types */}
            {availableTypes.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Categories</h3>
                <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {availableTypes.map((type) => {
                    const count = typeCounts[type] || 0;
                    const isChecked = selectedTypes.includes(type);

                    return (
                      <label
                        key={type}
                        className="flex items-center gap-3 text-xs font-bold text-brand/75 cursor-pointer hover:text-brand transition-colors select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTypeToggle(type)}
                          className="rounded border-brand/20 accent-brand w-4 h-4 cursor-pointer"
                        />
                        <span className="flex-1">{type}</span>
                        <span className="text-brand/35 text-[10px] font-medium">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 2: Colors */}
            {availableColors.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Color</h3>
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
                        className="flex items-center gap-3 text-xs font-bold text-brand/75 cursor-pointer hover:text-brand transition-colors select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleColorToggle(color)}
                          className="rounded border-brand/20 accent-brand w-4 h-4 cursor-pointer"
                        />
                        {/* Circle Swatch */}
                        <span
                          className={`w-3.5 h-3.5 rounded-full inline-block border shadow-sm flex-shrink-0 ${
                            isWhite ? "border-brand/20" : "border-transparent"
                          }`}
                          style={{ backgroundColor: hexCode }}
                        />
                        <span className="flex-1">{color}</span>
                        <span className="text-brand/35 text-[10px] font-medium">({count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 3: Sizes */}
            {availableSizes.length > 0 && (
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const count = sizeCounts[size.toUpperCase()] || 0;
                    const isChecked = selectedSizes.includes(size);

                    return (
                      <button
                        key={size}
                        onClick={() => handleSizeToggle(size)}
                        className={`h-9 min-w-[2.25rem] px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                          isChecked
                            ? "bg-[#333333] border-[#333333] text-white shadow-sm"
                            : "bg-white border-brand/10 text-brand hover:border-brand/30 hover:bg-brand/5"
                        }`}
                      >
                        <span>{size}</span>
                        <span className={`text-[9px] ${isChecked ? "text-white/60" : "text-brand/30"}`}>({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range Slider */}
            <div className="pb-4 border-b border-brand/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 ml-1">Price Range</h3>
                <span className="text-xs font-bold text-brand/80">
                  ₹{priceRange[0].toLocaleString("en-IN")} - ₹{priceRange[1].toLocaleString("en-IN")}{priceRange[1] >= maxLimit ? "+" : ""}
                </span>
              </div>
              
              <div className="range-slider-container relative w-full h-5 flex items-center px-1">
                {/* Track background */}
                <div className="absolute left-1 right-1 h-1 bg-brand/10 rounded-full pointer-events-none" />
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

            {/* Section 4: Sort By */}
            <div className="pt-2">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Sort Products</h3>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-brand/5 border border-brand/10 hover:border-brand-accent/50 text-brand text-xs font-bold uppercase tracking-widest py-3 pl-4 pr-10 rounded-2xl outline-none appearance-none cursor-pointer transition-all shadow-sm"
                >
                  <option value="default" className="text-brand bg-[#faf8f0]">Default</option>
                  <option value="price-asc" className="text-brand bg-[#faf8f0]">Price: Low to High</option>
                  <option value="price-desc" className="text-brand bg-[#faf8f0]">Price: High to Low</option>
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand/50 pointer-events-none" />
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile Sliding Drawer & Floating Button */}
      <div className="lg:hidden">
        {/* Floating Open Button */}
        {productsWithTypes.length > 0 && !isFiltersOpen && (
          <button
            onClick={() => setIsFiltersOpen(true)}
            className="fixed top-24 left-4 z-40 w-14 h-14 rounded-full bg-white shadow-xl border border-black/5 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Open Filters"
          >
            <SlidersHorizontal size={20} className="text-[#B18E35]" />
          </button>
        )}

        {/* sliding drawer framer-motion */}
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
                className="fixed inset-y-0 left-0 w-80 bg-[#faf8f0] border-r border-brand/10 z-50 flex flex-col shadow-2xl overflow-hidden"
              >
                {/* Sidebar Header */}
                <div className="p-6 border-b border-brand/5 flex items-center justify-between flex-shrink-0">
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-brand">Filters</h2>
                  
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
                  {/* Section 1: Categories / Types */}
                  {availableTypes.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Categories</h3>
                      <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {availableTypes.map((type) => {
                          const count = typeCounts[type] || 0;
                          const isChecked = selectedTypes.includes(type);

                          return (
                            <label
                              key={type}
                              className="flex items-center gap-3 text-xs font-bold text-brand/75 cursor-pointer hover:text-brand transition-colors select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleTypeToggle(type)}
                                className="rounded border-brand/20 accent-brand w-4 h-4 cursor-pointer"
                              />
                              <span className="flex-1">{type}</span>
                              <span className="text-brand/35 text-[10px] font-medium">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 2: Colors */}
                  {availableColors.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Color</h3>
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
                              className="flex items-center gap-3 text-xs font-bold text-brand/75 cursor-pointer hover:text-brand transition-colors select-none"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleColorToggle(color)}
                                className="rounded border-brand/20 accent-brand w-4 h-4 cursor-pointer"
                              />
                              {/* Circle Swatch */}
                              <span
                                className={`w-3.5 h-3.5 rounded-full inline-block border shadow-sm flex-shrink-0 ${
                                  isWhite ? "border-brand/20" : "border-transparent"
                                }`}
                                style={{ backgroundColor: hexCode }}
                              />
                              <span className="flex-1">{color}</span>
                              <span className="text-brand/35 text-[10px] font-medium">({count})</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Sizes */}
                  {availableSizes.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Sizes</h3>
                      <div className="flex flex-wrap gap-2">
                        {availableSizes.map((size) => {
                          const count = sizeCounts[size.toUpperCase()] || 0;
                          const isChecked = selectedSizes.includes(size);

                          return (
                            <button
                              key={size}
                              onClick={() => handleSizeToggle(size)}
                              className={`h-9 min-w-[2.25rem] px-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                                isChecked
                                  ? "bg-[#333333] border-[#333333] text-white shadow-sm"
                                  : "bg-white border-brand/10 text-brand hover:border-brand/30 hover:bg-brand/5"
                              }`}
                            >
                              <span>{size}</span>
                              <span className={`text-[9px] ${isChecked ? "text-white/60" : "text-brand/30"}`}>({count})</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Price Range Slider */}
                  <div className="pb-4 border-b border-brand/5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 ml-1">Price Range</h3>
                      <span className="text-xs font-bold text-brand/80">
                        ₹{priceRange[0].toLocaleString("en-IN")} - ₹{priceRange[1].toLocaleString("en-IN")}{priceRange[1] >= maxLimit ? "+" : ""}
                      </span>
                    </div>
                    
                    <div className="range-slider-container relative w-full h-5 flex items-center px-1">
                      {/* Track background */}
                      <div className="absolute left-1 right-1 h-1 bg-brand/10 rounded-full pointer-events-none" />
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

                  {/* Section 4: Sort By */}
                  <div className="pt-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand/40 mb-3 ml-1">Sort Products</h3>
                    <div className="relative">
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full bg-brand/5 border border-brand/10 hover:border-brand-accent/50 text-brand text-xs font-bold uppercase tracking-widest py-3 pl-4 pr-10 rounded-2xl outline-none appearance-none cursor-pointer transition-all shadow-sm"
                      >
                        <option value="default" className="text-brand bg-[#faf8f0]">Default</option>
                        <option value="price-asc" className="text-brand bg-[#faf8f0]">Price: Low to High</option>
                        <option value="price-desc" className="text-brand bg-[#faf8f0]">Price: High to Low</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand/50 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Bottom Drawer Actions */}
                <div className="p-6 border-t border-brand/5 bg-white flex items-center gap-4 flex-shrink-0">
                  <button
                    onClick={() => {
                      handleClearFilters();
                    }}
                    className="flex-1 px-4 py-3 bg-white border border-brand/10 hover:bg-neutral-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-[#0E2C2C]/50 hover:text-[#0E2C2C] transition-all cursor-pointer text-center"
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

      {/* Right Column: Products Content Area */}
      <div className="flex-grow min-w-0 px-4 sm:px-6 lg:px-8 py-8 lg:py-10 max-w-7xl mx-auto w-full">
        {/* Header Title & Description & Desktop filter toggle */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-brand/5 pb-6">
          <div className="text-center md:text-left flex-grow">
            <h1 className="text-4xl md:text-5xl font-playfair font-bold text-brand mb-3 tracking-tight">{categoryName}</h1>
            <div className="w-20 h-1 bg-[#333333] lg:mx-0 mx-auto rounded-full mb-3"></div>
            <p className="text-brand/70 max-w-2xl lg:mx-0 mx-auto font-inter leading-relaxed text-sm">
              Explore our curated selection of premium {categoryName.toLowerCase()} pieces, 
              each designed with meticulous attention to detail and crafted for an impeccable fit.
            </p>
          </div>
          
          {/* Desktop Filter Toggle Button */}
          {productsWithTypes.length > 0 && (
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
        
        <AnimatePresence mode="wait">
          {!isFilterOrSortActive && initialSections.length > 0 ? (
            <motion.div
              key="carousel-sections"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {initialSections.map((section) => (
                <ProductCarousel
                  key={section.id}
                  title={section.title}
                  products={section.products}
                />
              ))}
            </motion.div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <motion.div
              key="grid-layout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-6"
            >
              {isFilterOrSortActive && (
                <div className="flex items-center justify-between border-b border-brand/5 pb-2">
                  <span className="text-xs font-bold text-brand/60 uppercase tracking-widest flex items-center gap-1.5">
                    <SlidersHorizontal size={12} />
                    Found {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? "s" : ""}
                  </span>
                  <span className="text-xs font-bold text-brand/60 uppercase tracking-widest flex items-center gap-1.5">
                    <LayoutGrid size={12} />
                    Grid View
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 animate-in fade-in duration-300">
                {paginatedProducts.map((p) => {
                  const parsedImagesList = getProductImageUrls(p.images, p.colors);
                  const firstImage = getFirstProductImageUrl(p.images, p.colors);

                  const productProps = {
                    id: String(p.id),
                    name: p.name,
                    description: p.description || "",
                    price: p.salePrice || p.basePrice,
                    basePrice: p.basePrice,
                    salePrice: p.salePrice ?? undefined,
                    imageUrl: firstImage,
                    images: parsedImagesList,
                    categorySlug: slug,
                    isCustomizable: p.isCustomizable ?? undefined,
                  };
                  return <ProductCard key={p.id} product={productProps} />;
                })}
              </div>

              {/* Global Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-10 pt-8 border-t border-brand/5">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-brand/10 text-xs font-bold text-brand hover:bg-brand/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
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
                            ? "bg-brand text-white shadow-md scale-105"
                            : "border border-brand/10 text-brand hover:bg-brand/5"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-brand/10 text-xs font-bold text-brand hover:bg-brand/5 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="no-items"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 text-center bg-brand/5 rounded-[2.5rem] border border-brand/10 px-8"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <SlidersHorizontal className="text-[#333333]" size={24} />
              </div>
              <h2 className="text-xl font-playfair font-bold text-brand mb-2">No Matching Products</h2>
              <p className="text-brand/60 max-w-sm mx-auto text-sm mb-6">
                We couldn't find any products matching your active filters. Try clearing your filters to see all available items.
              </p>
              <button
                onClick={handleClearFilters}
                className="bg-brand text-white text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-brand-hover shadow-md transition-all duration-300"
              >
                Clear All Filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
