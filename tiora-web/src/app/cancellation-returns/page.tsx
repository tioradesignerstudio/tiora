import React from "react";
import { RotateCcw, Sparkles } from "lucide-react";

export const metadata = {
  title: "Cancellation & Returns - Tiora",
  description: "Cancellation and returns information for Tiora custom fit apparel.",
};

export default function CancellationReturns() {
  return (
    <div className="min-h-[70vh] bg-brand-light py-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-[#333333] font-black uppercase tracking-[0.4em] text-[10px] mb-4 block">Information</span>
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-brand-dark leading-tight mb-4 flex items-center justify-center gap-3">
            Cancellation & Returns <Sparkles size={24} className="text-[#333333]" />
          </h1>
          <div className="w-20 h-1 bg-[#333333] mx-auto rounded-full"></div>
        </div>

        <div className="bg-[#faf8f0] p-8 md:p-12 rounded-[2.5rem] border border-brand/5 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-brand-dark/5 flex items-center justify-center mx-auto mb-6">
            <RotateCcw size={32} className="text-[#333333]" />
          </div>
          
          <h2 className="text-2xl font-playfair font-bold text-brand-dark mb-4">Under Construction</h2>
          <p className="text-lg text-brand-dark/70 font-medium leading-relaxed max-w-lg mx-auto mb-8">
            We are currently drafting our detailed Cancellation & Returns policies to ensure a seamless post-purchase experience.
          </p>

          <div className="pt-6 border-t border-brand/5 max-w-md mx-auto">
            <p className="text-sm text-brand-dark/60 font-semibold mb-2">Have questions in the meantime?</p>
            <p className="text-base font-bold text-brand-dark">
              Contact us at{" "}
              <a href="mailto:Tioradesignerstudio@gmail.com" className="text-[#333333] hover:underline">
                Tioradesignerstudio@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
