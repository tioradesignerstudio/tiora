import { db } from "./index";
import { sql } from "drizzle-orm";

async function runMigration() {
  console.log("Starting Packages table migration...");

  // 1. Create table query
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "service_packages" (
      "id" integer PRIMARY KEY AUTOINCREMENT,
      "category_title" text NOT NULL,
      "category_tagline" text NOT NULL,
      "category_bg_image" text NOT NULL,
      "category_icon" text NOT NULL DEFAULT 'Crown',
      "category_theme_color" text NOT NULL DEFAULT '#C5A059',
      "tier_name" text NOT NULL,
      "price" text NOT NULL,
      "features" text NOT NULL,
      "upgrade_benefit" text,
      "whatsapp_msg" text NOT NULL,
      "order" integer NOT NULL DEFAULT 0,
      "created_at" text NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `;

  try {
    await db.run(sql.raw(createTableQuery));
    console.log("service_packages table created or already exists.");
  } catch (error) {
    console.error("Failed to create service_packages table:", error);
    process.exit(1);
  }

  // 2. Check if table is empty
  let isTableEmpty = true;
  try {
    const result = await db.run(sql.raw('SELECT COUNT(*) as count FROM "service_packages"'));
    const rows = result.rows as any[];
    if (rows && rows.length > 0 && rows[0].count > 0) {
      isTableEmpty = false;
      console.log(`service_packages table has ${rows[0].count} existing packages. Seeding skipped.`);
    }
  } catch (error) {
    console.error("Failed to count service_packages rows:", error);
  }

  if (!isTableEmpty) {
    process.exit(0);
  }

  // 3. Seed initial 12 packages
  console.log("Seeding default package templates...");

  const defaultPackages = [
    // 1. Bridal Styling Packages
    {
      category_title: "Bridal Styling Packages 👰",
      category_tagline: "Ultra-luxury bridal coordination, customized fits, and family styling",
      category_bg_image: "/images/bridal_styling_pkg.png",
      category_icon: "Crown",
      category_theme_color: "#C5A059",
      tier_name: "Essential Elegance (Tier 1)",
      price: "₹15,000",
      features: JSON.stringify([
        "Custom Bridal Outfit: 2",
        "Family Outfit Coordination: 1",
        "Premium Designs & Perfect Fit",
        "Complimentary Haldi Outfit: 1"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Bridal Styling - Essential Elegance Package (₹15,000) for my wedding events.",
      order: 1
    },
    {
      category_title: "Bridal Styling Packages 👰",
      category_tagline: "Ultra-luxury bridal coordination, customized fits, and family styling",
      category_bg_image: "/images/bridal_styling_pkg.png",
      category_icon: "Crown",
      category_theme_color: "#C5A059",
      tier_name: "Signature Experience (Tier 2)",
      price: "₹20,000",
      features: JSON.stringify([
        "Custom Bridal Outfit: 2",
        "Family Outfit Coordination: 1",
        "Premium Designs & Perfect Fit",
        "Complimentary Haldi Outfit: 1",
        "Advanced Bridal Couture Silhouette Layouts"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Bridal Styling - Signature Experience Package (₹20,000) for my wedding events.",
      order: 2
    },
    {
      category_title: "Bridal Styling Packages 👰",
      category_tagline: "Ultra-luxury bridal coordination, customized fits, and family styling",
      category_bg_image: "/images/bridal_styling_pkg.png",
      category_icon: "Crown",
      category_theme_color: "#C5A059",
      tier_name: "Royal Couture (Tier 3)",
      price: "₹50,000",
      features: JSON.stringify([
        "Custom Bridal Outfit: 2",
        "Family Outfit Coordination: 1",
        "Premium Fabrics & Intricate Work",
        "Detailed zari / embroidery / premium finishing",
        "Complimentary Haldi Outfit: 1"
      ]),
      upgrade_benefit: "Complimentary Haldi Outfits for Couple",
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Bridal Styling - Royal Couture Package (₹50,000) for my wedding events.",
      order: 3
    },

    // 2. Birthday Celebration Styling
    {
      category_title: "Birthday Celebration Styling 🎂",
      category_tagline: "Celebrate your star moment in theme-matched custom aesthetics",
      category_bg_image: "/images/birthday_styling_pkg.png",
      category_icon: "Gift",
      category_theme_color: "#B8738D",
      tier_name: "Essential Elegance (Tier 1)",
      price: "₹6,000",
      features: JSON.stringify([
        "Customized Outfit for Event Star: 1",
        "Matching Family Looks (Optional): 1",
        "Theme-Based Designs (Princess / Pastel / Traditional)"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Birthday Styling - Essential Elegance Package (₹6,000) for my celebration.",
      order: 1
    },
    {
      category_title: "Birthday Celebration Styling 🎂",
      category_tagline: "Celebrate your star moment in theme-matched custom aesthetics",
      category_bg_image: "/images/birthday_styling_pkg.png",
      category_icon: "Gift",
      category_theme_color: "#B8738D",
      tier_name: "Signature Experience (Tier 2)",
      price: "₹15,000",
      features: JSON.stringify([
        "Customized Outfit for Event Star: 2",
        "Matching Family Looks (Optional)",
        "Theme-Based Designs (Princess / Pastel / Traditional)",
        "Advanced Theme Styling & Accessories Matching"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Birthday Styling - Signature Experience (₹15,000) for my celebration.",
      order: 2
    },
    {
      category_title: "Birthday Celebration Styling 🎂",
      category_tagline: "Celebrate your star moment in theme-matched custom aesthetics",
      category_bg_image: "/images/birthday_styling_pkg.png",
      category_icon: "Gift",
      category_theme_color: "#B8738D",
      tier_name: "Royal Couture (Tier 3)",
      price: "₹30,000",
      features: JSON.stringify([
        "Customized Outfit for Event Star: 2",
        "Matching Family Looks: 1",
        "Theme-Based Designs (Princess / Pastel / Traditional)"
      ]),
      upgrade_benefit: "Extra designer outfit / premium theme styling",
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Birthday Styling - Royal Couture Package (₹30,000) for my celebration.",
      order: 3
    },

    // 3. House Ceremony Styling
    {
      category_title: "House Ceremony Styling 🏡",
      category_tagline: "Warm traditional coordinating looks for poojas and housewarmings",
      category_bg_image: "/images/house_ceremony_pkg.png",
      category_icon: "Calendar",
      category_theme_color: "#0E2C2C",
      tier_name: "Essential Elegance (Tier 1)",
      price: "₹6,000",
      features: JSON.stringify([
        "Elegant Traditional Outfits: 2",
        "Simple & Classy Designs",
        "Family Coordination Options"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the House Ceremony - Classic Traditional Package (₹6,000) for my housewarming/pooja event.",
      order: 1
    },
    {
      category_title: "House Ceremony Styling 🏡",
      category_tagline: "Warm traditional coordinating looks for poojas and housewarmings",
      category_bg_image: "/images/house_ceremony_pkg.png",
      category_icon: "Calendar",
      category_theme_color: "#0E2C2C",
      tier_name: "Signature Experience (Tier 2)",
      price: "₹8,000",
      features: JSON.stringify([
        "Elegant Traditional Outfits: 2",
        "Simple & Classy Designs",
        "Family Coordination Options",
        "Advanced Silhouettes & Saree Styling details"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the House Ceremony - Signature Experience Package (₹8,000) for my housewarming/pooja event.",
      order: 2
    },
    {
      category_title: "House Ceremony Styling 🏡",
      category_tagline: "Warm traditional coordinating looks for poojas and housewarmings",
      category_bg_image: "/images/house_ceremony_pkg.png",
      category_icon: "Calendar",
      category_theme_color: "#0E2C2C",
      tier_name: "Royal Couture (Tier 3)",
      price: "₹15,000",
      features: JSON.stringify([
        "Elegant Traditional Outfits: 2",
        "Simple & Classy Designs",
        "Family Coordination Options"
      ]),
      upgrade_benefit: "Family coordination upgrade (Premium coordinating fits)",
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the House Ceremony - Royal Couture Package (₹15,000) for my housewarming/pooja event.",
      order: 3
    },

    // 4. Half Saree & Mature Function Styling
    {
      category_title: "Half Saree & Mature Function Styling 🌸",
      category_tagline: "Classical designer outfits tailored for special occasions and heritage ceremonies",
      category_bg_image: "/images/half_saree_pkg.png",
      category_icon: "Sparkle",
      category_theme_color: "#9E2A2B",
      tier_name: "Essential Elegance (Tier 1)",
      price: "₹6,000",
      features: JSON.stringify([
        "Occasion-Specific Designer Outfit: 2",
        "Traditional + Modern Styling",
        "Detailed Finishing & Fit"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Mature Function Styling - Essential Elegance Package (₹6,000).",
      order: 1
    },
    {
      category_title: "Half Saree & Mature Function Styling 🌸",
      category_tagline: "Classical designer outfits tailored for special occasions and heritage ceremonies",
      category_bg_image: "/images/half_saree_pkg.png",
      category_icon: "Sparkle",
      category_theme_color: "#9E2A2B",
      tier_name: "Signature Experience (Tier 2)",
      price: "₹10,000",
      features: JSON.stringify([
        "Occasion-Specific Designer Outfit: 2",
        "Traditional + Modern Styling",
        "Detailed Finishing & Fit",
        "Premium Embroidery & Color Coordination"
      ]),
      upgrade_benefit: null,
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Half Saree Styling - Signature Experience Package (₹10,000).",
      order: 2
    },
    {
      category_title: "Half Saree & Mature Function Styling 🌸",
      category_tagline: "Classical designer outfits tailored for special occasions and heritage ceremonies",
      category_bg_image: "/images/half_saree_pkg.png",
      category_icon: "Sparkle",
      category_theme_color: "#9E2A2B",
      tier_name: "Royal Couture (Tier 3)",
      price: "₹20,000",
      features: JSON.stringify([
        "Occasion-Specific Designer Outfit: 2",
        "Traditional + Modern Styling",
        "Detailed Finishing & Fit"
      ]),
      upgrade_benefit: "Heavy design enhancement & complimentary matching accessories",
      whatsapp_msg: "Hello Tiora Designer Studio, I would like to inquire about the Half Saree Styling - Royal Couture Package (₹20,000).",
      order: 3
    }
  ];

  // Clear any partial data first
  try {
    await db.run(sql.raw('DELETE FROM "service_packages"'));
  } catch (e) {
    console.log("Could not clear service_packages (might be empty).");
  }

  for (const pkg of defaultPackages) {
    try {
      const query = sql`
        INSERT INTO "service_packages" (
          "category_title", "category_tagline", "category_bg_image", "category_icon", 
          "category_theme_color", "tier_name", "price", "features", "upgrade_benefit", 
          "whatsapp_msg", "order"
        ) VALUES (
          ${pkg.category_title}, ${pkg.category_tagline}, ${pkg.category_bg_image}, ${pkg.category_icon}, 
          ${pkg.category_theme_color}, ${pkg.tier_name}, ${pkg.price}, ${pkg.features}, ${pkg.upgrade_benefit}, 
          ${pkg.whatsapp_msg}, ${pkg.order}
        )
      `;
      await db.run(query);
    } catch (error) {
      console.error(`Failed to seed package ${pkg.tier_name} in ${pkg.category_title}:`, error);
    }
  }

  console.log("Seeding complete. Packages successfully migrated and populated.");
}

runMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Migration script failed:", err);
    process.exit(1);
  });
