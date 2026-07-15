"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, User, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "profile">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && step === "otp") {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer, step]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    if (error) setError("");
  };

  const validateEmail = (emailStr: string): boolean => {
    return emailStr.includes("@") && emailStr.includes(".");
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to send code.");
      }
      
      setStep("otp");
      setTimer(60);
    } catch (err: any) {
      console.error("OTP Error:", err);
      setError(err.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Verification failed");
      }
      
      if (data.isNewUser) {
        setStep("profile");
      } else {
        const redirect = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/") : "/";
        window.location.href = redirect;
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      setError(err.message || "Invalid verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to save profile");
      }
      
      const redirect = typeof window !== "undefined" ? (new URLSearchParams(window.location.search).get("redirect") || "/") : "/";
      window.location.href = redirect;
    } catch (err: any) {
      console.error("Profile error:", err);
      setError(err.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-light flex flex-col justify-center items-center p-4 selection:bg-brand-accent/30 font-inter">
      <div className="absolute top-8 left-8">
        <Link href="/" className="inline-flex items-center space-x-2 text-brand/60 hover:text-brand transition text-sm font-medium">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white border border-brand/10 rounded-2xl p-10 shadow-2xl border-t-8 border-t-brand-accent transform transition-all">
        <div className="text-center mb-10">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-brand flex items-center justify-center text-brand-accent font-bold text-3xl shadow-lg rotate-3 hover:rotate-0 transition-transform">
            T
          </div>
          <h2 className="text-3xl font-playfair font-bold text-brand mb-3">
            {step === "profile" ? "Welcome to Tiora" : "Sign In"}
          </h2>
          <p className="text-brand/60 text-sm leading-relaxed px-4">
            {step === "email" && "Enter your email address to access your custom fits."}
            {step === "otp" && `We've sent a 6-digit verification code to ${email}`}
            {step === "profile" && "One last step! Tell us your name to personalize your experience."}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
            {error}
          </div>
        )}

        {/* STEP 1: Email Address */}
        {step === "email" && (
          <form onSubmit={handleSendOTP} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-brand/40 uppercase mb-2 tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pr-3">
                  <Mail size={16} className="text-brand-accent" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="name@example.com" 
                  className="w-full bg-brand/5 border-2 border-transparent focus:border-brand-accent/30 focus:bg-white rounded-xl py-4 pl-12 pr-4 text-brand font-bold placeholder:text-brand/20 transition-all outline-none"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !email.trim()} 
              className="w-full bg-brand text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Continue</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === "otp" && (
          <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-brand/40 uppercase mb-2 tracking-[0.2em] ml-1">Verification Code</label>
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent" size={18} />
                <input 
                  type="text" 
                  inputMode="numeric"
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="0 0 0 0 0 0" 
                  className="w-full bg-brand/5 border-2 border-transparent focus:border-brand-accent/30 focus:bg-white rounded-xl py-4 px-12 text-brand font-mono font-bold text-center text-2xl tracking-[0.5em] placeholder:text-brand/10 placeholder:tracking-normal transition-all outline-none"
                  required
                />
              </div>
              <div className="flex justify-between mt-4 px-1">
                <button type="button" onClick={() => setStep("email")} className="text-xs text-brand/40 hover:text-brand font-bold transition-colors">Change Email</button>
                <button 
                  type="button" 
                  onClick={handleSendOTP}
                  disabled={timer > 0 || loading}
                  className={`text-xs font-bold ${timer > 0 ? "text-brand/30 cursor-not-allowed" : "text-brand-accent hover:underline"}`}
                >
                  {timer > 0 ? `Resend in ${timer}s` : "Resend Code"}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || otp.length !== 6} 
              className="w-full bg-brand text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Verify & Login</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: Profile Setup */}
        {step === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-brand/40 uppercase mb-2 tracking-[0.2em] ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-accent" size={18} />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Kapoor" 
                  className="w-full bg-brand/5 border-2 border-transparent focus:border-brand-accent/30 focus:bg-white rounded-xl py-4 px-12 text-brand font-bold transition-all outline-none"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || !fullName.trim()} 
              className="w-full bg-brand text-white font-bold py-4 rounded-xl shadow-lg hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 flex justify-center items-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span>Complete Setup</span>
              )}
            </button>
          </form>
        )}
      </div>

      <p className="mt-10 text-center text-[10px] text-brand/40 max-w-xs leading-relaxed uppercase tracking-widest font-bold">
        Secure login powered by Tiora. By continuing, you agree to our <a href="#" className="text-brand hover:underline">Terms</a> & <a href="#" className="text-brand hover:underline">Privacy</a>.
      </p>
    </div>
  );
}
