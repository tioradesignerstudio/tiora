"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Check, Phone, MessageCircle, MapPin, Crown, Calendar, Gift, Sparkle, Loader2 } from "lucide-react";

interface PackageCard {
  tierName: string;
  price: string;
  features: string[];
  isFeatured?: boolean;
  upgradeBenefit?: string; // Royal Couture special add-on
  whatsappMsg: string;
  bgImage: string;
}

interface EventCategory {
  title: string;
  tagline: string;
  bgImage: string;
  iconName: string;
  themeColor: string;
  packages: PackageCard[];
}

const IconMap: Record<string, React.ComponentType<any>> = {
  Crown,
  Gift,
  Calendar,
  Sparkle,
  Sparkles,
};

const getIcon = (iconName: string, themeColor: string) => {
  const IconComponent = IconMap[iconName] || Sparkles;
  return <IconComponent className="w-5 h-5" style={{ color: themeColor }} />;
};

interface PackageCardProps {
  pkg: PackageCard;
  event: EventCategory;
  isRoyal: boolean;
}

function PackageCardComponent({ pkg, event, isRoyal }: PackageCardProps) {
  // Determine plan number: 1 = Essential, 2 = Signature, 3 = Royal
  let planNum = 1;
  const tierLower = pkg.tierName.toLowerCase();
  if (tierLower.includes("signature") || tierLower.includes("tier 2")) {
    planNum = 2;
  } else if (tierLower.includes("royal") || tierLower.includes("tier 3")) {
    planNum = 3;
  }

  // Construct plan image path based on category bgImage path
  // e.g. /images/bridal_styling_pkg.png -> /images/bridal_styling_pkg_1.png
  const bgImageBase = event.bgImage.replace(/\.[^/.]+$/, "");
  const bgImageExt = event.bgImage.match(/\.[^/.]+$/)?.[0] || ".png";
  const planImage = `${bgImageBase}_${planNum}${bgImageExt}`;

  // Start with pkg.bgImage (from DB), fallback to planImage, fallback to event.bgImage
  const [imgSrc, setImgSrc] = useState(pkg.bgImage || event.bgImage);
  const [loadStep, setLoadStep] = useState(0); // 0 = pkg.bgImage, 1 = planImage, 2 = event.bgImage

  return (
    <div className="relative overflow-hidden group aspect-[3/4] w-full border border-black/10 transition-all shadow-md">
      {/* Event Background Image */}
      <img
        src={imgSrc}
        alt={event.title}
        onError={() => {
          if (loadStep === 0) {
            setLoadStep(1);
            setImgSrc(planImage);
          } else if (loadStep === 1) {
            setLoadStep(2);
            setImgSrc(event.bgImage);
          }
        }}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />

      {/* Gradient Overlay for backdrop contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-opacity duration-300 opacity-70" />

      {/* Top Decorative Border */}
      <div
        className="absolute top-0 left-0 right-0 h-[4px] z-30 transition-all"
        style={{ backgroundColor: event.themeColor }}
      />

      {/* Featured / Best Value Badges */}
      {isRoyal && (
        <div className="absolute top-4 right-4 bg-[#C5A059] text-white text-[8px] font-black uppercase px-3 py-1.5 tracking-wider z-20">
          Best Value
        </div>
      )}

      {/* Initial Card Content (visible when not hovered) */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end z-10 text-white select-none transition-opacity duration-300 group-hover:opacity-0">
        <div className="space-y-1">
          <span 
            className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border w-fit block mb-1.5 text-[#C5A059] border-[#C5A059]/30 bg-[#C5A059]/10"
          >
            {pkg.tierName}
          </span>
          
          <div className="flex justify-between items-baseline">
            <span className="text-3xl font-playfair font-black tracking-tight text-white">
              {pkg.price}
            </span>
          </div>
        </div>
      </div>

      {/* Hover Details Overlay (covers the whole card) */}
      <div 
        className="absolute inset-x-0 bottom-0 top-full group-hover:top-0 z-20 transition-all duration-500 ease-in-out overflow-y-auto flex flex-col justify-between p-6 md:p-8 text-white bg-black/45 backdrop-blur-[1px]"
      >
        <div className="flex flex-col justify-between h-full space-y-4">
          {/* Header */}
          <div>
            <span 
              className="text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border w-fit block mb-2 text-[#C5A059] border-[#C5A059]/30 bg-[#C5A059]/10"
            >
              {pkg.tierName}
            </span>
            
            <div className="flex justify-between items-baseline">
              <span className="text-3xl font-playfair font-black tracking-tight text-white">
                {pkg.price}
              </span>
            </div>
          </div>

          {/* Features List */}
          <div className="flex-1 flex flex-col justify-center">
            <ul className="space-y-3">
              {pkg.features.map((feature, fIdx) => (
                <li key={fIdx} className="flex items-start text-sm text-white/90 leading-relaxed font-semibold">
                  <Check size={16} className="mr-2.5 mt-0.5 shrink-0 text-[#C5A059]" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Special Upgrade Highlights */}
            {pkg.upgradeBenefit && (
              <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-none text-left">
                <p className="text-[9px] font-black uppercase tracking-wider flex items-center gap-1 text-[#C5A059]">
                  <Crown size={12} />
                  <span>Exclusive Royal Add-on</span>
                </p>
                <p className="text-xs text-white font-bold mt-1 leading-snug">{pkg.upgradeBenefit}</p>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <a
            href={`https://wa.me/919063364078?text=${encodeURIComponent(pkg.whatsappMsg)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-white py-3.5 text-center text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md hover:brightness-110 bg-[#C5A059] hover:bg-[#b39150]"
          >
            <MessageCircle size={16} className="text-white" />
            <span>Inquire Now</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPackages() {
      try {
        const res = await fetch("/api/packages");
        const json = await res.json();
        if (json.success && json.data) {
          const parsed = json.data.map((item: any) => ({
            ...item,
            features: typeof item.features === "string" ? JSON.parse(item.features) : item.features || []
          }));
          setPackages(parsed);
        }
      } catch (err) {
        console.error("Error loading packages:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPackages();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf8f0] text-[#111111] flex flex-col items-center justify-center gap-4 selection:bg-[#B18E35]/30">
        <div className="space-y-4 text-center">
          <div className="space-y-1">
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
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B18E35]">Loading Packages...</span>
          </div>
        </div>
      </main>
    );
  }

  if (packages.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#faf8f0] text-[#111111] flex flex-col items-center justify-center gap-4 px-4 text-center selection:bg-[#B18E35]/30">
        <h2 className="text-2xl font-playfair font-bold text-[#111111] mb-2">No packages added yet</h2>
        <p className="text-neutral-500 max-w-sm mx-auto text-sm mb-6 leading-relaxed">
          We are currently setting up customization packages for this section. Please check back soon!
        </p>
        <a href="/" className="bg-[#0E2C2C] text-[#C5A059] hover:bg-[#0A2222] px-8 py-3.5 text-xs font-black uppercase tracking-widest transition-all shadow-md">
          Go to Home
        </a>
      </main>
    );
  }

  // Group packages by categoryTitle, keeping insertion order (based on db query order)
  const categoriesList: EventCategory[] = [];
  packages.forEach((pkg) => {
    let cat = categoriesList.find((c) => c.title === pkg.categoryTitle);
    if (!cat) {
      cat = {
        title: pkg.categoryTitle,
        tagline: pkg.categoryTagline,
        bgImage: pkg.categoryBgImage,
        iconName: pkg.categoryIcon,
        themeColor: pkg.categoryThemeColor,
        packages: []
      };
      categoriesList.push(cat);
    }
    cat.packages.push({
      tierName: pkg.tierName,
      price: pkg.price,
      features: pkg.features,
      upgradeBenefit: pkg.upgradeBenefit || undefined,
      whatsappMsg: pkg.whatsappMsg,
      bgImage: pkg.categoryBgImage
    });
  });

  return (
    <main className="min-h-screen bg-[#faf8f0] text-[#111111] pb-24 selection:bg-[#B18E35]/30">
      
      {/* Hero Header Section */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-8 text-center relative overflow-hidden">
        {/* Background Subtle Blurs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#B18E35]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#0E2C2C] text-[#C5A059] px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.25em] shadow-sm">
            <Sparkles size={10} className="animate-spin duration-3000" />
            <span>Bookings Now Open</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl md:text-6xl font-playfair font-semibold uppercase tracking-[0.25em] text-[#111111] leading-none">
              Tiora
            </h1>
            <p className="text-[10px] md:text-xs uppercase tracking-[0.45em] text-[#B18E35] font-black">
              D e s i g n e r &nbsp; S t u d i o
            </p>
          </div>

          <p className="italic font-playfair text-lg md:text-2xl text-neutral-600 max-w-xl mx-auto">
            "Where Every Outfit Tells Your Story"
          </p>

          <div className="w-20 h-[1.5px] bg-[#B18E35] mx-auto my-6"></div>

          {/* Quick Location Badges */}
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B18E35] bg-white border border-black/5 px-4 py-2 w-fit mx-auto shadow-sm">
            <MapPin size={12} className="shrink-0" />
            <span>Studio Location: Hyderabad</span>
          </div>
        </div>
      </section>

      {/* Exclusive Royal Benefits Section */}
      <section className="max-w-6xl mx-auto px-6 mb-20 text-center">
        <div className="bg-white border border-black/10 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-[#B18E35]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B18E35] block">💛 Royal Couture Perks</span>
              <h2 className="text-2xl md:text-3xl font-playfair font-bold uppercase tracking-widest text-[#111111]">
                Exclusive Premium Benefits
              </h2>
              <p className="text-xs text-neutral-500 max-w-xl mx-auto leading-relaxed">
                Unlock signature complimentary add-ons designed specifically to elevate your style when booking our top-tier <strong>Royal Couture (Tier 3)</strong> packages:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left pt-4">
              {/* Weddings */}
              <div className="p-5 bg-[#faf8f0] border border-black/5 flex flex-col justify-between space-y-4 transition-all hover:border-[#B18E35]/30">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-none bg-[#C5A059]/10 flex items-center justify-center text-[#C5A059]">
                    <Crown size={16} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">Weddings (Bridal)</h4>
                  <p className="text-[13px] text-neutral-600 leading-relaxed font-semibold">
                    Complimentary Haldi Outfits for the Couple
                  </p>
                </div>
              </div>

              {/* Birthday */}
              <div className="p-5 bg-[#faf8f0] border border-black/5 flex flex-col justify-between space-y-4 transition-all hover:border-[#B18E35]/30">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-none bg-[#B8738D]/10 flex items-center justify-center text-[#B8738D]">
                    <Gift size={16} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">Birthday Styling</h4>
                  <p className="text-[13px] text-neutral-600 leading-relaxed font-semibold">
                    Extra Designer Outfit or Premium Theme Styling
                  </p>
                </div>
              </div>

              {/* House Ceremony */}
              <div className="p-5 bg-[#faf8f0] border border-black/5 flex flex-col justify-between space-y-4 transition-all hover:border-[#B18E35]/30">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-none bg-[#0E2C2C]/10 flex items-center justify-center text-[#0E2C2C]">
                    <Calendar size={16} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">House Ceremony</h4>
                  <p className="text-[13px] text-neutral-600 leading-relaxed font-semibold">
                    Family Coordination Upgrade (Premium coordinating fits)
                  </p>
                </div>
              </div>

              {/* Half Saree */}
              <div className="p-5 bg-[#faf8f0] border border-black/5 flex flex-col justify-between space-y-4 transition-all hover:border-[#B18E35]/30">
                <div className="space-y-2">
                  <div className="w-8 h-8 rounded-none bg-[#9E2A2B]/10 flex items-center justify-center text-[#9E2A2B]">
                    <Sparkle size={16} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-800">Half Saree & Occasions</h4>
                  <p className="text-[13px] text-neutral-600 leading-relaxed font-semibold">
                    Heavy Design Enhancement & Accessories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events Package List */}
      <section className="max-w-6xl mx-auto px-6 space-y-24">
        {categoriesList.map((event, eventIdx) => (
          <div key={eventIdx} className="space-y-8">
            {/* Event Category Title */}
            <div className="flex items-center gap-3 border-b border-black/5 pb-4">
              <div 
                className="p-2.5 rounded-none"
                style={{ backgroundColor: `${event.themeColor}1a`, color: event.themeColor }}
              >
                {getIcon(event.iconName, event.themeColor)}
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-playfair font-black uppercase tracking-widest text-neutral-800">
                  {event.title}
                </h2>
                <p className="text-xs text-neutral-400 font-medium mt-0.5">{event.tagline}</p>
              </div>
            </div>

            {/* Comparative image cards with hover detail raise effect */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
              {event.packages.map((pkg, pkgIdx) => {
                const isRoyal = pkg.tierName.includes("Royal");
                return (
                  <PackageCardComponent
                    key={pkgIdx}
                    pkg={pkg}
                    event={event}
                    isRoyal={isRoyal}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {/* Custom Designs Category (All Events) */}
        <div className="space-y-8">
          <div className="flex items-center gap-3 border-b border-black/5 pb-4">
            <div className="p-2.5 rounded-none bg-neutral-900 text-[#C5A059]">
              <Sparkles className="w-5 h-5 text-[#C5A059]" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-playfair font-black uppercase tracking-widest text-neutral-800">
                Custom Designs (All Events) ✨
              </h2>
              <p className="text-xs text-neutral-400 font-medium mt-0.5">Craft fully customized designer silhouettes tailored for your event theme</p>
            </div>
          </div>

          <div className="relative overflow-hidden group w-full h-[450px] md:h-[380px] border border-black/10 shadow-lg">
            {/* Custom designs background image */}
            <img
              src="/images/custom_designs_pkg.png"
              alt="Custom Designs"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            
            {/* Dark contrast gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10 transition-opacity duration-300 opacity-70" />

            {/* Top gold highlight border */}
            <div className="absolute top-0 left-0 right-0 h-[4px] bg-[#C5A059] z-30" />

            {/* Initial Card Content (visible when not hovered) */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end z-10 text-white select-none transition-opacity duration-300 group-hover:opacity-0">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 border border-[#C5A059]/20 w-fit block mb-2">
                Bespoke Studio Option
              </span>
              <h3 className="text-3xl font-playfair font-bold uppercase tracking-widest text-white leading-tight">
                Flexible Pricing Based on Design
              </h3>
            </div>

            {/* Hover Details Overlay (covers the whole card) */}
            <div 
              className="absolute inset-x-0 bottom-0 top-full group-hover:top-0 z-20 transition-all duration-500 ease-in-out overflow-y-auto flex flex-col justify-between p-6 md:p-8 text-white bg-black/45 backdrop-blur-[1px]"
            >
              <div className="flex flex-col justify-between h-full space-y-4">
                {/* Header */}
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A059] bg-[#C5A059]/10 px-2.5 py-1 border border-[#C5A059]/20 w-fit block mb-2">
                    Bespoke Studio Option
                  </span>
                  <h3 className="text-3xl font-playfair font-bold uppercase tracking-widest text-white leading-tight">
                    Flexible Pricing Based on Design
                  </h3>
                </div>

                {/* Body details */}
                <div className="flex-1 flex flex-col md:flex-row items-stretch justify-between gap-6 my-auto">
                  <p className="text-sm text-white/70 leading-relaxed max-w-md my-auto">
                    Ideal for clients looking for a completely unique design tailored exactly to their event vision. Includes dedicated consultations, custom sketches & fittings.
                  </p>
                  
                  <div className="flex-1 max-w-xl flex flex-col justify-center">
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-6">
                      {[
                        "Fully Customized Outfits",
                        "Unique Patterns (No Repeats)",
                        "Designed as per Event Theme",
                        "Premium Fabric & Finishing Options"
                      ].map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start text-sm text-white/90 leading-relaxed font-semibold">
                          <Check size={16} className="text-[#C5A059] mr-2.5 mt-0.5 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                <a
                  href="https://wa.me/919063364078?text=Hello%20Tiora%20Designer%20Studio,%20I%27d%20like%20to%20inquire%20about%20a%20completely%20custom-designed%20outfit%20for%20an%20event."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#C5A059] hover:bg-[#b39150] text-white py-3.5 px-8 text-center text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 shadow-md w-full sm:w-fit"
                >
                  <MessageCircle size={16} className="text-white" />
                  <span>Request Custom Consultation</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking and Location Contact Section */}
      <section className="max-w-4xl mx-auto px-6 mt-28">
        <div className="bg-white border border-black/10 p-8 md:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#B18E35]/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B18E35] block">Get in Touch</span>
            <h2 className="text-2xl md:text-3xl font-playfair font-bold uppercase tracking-widest text-[#111111]">
              Secure Your Appointment
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              Our bespoke design consultations are booked in advance. Let's create an outfit that matches your unique style.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto py-4">
            <div className="p-4 bg-[#faf8f0] border border-black/5 flex flex-col items-center justify-center space-y-1">
              <MapPin size={18} className="text-[#B18E35]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Studio Address</span>
              <span className="text-xs font-bold text-neutral-700">📍 Hyderabad, IN</span>
            </div>
            <a
              href="tel:9063364078"
              className="p-4 bg-[#faf8f0] border border-black/5 hover:border-[#B18E35]/30 transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer"
            >
              <Phone size={18} className="text-[#B18E35]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Phone Booking</span>
              <span className="text-xs font-bold text-neutral-700">9063364078</span>
            </a>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/919063364078?text=Hello,%20I'd%20like%20to%20book%20a%20design%20consultation%20with%20Tiora%20Designer%20Studio."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0E2C2C] text-[#C5A059] hover:bg-[#0A2222] px-8 py-4 text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 w-full sm:w-auto shadow-md"
            >
              <MessageCircle size={16} />
              <span>Direct WhatsApp DM</span>
            </a>
            <a
              href="/my-story#contact"
              className="border border-black/20 text-[#111111] hover:bg-neutral-50 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto"
            >
              View Studio Details
            </a>
          </div>
        </div>
      </section>

    </main>
  );
}
