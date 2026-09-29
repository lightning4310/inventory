import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Product from "./models/Product.js";
import Supplier from "./models/Supplier.js";
import PurchaseOrder from "./models/PurchaseOrder.js";
import Sale from "./models/Sale.js";

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/inventory";
    console.log(`Connecting to MongoDB at ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully!");

    // Clear existing collections
    console.log("Clearing existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Product.deleteMany({}),
      Supplier.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      Sale.deleteMany({})
    ]);

    // 1. Create Users
    console.log("Seeding Users...");
    const adminPassword = await bcrypt.hash("admin123", 10);
    const employeePassword = await bcrypt.hash("employee123", 10);

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@inventory.com",
      password: adminPassword,
      role: "admin"
    });

    const employeeUser = await User.create({
      name: "Employee User",
      email: "employee@inventory.com",
      password: employeePassword,
      role: "employee"
    });

    console.log("Users created:", adminUser.email, employeeUser.email);

    // 2. Create Suppliers
    console.log("Seeding Suppliers...");
    const suppliers = await Supplier.insertMany([
      {
        name: "Apex Electronics Ltd",
        contactPerson: "Rajesh Sharma",
        phone: "+91 98765 43210",
        email: "contact@apexelectronics.com",
        address: "Plot 42, Tech Park, Bengaluru, Karnataka",
        notes: "Primary vendor for computer accessories and peripherals"
      },
      {
        name: "LogiTech Distributing Co",
        contactPerson: "Anita Roy",
        phone: "+91 98123 45678",
        email: "anita@logitechdist.com",
        address: "B-12 Industrial Area, Gurugram, Haryana",
        notes: "Keyboards, mice, and gaming hardware"
      },
      {
        name: "Vision Display Systems",
        contactPerson: "Vikram Malhotra",
        phone: "+91 99887 76655",
        email: "sales@visiondisplays.com",
        address: "7th Cross, Electronic City, Bengaluru",
        notes: "Monitors, HDMI cables, and display docks"
      }
    ]);

    // 3. Create Products
    console.log("Seeding Products...");
    const products = await Product.insertMany([
      {
        name: "Dell UltraSharp 27 Monitor",
        category: "Monitors",
        quantity: 24,
        price: 28500,
        buyingPrice: 22000,
        lowStockAlert: 5
      },
      {
        name: "Logitech MX Master 3S Mouse",
        category: "Peripherals",
        quantity: 45,
        price: 8999,
        buyingPrice: 6500,
        lowStockAlert: 10
      },
      {
        name: "Keychron K2 Mechanical Keyboard",
        category: "Peripherals",
        quantity: 18,
        price: 7499,
        buyingPrice: 5200,
        lowStockAlert: 5
      },
      {
        name: "Kingston 1TB NVMe M.2 SSD",
        category: "Storage",
        quantity: 35,
        price: 6800,
        buyingPrice: 4800,
        lowStockAlert: 8
      },
      {
        name: "Sony WH-1000XM5 Headphones",
        category: "Audio",
        quantity: 3, // Low stock on purpose
        price: 29990,
        buyingPrice: 24000,
        lowStockAlert: 5
      },
      {
        name: "Anker 65W GaN Fast Charger",
        category: "Accessories",
        quantity: 50,
        price: 2999,
        buyingPrice: 1800,
        lowStockAlert: 12
      },
      {
        name: "USB-C to DisplayPort 4K Braided Cable",
        category: "Cables",
        quantity: 2, // Low stock on purpose
        price: 1199,
        buyingPrice: 650,
        lowStockAlert: 6
      }
    ]);

    // 4. Create Purchase Orders
    console.log("Seeding Purchase Orders...");
    await PurchaseOrder.create({
      supplierId: suppliers[0]._id,
      status: "Received",
      items: [
        {
          productId: products[0]._id,
          quantity: 10,
          unitPrice: 22000
        },
        {
          productId: products[3]._id,
          quantity: 20,
          unitPrice: 4800
        }
      ],
      totalAmount: 10 * 22000 + 20 * 4800
    });

    await PurchaseOrder.create({
      supplierId: suppliers[1]._id,
      status: "Sent",
      items: [
        {
          productId: products[1]._id,
          quantity: 15,
          unitPrice: 6500
        },
        {
          productId: products[2]._id,
          quantity: 10,
          unitPrice: 5200
        }
      ],
      totalAmount: 15 * 6500 + 10 * 5200
    });

    // 5. Create Sales Records with varied dates
    console.log("Seeding Sales...");
    const now = new Date();
    const salesData = [
      {
        product: products[0]._id,
        quantity: 2,
        buyingPrice: products[0].buyingPrice,
        sellingPrice: products[0].price,
        totalAmount: 2 * products[0].price,
        date: new Date(now.getTime() - 1000 * 60 * 60 * 2) // 2 hours ago
      },
      {
        product: products[1]._id,
        quantity: 5,
        buyingPrice: products[1].buyingPrice,
        sellingPrice: products[1].price,
        totalAmount: 5 * products[1].price,
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
      },
      {
        product: products[2]._id,
        quantity: 3,
        buyingPrice: products[2].buyingPrice,
        sellingPrice: products[2].price,
        totalAmount: 3 * products[2].price,
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      },
      {
        product: products[3]._id,
        quantity: 4,
        buyingPrice: products[3].buyingPrice,
        sellingPrice: products[3].price,
        totalAmount: 4 * products[3].price,
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
      },
      {
        product: products[4]._id,
        quantity: 1,
        buyingPrice: products[4].buyingPrice,
        sellingPrice: products[4].price,
        totalAmount: 1 * products[4].price,
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10) // 10 days ago
      },
      {
        product: products[5]._id,
        quantity: 8,
        buyingPrice: products[5].buyingPrice,
        sellingPrice: products[5].price,
        totalAmount: 8 * products[5].price,
        date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 15) // 15 days ago
      }
    ];

    await Sale.insertMany(salesData);

    console.log("Mock data seeded successfully!");
    console.log("-----------------------------------------");
    console.log("Default Login Credentials:");
    console.log("  Admin:    admin@inventory.com    / admin123");
    console.log("  Employee: employee@inventory.com / employee123");
    console.log("-----------------------------------------");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
