import type { CategoryId } from "./categories";
import vitamins from "@/assets/p-vitamins.jpg";
import yogamat from "@/assets/p-yogamat.jpg";
import firstaid from "@/assets/p-firstaid.jpg";
import diapers from "@/assets/p-diapers.jpg";
import babybottle from "@/assets/p-babybottle.jpg";
import cleaner from "@/assets/p-cleaner.jpg";
import microfiber from "@/assets/p-microfiber.jpg";
import notebook from "@/assets/p-notebook.jpg";
import pens from "@/assets/p-pens.jpg";
import petbed from "@/assets/p-petbed.jpg";
import leash from "@/assets/p-leash.jpg";
import carmount from "@/assets/p-carmount.jpg";
import carvacuum from "@/assets/p-carvacuum.jpg";

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  subcategory: string;
  description: string;
  image: string;
  regularPrice: number;
  sellingPrice: number;
  discountPercentage: number;
  rating?: number | undefined;
  reviewCount?: number | undefined;
  inStock: boolean;
  keywords: string[];
  isTrending?: boolean | undefined;
  isNewArrival?: boolean | undefined;
  isFlashSale?: boolean | undefined;
  isFeatured?: boolean | undefined;
};

const cdn = (path: string) => `https://cdn.dummyjson.com/product-images/${path}/thumbnail.webp`;

type Flags = Partial<Pick<Product, "isTrending" | "isNewArrival" | "isFlashSale" | "isFeatured" | "inStock">>;

function p(
  id: string, name: string, brand: string, category: CategoryId, subcategory: string,
  image: string, regularPrice: number, discount: number, rating: [number, number] | null,
  keywords: string[], description: string, flags: Flags = {},
): Product {
  const sellingPrice = Math.round(regularPrice * (1 - discount / 100) * 100) / 100;
  return {
    id, name, brand, category, subcategory, image, regularPrice, sellingPrice,
    discountPercentage: discount, description, keywords,
    rating: rating?.[0], reviewCount: rating?.[1],
    inStock: flags.inStock ?? true,
    isTrending: flags.isTrending, isNewArrival: flags.isNewArrival,
    isFlashSale: flags.isFlashSale, isFeatured: flags.isFeatured,
  };
}

export const products: Product[] = [
  // Women's Clothing
  p("w1", "Black Evening Gown", "Sholok Studio", "womens-clothing", "Dresses", cdn("womens-dresses/black-women's-gown"), 89, 20, [4.6, 128], ["gown", "dress", "party", "evening"], "Floor-length gown with a flattering silhouette for evening occasions.", { isTrending: true, isFlashSale: true }),
  p("w2", "Pea Green Midi Dress", "Sholok Studio", "womens-clothing", "Dresses", cdn("womens-dresses/dress-pea"), 54, 0, [4.4, 61], ["dress", "midi", "casual"], "Breezy midi dress for relaxed everyday wear.", { isNewArrival: true }),
  p("w3", "Blue Summer Frock", "Bloom", "womens-clothing", "Tops & Frocks", cdn("tops/blue-frock"), 32, 15, [4.3, 42], ["frock", "summer", "dress"], "Lightweight frock in a soft blue tone.", { isFlashSale: true }),
  p("w4", "Floral Summer Dress", "Bloom", "womens-clothing", "Dresses", cdn("tops/girl-summer-dress"), 38, 10, [4.5, 77], ["dress", "summer", "floral"], "Floral dress made for sunny days.", { isTrending: true }),
  p("w5", "Classic Tartan Dress", "Bloom", "womens-clothing", "Dresses", cdn("tops/tartan-dress"), 46, 0, null, ["dress", "tartan", "check"], "Timeless tartan pattern in a comfortable cut.", { inStock: false }),
  p("w6", "Soft Gray Day Dress", "Sholok Studio", "womens-clothing", "Dresses", cdn("tops/gray-dress"), 41, 0, [4.2, 19], ["dress", "gray", "casual"], "Minimal gray dress that pairs with everything.", { isNewArrival: true }),
  // Men's Clothing
  p("m1", "Blue & Black Check Shirt", "Fashion Trends", "mens-clothing", "Shirts", cdn("mens-shirts/blue-%26-black-check-shirt"), 34, 15, [4.4, 96], ["shirt", "check", "casual"], "Brushed cotton check shirt with a relaxed fit.", { isTrending: true, isFlashSale: true }),
  p("m2", "Classic Plaid Shirt", "Classic Wear", "mens-clothing", "Shirts", cdn("mens-shirts/man-plaid-shirt"), 36, 0, [4.3, 54], ["shirt", "plaid"], "Everyday plaid shirt with durable stitching."),
  p("m3", "Short Sleeve Casual Shirt", "Casual Comfort", "mens-clothing", "Shirts", cdn("mens-shirts/man-short-sleeve-shirt"), 26, 10, [4.1, 38], ["shirt", "short sleeve", "summer"], "Cool, breathable short-sleeve shirt.", { isNewArrival: true }),
  p("m4", "Urban Check Shirt", "Urban Chic", "mens-clothing", "Shirts", cdn("mens-shirts/men-check-shirt"), 32, 0, [4.5, 71], ["shirt", "check"], "Smart check shirt for office or weekend."),
  p("m5", "Graphic Gaming T-Shirt", "Aorus", "mens-clothing", "T-Shirts", cdn("mens-shirts/gigabyte-aorus-men-tshirt"), 22, 0, [4.0, 23], ["t-shirt", "tee", "graphic"], "Soft cotton tee with bold graphic print."),
  // Beauty & Makeup
  p("b1", "Lash Princess Mascara", "Essence", "beauty-makeup", "Eyes", cdn("beauty/essence-mascara-lash-princess"), 12, 25, [4.7, 312], ["mascara", "eyes", "makeup"], "Volumizing and lengthening mascara.", { isTrending: true, isFlashSale: true }),
  p("b2", "Eyeshadow Palette with Mirror", "Glamour Beauty", "beauty-makeup", "Eyes", cdn("beauty/eyeshadow-palette-with-mirror"), 24, 20, [4.5, 140], ["eyeshadow", "palette", "makeup"], "Twelve blendable shades with a handy mirror.", { isFlashSale: true }),
  p("b3", "Velvet Setting Powder", "Velvet Touch", "beauty-makeup", "Face", cdn("beauty/powder-canister"), 18, 0, [4.2, 66], ["powder", "face", "makeup"], "Silky setting powder for a soft-matte finish.", { isNewArrival: true }),
  p("b4", "Classic Red Lipstick", "Chic Cosmetics", "beauty-makeup", "Lips", cdn("beauty/red-lipstick"), 15, 10, [4.6, 201], ["lipstick", "lips", "red", "makeup"], "Long-wearing, richly pigmented red lipstick.", { isTrending: true }),
  p("b5", "Red Nail Polish", "Nail Couture", "beauty-makeup", "Nails", cdn("beauty/red-nail-polish"), 9, 0, [4.3, 88], ["nail polish", "nails", "red"], "Glossy, chip-resistant nail colour."),
  // Personal Care
  p("pc1", "Super Leaves Hand Soap", "Attitude", "personal-care", "Hand Care", cdn("skin-care/attitude-super-leaves-hand-soap"), 11, 0, [4.4, 57], ["soap", "hand wash", "skin care"], "Gentle plant-based hand soap."),
  p("pc2", "Shea Butter Body Wash", "Olay", "personal-care", "Bath & Body", cdn("skin-care/olay-ultra-moisture-shea-butter-body-wash"), 14, 15, [4.6, 174], ["body wash", "shower", "skin care"], "Ultra-moisturizing body wash with shea butter.", { isTrending: true, isFlashSale: true }),
  p("pc3", "Men's Body & Face Lotion", "Vaseline", "personal-care", "Skin Care", cdn("skin-care/vaseline-men-body-and-face-lotion"), 13, 0, [4.3, 92], ["lotion", "men", "skin care"], "Non-greasy lotion for face and body.", { isNewArrival: true }),
  p("pc4", "CK One Eau de Toilette", "Calvin Klein", "personal-care", "Fragrance", cdn("fragrances/calvin-klein-ck-one"), 58, 10, [4.5, 210], ["perfume", "fragrance", "unisex"], "Fresh, clean unisex fragrance.", { isFeatured: true }),
  p("pc5", "Coco Noir Eau de Parfum", "Chanel", "personal-care", "Fragrance", cdn("fragrances/chanel-coco-noir-eau-de"), 135, 0, [4.8, 76], ["perfume", "fragrance", "women"], "Elegant, deep floral fragrance.", { isTrending: true }),
  // Fashion & Lifestyle
  p("f1", "Blue Women's Handbag", "Fashionista", "fashion-lifestyle", "Bags", cdn("womens-bags/blue-women's-handbag"), 48, 20, [4.4, 63], ["bag", "handbag", "women"], "Structured handbag with a detachable strap.", { isFlashSale: true, isTrending: true }),
  p("f2", "Classic Black Handbag", "Elegance Collection", "fashion-lifestyle", "Bags", cdn("womens-bags/women-handbag-black"), 56, 0, [4.6, 98], ["bag", "handbag", "black"], "Versatile black handbag for daily use.", { isFeatured: true }),
  p("f3", "Black Sunglasses", "Fashion Shades", "fashion-lifestyle", "Eyewear", cdn("sunglasses/black-sun-glasses"), 19, 15, [4.2, 45], ["sunglasses", "eyewear", "shades"], "UV-protective black sunglasses."),
  p("f4", "Classic Sunglasses", "Fashion Shades", "fashion-lifestyle", "Eyewear", cdn("sunglasses/classic-sun-glasses"), 21, 0, [4.3, 37], ["sunglasses", "eyewear"], "Retro-inspired everyday sunglasses.", { isNewArrival: true }),
  p("f5", "Brown Leather Belt Watch", "Fashion Timepieces", "fashion-lifestyle", "Watches", cdn("mens-watches/brown-leather-belt-watch"), 65, 25, [4.5, 120], ["watch", "leather", "men"], "Minimal dial with a genuine leather strap.", { isFlashSale: true, isTrending: true }),
  p("f6", "Gold Women's Watch", "Fashion Gold", "fashion-lifestyle", "Watches", cdn("womens-watches/watch-gold-for-women"), 72, 0, [4.6, 54], ["watch", "gold", "women"], "Gold-tone watch with a slim bracelet."),
  p("f7", "Green Crystal Earrings", "Sholok Studio", "fashion-lifestyle", "Jewellery", cdn("womens-jewellery/green-crystal-earring"), 17, 0, [4.4, 29], ["earrings", "jewellery", "crystal"], "Sparkling crystal drop earrings.", { isNewArrival: true }),
  p("f8", "Black & Brown Slippers", "Comfort Trends", "fashion-lifestyle", "Footwear", cdn("womens-shoes/black-%26-brown-slipper"), 16, 10, [4.1, 34], ["slippers", "footwear", "sandals"], "Cushioned slippers for all-day comfort."),
  p("f9", "Classic Heel Shoes", "Calvin Klein", "fashion-lifestyle", "Footwear", cdn("womens-shoes/calvin-klein-heel-shoes"), 79, 15, [4.5, 58], ["heels", "shoes", "footwear", "women"], "Elegant pointed heels.", { isTrending: true }),
  p("f10", "Air Jordan 1 Red & Black", "Nike", "fashion-lifestyle", "Sneakers", cdn("mens-shoes/nike-air-jordan-1-red-and-black"), 160, 10, [4.8, 330], ["sneakers", "shoes", "footwear", "men"], "Iconic high-top sneakers.", { isTrending: true, isFeatured: true }),
  p("f11", "Future Rider Trainers", "Puma", "fashion-lifestyle", "Sneakers", cdn("mens-shoes/puma-future-rider-trainers"), 85, 20, [4.4, 112], ["sneakers", "trainers", "shoes", "running"], "Lightweight retro-runner trainers.", { isFlashSale: true }),
  // Health & Wellness
  p("h1", "Daily Multivitamin, 120 Tablets", "Sholok Wellness", "health-wellness", "Supplements", vitamins, 18, 10, [4.5, 84], ["vitamins", "supplement", "multivitamin"], "Everyday multivitamin to support a balanced routine.", { isTrending: true }),
  p("h2", "Non-Slip Yoga Mat", "FlexFit", "health-wellness", "Fitness", yogamat, 29, 20, [4.6, 142], ["yoga", "mat", "fitness", "exercise"], "6mm cushioned mat with a carry strap.", { isFlashSale: true, isNewArrival: true }),
  p("h3", "Compact First Aid Kit", "CareFirst", "health-wellness", "First Aid", firstaid, 22, 0, [4.7, 63], ["first aid", "medical kit", "safety"], "Travel-size kit with everyday essentials."),
  // Baby Care
  p("bc1", "Soft Baby Diapers, Size 3", "LittleCloud", "baby-care", "Diapering", diapers, 16, 10, [4.6, 205], ["diapers", "baby", "nappies"], "Ultra-soft, high-absorbency diapers.", { isTrending: true, isFlashSale: true }),
  p("bc2", "Anti-Colic Feeding Bottle", "LittleCloud", "baby-care", "Feeding", babybottle, 12, 0, [4.4, 71], ["baby bottle", "feeding", "baby"], "180ml bottle with a soft silicone nipple.", { isNewArrival: true }),
  // Home & Kitchen
  p("hk1", "Modern Table Lamp", "Lumio Home", "home-kitchen", "Decor", cdn("home-decoration/table-lamp"), 39, 15, [4.5, 66], ["lamp", "lighting", "decor"], "Warm ambient lamp for bedside or desk.", { isTrending: true }),
  p("hk2", "Family Tree Photo Frame", "Lumio Home", "home-kitchen", "Decor", cdn("home-decoration/family-tree-photo-frame"), 27, 0, [4.3, 21], ["photo frame", "decor", "gift"], "Display your favourite memories."),
  p("hk3", "Ceramic Plant Pot", "Lumio Home", "home-kitchen", "Decor", cdn("home-decoration/plant-pot"), 14, 0, [4.2, 33], ["plant pot", "planter", "decor"], "Minimal ceramic planter.", { isNewArrival: true }),
  p("hk4", "Countertop Blender", "KitchenPro", "home-kitchen", "Appliances", cdn("kitchen-accessories/boxed-blender"), 69, 20, [4.4, 97], ["blender", "appliance", "kitchen"], "Powerful blender for smoothies and more.", { isFlashSale: true, isFeatured: true }),
  p("hk5", "Carbon Steel Wok", "KitchenPro", "home-kitchen", "Cookware", cdn("kitchen-accessories/carbon-steel-wok"), 34, 0, [4.6, 52], ["wok", "cookware", "pan"], "Heats fast and evenly for stir-fry."),
  p("hk6", "Hand Blender", "KitchenPro", "home-kitchen", "Appliances", cdn("kitchen-accessories/hand-blender"), 31, 10, [4.3, 44], ["hand blender", "appliance"], "Compact immersion blender."),
  p("hk7", "Insulated Lunch Box", "KitchenPro", "home-kitchen", "Storage", cdn("kitchen-accessories/lunch-box"), 15, 0, [4.2, 58], ["lunch box", "storage", "tiffin"], "Leak-resistant lunch box with compartments."),
  p("hk8", "Rotating Spice Rack", "KitchenPro", "home-kitchen", "Storage", cdn("kitchen-accessories/spice-rack"), 24, 0, null, ["spice rack", "storage", "organizer"], "Keep jars organized and in reach.", { isNewArrival: true }),
  // Cleaning Supplies
  p("cs1", "Multi-Surface Cleaning Spray", "FreshNest", "cleaning-supplies", "Surface Care", cleaner, 7, 0, [4.4, 119], ["cleaner", "spray", "surface"], "Streak-free cleaner for everyday surfaces.", { isTrending: true }),
  p("cs2", "Microfiber Cloths, 5-Pack", "FreshNest", "cleaning-supplies", "Cloths", microfiber, 10, 20, [4.7, 186], ["microfiber", "cloth", "duster"], "Lint-free cloths for dusting and polishing.", { isFlashSale: true }),
  // Stationery & Office
  p("so1", "Hardcover Notebook & Pen Set", "PaperLane", "stationery-office", "Notebooks", notebook, 19, 0, [4.6, 48], ["notebook", "journal", "pen"], "A5 dotted notebook with a gold-tone pen.", { isNewArrival: true, isTrending: true }),
  p("so2", "Gel Pens & Highlighters Set", "PaperLane", "stationery-office", "Writing", pens, 12, 15, [4.5, 93], ["pens", "highlighter", "gel pen"], "Seven gel pens and five highlighters.", { isFlashSale: true }),
  // Pet Care
  p("pt1", "Plush Round Pet Bed", "PawHaven", "pet-care", "Beds", petbed, 42, 15, [4.7, 77], ["pet bed", "dog", "cat"], "Cozy calming bed with a free chew toy.", { isTrending: true }),
  p("pt2", "Nylon Leash & Collar Set", "PawHaven", "pet-care", "Walking", leash, 14, 0, [4.4, 41], ["leash", "collar", "dog"], "Adjustable collar with a matching leash.", { isNewArrival: true }),
  // Toys & Sports
  p("ts1", "Indoor/Outdoor Basketball", "ProSport", "toys-sports", "Balls", cdn("sports-accessories/basketball"), 25, 10, [4.5, 66], ["basketball", "ball", "sports"], "Durable grip for indoor and outdoor play.", { isTrending: true }),
  p("ts2", "English Willow Cricket Bat", "ProSport", "toys-sports", "Cricket", cdn("sports-accessories/cricket-bat"), 75, 20, [4.6, 59], ["cricket", "bat", "sports"], "Well-balanced bat for club play.", { isFlashSale: true }),
  p("ts3", "Tennis Racket", "ProSport", "toys-sports", "Racket Sports", cdn("sports-accessories/tennis-racket"), 58, 0, [4.3, 27], ["tennis", "racket", "sports"], "Lightweight racket for all levels."),
  p("ts4", "Match Football", "ProSport", "toys-sports", "Balls", cdn("sports-accessories/football"), 21, 0, [4.4, 82], ["football", "soccer", "ball"], "Stitched match-quality football.", { isNewArrival: true }),
  p("ts5", "Feather Shuttlecocks", "ProSport", "toys-sports", "Racket Sports", cdn("sports-accessories/feather-shuttlecock"), 9, 0, null, ["badminton", "shuttlecock"], "Tube of tournament-style shuttlecocks."),
  // Vehicle Essentials
  p("v1", "Dashboard Phone Mount", "DriveMate", "vehicle-essentials", "Accessories", carmount, 17, 15, [4.4, 102], ["phone holder", "car mount", "car"], "Adjustable suction-cup phone holder.", { isTrending: true }),
  p("v2", "Portable Car Vacuum", "DriveMate", "vehicle-essentials", "Cleaning", carvacuum, 36, 20, [4.5, 68], ["car vacuum", "vacuum", "car cleaning"], "12V handheld vacuum with three nozzles.", { isFlashSale: true }),
  p("v3", "Magnetic Travel Power Bank", "DriveMate", "vehicle-essentials", "Accessories", cdn("mobile-accessories/apple-magsafe-battery-pack"), 49, 10, [4.4, 57], ["power bank", "battery", "car", "travel"], "Snap-on battery pack to keep your phone charged on the road.", { isNewArrival: true }),
  // More Home & Kitchen
  p("hk9", "Wooden Chopping Board", "KitchenPro", "home-kitchen", "Cookware", cdn("kitchen-accessories/chopping-board"), 16, 0, [4.5, 73], ["chopping board", "cutting board", "kitchen"], "Sturdy hardwood board for daily prep."),
  p("hk10", "Non-Stick Frying Pan", "KitchenPro", "home-kitchen", "Cookware", cdn("kitchen-accessories/pan"), 28, 15, [4.4, 88], ["pan", "frying pan", "cookware"], "Even-heating pan with a cool-touch handle.", { isFlashSale: true }),
  p("hk11", "Compact Microwave Oven", "KitchenPro", "home-kitchen", "Appliances", cdn("kitchen-accessories/microwave-oven"), 120, 10, [4.5, 64], ["microwave", "oven", "appliance"], "20L microwave with quick-reheat presets.", { isTrending: true }),
  p("hk12", "Steel Pot with Glass Lid", "KitchenPro", "home-kitchen", "Cookware", cdn("kitchen-accessories/silver-pot-with-glass-cap"), 33, 0, [4.3, 41], ["pot", "saucepan", "cookware"], "Stainless steel pot with a see-through lid.", { isNewArrival: true }),
  p("hk13", "Showpiece Indoor Plant", "Lumio Home", "home-kitchen", "Decor", cdn("home-decoration/house-showpiece-plant"), 22, 0, [4.4, 36], ["plant", "decor", "showpiece"], "Life-like plant that brightens any corner."),
  p("hk14", "Decorative Hanging Swing", "Lumio Home", "home-kitchen", "Decor", cdn("home-decoration/decoration-swing"), 45, 15, [4.2, 18], ["swing", "decor", "hanging"], "Handcrafted swing showpiece for living spaces."),
  p("hk15", "Mug Tree Stand", "KitchenPro", "home-kitchen", "Storage", cdn("kitchen-accessories/mug-tree-stand"), 13, 0, [4.3, 29], ["mug stand", "storage", "organizer"], "Keeps six mugs tidy and within reach."),
  // More Health & Wellness
  p("h4", "Whey Protein Powder, 1kg", "Sholok Wellness", "health-wellness", "Supplements", cdn("groceries/protein-powder"), 38, 15, [4.6, 132], ["protein", "whey", "supplement", "fitness"], "Smooth chocolate whey for post-workout recovery.", { isTrending: true, isFlashSale: true }),
  p("h5", "Pure Natural Honey Jar", "Sholok Wellness", "health-wellness", "Natural Foods", cdn("groceries/honey-jar"), 12, 0, [4.7, 95], ["honey", "natural", "healthy"], "Raw, unprocessed honey in a glass jar.", { isNewArrival: true }),
  p("h6", "Smart Fitness Watch", "FlexFit", "health-wellness", "Fitness", cdn("mobile-accessories/apple-watch-series-4-gold"), 199, 10, [4.6, 211], ["smart watch", "fitness tracker", "health"], "Tracks heart rate, steps and workouts.", { isTrending: true }),
  // More Pet Care
  p("pt3", "Adult Dog Food, 3kg", "PawHaven", "pet-care", "Food", cdn("groceries/dog-food"), 24, 10, [4.6, 118], ["dog food", "pet food", "dog"], "Balanced nutrition for active adult dogs.", { isTrending: true }),
  p("pt4", "Ocean Fish Cat Food", "PawHaven", "pet-care", "Food", cdn("groceries/cat-food"), 19, 0, [4.5, 87], ["cat food", "pet food", "cat"], "Tasty, protein-rich meals for cats.", { isNewArrival: true }),
  // More Cleaning, Stationery & Office
  p("cs3", "Soft Tissue Paper Box", "FreshNest", "cleaning-supplies", "Paper Goods", cdn("groceries/tissue-paper-box"), 4, 0, [4.4, 154], ["tissue", "napkin", "paper"], "Two-ply tissues for home and office."),
  p("so3", "Executive Office Chair", "PaperLane", "stationery-office", "Furniture", cdn("furniture/knoll-saarinen-executive-conference-chair"), 210, 15, [4.5, 39], ["office chair", "chair", "desk"], "Ergonomic chair for long work sessions.", { isTrending: true }),
  p("so4", "Wireless Desk Charger", "PaperLane", "stationery-office", "Desk Accessories", cdn("mobile-accessories/apple-airpower-wireless-charger"), 29, 0, [4.2, 46], ["charger", "wireless", "desk"], "Slim pad that keeps your desk cable-free.", { isNewArrival: true }),
  // More Toys & Sports
  p("ts6", "Beach Volleyball", "ProSport", "toys-sports", "Balls", cdn("sports-accessories/volleyball"), 18, 10, [4.4, 52], ["volleyball", "ball", "beach"], "Soft-touch ball for beach and indoor play."),
  p("ts7", "Tennis Balls, 3-Pack", "ProSport", "toys-sports", "Racket Sports", cdn("sports-accessories/tennis-ball"), 8, 0, [4.5, 77], ["tennis", "ball"], "Pressurised balls with consistent bounce."),
  p("ts8", "Leather Cricket Ball", "ProSport", "toys-sports", "Cricket", cdn("sports-accessories/cricket-ball"), 12, 0, [4.6, 64], ["cricket", "ball", "leather"], "Hand-stitched ball for matches and nets.", { isNewArrival: true }),
  p("ts9", "Cricket Batting Helmet", "ProSport", "toys-sports", "Cricket", cdn("sports-accessories/cricket-helmet"), 55, 20, [4.5, 31], ["cricket", "helmet", "safety"], "Lightweight helmet with a steel grille.", { isFlashSale: true }),
  p("ts10", "American Football", "ProSport", "toys-sports", "Balls", cdn("sports-accessories/american-football"), 23, 0, [4.3, 22], ["american football", "ball"], "Grippy composite-leather ball."),
  p("ts11", "Baseball Glove", "ProSport", "toys-sports", "Baseball", cdn("sports-accessories/baseball-glove"), 34, 0, [4.4, 19], ["baseball", "glove", "mitt"], "Soft leather glove with a deep pocket."),
  // More Fashion & Lifestyle
  p("f12", "Green Oval Earrings", "Sholok Studio", "fashion-lifestyle", "Jewellery", cdn("womens-jewellery/green-oval-earring"), 15, 0, [4.3, 26], ["earrings", "jewellery", "green"], "Elegant oval drops for every day."),
  p("f13", "Tropical Statement Earrings", "Sholok Studio", "fashion-lifestyle", "Jewellery", cdn("womens-jewellery/tropical-earring"), 18, 10, [4.5, 33], ["earrings", "jewellery", "statement"], "Colourful earrings with a playful twist.", { isTrending: true }),
  p("f14", "Wireless Earbuds", "Apple", "fashion-lifestyle", "Gadgets", cdn("mobile-accessories/apple-airpods"), 129, 10, [4.7, 402], ["earbuds", "airpods", "wireless", "audio"], "True wireless earbuds with a charging case.", { isTrending: true }),
  p("f15", "Flex Wireless Earphones", "Beats", "fashion-lifestyle", "Gadgets", cdn("mobile-accessories/beats-flex-wireless-earphones"), 69, 15, [4.4, 158], ["earphones", "wireless", "audio"], "All-day neckband earphones with magnetic buds.", { isNewArrival: true }),
];

export const productById = (id: string) => products.find((x) => x.id === id);
