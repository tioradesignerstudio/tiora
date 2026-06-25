"use client";

import React from "react";
import { Mail, Phone, Camera, Share2, MessageCircle, Sparkles, MapPin, Clock, ArrowRight } from "lucide-react";

export default function MyStory() {
  return (
    <main className="min-h-screen bg-brand-light text-brand-dark-dark">

      {/* Narrative Section */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24 relative">
        <div className="absolute inset-0 bg-[#333333]/2 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="text-center space-y-8 relative z-10">
          <div>
            <span className="text-[#333333]/60 font-black uppercase tracking-[0.4em] text-[10px] mb-3 block">Our Philosophy</span>
            <h2 className="text-4xl md:text-5xl font-playfair font-bold text-brand-dark-dark leading-tight mb-4">
              The Vision Behind <span className="text-[#333333]">Tiora</span>
            </h2>
            <div className="w-20 h-1 bg-[#333333] mx-auto rounded-full"></div>
          </div>

          <div className="space-y-6 text-lg text-brand-dark-dark/75 font-medium leading-relaxed max-w-4xl mx-auto">
            <p>
              Our journey is defined by a dedication to craftsmanship, heritage, and modern design. Established with a vision to create timeless silhouettes, we blend traditional artistry with contemporary aesthetics to craft garments that inspire confidence and elegance.
            </p>
            <p>
              Every collection is a curation of fine fabrics, intricate details, and tailored precision. We believe that fashion is a form of self-expression, and our creations are designed to celebrate individuality and grace.
            </p>
            <p>
              From the sourcing of premium materials to the final stitch, our commitment to sustainability and quality remains at the heart of everything we do.
            </p>
          </div>

          <div className="pt-6 border-t border-b border-[#333333]/10 py-6 max-w-3xl mx-auto">
            <p className="italic text-[#333333] font-playfair text-xl md:text-2xl text-center">
              "We don't just sell clothes; we weave memories into every thread."
            </p>
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
