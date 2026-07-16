"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#faf8f0] z-[9999] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#B18E35]" />
        <span className="text-[10px] font-black uppercase tracking-widest text-[#B18E35] select-none">
          Loading...
        </span>
      </div>
    </div>
  );
}
