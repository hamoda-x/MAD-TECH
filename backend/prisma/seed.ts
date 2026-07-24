import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const defaultCategories = [
  { name: "تجميعات PC", slug: "PC_BUILD" },
  { name: "معالجات", slug: "CPU" },
  { name: "كروت شاشة", slug: "GPU" },
  { name: "ذاكرة RAM", slug: "RAM" },
  { name: "تخزين", slug: "STORAGE" },
  { name: "لوحات أم", slug: "MOTHERBOARD" },
  { name: "مزودات طاقة", slug: "PSU" },
  { name: "كيسات", slug: "CASE" },
  { name: "تبريد", slug: "COOLING" },
  { name: "ملحقات", slug: "PERIPHERAL" },
  { name: "أخرى", slug: "OTHER" },
];

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash("Admin@123", 12);

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash,
    },
  });

  // Create default categories
  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug },
    });
  }

  // Create sample products
  const categories = await prisma.category.findMany();
  const getCategory = (slug: string) => categories.find((c) => c.slug === slug);

  const sampleProducts = [
    {
      name: "MAD TECH Gaming Build - RTX 4070",
      description: "تجميعة ألعاب احترافية: Intel i7-13700K، RTX 4070، 32GB DDR5، 1TB NVMe SSD.",
      price: 1499.99,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      categorySlug: "PC_BUILD",
      isAvailable: true,
    },
    {
      name: "Intel Core i7-13700K",
      description: "معالج 16 نواة (8P+8E) بسرعة تصل إلى 5.4 GHz.",
      price: 389.99,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      categorySlug: "CPU",
      isAvailable: true,
    },
    {
      name: "NVIDIA GeForce RTX 4070",
      description: "كرت شاشة 12GB GDDR6X - مثالي للألعاب بدقة 1440p.",
      price: 549.99,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      categorySlug: "GPU",
      isAvailable: true,
    },
    {
      name: "Corsair Vengeance 32GB DDR5 6000MHz",
      description: "ذاكرة RAM عالية الأداء للألعاب والمهام الثقيلة.",
      price: 129.99,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      categorySlug: "RAM",
      isAvailable: true,
    },
    {
      name: "Samsung 990 PRO 1TB NVMe",
      description: "SSD فائق السرعة بقراءة تصل إلى 7450 MB/s.",
      price: 119.99,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      categorySlug: "STORAGE",
      isAvailable: true,
    },
    {
      name: "Logitech G Pro X Superlight",
      description: "ماوس ألعاب لاسلكي خفيف الوزن 63g.",
      price: 149.99,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      categorySlug: "PERIPHERAL",
      isAvailable: true,
    },
  ];

  for (const product of sampleProducts) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      const category = getCategory(product.categorySlug);
      if (category) {
        await prisma.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            categoryId: category.id,
            isAvailable: product.isAvailable,
          },
        });
      }
    }
  }

  console.log("Seed completed successfully.");
  console.log("Default admin credentials: admin / Admin@123");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
