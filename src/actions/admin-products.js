'use server';

import prisma from '@/lib/db';
import { generateSlug } from '@/lib/product';
import { logAdminActivity } from '@/actions/admin';
import { getSessionAdmin } from '@/actions/auth';

// ==========================================
// PRODUCT CRUD
// ==========================================

export async function getAdminProducts({ page = 1, limit = 10, search = '', status = '' } = {}) {
  try {
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [baseProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    if (!baseProducts.length) {
      return {
        success: true,
        products: [],
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }

    const productIds = baseProducts.map((p) => p.id);
    const categoryIds = [...new Set(baseProducts.map((p) => p.categoryId).filter(Boolean))];

    const [images, variants, categories, reviewsData] = await Promise.all([
      prisma.productImage.findMany({
        where: { productId: { in: productIds } },
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.productVariant.findMany({
        where: { productId: { in: productIds } },
        orderBy: { sortOrder: 'asc' },
      }),
      categoryIds.length > 0
        ? prisma.category.findMany({
            where: { id: { in: categoryIds } },
          })
        : Promise.resolve([]),
      prisma.productReview.groupBy({
        by: ['productId'],
        where: { productId: { in: productIds } },
        _count: { rating: true },
      }),
    ]);

    const imagesMap = new Map();
    images.forEach((img) => {
      if (!imagesMap.has(img.productId)) imagesMap.set(img.productId, []);
      if (imagesMap.get(img.productId).length < 1) {
        imagesMap.get(img.productId).push(img);
      }
    });

    const variantsMap = new Map();
    variants.forEach((v) => {
      if (!variantsMap.has(v.productId)) variantsMap.set(v.productId, []);
      variantsMap.get(v.productId).push(v);
    });

    const categoriesMap = new Map(categories.map((c) => [c.id, c]));
    const reviewsMap = new Map(reviewsData.map((r) => [r.productId, r._count.rating]));

    const products = baseProducts.map((p) => ({
      ...p,
      images: imagesMap.get(p.id) || [],
      variants: variantsMap.get(p.id) || [],
      category: p.categoryId ? categoriesMap.get(p.categoryId) || null : null,
      _count: { reviews: reviewsMap.get(p.id) || 0 },
    }));

    return {
      success: true,
      products,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('getAdminProducts error:', error);
    return { success: false, error: 'Failed to fetch products' };
  }
}

export async function getAdminProduct(id) {
  try {
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        features: { orderBy: { sortOrder: 'asc' } },
        specs: { orderBy: { sortOrder: 'asc' } },
        reviews: { orderBy: { createdAt: 'desc' } },
        category: true
      }
    });
    
    if (!product) return { success: false, error: 'Product not found' };
    
    return { success: true, product };
  } catch (error) {
    return { success: false, error: 'Failed to fetch product' };
  }
}

export async function createProduct(data) {
  try {
    let slug = data.slug || generateSlug(data.name);

    // Ensure unique slug
    let existing = await prisma.product.findUnique({ where: { slug } });
    let counter = 1;
    const baseSlug = slug;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await prisma.product.findUnique({ where: { slug } });
      counter++;
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        shortName: data.shortName || null,
        description: data.description || null,
        descriptionData: data.descriptionData || null,
        price: parseFloat(data.price),
        originalPrice: parseFloat(data.originalPrice || data.price),
        discount: parseInt(data.discount) || 0,
        currency: data.currency || '₹',
        stock: parseInt(data.stock) || 0,
        soldCount: parseInt(data.soldCount) || 0,
        soldPeriod: data.soldPeriod || null,
        status: data.status || 'draft',
        isFeatured: data.isFeatured || false,
        categoryId: data.categoryId || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
        ogImage: data.ogImage || null,
        canonicalUrl: data.canonicalUrl || null,
        breadcrumb: data.breadcrumb || null,
        additionalInfo: data.additionalInfo || null,
      },
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'created_product',
        entityType: 'product',
        entityId: product.id,
        description: `Created product '${product.name}'`,
      });
    }

    return { success: true, product };
  } catch (error) {
    console.error('createProduct error:', error);
    return { success: false, error: 'Failed to create product' };
  }
}

export async function updateProduct(id, data) {
  try {
    // Handle slug uniqueness if slug is being changed
    if (data.slug) {
      const existing = await prisma.product.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existing) {
        return { success: false, error: 'Slug already exists. Please choose a different slug.' };
      }
    }

    const updateData = {};
    const fields = [
      'name', 'slug', 'shortName', 'description', 'descriptionData',
      'price', 'originalPrice', 'discount', 'currency', 'stock',
      'soldCount', 'soldPeriod', 'status', 'isFeatured', 'categoryId',
      'seoTitle', 'seoDescription', 'seoKeywords', 'ogImage', 'canonicalUrl',
      'breadcrumb', 'additionalInfo',
    ];

    for (const field of fields) {
      if (data[field] !== undefined) {
        if (['price', 'originalPrice'].includes(field)) {
          updateData[field] = parseFloat(data[field]);
        } else if (['discount', 'stock', 'soldCount'].includes(field)) {
          updateData[field] = parseInt(data[field]);
        } else if (field === 'categoryId') {
          updateData[field] = data[field] || null; // empty string → null
        } else {
          updateData[field] = data[field];
        }
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'updated_product',
        entityType: 'product',
        entityId: product.id,
        description: `Updated product '${product.name}'`,
      });
    }

    return { success: true, product };
  } catch (error) {
    console.error('updateProduct error:', error);
    return { success: false, error: 'Failed to update product' };
  }
}

export async function deleteProduct(id) {
  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: 'Not found' };

    await prisma.product.delete({ where: { id } });

    const session = await getSessionAdmin();
    if (session.success) {
      await logAdminActivity({
        authId: session.authId,
        action: 'deleted_product',
        entityType: 'product',
        entityId: id,
        description: `Deleted product '${product.name}'`,
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete product' };
  }
}

// ==========================================
// PRODUCT VARIANTS
// ==========================================

export async function saveProductVariants(productId, variants) {
  try {
    // Delete existing variants
    await prisma.productVariant.deleteMany({ where: { productId } });

    // Create new variants
    if (variants && variants.length > 0) {
      const variantsData = variants.map((v, i) => ({
        productId,
        name: v.name,
        price: parseFloat(v.price),
        originalPrice: parseFloat(v.originalPrice || v.price),
        stock: parseInt(v.stock) || 0,
        isBestSeller: v.isBestSeller || false,
        sortOrder: i,
        isActive: v.isActive !== false,
        images: v.images || null,
      }));
      await prisma.productVariant.createMany({ data: variantsData });
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save variants' };
  }
}

// ==========================================
// PRODUCT FEATURES
// ==========================================

export async function saveProductFeatures(productId, features) {
  try {
    await prisma.productFeature.deleteMany({ where: { productId } });
    if (features && features.length > 0) {
      const featuresData = features.map((f, i) => ({
        productId,
        bold: f.bold,
        text: f.text,
        sortOrder: i,
      }));
      await prisma.productFeature.createMany({ data: featuresData });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save features' };
  }
}

// ==========================================
// PRODUCT SPECS
// ==========================================

export async function saveProductSpecs(productId, specs) {
  try {
    await prisma.productSpec.deleteMany({ where: { productId } });
    if (specs && specs.length > 0) {
      const specsData = specs.map((s, i) => ({
        productId,
        label: s.label,
        value: s.value,
        sortOrder: i,
      }));
      await prisma.productSpec.createMany({ data: specsData });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save specs' };
  }
}

// ==========================================
// PRODUCT IMAGES
// ==========================================

export async function saveProductImages(productId, images) {
  try {
    await prisma.productImage.deleteMany({ where: { productId } });
    if (images && images.length > 0) {
      const imagesData = images.map((img, i) => ({
        productId,
        src: img.src,
        sortOrder: i,
        isFeatured: i === 0,
      }));
      await prisma.productImage.createMany({ data: imagesData });
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to save images' };
  }
}

// ==========================================
// CATEGORIES
// ==========================================

export async function getAdminCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return { success: true, categories };
  } catch (error) {
    return { success: false, error: 'Failed to fetch categories' };
  }
}

export async function getPaginatedCategories({ page = 1, limit = 10, search = '' } = {}) {
  try {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        include: { _count: { select: { products: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      success: true,
      categories,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    return { success: false, error: 'Failed to fetch paginated categories' };
  }
}

export async function createCategory(data) {
  try {
    let slug = data.slug || generateSlug(data.name);
    let existing = await prisma.category.findUnique({ where: { slug } });
    let counter = 1;
    const baseSlug = slug;
    while (existing) {
      slug = `${baseSlug}-${counter}`;
      existing = await prisma.category.findUnique({ where: { slug } });
      counter++;
    }

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        parentId: data.parentId || null,
        sortOrder: parseInt(data.sortOrder) || 0,
        isActive: data.isActive !== false,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
        seoKeywords: data.seoKeywords || null,
      },
    });
    return { success: true, category };
  } catch (error) {
    return { success: false, error: 'Failed to create category' };
  }
}

export async function updateCategory(id, data) {
  try {
    if (data.slug) {
      const existing = await prisma.category.findFirst({
        where: { slug: data.slug, NOT: { id } },
      });
      if (existing) return { success: false, error: 'Slug already exists' };
    }
    const category = await prisma.category.update({ where: { id }, data });
    return { success: true, category };
  } catch (error) {
    return { success: false, error: 'Failed to update category' };
  }
}

export async function deleteCategory(id) {
  try {
    await prisma.category.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete category' };
  }
}

// ==========================================
// STORE SETTINGS
// ==========================================

export async function getStoreSettings() {
  try {
    let settings = await prisma.storeSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.storeSettings.create({ data: { id: 'default' } });
    }
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: 'Failed to fetch settings' };
  }
}

export async function updateStoreSettings(data) {
  try {
    const settings = await prisma.storeSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    return { success: true, settings };
  } catch (error) {
    console.error('updateStoreSettings error:', error);
    return { success: false, error: 'Failed to update settings' };
  }
}

// ==========================================
// HOMEPAGE SETTINGS
// ==========================================

export async function getHomepageSettings() {
  try {
    let settings = await prisma.homepageSettings.findUnique({ where: { id: 'default' } });
    if (!settings) {
      settings = await prisma.homepageSettings.create({ data: { id: 'default' } });
    }
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: 'Failed to fetch homepage settings' };
  }
}

export async function updateHomepageSettings(data) {
  try {
    const settings = await prisma.homepageSettings.upsert({
      where: { id: 'default' },
      update: data,
      create: { id: 'default', ...data },
    });
    return { success: true, settings };
  } catch (error) {
    return { success: false, error: 'Failed to update homepage settings' };
  }
}

// ==========================================
// REVIEWS
// ==========================================

export async function getAdminReviews({ productId, approved } = {}) {
  try {
    const where = {};
    if (productId) where.productId = productId;
    if (approved !== undefined) where.approved = approved;

    const reviews = await prisma.productReview.findMany({
      where,
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, reviews };
  } catch (error) {
    return { success: false, error: 'Failed to fetch reviews' };
  }
}

export async function toggleReviewApproval(id) {
  try {
    const review = await prisma.productReview.findUnique({ where: { id } });
    if (!review) return { success: false, error: 'Review not found' };

    await prisma.productReview.update({
      where: { id },
      data: { approved: !review.approved },
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to toggle review' };
  }
}

export async function deleteReview(id) {
  try {
    await prisma.productReview.delete({ where: { id } });
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete review' };
  }
}

// ==========================================
// ENHANCED DASHBOARD STATS
// ==========================================

export async function getEnhancedDashboardStats() {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalOrders,
      todayOrders,
      monthOrders,
      totalRevenue,
      monthRevenue,
      pendingOrders,
      prepaidOrders,
      totalProducts,
      recentOrders,
      topProducts,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.order.count({ where: { createdAt: { gte: monthStart } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid' } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'paid', createdAt: { gte: monthStart } } }),
      prisma.order.count({ where: { orderStatus: 'pending' } }),
      prisma.order.count({ where: { paymentMethod: 'razorpay' } }),
      prisma.product.count({ where: { status: 'active' } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.orderItem.groupBy({
        by: ['productName'],
        _sum: { quantity: true },
        _count: true,
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      success: true,
      stats: {
        totalOrders,
        todayOrders,
        monthOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        monthRevenue: monthRevenue._sum.total || 0,
        pendingOrders,
        prepaidOrders,
        totalProducts,
      },
      recentOrders,
      topProducts: topProducts.map((p) => ({
        name: p.productName,
        totalSold: p._sum.quantity || 0,
        orderCount: p._count,
      })),
    };
  } catch (error) {
    console.error('getEnhancedDashboardStats error:', error);
    return { success: false, error: 'Failed to fetch dashboard stats' };
  }
}

// ==========================================
// CUSTOMERS
// ==========================================

export async function getPaginatedCustomers({ page = 1, limit = 10, search = '' } = {}) {
  try {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: { total: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.customer.count({ where }),
    ]);

    // Calculate total spend per customer
    const enhancedCustomers = customers.map(c => {
      const totalSpend = c.orders.reduce((sum, order) => sum + order.total, 0);
      return {
        ...c,
        totalSpend,
      };
    });

    return {
      success: true,
      customers: enhancedCustomers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  } catch (error) {
    console.error('getPaginatedCustomers error:', error);
    return { success: false, error: 'Failed to fetch customers' };
  }
}
