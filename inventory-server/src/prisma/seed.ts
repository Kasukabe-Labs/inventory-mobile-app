// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const employee1Password = await bcrypt.hash("employee123", 10);
  const employee2Password = await bcrypt.hash("employee123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Business Owner",
        email: "owner@example.com",
        password: adminPassword,
        role: "ADMIN",
      },
      {
        name: "Employee One",
        email: "employee1@example.com",
        password: employee1Password,
        role: "EMPLOYEE",
      },
      {
        name: "Employee Two",
        email: "employee2@example.com",
        password: employee2Password,
        role: "EMPLOYEE",
      },
    ],
    skipDuplicates: true,
  });

  // Categories
  await prisma.category.createMany({
    data: [
      { name: "Sarees" },
      { name: "Salwar Suits" },
      { name: "Kurtis" },
      { name: "Shirts" },
      { name: "Trousers" },
      { name: "T-shirts" },
      { name: "Dupattas" },
      { name: "Dress Materials" },
    ],
    skipDuplicates: true,
  });

  // Fetch category IDs
  const categories = await prisma.category.findMany();
  const findCat = (name: string) => categories.find((c) => c.name === name)!;

  const products = [
    // Sarees
    {
      name: "Banarasi Silk Saree",
      sku: "SR1001",
      categoryId: findCat("Sarees").id,
      price: 2500,
      quantity: 50,
    },
    {
      name: "Kanjeevaram Saree",
      sku: "SR1002",
      categoryId: findCat("Sarees").id,
      price: 3200,
      quantity: 40,
    },
    {
      name: "Chiffon Printed Saree",
      sku: "SR1003",
      categoryId: findCat("Sarees").id,
      price: 1800,
      quantity: 60,
    },
    {
      name: "Cotton Handloom Saree",
      sku: "SR1004",
      categoryId: findCat("Sarees").id,
      price: 1500,
      quantity: 80,
    },
    {
      name: "Georgette Party Wear Saree",
      sku: "SR1005",
      categoryId: findCat("Sarees").id,
      price: 2100,
      quantity: 70,
    },

    // Salwar Suits
    {
      name: "Punjabi Patiala Suit",
      sku: "SS2001",
      categoryId: findCat("Salwar Suits").id,
      price: 1600,
      quantity: 90,
    },
    {
      name: "Anarkali Salwar Suit",
      sku: "SS2002",
      categoryId: findCat("Salwar Suits").id,
      price: 2200,
      quantity: 65,
    },
    {
      name: "Churidar Cotton Suit",
      sku: "SS2003",
      categoryId: findCat("Salwar Suits").id,
      price: 1400,
      quantity: 100,
    },
    {
      name: "Silk Embroidered Suit",
      sku: "SS2004",
      categoryId: findCat("Salwar Suits").id,
      price: 2500,
      quantity: 55,
    },
    {
      name: "Georgette Salwar Suit",
      sku: "SS2005",
      categoryId: findCat("Salwar Suits").id,
      price: 1800,
      quantity: 75,
    },

    // Kurtis
    {
      name: "Cotton Printed Kurti",
      sku: "KT3001",
      categoryId: findCat("Kurtis").id,
      price: 850,
      quantity: 100,
    },
    {
      name: "Embroidered Long Kurti",
      sku: "KT3002",
      categoryId: findCat("Kurtis").id,
      price: 1200,
      quantity: 80,
    },
    {
      name: "Silk Party Wear Kurti",
      sku: "KT3003",
      categoryId: findCat("Kurtis").id,
      price: 1500,
      quantity: 60,
    },
    {
      name: "Denim Casual Kurti",
      sku: "KT3004",
      categoryId: findCat("Kurtis").id,
      price: 950,
      quantity: 90,
    },
    {
      name: "Rayon A-line Kurti",
      sku: "KT3005",
      categoryId: findCat("Kurtis").id,
      price: 1100,
      quantity: 85,
    },

    // Shirts
    {
      name: "Formal White Shirt",
      sku: "SH4001",
      categoryId: findCat("Shirts").id,
      price: 1200,
      quantity: 70,
    },
    {
      name: "Casual Checked Shirt",
      sku: "SH4002",
      categoryId: findCat("Shirts").id,
      price: 950,
      quantity: 110,
    },
    {
      name: "Slim Fit Denim Shirt",
      sku: "SH4003",
      categoryId: findCat("Shirts").id,
      price: 1350,
      quantity: 65,
    },
    {
      name: "Linen Formal Shirt",
      sku: "SH4004",
      categoryId: findCat("Shirts").id,
      price: 1450,
      quantity: 50,
    },
    {
      name: "Printed Casual Shirt",
      sku: "SH4005",
      categoryId: findCat("Shirts").id,
      price: 1000,
      quantity: 95,
    },

    // Trousers
    {
      name: "Formal Black Trousers",
      sku: "TR5001",
      categoryId: findCat("Trousers").id,
      price: 1500,
      quantity: 70,
    },
    {
      name: "Slim Fit Chinos",
      sku: "TR5002",
      categoryId: findCat("Trousers").id,
      price: 1400,
      quantity: 80,
    },
    {
      name: "Casual Cotton Trousers",
      sku: "TR5003",
      categoryId: findCat("Trousers").id,
      price: 1300,
      quantity: 90,
    },
    {
      name: "Linen Beige Trousers",
      sku: "TR5004",
      categoryId: findCat("Trousers").id,
      price: 1600,
      quantity: 50,
    },
    {
      name: "Denim Blue Trousers",
      sku: "TR5005",
      categoryId: findCat("Trousers").id,
      price: 1700,
      quantity: 40,
    },

    // T-shirts
    {
      name: "Round Neck Cotton T-shirt",
      sku: "TS6001",
      categoryId: findCat("T-shirts").id,
      price: 600,
      quantity: 200,
    },
    {
      name: "Polo Collar T-shirt",
      sku: "TS6002",
      categoryId: findCat("T-shirts").id,
      price: 750,
      quantity: 150,
    },
    {
      name: "Graphic Print T-shirt",
      sku: "TS6003",
      categoryId: findCat("T-shirts").id,
      price: 850,
      quantity: 120,
    },
    {
      name: "V-neck Casual T-shirt",
      sku: "TS6004",
      categoryId: findCat("T-shirts").id,
      price: 700,
      quantity: 180,
    },
    {
      name: "Sports Dry-fit T-shirt",
      sku: "TS6005",
      categoryId: findCat("T-shirts").id,
      price: 950,
      quantity: 90,
    },

    // Dupattas
    {
      name: "Cotton Printed Dupatta",
      sku: "DP7001",
      categoryId: findCat("Dupattas").id,
      price: 500,
      quantity: 130,
    },
    {
      name: "Silk Embroidered Dupatta",
      sku: "DP7002",
      categoryId: findCat("Dupattas").id,
      price: 1200,
      quantity: 60,
    },
    {
      name: "Chiffon Plain Dupatta",
      sku: "DP7003",
      categoryId: findCat("Dupattas").id,
      price: 650,
      quantity: 100,
    },
    {
      name: "Georgette Printed Dupatta",
      sku: "DP7004",
      categoryId: findCat("Dupattas").id,
      price: 800,
      quantity: 85,
    },
    {
      name: "Banarasi Dupatta",
      sku: "DP7005",
      categoryId: findCat("Dupattas").id,
      price: 1500,
      quantity: 45,
    },

    // Dress Materials
    {
      name: "Cotton Dress Material",
      sku: "DM8001",
      categoryId: findCat("Dress Materials").id,
      price: 1100,
      quantity: 90,
    },
    {
      name: "Silk Dress Material",
      sku: "DM8002",
      categoryId: findCat("Dress Materials").id,
      price: 1800,
      quantity: 70,
    },
    {
      name: "Printed Rayon Dress Material",
      sku: "DM8003",
      categoryId: findCat("Dress Materials").id,
      price: 1250,
      quantity: 85,
    },
    {
      name: "Embroidered Georgette Dress Material",
      sku: "DM8004",
      categoryId: findCat("Dress Materials").id,
      price: 2000,
      quantity: 60,
    },
    {
      name: "Linen Dress Material",
      sku: "DM8005",
      categoryId: findCat("Dress Materials").id,
      price: 1500,
      quantity: 75,
    },
  ];

  const productsWithUrls = products.map((p) => ({
    ...p,
    imageUrl: `https://example-bucket.s3.amazonaws.com/images/${p.sku}.jpg`,
    barcodeUrl: `https://example-bucket.s3.amazonaws.com/barcodes/${p.sku}.png`,
  }));

  await prisma.product.createMany({
    data: productsWithUrls,
    skipDuplicates: true,
  });

  console.log("✅ Seed data inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
