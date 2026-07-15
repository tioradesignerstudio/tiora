"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldCheck, Loader2, Mail, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const validateEmail = (emailStr: string): boolean => {
    return emailStr.includes("@") && emailStr.includes(".");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        router.push("/admin/navigation");
        router.refresh();
      } else {
        setError(data.error || "Invalid administrator credentials");
      }
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-4 font-inter">
      <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl border-t-[12px] border-t-[#333333] relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#333333]/5 rounded-full blur-3xl"></div>

        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-[#333333] flex items-center justify-center shadow-2xl relative">
            <Lock className="text-white" size={32} />
            <div className="absolute -bottom-2 -right-2 bg-[#333333] p-1.5 rounded-lg shadow-lg">
              <ShieldCheck size={16} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-playfair font-bold text-[#333333] mb-3">
            Admin Portal
          </h2>
          <p className="text-[#333333]/60 text-sm font-medium uppercase tracking-widest">
            Authorization Required
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-6">
          {/* Email Address */}
          <div>
            <label className="block text-[10px] font-black text-[#333333]/40 uppercase mb-2 tracking-[0.2em] ml-1">Admin Email</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pr-3">
                <Mail size={16} className="text-[#333333]" />
              </div>
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="admin@tiorastudio.com"
                className="w-full bg-[#333333]/5 border-2 border-transparent focus:border-[#333333]/30 focus:bg-white rounded-xl py-4 pl-12 pr-4 text-[#333333] font-bold transition-all outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-black text-[#333333]/40 uppercase mb-2 tracking-[0.2em] ml-1">Password</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pr-3">
                <Lock size={16} className="text-[#333333]" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={handlePasswordChange}
                placeholder="••••••••"
                className="w-full bg-[#333333]/5 border-2 border-transparent focus:border-[#333333]/30 focus:bg-white rounded-xl py-4 pl-12 pr-12 text-[#333333] font-bold transition-all outline-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#333333]/40 hover:text-[#333333] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full bg-[#333333] text-white font-bold py-5 rounded-2xl shadow-xl hover:bg-[#444444] disabled:opacity-50 transition-all active:scale-95 flex justify-center items-center space-x-2 group"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span className="uppercase tracking-[0.2em] text-xs font-bold">Sign In</span>
            )}
          </button>
        </form>
      </div>

      <p className="mt-10 text-center text-[10px] text-brand-dark/30 max-w-xs leading-relaxed uppercase tracking-[0.3em] font-bold">
        Tiora Management Infrastructure
      </p>
    </div>
  );
}
