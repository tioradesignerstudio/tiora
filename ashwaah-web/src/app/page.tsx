"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import ProductGrid from "@/components/ProductGrid";

import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-brand font-sans selection:bg-brand-accent/30">
      {/* Hero Section */}
      <header className="relative w-full min-h-[70vh] flex flex-col items-center justify-center overflow-hidden border-b border-brand/10 bg-white pt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center space-x-2 bg-brand/5 border border-brand/10 text-brand text-xs font-bold px-4 py-1.5 rounded-full mb-8 shadow-sm tracking-widest uppercase"
          >
            <Sparkles size={14} className="text-brand-accent" />
            <span>Introducing Custom Refinements</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-6xl md:text-8xl font-playfair font-bold tracking-tight mb-8 text-brand leading-[1.1]"
          >
            Standard Sizes. <br /> <span className="text-brand-accent italic">Perfected Fits.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-brand/70 text-xl max-w-2xl mx-auto mb-4 font-inter leading-relaxed"
          >
            Ashwaah elevates dual-gender apparel. Select your base size, then refine your waist, length, and sleeves down to the millimeter.
          </motion.p>
        </motion.div>
        
        {/* Subtle background element */}
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand/5 to-transparent"></div>
      </header>

      {/* Featured Collections Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Category Banners */}
        <section className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-12 md:gap-24 mt-12">
            {/* Men's Circle */}
            <Link href="/category/mens" className="group flex flex-col items-center">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-brand/10 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:border-brand-accent">
                <img src="/images/mens_banner.png" alt="Men" className="w-full h-full object-cover" />
              </div>
              <span className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-brand/60 group-hover:text-brand-accent transition-colors">Men</span>
            </Link>

            {/* Women's Circle */}
            <Link href="/category/womens" className="group flex flex-col items-center">
              <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-2 border-brand/10 shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:border-brand-accent">
                <img src="/images/womens_banner.png" alt="Women" className="w-full h-full object-cover" />
              </div>
              <span className="mt-4 text-xs font-black uppercase tracking-[0.2em] text-brand/60 group-hover:text-brand-accent transition-colors">Women</span>
            </Link>
          </div>
        </section>

        <ProductGrid />
      </main>


    </div>
  );
}

