import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting seed...');

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
    },
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: await bcrypt.hash(adminPassword, 10),
      role: 'ADMIN',
    },
  });
  console.log('Created admin:', admin.email);

  // Create seller user
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {
      role: 'SELLER',
    },
    create: {
      email: 'seller@example.com',
      name: 'John Seller',
      password: await bcrypt.hash('seller123', 10),
      role: 'SELLER',
    },
  });
  console.log('Created seller:', seller.email);

  // Create seller profile
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: seller.id },
    update: {},
    create: {
      userId: seller.id,
      storeName: 'Premium Fashion Store',
      storeDescription: 'High-quality clothing and accessories for fashion enthusiasts',
      status: 'APPROVED',
      verificationStatus: 'verified',
      commissionRate: 10,
    },
  });
  console.log('Created seller profile:', sellerProfile.storeName);

  // Create categories
  const clothingCat = await prisma.category.upsert({
    where: { name: 'CLOTHING' },
    update: {},
    create: {
      name: 'CLOTHING',
      description: 'Clothing items including shirts, pants, dresses, and more',
    },
  });

  const accessoriesCat = await prisma.category.upsert({
    where: { name: 'ACCESSORIES' },
    update: {},
    create: {
      name: 'ACCESSORIES',
      description: 'Fashion accessories including bags, belts, and more',
    },
  });
  console.log('Created categories');

  // Create sample products
  const products = [
    {
      sku: 'TSHIRT-001',
      name: 'Classic Black T-Shirt',
      description: 'Comfortable and stylish black t-shirt perfect for everyday wear',
      categoryId: clothingCat.id,
      sellerId: seller.id,
      price: 29.99,
      originalPrice: 39.99,
      stock: 50,
      sizes: '["S", "M", "L", "XL", "XXL"]',
      colors: '["Black", "White", "Gray"]',
    },
    {
      sku: 'JEANS-001',
      name: 'Slim Fit Blue Jeans',
      description: 'Premium denim jeans with perfect fit and comfort',
      categoryId: clothingCat.id,
      sellerId: seller.id,
      price: 79.99,
      originalPrice: null,
      stock: 30,
      sizes: '["28", "30", "32", "34", "36"]',
      colors: '["Dark Blue", "Light Blue"]',
    },
    {
      sku: 'BAG-001',
      name: 'Leather Crossbody Bag',
      description: 'Elegant leather bag perfect for daily use',
      categoryId: accessoriesCat.id,
      sellerId: seller.id,
      price: 149.99,
      originalPrice: 199.99,
      stock: 20,
      sizes: '["One Size"]',
      colors: '["Black", "Brown"]',
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {},
      create: productData,
    });
    console.log('Created product:', product.name);
  }

  // Create customer user
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      role: 'CUSTOMER',
    },
    create: {
      email: 'customer@example.com',
      name: 'Jane Customer',
      password: await bcrypt.hash('customer123', 10),
      role: 'CUSTOMER',
    },
  });
  console.log('Created customer:', customer.email);

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
