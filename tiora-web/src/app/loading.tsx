"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#faf8f0] z-[9999] flex flex-col items-center justify-center gap-4 selection:bg-[#B18E35]/30">
      <div className="space-y-4 text-center">
        <div className="space-y-1 animate-pulse">
          <h1 className="text-4xl md:text-6xl font-playfair font-semibold uppercase tracking-[0.25em] text-[#111111] leading-none">
            Tiora
          </h1>
          <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-[#B18E35] font-black">
            D e s i g n e r &nbsp; S t u d i o
          </p>
        </div>
        <div className="w-20 h-[1.5px] bg-[#B18E35] mx-auto my-4"></div>
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[#B18E35]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#B18E35]">Loading Studio...</span>
        </div>
      </div>
    </div>
  );
}
