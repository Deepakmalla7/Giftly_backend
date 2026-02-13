import mongoose from "mongoose";
import { GiftModel } from "../models/gift.model";
import { MONGODB_URI } from "../configs";

const sampleGifts = [
  {
    name: "Classic Analog Watch",
    description: "Elegant analog watch with leather strap and stainless steel case",
    category: "accessories",
    price: 129.99,
    occasion: ["birthday", "anniversary", "graduation"],
    recipientType: "male",
    tags: ["watch", "accessories", "classic", "male", "adult"],
    popularityScore: 95,
    imageUrl: "https://images.unsplash.com/photo-1523170335684-f042fb2c6ee1?w=400",
    stock: 25
  },
  {
    name: "Luxury Perfume for Women",
    description: "Premium fragrance with floral and fruity notes",
    category: "beauty",
    price: 89.99,
    occasion: ["birthday", "valentine", "anniversary"],
    recipientType: "female",
    tags: ["perfume", "beauty", "fragrance", "female", "adult"],
    popularityScore: 92,
    imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400",
    stock: 40
  },
  {
    name: "Premium Leather Wallet",
    description: "Minimalist RFID-blocking wallet made from full-grain leather",
    category: "accessories",
    price: 59.99,
    occasion: ["birthday", "father", "graduation"],
    recipientType: "unisex",
    tags: ["wallet", "accessories", "leather", "unisex"],
    popularityScore: 88,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    stock: 60
  },
  {
    name: "Fresh Flower Bouquet",
    description: "Seasonal fresh flowers arranged beautifully for special occasions",
    category: "flowers",
    price: 49.99,
    occasion: ["birthday", "anniversary", "valentine", "wedding"],
    recipientType: "unisex",
    tags: ["flowers", "romantic", "birthday", "anniversary"],
    popularityScore: 85,
    imageUrl: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400",
    stock: 100
  },
  {
    name: "Durable Leather Boots",
    description: "Professional leather boots suitable for work and casual wear",
    category: "fashion",
    price: 149.99,
    occasion: ["birthday", "graduation"],
    recipientType: "male",
    tags: ["boots", "fashion", "shoes", "male"],
    popularityScore: 82,
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400",
    stock: 18
  },
  {
    name: "Smart Speaker Pro",
    description: "Voice-controlled smart speaker with premium audio quality",
    category: "tech",
    price: 119.99,
    occasion: ["birthday", "housewarming", "wedding"],
    recipientType: "unisex",
    tags: ["tech", "speaker", "smart", "home-automation"],
    popularityScore: 90,
    imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
    stock: 35
  },
  {
    name: "Wireless Earbuds",
    description: "High-quality wireless earbuds with noise cancellation",
    category: "tech",
    price: 99.99,
    occasion: ["birthday", "graduation"],
    recipientType: "unisex",
    tags: ["tech", "audio", "wireless", "earbuds"],
    popularityScore: 94,
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    stock: 50
  },
  {
    name: "Luxury Handbag",
    description: "Designer handbag made with premium materials",
    category: "accessories",
    price: 199.99,
    occasion: ["birthday", "anniversary", "valentine"],
    recipientType: "female",
    tags: ["handbag", "fashion", "accessories", "female"],
    popularityScore: 87,
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400",
    stock: 20
  },
  {
    name: "Coffee Maker Premium",
    description: "Programmable coffee maker with thermal carafe",
    category: "home",
    price: 139.99,
    occasion: ["housewarming", "wedding"],
    recipientType: "unisex",
    tags: ["coffee", "home", "kitchen", "appliances"],
    popularityScore: 79,
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9ebb02ae2a0e?w=400",
    stock: 22
  },
  {
    name: "Yoga Mat Premium",
    description: "Non-slip yoga mat with carrying strap and alignment markers",
    category: "fitness",
    price: 69.99,
    occasion: ["birthday", "wellness"],
    recipientType: "unisex",
    tags: ["yoga", "fitness", "sports", "health"],
    popularityScore: 81,
    imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400",
    stock: 45
  },
  {
    name: "Smartwatch Pro",
    description: "Advanced fitness tracking smartwatch with heart rate monitor",
    category: "tech",
    price: 179.99,
    occasion: ["birthday", "anniversary", "graduation"],
    recipientType: "unisex",
    tags: ["smartwatch", "fitness", "tech", "wearable"],
    popularityScore: 93,
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    stock: 30
  },
  {
    name: "Portable Charger",
    description: "High-capacity power bank with fast charging support",
    category: "tech",
    price: 49.99,
    occasion: ["birthday", "graduation"],
    recipientType: "unisex",
    tags: ["charger", "tech", "portable", "power-bank"],
    popularityScore: 86,
    imageUrl: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400",
    stock: 80
  },
  {
    name: "Silk Pillowcase",
    description: "Premium mulberry silk pillowcase for better sleep",
    category: "home",
    price: 79.99,
    occasion: ["birthday", "anniversary"],
    recipientType: "unisex",
    tags: ["pillowcase", "bed", "luxury", "sleep"],
    popularityScore: 76,
    imageUrl: "https://images.unsplash.com/photo-1558769132-cb5aea458c5e?w=400",
    stock: 55
  },
  {
    name: "Bluetooth Speaker",
    description: "Portable waterproof Bluetooth speaker with 360 sound",
    category: "tech",
    price: 89.99,
    occasion: ["birthday", "graduation", "housewarming"],
    recipientType: "unisex",
    tags: ["speaker", "bluetooth", "portable", "audio"],
    popularityScore: 88,
    imageUrl: "https://images.unsplash.com/photo-1589003077984-894e133814c9?w=400",
    stock: 42
  },
  {
    name: "Diamond Jewelry Set",
    description: "Elegant jewelry set with diamond accents",
    category: "jewelry",
    price: 499.99,
    occasion: ["anniversary", "wedding", "valentine"],
    recipientType: "female",
    tags: ["jewelry", "diamond", "luxury", "female", "anniversary"],
    popularityScore: 91,
    imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400",
    stock: 12
  }
];

async function seedGifts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const existingCount = await GiftModel.countDocuments();
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} gifts. Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    const insertedGifts = await GiftModel.insertMany(sampleGifts);
    console.log(`✓ Successfully seeded ${insertedGifts.length} gifts`);

    await mongoose.disconnect();
    console.log("✓ Disconnected from MongoDB");
  } catch (error: any) {
    console.error("Error seeding gifts:", error.message);
    process.exit(1);
  }
}

seedGifts();
