"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Edit2, Check, Crown, Phone, ArrowLeft, Loader2, Calendar, Gift, Sparkle, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface Package {
  id?: number;
  categoryTitle: string;
  categoryTagline: string;
  categoryBgImage: string;
  categoryIcon: string;
  categoryThemeColor: string;
  tierName: string;
  price: string;
  features: string[]; // will be parsed/stringified from/to JSON
  upgradeBenefit: string | null;
  whatsappMsg: string;
  order: number;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  
  // Field states
  const [categorySelection, setCategorySelection] = useState("existing"); // "existing" or "new"
  const [selectedCategoryTitle, setSelectedCategoryTitle] = useState("");
  
  const [categoryTitle, setCategoryTitle] = useState("");
  const [categoryTagline, setCategoryTagline] = useState("");
  const [categoryBgImage, setCategoryBgImage] = useState("");
  const [categoryIcon, setCategoryIcon] = useState("Crown");
  const [categoryThemeColor, setCategoryThemeColor] = useState("#C5A059");
  
  const [tierName, setTierName] = useState("");
  const [price, setPrice] = useState("");
  const [features, setFeatures] = useState<string[]>([""]);
  const [upgradeBenefit, setUpgradeBenefit] = useState("");
  const [whatsappMsg, setWhatsappMsg] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setCategoryBgImage(data.url);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(data.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during file upload.");
    } finally {
      setIsUploading(false);
    }
  };

  // Delete modal confirmation
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  // Load packages
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      const result = await res.json();
      if (result.success) {
        // Parse features JSON string into array
        const parsedData = result.data.map((item: any) => ({
          ...item,
          features: typeof item.features === "string" ? JSON.parse(item.features) : item.features || []
        }));
        setPackages(parsedData);
      } else {
        toast.error("Failed to load packages: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error fetching packages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  // Unique categories list
  const uniqueCategories = Array.from(new Set(packages.map(p => p.categoryTitle))).map(title => {
    const pkgMatch = packages.find(p => p.categoryTitle === title);
    return {
      title,
      tagline: pkgMatch?.categoryTagline || "",
      bgImage: pkgMatch?.categoryBgImage || "",
      icon: pkgMatch?.categoryIcon || "Crown",
      themeColor: pkgMatch?.categoryThemeColor || "#C5A059"
    };
  });

  // Handle open form for Add
  const handleAddClick = (categoryPreset?: typeof uniqueCategories[0]) => {
    setEditingPackage(null);
    if (categoryPreset) {
      setCategorySelection("existing");
      setSelectedCategoryTitle(categoryPreset.title);
      setCategoryTitle(categoryPreset.title);
      setCategoryTagline(categoryPreset.tagline);
      setCategoryBgImage(categoryPreset.bgImage);
      setCategoryIcon(categoryPreset.icon);
      setCategoryThemeColor(categoryPreset.themeColor);
    } else {
      setCategorySelection("new");
      setSelectedCategoryTitle("");
      setCategoryTitle("");
      setCategoryTagline("");
      setCategoryBgImage("/images/bridal_styling_pkg.png");
      setCategoryIcon("Crown");
      setCategoryThemeColor("#C5A059");
    }
    
    setTierName("");
    setPrice("");
    setFeatures([""]);
    setUpgradeBenefit("");
    setWhatsappMsg("");
    setDisplayOrder(packages.length + 1);
    
    setIsFormOpen(true);
  };

  // Handle open form for Edit
  const handleEditClick = (pkg: Package) => {
    setEditingPackage(pkg);
    setCategorySelection("existing");
    setSelectedCategoryTitle(pkg.categoryTitle);
    
    setCategoryTitle(pkg.categoryTitle);
    setCategoryTagline(pkg.categoryTagline);
    setCategoryBgImage(pkg.categoryBgImage);
    setCategoryIcon(pkg.categoryIcon);
    setCategoryThemeColor(pkg.categoryThemeColor);
    
    setTierName(pkg.tierName);
    setPrice(pkg.price);
    setFeatures(pkg.features.length > 0 ? pkg.features : [""]);
    setUpgradeBenefit(pkg.upgradeBenefit || "");
    setWhatsappMsg(pkg.whatsappMsg);
    setDisplayOrder(pkg.order);
    
    setIsFormOpen(true);
  };

  // Handle features change
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...features];
    updatedFeatures[index] = value;
    setFeatures(updatedFeatures);
  };

  const addFeatureInput = () => {
    setFeatures([...features, ""]);
  };

  const removeFeatureInput = (index: number) => {
    if (features.length > 1) {
      setFeatures(features.filter((_, i) => i !== index));
    }
  };

  // Sync details from existing category when selected
  useEffect(() => {
    if (categorySelection === "existing" && selectedCategoryTitle) {
      const match = uniqueCategories.find(c => c.title === selectedCategoryTitle);
      if (match) {
        setCategoryTitle(match.title);
        setCategoryTagline(match.tagline);
        setCategoryBgImage(match.bgImage);
        setCategoryIcon(match.icon);
        setCategoryThemeColor(match.themeColor);
      }
    }
  }, [selectedCategoryTitle, categorySelection]);

  // Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter empty features
    const cleanFeatures = features.filter(f => f.trim() !== "");
    
    if (!categoryTitle.trim() || !tierName.trim() || !price.trim() || !whatsappMsg.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const payload = {
      categoryTitle,
      categoryTagline,
      categoryBgImage,
      categoryIcon,
      categoryThemeColor,
      tierName,
      price,
      features: cleanFeatures,
      upgradeBenefit: upgradeBenefit.trim() !== "" ? upgradeBenefit : null,
      whatsappMsg,
      order: displayOrder
    };

    try {
      let res;
      if (editingPackage) {
        // Edit mode (PATCH)
        res = await fetch("/api/admin/packages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingPackage.id, ...payload })
        });
      } else {
        // Create mode (POST)
        res = await fetch("/api/admin/packages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      const result = await res.json();
      if (result.success) {
        toast.success(editingPackage ? "Package updated successfully!" : "Package created successfully!");
        setIsFormOpen(false);
        fetchPackages();
      } else {
        toast.error("Failed to save: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error submitting package data");
    }
  };

  // Delete Package
  const handleDeleteConfirm = async () => {
    if (!packageToDelete) return;

    try {
      const res = await fetch(`/api/admin/packages?id=${packageToDelete.id}`, {
        method: "DELETE"
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Package card deleted successfully.");
        setPackageToDelete(null);
        fetchPackages();
      } else {
        toast.error("Failed to delete: " + result.error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error deleting package");
    }
  };

  // Get Icon Component Helper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Crown": return <Crown size={16} />;
      case "Gift": return <Gift size={16} />;
      case "Calendar": return <Calendar size={16} />;
      case "Sparkle": return <Sparkle size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-[#faf8f0] min-h-screen text-[#111111] selection:bg-[#B18E35]/30">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-3xl font-playfair font-bold uppercase tracking-widest text-[#111111]">
            Package Cards Manager
          </h1>
          <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-semibold">
            Customize Event styling cards, modify details, and configure WhatsApp DM redirects
          </p>
        </div>
        <button
          onClick={() => handleAddClick()}
          className="bg-[#0E2C2C] text-[#C5A059] hover:bg-[#0A2222] px-5 py-3 text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2 w-fit cursor-pointer shadow-md"
        >
          <Plus size={16} />
          <span>Add Package Card</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#B18E35]" />
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Loading Packages Data...</span>
        </div>
      ) : packages.length === 0 ? (
        <div className="bg-white border border-black/10 p-16 text-center space-y-4">
          <Sparkles className="mx-auto text-neutral-300 w-12 h-12" />
          <h3 className="text-lg font-bold text-neutral-600 uppercase tracking-wider">No Package Cards Configured</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto">
            Get started by adding your first event package card. Categories will group dynamically based on their category titles.
          </p>
          <button
            onClick={() => handleAddClick()}
            className="bg-[#C5A059] text-white hover:bg-[#b39150] px-6 py-3.5 text-xs font-black uppercase tracking-widest transition-colors inline-flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus size={14} />
            <span>Create First Package</span>
          </button>
        </div>
      ) : (
        <div className="space-y-16">
          {/* Loop unique categories */}
          {uniqueCategories.map((category, catIdx) => {
            const categoryPkgs = packages
              .filter(p => p.categoryTitle === category.title)
              .sort((a, b) => a.order - b.order);

            return (
              <div key={catIdx} className="space-y-6 bg-white border border-black/10 p-6 md:p-8 relative">
                {/* Accent Top Border */}
                <div 
                  className="absolute top-0 left-0 right-0 h-[4px]" 
                  style={{ backgroundColor: category.themeColor }}
                />

                {/* Category Header Box */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 pb-4">
                  <div className="flex items-start gap-4">
                    <div 
                      className="p-3 text-white shrink-0" 
                      style={{ backgroundColor: category.themeColor }}
                    >
                      {getIcon(category.icon)}
                    </div>
                    <div>
                      <h2 className="text-lg md:text-xl font-playfair font-black uppercase tracking-widest text-neutral-800 flex items-center gap-2">
                        {category.title}
                      </h2>
                      <p className="text-xs text-neutral-400 font-bold mt-0.5">{category.tagline}</p>
                      
                      {/* Theme Colors and Details */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] uppercase font-black text-neutral-400 tracking-wider">
                        <span>Theme Hex: <strong style={{ color: category.themeColor }}>{category.themeColor}</strong></span>
                        <span>•</span>
                        <span>Icon: <strong>{category.icon}</strong></span>
                        <span>•</span>
                        <span>Image: <strong className="lowercase truncate max-w-[200px] inline-block align-bottom">{category.bgImage}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleAddClick(category)}
                    className="border border-[#C5A059] text-[#C5A059] hover:bg-[#C5A059]/5 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 cursor-pointer w-fit"
                  >
                    <Plus size={12} />
                    <span>Add Tier</span>
                  </button>
                </div>

                {/* Package Cards list for this Category */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {categoryPkgs.map((pkg) => (
                    <div 
                      key={pkg.id} 
                      className="border border-black/5 bg-[#faf8f0] p-6 flex flex-col justify-between space-y-6 relative hover:shadow-md transition-shadow"
                    >
                      {/* Card Info */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-black/5 pb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#C5A059] bg-[#C5A059]/10 px-2 py-0.5 border border-[#C5A059]/20 block w-fit">
                              {pkg.tierName}
                            </span>
                            <h3 className="text-2xl font-playfair font-bold text-neutral-800 mt-2">
                              {pkg.price}
                            </h3>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditClick(pkg)}
                              className="p-2 hover:bg-neutral-200 text-neutral-600 transition-colors cursor-pointer"
                              title="Edit package card details"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => setPackageToDelete(pkg)}
                              className="p-2 hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                              title="Delete package card"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 block">Features</span>
                          <ul className="space-y-1.5">
                            {pkg.features.map((feature, fIdx) => (
                              <li key={fIdx} className="flex items-start text-xs text-neutral-700 font-semibold leading-relaxed">
                                <Check size={12} className="text-[#C5A059] mr-2 mt-0.5 shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Upgrade benefit */}
                        {pkg.upgradeBenefit && (
                          <div className="p-2.5 bg-white border border-black/5 text-left">
                            <p className="text-[8px] font-black uppercase tracking-wider text-[#C5A059] flex items-center gap-1">
                              <Crown size={10} />
                              <span>Exclusive Upgrade Add-on</span>
                            </p>
                            <p className="text-[11px] text-neutral-700 font-bold mt-0.5 leading-snug">{pkg.upgradeBenefit}</p>
                          </div>
                        )}
                      </div>

                      {/* WhatsApp pretyped view */}
                      <div className="pt-4 border-t border-black/5 space-y-2">
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-neutral-400">
                          <Phone size={10} />
                          <span>Pre-typed WhatsApp Text</span>
                        </div>
                        <p className="text-[10px] text-neutral-500 font-medium leading-relaxed italic bg-white p-2 border border-black/5">
                          "{pkg.whatsappMsg}"
                        </p>
                      </div>

                      {/* Order and ID indicators */}
                      <div className="text-[8px] font-bold text-neutral-300 uppercase tracking-widest text-right mt-1">
                        Display Order: {pkg.order} | Card ID: {pkg.id}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Package Form Editor Drawer/Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/45 backdrop-blur-sm cursor-pointer"
            onClick={() => setIsFormOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="p-6 border-b border-black/10 flex items-center justify-between bg-neutral-50">
              <div className="flex items-center space-x-2 text-neutral-800">
                <Sparkles className="h-5 w-5 text-[#C5A059]" />
                <h3 className="font-playfair text-lg font-black uppercase tracking-widest">
                  {editingPackage ? "Edit Package Card" : "Add Package Card"}
                </h3>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 hover:bg-black/5 transition-all text-neutral-500 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form scrollable inputs */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              
              {/* SECTION 1: Event Category Configurations */}
              <div className="bg-[#faf8f0] border border-black/5 p-4 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B18E35] border-b border-black/5 pb-2">
                  1. Event Category Settings
                </h4>
                
                {/* Selector */}
                {!editingPackage && (
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setCategorySelection("existing")}
                      className={`py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all ${
                        categorySelection === "existing"
                          ? "bg-[#0E2C2C] text-white"
                          : "bg-white text-neutral-500 border border-black/10"
                      }`}
                    >
                      Use Existing Category
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategorySelection("new")}
                      className={`py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all ${
                        categorySelection === "new"
                          ? "bg-[#0E2C2C] text-white"
                          : "bg-white text-neutral-500 border border-black/10"
                      }`}
                    >
                      Create New Category
                    </button>
                  </div>
                )}

                {/* Existing Categories Dropdown */}
                {categorySelection === "existing" && !editingPackage && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Select Category *</label>
                    <select
                      value={selectedCategoryTitle}
                      onChange={(e) => setSelectedCategoryTitle(e.target.value)}
                      className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                      required
                    >
                      <option value="">-- Choose Category --</option>
                      {uniqueCategories.map((c, i) => (
                        <option key={i} value={c.title}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Category Configuration Inputs */}
                {(categorySelection === "new" || editingPackage) && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Category Title (e.g. Bridal Styling Packages 👰) *</label>
                      <input
                        type="text"
                        value={categoryTitle}
                        onChange={(e) => setCategoryTitle(e.target.value)}
                        placeholder="Haldi & Sangeet Styling 💛"
                        className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Category Tagline *</label>
                      <input
                        type="text"
                        value={categoryTagline}
                        onChange={(e) => setCategoryTagline(e.target.value)}
                        placeholder="Tailored silhouttes for sangeet nights and haldi functions"
                        className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Lucide Icon name *</label>
                        <select
                          value={categoryIcon}
                          onChange={(e) => setCategoryIcon(e.target.value)}
                          className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                        >
                          <option value="Crown">Crown</option>
                          <option value="Gift">Gift</option>
                          <option value="Calendar">Calendar</option>
                          <option value="Sparkle">Sparkle</option>
                          <option value="Sparkles">Sparkles</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Theme Hex Color (e.g. #C5A059) *</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={categoryThemeColor}
                            onChange={(e) => setCategoryThemeColor(e.target.value)}
                            className="w-12 h-10 border border-black/10 p-0 rounded-none bg-transparent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={categoryThemeColor}
                            onChange={(e) => setCategoryThemeColor(e.target.value)}
                            placeholder="#C5A059"
                            className="flex-1 bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059] uppercase"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Background Image *</label>
                      <div className="flex flex-col gap-2">
                        {categoryBgImage && (
                          <div className="relative w-32 aspect-[4/3] border border-black/10 overflow-hidden">
                            <img src={categoryBgImage} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={categoryBgImage}
                            onChange={(e) => setCategoryBgImage(e.target.value)}
                            placeholder="/images/bridal_styling_pkg.png"
                            className="flex-1 bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                            required
                          />
                          <label className="bg-brand text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-brand-hover flex items-center justify-center min-w-32 active:scale-95 transition-all text-center select-none shadow-md">
                            {isUploading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Upload File"
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              disabled={isUploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Package Card Settings */}
              <div className="border border-black/5 p-4 space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B18E35] border-b border-black/5 pb-2">
                  2. Package Card Details
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Tier Name *</label>
                    <input
                      type="text"
                      value={tierName}
                      onChange={(e) => setTierName(e.target.value)}
                      placeholder="Essential Elegance (Tier 1)"
                      className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Pricing *</label>
                    <input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="₹15,000"
                      className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                      required
                    />
                  </div>
                </div>

                {/* Features list dynamic */}
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400 flex justify-between items-center">
                    <span>Package Features List *</span>
                    <button
                      type="button"
                      onClick={addFeatureInput}
                      className="text-[9px] font-black uppercase tracking-wider text-[#C5A059] flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <Plus size={10} />
                      <span>Add Feature Row</span>
                    </button>
                  </label>

                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="p-2 bg-neutral-100 text-xs font-bold text-neutral-400 min-w-[28px] text-center">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="e.g. Custom Bridal Outfit: 2"
                          className="flex-1 bg-white text-neutral-800 p-2.5 rounded-none border border-black/10 text-xs font-semibold focus:outline-none focus:border-[#C5A059]"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeFeatureInput(index)}
                          disabled={features.length <= 1}
                          className="p-2 text-neutral-400 hover:text-red-500 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Remove feature item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Exclusive Upgrade Add-on (Optional)</label>
                  <input
                    type="text"
                    value={upgradeBenefit}
                    onChange={(e) => setUpgradeBenefit(e.target.value)}
                    placeholder="e.g. Complimentary Haldi Outfits for Couple"
                    className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-semibold focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Pre-typed WhatsApp message *</label>
                  <textarea
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    placeholder="Hello Tiora Designer Studio, I would like to inquire about..."
                    rows={3}
                    className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-medium focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Display Order (Sorting) *</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-white text-neutral-800 p-3 rounded-none border border-black/10 text-xs font-bold focus:outline-none focus:border-[#C5A059]"
                    required
                  />
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="w-full border border-black/15 text-neutral-700 py-3.5 text-center text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full bg-[#0E2C2C] text-[#C5A059] hover:bg-[#0A2222] py-3.5 text-center text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer shadow-md"
                >
                  {editingPackage ? "Save Changes" : "Create Card"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {packageToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#333333]/80 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setPackageToDelete(null)}
          />
          <div className="relative bg-white w-full max-w-sm rounded-none border border-black/10 shadow-2xl p-8 animate-in zoom-in-95 duration-300 text-center space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-none flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-playfair font-bold text-neutral-800">Confirm Deletion</h3>
              <p className="text-neutral-500 text-xs leading-relaxed">
                Are you sure you want to delete the package card <strong className="text-neutral-800">"{packageToDelete.tierName}"</strong> in <strong className="text-neutral-800">"{packageToDelete.categoryTitle}"</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPackageToDelete(null)}
                className="px-6 py-3.5 border border-black/10 text-neutral-500 hover:bg-neutral-50 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-3.5 bg-red-500 text-white hover:bg-red-600 text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
