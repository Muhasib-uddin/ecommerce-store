import { Router } from 'express';
import {
  createBlogCategory,
  getBlogCategories,
  getBlogPosts,
  getBlogPostBySlug,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getPages,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  getNavigationMenu,
  createNavigationMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getPopupConfig,
  updatePopupConfig,
} from '../controllers/cms.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/security.js';
import {
  blogCategorySchema,
  blogPostSchema,
  pageSchema,
  menuSchema,
  menuItemSchema,
} from '../validators/cms.validators.js';

const router = Router();

// ============================================================
// Blog Category Routes
// ============================================================
router.get('/blog/categories', getBlogCategories);
router.post(
  '/blog/categories',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(blogCategorySchema),
  createBlogCategory
);

// ============================================================
// Blog Post Routes
// ============================================================
router.get('/blog/posts', getBlogPosts);
router.get('/blog/posts/:slug', getBlogPostBySlug);
router.post(
  '/blog/posts',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(blogPostSchema),
  createBlogPost
);
router.put(
  '/blog/posts/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(blogPostSchema),
  updateBlogPost
);
router.delete(
  '/blog/posts/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteBlogPost
);

// ============================================================
// Page Routes
// ============================================================
router.get('/pages', getPages);
router.get('/pages/:slug', getPageBySlug);
router.post(
  '/pages',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(pageSchema),
  createPage
);
router.put(
  '/pages/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(pageSchema),
  updatePage
);
router.delete(
  '/pages/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deletePage
);

// ============================================================
// Navigation Menu Routes
// ============================================================
router.get('/menus/:name', getNavigationMenu);
router.post(
  '/menus',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(menuSchema),
  createNavigationMenu
);
router.post(
  '/menus/items',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(menuItemSchema),
  createMenuItem
);
router.put(
  '/menus/items/:id',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  validateBody(menuItemSchema),
  updateMenuItem
);
router.delete(
  '/menus/items/:id',
  authenticate,
  requireRole('SUPER_ADMIN'),
  deleteMenuItem
);

// ============================================================
// Popup Config Routes
// ============================================================
router.get('/popups', getPopupConfig);
router.put(
  '/popups',
  authenticate,
  requireRole('SUPER_ADMIN', 'STORE_MANAGER'),
  updatePopupConfig
);

export default router;
