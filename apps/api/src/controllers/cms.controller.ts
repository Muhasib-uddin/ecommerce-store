import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

// ============================================================
// 1. Blog Categories
// ============================================================

export const createBlogCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    const existing = await prisma.blogCategory.findUnique({ where: { slug } });
    if (existing) throw new AppError('Blog category slug already exists', 400);

    const category = await prisma.blogCategory.create({
      data: { name, slug },
    });
    res.status(201).json({ success: true, data: { category } });
  } catch (error) {
    next(error);
  }
};

export const getBlogCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.blogCategory.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: { categories } });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 2. Blog Posts
// ============================================================

export const getBlogPosts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, all } = req.query;

    const where: any = {};
    if (all !== 'true') {
      where.published = true;
    }
    if (category) {
      where.OR = [
        { categoryId: category as string },
        { category: { slug: category as string } }
      ];
    }

    const posts = await prisma.blog.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { posts } });
  } catch (error) {
    next(error);
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const post = await prisma.blog.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!post) throw new AppError('Blog post not found', 404);

    res.json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

export const createBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { categoryId, title, slug, content, featuredImage, authorName, metaTitle, metaDescription, published } = req.body;

    const existing = await prisma.blog.findUnique({ where: { slug } });
    if (existing) throw new AppError('Blog post slug already exists', 400);

    const post = await prisma.blog.create({
      data: {
        categoryId: categoryId || null,
        title,
        slug,
        content,
        featuredImage: featuredImage || null,
        authorName,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        published: published ?? false,
      },
    });

    res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

export const updateBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { categoryId, title, slug, content, featuredImage, authorName, metaTitle, metaDescription, published } = req.body;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) throw new AppError('Blog post not found', 404);

    if (slug && slug !== existing.slug) {
      const slugCheck = await prisma.blog.findUnique({ where: { slug } });
      if (slugCheck) throw new AppError('Blog post slug already exists', 400);
    }

    const post = await prisma.blog.update({
      where: { id },
      data: {
        categoryId: categoryId !== undefined ? categoryId : undefined,
        title,
        slug,
        content,
        featuredImage,
        authorName,
        metaTitle,
        metaDescription,
        published,
      },
    });

    res.json({ success: true, data: { post } });
  } catch (error) {
    next(error);
  }
};

export const deleteBlogPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.blog.delete({ where: { id } });
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 3. Static Pages
// ============================================================

export const getPages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? {} : { published: true };

    const pages = await prisma.page.findMany({
      where,
      orderBy: { title: 'asc' },
    });
    res.json({ success: true, data: { pages } });
  } catch (error) {
    next(error);
  }
};

export const getPageBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) throw new AppError('Page not found', 404);

    res.json({ success: true, data: { page } });
  } catch (error) {
    next(error);
  }
};

export const createPage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, slug, content, metaTitle, metaDescription, published } = req.body;

    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) throw new AppError('Page slug already exists', 400);

    const page = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        published: published ?? false,
      },
    });

    res.status(201).json({ success: true, data: { page } });
  } catch (error) {
    next(error);
  }
};

export const updatePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, slug, content, metaTitle, metaDescription, published } = req.body;

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) throw new AppError('Page not found', 404);

    if (slug && slug !== existing.slug) {
      const slugCheck = await prisma.page.findUnique({ where: { slug } });
      if (slugCheck) throw new AppError('Page slug already exists', 400);
    }

    const page = await prisma.page.update({
      where: { id },
      data: { title, slug, content, metaTitle, metaDescription, published },
    });

    res.json({ success: true, data: { page } });
  } catch (error) {
    next(error);
  }
};

export const deletePage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.page.delete({ where: { id } });
    res.json({ success: true, message: 'Page deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 4. Navigation Menu & Items
// ============================================================

export const getNavigationMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.params;
    if (!name) throw new AppError('Menu name is required', 400);

    let menu = await prisma.navigationMenu.findUnique({
      where: { name },
      include: {
        items: {
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!menu) {
      // Auto-provision menu with starter items for header / footer
      const createdMenu = await prisma.navigationMenu.create({
        data: { name },
      });

      if (name === 'header') {
        const starterItems = [
          { title: 'Shop All', url: '/shop', position: 1 },
          { title: 'Apparel', url: '/shop?category=apparel', position: 2 },
          { title: 'Accessories', url: '/shop?category=accessories', position: 3 },
          { title: 'Home Living', url: '/shop?category=living', position: 4 },
          { title: 'FAQ', url: '/faq', position: 5 },
        ];
        for (const item of starterItems) {
          await prisma.menuItem.create({
            data: { menuId: createdMenu.id, ...item },
          });
        }
      } else if (name === 'footer') {
        const starterItems = [
          { title: 'Shop All', url: '/shop', position: 1 },
          { title: 'FAQs & Help', url: '/faq', position: 2 },
          { title: 'Privacy Policy', url: '/privacy', position: 3 },
          { title: 'Terms of Service', url: '/terms', position: 4 },
          { title: 'Contact Us', url: '/contact', position: 5 },
        ];
        for (const item of starterItems) {
          await prisma.menuItem.create({
            data: { menuId: createdMenu.id, ...item },
          });
        }
      }

      menu = await prisma.navigationMenu.findUnique({
        where: { name },
        include: {
          items: {
            orderBy: { position: 'asc' },
          },
        },
      });
    }

    if (!menu) throw new AppError('Navigation menu could not be loaded', 500);

    // Build hierarchy for menu items
    const itemMap = new Map<string, any>();
    const roots: any[] = [];

    menu.items.forEach((item) => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    menu.items.forEach((item) => {
      const mapped = itemMap.get(item.id);
      if (item.parentId) {
        const parent = itemMap.get(item.parentId);
        if (parent) {
          parent.children.push(mapped);
        } else {
          roots.push(mapped);
        }
      } else {
        roots.push(mapped);
      }
    });

    res.json({
      success: true,
      data: {
        id: menu.id,
        name: menu.name,
        items: roots,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createNavigationMenu = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const existing = await prisma.navigationMenu.findUnique({ where: { name } });
    if (existing) throw new AppError('Menu name already exists', 400);

    const menu = await prisma.navigationMenu.create({ data: { name } });
    res.status(201).json({ success: true, data: { menu } });
  } catch (error) {
    next(error);
  }
};

export const createMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { menuId, parentId, title, url, position } = req.body;

    const item = await prisma.menuItem.create({
      data: {
        menuId,
        parentId: parentId || null,
        title,
        url,
        position: position ?? 0,
      },
    });

    res.status(201).json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { parentId, title, url, position } = req.body;

    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) throw new AppError('Menu item not found', 404);

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        parentId: parentId !== undefined ? parentId : undefined,
        title,
        url,
        position,
      },
    });

    res.json({ success: true, data: { item } });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.menuItem.delete({ where: { id } });
    res.json({ success: true, message: 'Menu item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ============================================================
// 5. Popups
// ============================================================

export const getPopupConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const setting = await prisma.storeSettings.findUnique({
      where: { key: 'popup_config' },
    });

    res.json({
      success: true,
      data: {
        popup: setting ? JSON.parse(setting.value) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePopupConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configString = JSON.stringify(req.body);

    const setting = await prisma.storeSettings.upsert({
      where: { key: 'popup_config' },
      create: { key: 'popup_config', value: configString },
      update: { value: configString },
    });

    res.json({
      success: true,
      data: {
        popup: JSON.parse(setting.value),
      },
    });
  } catch (error) {
    next(error);
  }
};
