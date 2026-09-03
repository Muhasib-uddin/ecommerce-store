import { PrismaClient, Role, OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clear database tables
  await prisma.auditLog.deleteMany({});
  await prisma.apiKey.deleteMany({});
  await prisma.webhookEvent.deleteMany({});
  await prisma.webhook.deleteMany({});
  await prisma.emailTemplate.deleteMany({});
  await prisma.themeSettings.deleteMany({});
  await prisma.storeSettings.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.navigationMenu.deleteMany({});
  await prisma.page.deleteMany({});
  await prisma.blog.deleteMany({});
  await prisma.blogCategory.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.flashSaleProduct.deleteMany({});
  await prisma.flashSale.deleteMany({});
  await prisma.discount.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.orderStatusHistory.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.productTag.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database cleared.");

  // 2. Create Admin and Customers
  const passwordHash = bcrypt.hashSync("admin123", 10);
  const customerPasswordHash = bcrypt.hashSync("customer123", 10);

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@store.com",
      passwordHash,
      firstName: "Super",
      lastName: "Admin",
      phone: "+1234567890",
      role: Role.SUPER_ADMIN,
      isEmailVerified: true,
    },
  });

  const storeManager = await prisma.user.create({
    data: {
      email: "manager@store.com",
      passwordHash,
      firstName: "John",
      lastName: "Manager",
      phone: "+1234567891",
      role: Role.STORE_MANAGER,
      isEmailVerified: true,
    },
  });

  const customers = [];
  for (let i = 1; i <= 5; i++) {
    const customer = await prisma.user.create({
      data: {
        email: `customer${i}@example.com`,
        passwordHash: customerPasswordHash,
        firstName: `Customer${i}`,
        lastName: `Test`,
        phone: `+155500000${i}`,
        role: Role.CUSTOMER,
        isEmailVerified: true,
        addresses: {
          create: [
            {
              firstName: `Customer${i}`,
              lastName: `Test`,
              company: i % 2 === 0 ? "Test Company" : null,
              address1: `${i * 100} Main Street`,
              address2: i % 2 === 0 ? "Suite B" : null,
              city: "New York",
              state: "NY",
              postalCode: "10001",
              country: "United States",
              phone: `+155500000${i}`,
              isDefaultBilling: true,
              isDefaultShipping: true,
            },
          ],
        },
      },
      include: {
        addresses: true,
      },
    });
    customers.push(customer);
  }
  console.log("Admin and Customers seeded.");

  // 3. Create Categories
  const categoriesData = [
    { name: "Electronics", slug: "electronics", description: "Gadgets and gear" },
    { name: "Fashion & Clothing", slug: "fashion-clothing", description: "Stylish apparel" },
    { name: "Home & Kitchen", slug: "home-kitchen", description: "Furnishings and appliances" },
    { name: "Books", slug: "books", description: "Bestsellers and educational books" },
    { name: "Sports & Outdoors", slug: "sports-outdoors", description: "Atheletic gear and accessories" },
  ];

  const categories = [];
  for (const catData of categoriesData) {
    const cat = await prisma.category.create({
      data: catData,
    });
    categories.push(cat);
  }

  // Create child categories
  const mobilePhones = await prisma.category.create({
    data: {
      name: "Mobile Phones",
      slug: "mobile-phones",
      description: "Smartphones and accessories",
      parentId: categories[0]!.id,
    },
  });
  console.log("Categories seeded.");

  // 4. Create Tags
  const tagsData = ["New", "Featured", "Best Seller", "Sale", "Premium"];
  const tags = [];
  for (const tagName of tagsData) {
    const tag = await prisma.productTag.create({
      data: { name: tagName },
    });
    tags.push(tag);
  }

  // 5. Create 50 Products
  const products = [];
  const brandNames = ["Alpha", "Beta", "Gamma", "Delta", "Sigma"];

  for (let i = 1; i <= 50; i++) {
    const cat = categories[i % categories.length]!;
    const brand = brandNames[i % brandNames.length]!;
    const basePrice = 10 + (i * 7.5);
    const costPrice = basePrice * 0.6;
    const comparePrice = i % 3 === 0 ? basePrice * 1.25 : null;

    const product = await prisma.product.create({
      data: {
        categoryId: cat.id,
        name: `${brand} Product Model ${i}`,
        slug: `product-model-${i}`,
        description: `This is a premium product from ${brand} brand. Model number ${i} is designed for high efficiency and longevity.`,
        richContent: `<p>Detail specifications for <strong>${brand} Product Model ${i}</strong>:</p><ul><li>High quality materials</li><li>Advanced technology</li><li>Eco-friendly components</li><li>Standard 2-year warranty included</li></ul>`,
        price: basePrice,
        compareAtPrice: comparePrice,
        costPrice: costPrice,
        sku: `SKU-PROD-${i.toString().padStart(4, "0")}`,
        barcode: `BAR-${(1000000000 + i).toString()}`,
        stock: i % 5 === 0 ? 0 : 20 + i, // some out of stock products
        trackStock: true,
        published: true,
        averageRating: 3.5 + (i % 2) * 1.5,
        reviewCount: i % 7,
        images: {
          create: [
            {
              url: `https://picsum.photos/seed/prod${i}/600/600`,
              isPrimary: true,
              position: 0,
            },
            {
              url: `https://picsum.photos/seed/prod${i}alt/600/600`,
              isPrimary: false,
              position: 1,
            },
          ],
        },
        tags: {
          connect: [
            { id: tags[i % tags.length]!.id },
            { id: tags[(i + 1) % tags.length]!.id },
          ],
        },
      },
    });

    // Create variants for every 3rd product
    if (i % 3 === 0) {
      await prisma.productVariant.createMany({
        data: [
          {
            productId: product.id,
            name: "Small / Black",
            sku: `${product.sku}-S-BLK`,
            price: basePrice,
            compareAtPrice: comparePrice,
            stock: 10,
          },
          {
            productId: product.id,
            name: "Large / Black",
            sku: `${product.sku}-L-BLK`,
            price: basePrice + 5,
            compareAtPrice: comparePrice ? comparePrice + 5 : null,
            stock: 15,
          },
          {
            productId: product.id,
            name: "Large / White",
            sku: `${product.sku}-L-WHT`,
            price: basePrice + 5,
            compareAtPrice: comparePrice ? comparePrice + 5 : null,
            stock: 8,
          },
        ],
      });
    }

    products.push(product);
  }
  console.log("50 Products and variants seeded.");

  // 6. Create Coupons & Discounts
  const coupon = await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      description: "10% off your first purchase",
      discountType: "PERCENT",
      discountValue: 10.0,
      minOrderValue: 20.0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      isActive: true,
    },
  });

  const fixedCoupon = await prisma.coupon.create({
    data: {
      code: "SAVE50",
      description: "$50 off purchases over $200",
      discountType: "FIXED",
      discountValue: 50.0,
      minOrderValue: 200.0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      isActive: true,
    },
  });
  console.log("Coupons seeded.");

  // 7. Create Orders & Order Items
  for (let i = 1; i <= 20; i++) {
    const customer = customers[i % customers.length]!;
    const address = customer.addresses[0]!;
    const orderProducts = [
      products[i % products.length]!,
      products[(i + 5) % products.length]!,
    ];

    let subtotal = 0;
    const itemsData = [];

    for (const p of orderProducts) {
      const qty = (i % 2) + 1;
      const price = Number(p.price);
      subtotal += price * qty;
      itemsData.push({
        productId: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        quantity: qty,
      });
    }

    const shippingCost = subtotal > 150 ? 0.0 : 9.99;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shippingCost + tax;

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber: `ORD-${2026}-${10000 + i}`,
        status: i % 4 === 0 ? OrderStatus.DELIVERED : i % 5 === 0 ? OrderStatus.SHIPPED : OrderStatus.PROCESSING,
        paymentStatus: i % 4 === 0 || i % 5 === 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paymentMethod: i % 3 === 0 ? PaymentMethod.STRIPE : i % 3 === 1 ? PaymentMethod.PAYPAL : PaymentMethod.COD,
        subtotal,
        tax,
        shippingCost,
        total,
        shippingName: `${address.firstName} ${address.lastName}`,
        shippingAddress1: address.address1,
        shippingAddress2: address.address2,
        shippingCity: address.city,
        shippingState: address.state,
        shippingPostalCode: address.postalCode,
        shippingCountry: address.country,
        shippingPhone: address.phone,
        billingName: `${address.firstName} ${address.lastName}`,
        billingAddress1: address.address1,
        billingAddress2: address.address2,
        billingCity: address.city,
        billingState: address.state,
        billingPostalCode: address.postalCode,
        billingCountry: address.country,
        items: {
          create: itemsData,
        },
        statusHistory: {
          create: [
            {
              status: OrderStatus.PENDING,
              note: "Order created successfully",
              updatedBy: "system",
            },
          ],
        },
      },
    });

    // Add additional history for shipped/delivered orders
    if (order.status === OrderStatus.SHIPPED || order.status === OrderStatus.DELIVERED) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PROCESSING,
          note: "Order is being processed",
          updatedBy: "system",
        },
      });
    }
    if (order.status === OrderStatus.DELIVERED) {
      await prisma.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.DELIVERED,
          note: "Order delivered safely",
          updatedBy: "system",
        },
      });
    }
  }
  console.log("20 Orders and item history seeded.");

  // 8. Create Reviews
  for (let i = 1; i <= 10; i++) {
    const p = products[i]!;
    const customer = customers[i % customers.length]!;
    await prisma.review.create({
      data: {
        productId: p.id,
        userId: customer.id,
        rating: 4 + (i % 2), // 4 or 5 stars
        title: "Excellent Product",
        comment: "Great build quality and very fast shipping. Exceeded my expectations!",
        approved: true,
      },
    });
  }
  console.log("Product reviews seeded.");

  // 9. CMS Content (Blogs and Categories)
  const blogCat = await prisma.blogCategory.create({
    data: {
      name: "E-Commerce Tips",
      slug: "ecommerce-tips",
    },
  });

  for (let i = 1; i <= 5; i++) {
    await prisma.blog.create({
      data: {
        categoryId: blogCat.id,
        title: `E-Commerce Tip Number ${i}: Grow Your Sales`,
        slug: `ecommerce-tip-${i}-grow-sales`,
        content: `<p>In this post, we discuss tips and strategies to grow your store sales. Strategy number ${i} revolves around refining user experience and improving site speed.</p>`,
        authorName: "Store Editor",
        metaTitle: `Grow Sales Strategy ${i}`,
        metaDescription: `Learn e-commerce optimization strategy ${i}`,
        published: true,
      },
    });
  }

  await prisma.page.createMany({
    data: [
      { title: "About Us", slug: "about-us", content: "<h1>About Our Store</h1><p>We provide premium products at affordable pricing.</p>", published: true },
      { title: "Privacy Policy", slug: "privacy-policy", content: "<h1>Privacy Policy</h1><p>Your privacy is secure with us.</p>", published: true },
      { title: "Refunds and Returns", slug: "refunds-returns", content: "<h1>Refund Policy</h1><p>We offer 30-day money back guarantees.</p>", published: true },
    ],
  });
  console.log("CMS and Static Pages seeded.");

  // 10. Navigation Menus
  const headerMenu = await prisma.navigationMenu.create({
    data: { name: "header" },
  });
  await prisma.menuItem.createMany({
    data: [
      { menuId: headerMenu.id, title: "Shop All", url: "/shop", position: 1 },
      { menuId: headerMenu.id, title: "Apparel", url: "/shop?category=apparel", position: 2 },
      { menuId: headerMenu.id, title: "Accessories", url: "/shop?category=accessories", position: 3 },
      { menuId: headerMenu.id, title: "Home Living", url: "/shop?category=living", position: 4 },
      { menuId: headerMenu.id, title: "FAQ", url: "/faq", position: 5 },
    ],
  });

  const footerMenu = await prisma.navigationMenu.create({
    data: { name: "footer" },
  });
  await prisma.menuItem.createMany({
    data: [
      { menuId: footerMenu.id, title: "Shop All", url: "/shop", position: 1 },
      { menuId: footerMenu.id, title: "FAQs & Help", url: "/faq", position: 2 },
      { menuId: footerMenu.id, title: "Privacy Policy", url: "/privacy", position: 3 },
      { menuId: footerMenu.id, title: "Terms of Service", url: "/terms", position: 4 },
      { menuId: footerMenu.id, title: "Contact Us", url: "/contact", position: 5 },
    ],
  });
  console.log("Navigation menus seeded.");

  // 11. Store configurations
  await prisma.storeSettings.createMany({
    data: [
      { key: "store_name", value: "LUMIÈRE" },
      { key: "store_email", value: "support@lumiere.com" },
      { key: "store_phone", value: "+1 (800) 555-0199" },
      { key: "store_address", value: "142 Mercer Street, New York, NY 10012" },
      { key: "store_currency", value: "PKR" },
      { key: "tagline", value: "Curated premium lifestyle products designed for modern comfort." },
      { key: "footer_copyright", value: "© 2026 LUMIÈRE Store. All rights reserved." },
      { key: "footer_description", value: "Curated premium lifestyle products designed for modern comfort. Elevate your everyday aesthetic." },
      { key: "social_facebook", value: "https://facebook.com" },
      { key: "social_instagram", value: "https://instagram.com" },
      { key: "social_twitter", value: "https://twitter.com" },
      { key: "social_youtube", value: "https://youtube.com" },
      { key: "social_tiktok", value: "https://tiktok.com" },
      { key: "stripe_enabled", value: "true" },
      { key: "paypal_enabled", value: "false" },
      { key: "cod_enabled", value: "true" },
      { key: "bank_transfer_enabled", value: "true" },
    ],
  });

  await prisma.themeSettings.createMany({
    data: [
      { key: "primary_color", value: "#4f46e5" },
      { key: "secondary_color", value: "#0ea5e9" },
      { key: "accent_color", value: "#f59e0b" },
      { key: "background_color", value: "#ffffff" },
      { key: "font_family", value: "Inter" },
      { key: "announcement_enabled", value: "true" },
      { key: "announcement_text", value: "✨ Free shipping on orders over $100! Use code PREMIUM20 for 20% off." },
      { key: "announcement_bg_color", value: "#000000" },
      { key: "announcement_text_color", value: "#ffffff" },
      { key: "announcement_link", value: "/shop" },
    ],
  });

  console.log("Store and Theme settings seeded.");
  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
