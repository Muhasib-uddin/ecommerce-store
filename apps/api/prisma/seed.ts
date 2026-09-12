import { PrismaClient, Role, OrderStatus, PaymentStatus, PaymentMethod } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // 1. Clear database tables
  await prisma.customerActivity.deleteMany({});
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
    { name: "Men's Shoes", slug: "mens-shoes", description: "Premium men's footwear" },
    { name: "Women's Shoes", slug: "womens-shoes", description: "Elegant women's footwear" },
    { name: "Kids' Shoes", slug: "kids-shoes", description: "Comfortable kids' footwear" },
    { name: "Medicated Shoes", slug: "medicated-shoes", description: "Orthopedic and comfort footwear" },
    { name: "Shoe Care", slug: "shoe-care", description: "Shoe care, socks, and accessories" },
  ];

  const categories = [];
  for (const catData of categoriesData) {
    const cat = await prisma.category.create({
      data: catData,
    });
    categories.push(cat);
  }

  // Create child categories
  const sneakers = await prisma.category.create({
    data: {
      name: "Sneakers",
      slug: "sneakers",
      description: "Casual and athletic sneakers",
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
  const brandNames = ["GAIT", "Puma", "Nike", "Adidas", "Reebok"];
  const shoeTypes = ["Sneakers", "Loafers", "Formal Oxfords", "Walking Shoes", "Sandals"];

  for (let i = 1; i <= 50; i++) {
    const cat = categories[i % categories.length]!;
    const brand = brandNames[i % brandNames.length]!;
    const shoeType = shoeTypes[i % shoeTypes.length]!;
    const basePrice = 40 + (i * 5.5);
    const costPrice = basePrice * 0.6;
    const comparePrice = i % 3 === 0 ? basePrice * 1.25 : null;

    const product = await prisma.product.create({
      data: {
        categoryId: cat.id,
        name: `${brand} ${shoeType} Model ${i}`,
        slug: `shoe-model-${i}`,
        description: `This is a premium ${shoeType.toLowerCase()} from ${brand}. Model number ${i} is designed for ultimate comfort and style.`,
        richContent: `<p>Detail specifications for <strong>${brand} ${shoeType} Model ${i}</strong>:</p><ul><li>Premium leather and mesh materials</li><li>Orthopedic insoles</li><li>Slip-resistant outsoles</li><li>Standard 1-year warranty included</li></ul>`,
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
      name: "Footwear Guides & Trends",
      slug: "footwear-guides",
    },
  });

  const blogData = [
    {
      title: "Trending Shoes in 2026",
      slug: "trending-shoes-2026",
      content: "<p>Discover the top trending shoes this year. From chunky sneakers to elegant loafers, stay ahead of the fashion curve.</p>",
      metaTitle: "Trending Shoes 2026",
      metaDescription: "Top trending shoes in 2026.",
    },
    {
      title: "The Benefits of Medicated Shoes",
      slug: "benefits-medicated-shoes",
      content: "<p>Medicated shoes provide unmatched support for posture and foot health. Learn why orthopedic footwear is a game changer.</p>",
      metaTitle: "Medicated Shoes Benefits",
      metaDescription: "Why you should wear medicated shoes.",
    },
    {
      title: "Ultimate Shoe Size Guide",
      slug: "ultimate-shoe-size-guide",
      content: "<p>Finding the perfect fit is crucial. Read our comprehensive shoe size guide to measure your feet accurately and pick the right size.</p>",
      metaTitle: "Shoe Size Guide",
      metaDescription: "How to measure your shoe size accurately.",
    }
  ];

  for (const blog of blogData) {
    await prisma.blog.create({
      data: {
        categoryId: blogCat.id,
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        authorName: "Shoe Expert",
        metaTitle: blog.metaTitle,
        metaDescription: blog.metaDescription,
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
      { menuId: headerMenu.id, title: "Men", url: "/shop?category=mens-shoes", position: 2 },
      { menuId: headerMenu.id, title: "Women", url: "/shop?category=womens-shoes", position: 3 },
      { menuId: headerMenu.id, title: "Medicated", url: "/shop?category=medicated-shoes", position: 4 },
      { menuId: headerMenu.id, title: "Size Guide", url: "/pages/shoe-size-guide", position: 5 },
    ],
  });

  const footerMenu = await prisma.navigationMenu.create({
    data: { name: "footer" },
  });
  await prisma.menuItem.createMany({
    data: [
      { menuId: footerMenu.id, title: "Shop All", url: "/shop", position: 1 },
      { menuId: footerMenu.id, title: "Size Guide", url: "/pages/shoe-size-guide", position: 2 },
      { menuId: footerMenu.id, title: "Privacy Policy", url: "/privacy", position: 3 },
      { menuId: footerMenu.id, title: "Terms of Service", url: "/terms", position: 4 },
      { menuId: footerMenu.id, title: "Contact Us", url: "/contact", position: 5 },
    ],
  });
  console.log("Navigation menus seeded.");

  // 11. Store configurations
  await prisma.storeSettings.createMany({
    data: [
      { key: "store_name", value: "GAIT" },
      { key: "store_email", value: "support@gait.pk" },
      { key: "store_phone", value: "+123456789" },
      { key: "store_address", value: "Main Market, Pakistan" },
      { key: "store_currency", value: "PKR" },
      { key: "tagline", value: "Premium Men's & Women's Shoe Brand in Pakistan." },
      { key: "footer_copyright", value: "© 2026 GAIT. All rights reserved." },
      { key: "footer_description", value: "Discover GAIT, a trusted shoes brand offering quality footwear crafted for modern style, comfort and everyday confidence." },
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

  // 12. Seed Sample Customer Activities for Analytics & Funnels
  console.log("Seeding Customer Activities...");
  const sampleActivities = [];
  const searchTerms = ["running shoes", "sneakers", "leather boots", "casual loafers", "white sneakers", "hiking shoes", "winter boots"];
  const now = Date.now();

  for (let i = 0; i < customers.length; i++) {
    const cust = customers[i];
    const prod = products[i % products.length];

    // Login event
    sampleActivities.push({
      type: "LOGIN",
      userId: cust.id,
      metadata: { email: cust.email, method: "password" },
      ipAddress: `192.168.1.${10 + i}`,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: new Date(now - (i * 3600 * 1000 + 10000)),
    });

    // Search event
    sampleActivities.push({
      type: "SEARCH",
      userId: cust.id,
      searchQuery: searchTerms[i % searchTerms.length],
      metadata: { resultCount: 8 },
      ipAddress: `192.168.1.${10 + i}`,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: new Date(now - (i * 3600 * 1000 + 8000)),
    });

    // Product view event
    sampleActivities.push({
      type: "PRODUCT_VIEW",
      userId: cust.id,
      productId: prod.id,
      categoryId: prod.categoryId,
      metadata: { name: prod.name, slug: prod.slug, price: parseFloat(prod.price.toString()) },
      ipAddress: `192.168.1.${10 + i}`,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: new Date(now - (i * 3600 * 1000 + 6000)),
    });

    // Add to cart event
    sampleActivities.push({
      type: "ADD_TO_CART",
      userId: cust.id,
      productId: prod.id,
      metadata: { name: prod.name, quantity: 1, price: parseFloat(prod.price.toString()) },
      ipAddress: `192.168.1.${10 + i}`,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: new Date(now - (i * 3600 * 1000 + 4000)),
    });

    // Initiate checkout event
    sampleActivities.push({
      type: "INITIATE_CHECKOUT",
      userId: cust.id,
      metadata: { itemCount: 1, total: parseFloat(prod.price.toString()) },
      ipAddress: `192.168.1.${10 + i}`,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: new Date(now - (i * 3600 * 1000 + 2000)),
    });

    // Purchase event for first 3 customers
    if (i < 3) {
      sampleActivities.push({
        type: "PURCHASE",
        userId: cust.id,
        metadata: {
          orderNumber: `ORD-SEED-${1000 + i}`,
          total: parseFloat(prod.price.toString()),
          itemCount: 1,
        },
        ipAddress: `192.168.1.${10 + i}`,
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        createdAt: new Date(now - (i * 3600 * 1000 + 500)),
      });
    }
  }

  // Add some guest activities
  for (let g = 1; g <= 5; g++) {
    const guestProd = products[(g + 5) % products.length];
    sampleActivities.push({
      type: "PAGE_VIEW",
      sessionId: `guest_sess_${g}`,
      metadata: { page: "/shop", url: "/shop" },
      ipAddress: `10.0.0.${g}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(now - (g * 7200 * 1000)),
    });
    sampleActivities.push({
      type: "SEARCH",
      sessionId: `guest_sess_${g}`,
      searchQuery: searchTerms[(g + 2) % searchTerms.length],
      metadata: { resultCount: 5 },
      ipAddress: `10.0.0.${g}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(now - (g * 7200 * 1000 - 1000)),
    });
    sampleActivities.push({
      type: "PRODUCT_VIEW",
      sessionId: `guest_sess_${g}`,
      productId: guestProd.id,
      categoryId: guestProd.categoryId,
      metadata: { name: guestProd.name, slug: guestProd.slug, price: parseFloat(guestProd.price.toString()) },
      ipAddress: `10.0.0.${g}`,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: new Date(now - (g * 7200 * 1000 - 2000)),
    });
  }

  await prisma.customerActivity.createMany({
    data: sampleActivities,
  });

  console.log(`Seeded ${sampleActivities.length} Customer Activity records.`);
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
