"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-[#faf8f0] z-[9999] flex items-center justify-center">
      <Loader2 className="w-9 h-9 animate-spin text-[#B18E35]" />
    </div>
  );
}
