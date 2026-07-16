"use client";

import React, { useState } from "react";
import { Mail, Phone, Camera, Share2, MessageCircle, Sparkles, MapPin, Clock, ArrowRight, Crown, Sparkle, Scissors, Palette } from "lucide-react";
import { motion } from "framer-motion";

const packagesData = [
  {
    title: "Bridal Couture",
    imageUrl: "/images/i1.png",
    fallbackUrl: "/images/bridal_styling_pkg.png"
  },
  {
    title: "Signature Ceremony",
    imageUrl: "/images/i2.png",
    fallbackUrl: "/images/half_saree_pkg.png"
  },
  {
    title: "Bespoke Designing",
    imageUrl: "/images/i3.png",
    fallbackUrl: "/images/custom_designs_pkg.png"
  },
  {
    title: "Atelier Consultation",
    imageUrl: "/images/i4.png",
    fallbackUrl: "/images/tiora_showroom_banner.png"
  }
];

interface ImageCardProps {
  imageUrl: string;
  fallbackUrl: string;
  title: string;
}

function ImageCard({ imageUrl, fallbackUrl, title }: ImageCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-xl shadow-md select-none pointer-events-none">
      <img
        src={imgSrc}
        alt={title}
        onError={() => {
          if (!hasError) {
            setHasError(true);
            setImgSrc(fallbackUrl);
          }
        }}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}

export default function MyStory() {
  return (
    <main className="min-h-screen bg-brand-light text-brand-dark-dark selection:bg-[#B18E35]/30">

      {/* Narrative Section - Redesigned to Our Boutique */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24 relative overflow-hidden">
        {/* Background Subtle Blurs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#B18E35]/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#333333]/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center relative z-10">
          
          {/* Left Half: 4 Images in Staggered Asymmetric Structure */}
          <div className="lg:col-span-6 flex justify-center lg:justify-center items-center">
            <div className="grid grid-cols-2 gap-4 max-w-[320px] sm:max-w-[370px] md:max-w-[420px] w-full">
              <motion.div 
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-4 pt-8"
              >
                <ImageCard
                  imageUrl={packagesData[0].imageUrl}
                  fallbackUrl={packagesData[0].fallbackUrl}
                  title={packagesData[0].title}
                />
                <ImageCard
                  imageUrl={packagesData[2].imageUrl}
                  fallbackUrl={packagesData[2].fallbackUrl}
                  title={packagesData[2].title}
                />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="space-y-4"
              >
                <ImageCard
                  imageUrl={packagesData[1].imageUrl}
                  fallbackUrl={packagesData[1].fallbackUrl}
                  title={packagesData[1].title}
                />
                <ImageCard
                  imageUrl={packagesData[3].imageUrl}
                  fallbackUrl={packagesData[3].fallbackUrl}
                  title={packagesData[3].title}
                />
              </motion.div>
            </div>
          </div>

          {/* Right Half: Our Boutique Info and Customization Packages (Static Matter) */}
          <div className="lg:col-span-6 lg:pl-0 lg:-ml-8 flex flex-col justify-center space-y-6">
            <div>
              <span className="text-[#B18E35] font-black uppercase tracking-[0.4em] text-xs mb-3 block">Welcome to Tiora</span>
              <h2 className="text-4xl md:text-5xl font-playfair font-bold text-brand-dark-dark leading-tight mb-4">
                Our Boutique
              </h2>
              <div className="w-20 h-1 bg-[#B18E35] rounded-full"></div>
            </div>

            <p className="text-base md:text-lg font-medium text-[#333333]/90 leading-relaxed">
              Tiora Designer Studio brings you an exquisite selection of custom-tailored silhouettes, bridal designs, and coordinated occasion wear. We believe in creating outfits that perfectly complement your individuality. 
            </p>

            {/* Static Boutique Details Panel */}
            <div className="border-t border-[#333333]/10 pt-8 space-y-6">
              <div className="flex items-center gap-3">
                <h3 className="text-xl md:text-2xl font-playfair font-bold uppercase tracking-widest text-[#111111]">
                  Customization & Packages
                </h3>
              </div>

              <ul className="space-y-4">
                <li className="flex items-start text-sm md:text-base font-bold text-brand-dark-dark/90 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-[#B18E35] mr-3 mt-2 shrink-0"></span>
                  <div>
                    <span className="text-[#B18E35] uppercase tracking-wider block text-xs mb-0.5">Bridal Couture</span>
                    Bespoke wedding lehengas, designer sarees, and custom bridal wear.
                  </div>
                </li>
                <li className="flex items-start text-sm md:text-base font-bold text-brand-dark-dark/90 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-[#B18E35] mr-3 mt-2 shrink-0"></span>
                  <div>
                    <span className="text-[#B18E35] uppercase tracking-wider block text-xs mb-0.5">Signature Ceremony</span>
                    Coordinating family theme wear, half-sarees, and birthday outfits.
                  </div>
                </li>
                <li className="flex items-start text-sm md:text-base font-bold text-brand-dark-dark/90 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-[#B18E35] mr-3 mt-2 shrink-0"></span>
                  <div>
                    <span className="text-[#B18E35] uppercase tracking-wider block text-xs mb-0.5">Bespoke Designing</span>
                    1-on-1 designer sketches, pattern drafting, and premium fabric selection.
                  </div>
                </li>
                <li className="flex items-start text-sm md:text-base font-bold text-brand-dark-dark/90 leading-relaxed">
                  <span className="w-2 h-2 rounded-full bg-[#B18E35] mr-3 mt-2 shrink-0"></span>
                  <div>
                    <span className="text-[#B18E35] uppercase tracking-wider block text-xs mb-0.5">Atelier Consultation</span>
                    Designer blouses, precision fittings, and festive wardrobe updates.
                  </div>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </section>
      <section id="contact" className="bg-white py-24 text-brand-dark overflow-hidden relative border-t border-black/5">
        {/* Decorative Blur Backdrops */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#B18E35]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#B18E35]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
 
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[#B18E35] font-semibold uppercase tracking-[0.4em] text-[10px] mb-2 block">Connect With Us</span>
            <h3 className="text-3xl md:text-4xl font-playfair font-light tracking-widest text-[#111111] uppercase flex items-center justify-center gap-3">
              Contact Us <Sparkles size={24} className="text-[#B18E35] animate-pulse" />
            </h3>
            <div className="w-20 h-1 bg-[#B18E35] mx-auto mt-4"></div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* Left Card: Contact Information */}
            <div className="bg-white p-8 md:p-10 rounded-none border border-black/10 flex flex-col justify-center space-y-8">
              {/* Email */}
              <a href="mailto:Tioradesignerstudio@gmail.com" className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-none bg-[#111111] text-white flex items-center justify-center transition-all duration-300 group-hover:bg-[#B18E35] shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18E35]/70 mb-1">Email Us</p>
                  <p className="text-sm font-medium text-brand-dark transition-colors group-hover:text-[#B18E35] break-all">
                    Tioradesignerstudio@gmail.com
                  </p>
                </div>
              </a>
 
              {/* Call & WhatsApp */}
              <div className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-none bg-[#111111] text-white flex items-center justify-center shrink-0">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18E35]/70 mb-1.5">Call & WhatsApp</p>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-brand-dark">
                      <a href="https://wa.me/919182258415" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#B18E35] transition-colors">
                        +91 91822 58415
                      </a>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider ml-2">(Primary)</span>
                    </p>
                    <p className="text-sm font-medium text-brand-dark">
                      <a href="https://wa.me/919063364078" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-[#B18E35] transition-colors">
                        +91 90633 64078
                      </a>
                      <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider ml-2">(Alternative)</span>
                    </p>
                  </div>
                </div>
              </div>
 
              {/* Address / Google Maps */}
              <a href="https://maps.app.goo.gl/9K1PEFXBqCUWKtji8?g_st=iwb" target="_blank" rel="noopener noreferrer" className="flex items-start gap-6 group">
                <div className="w-12 h-12 rounded-none bg-[#111111] text-white flex items-center justify-center transition-all duration-300 group-hover:bg-[#B18E35] shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18E35]/70 mb-1">Visit Our Studio (Google Maps)</p>
                  <p className="text-xs font-medium text-brand-dark leading-relaxed hover:underline transition-colors group-hover:text-[#B18E35]">
                    Tiora designer studio, Bharath Nagar Colony, Kismatpur, Hyderabad, Telangana, India PIN code- 500086
                  </p>
                </div>
              </a>
            </div>
 
            {/* Right Card: Business Hours & Socials */}
            <div className="bg-white p-8 md:p-10 rounded-none border border-black/10 flex flex-col justify-center space-y-8">
              {/* Business Hours */}
              <div className="flex items-center gap-6 group">
                <div className="w-12 h-12 rounded-none bg-[#111111] text-white flex items-center justify-center shrink-0 transition-all duration-300 group-hover:bg-[#B18E35]">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#B18E35]/70 mb-1">Business Hours</p>
                  <p className="text-sm font-medium text-brand-dark leading-relaxed">
                    Mon - Sat: 12:00 PM - 8:00 PM
                  </p>
                  <p className="text-xs font-semibold text-neutral-400 mt-0.5">
                    Sunday: Closed (Weekly Off)
                  </p>
                </div>
              </div>
 
              <div className="border-t border-black/5 pt-8">
                <span className="text-[#B18E35]/80 font-semibold uppercase tracking-[0.2em] text-[10px] mb-4 block">Follow Our Journey</span>
                <div className="grid grid-cols-2 gap-4">
                  <a 
                    href="https://www.instagram.com/tioradesignerstudio?igsh=dGttdXI3OGx6NWZq&utm_source=qr" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-3 p-4 bg-transparent border border-black/15 text-[#111111] hover:text-white rounded-none hover:bg-[#B18E35] hover:border-[#B18E35] transition-all duration-300 group font-semibold tracking-widest text-[10px] uppercase"
                  >
                    <Camera size={16} />
                    <span>Instagram</span>
                  </a>
                  <a 
                    href="https://www.facebook.com/share/1Ddd2P38UR/?mibextid=wwXIfr" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-3 p-4 bg-transparent border border-black/15 text-[#111111] hover:text-white rounded-none hover:bg-[#B18E35] hover:border-[#B18E35] transition-all duration-300 group font-semibold tracking-widest text-[10px] uppercase"
                  >
                    <Share2 size={16} />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
 
          {/* Embedded Google Map */}
          <div className="w-full aspect-[16/9] md:aspect-[21/9] rounded-none overflow-hidden border border-black/10 mt-8 min-h-[350px]">
            <iframe
              src="https://maps.google.com/maps?q=Tiora%20designer%20studio,%20Bharath%20Nagar%20Colony,%20Kismatpur,%20Hyderabad,%20Telangana%20500086,%20India&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Tiora Designer Studio Location"
              className="grayscale-[15%] contrast-[105%] hover:grayscale-0 transition-all duration-500"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
