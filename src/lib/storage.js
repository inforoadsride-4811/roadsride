import { supabase } from './supabase';

const MAIN_BUCKET = 'roadsride';

export const BUCKETS = {
  PRODUCTS: 'product-images',
  CATEGORIES: 'category-images',
  BANNERS: 'homepage-banners',
  STORE: 'store-assets',
  CUSTOMERS: 'customer-avatars',
  INVOICES: 'invoice-pdfs',
  REVIEWS: 'review-media',
};

/**
 * Upload a file to Supabase Storage inside the master bucket
 * @param {File} file - The file to upload
 * @param {string} folder - The folder name (use BUCKETS constant)
 * @param {string} path - Optional sub-folder path (e.g. 'pack1/')
 * @returns {Promise<{success: boolean, url: string, error: string}>}
 */
export async function uploadFile(file, folder, path = '') {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    // Construct path: folderName/optionalPath/fileName.ext
    const filePath = `${folder}/${path}${fileName}`;

    const { data, error } = await supabase.storage
      .from(MAIN_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(MAIN_BUCKET)
      .getPublicUrl(filePath);

    return { success: true, url: publicUrl, path: filePath };
  } catch (err) {
    console.error('Storage upload error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a file from Supabase Storage
 * @param {string} fileUrlOrPath - The full public URL or the exact path
 * @param {string} folder - The folder name (for legacy compatibility, not strictly needed for deletion if URL is full)
 */
export async function deleteFile(fileUrlOrPath, folder) {
  try {
    let filePath = fileUrlOrPath;
    if (fileUrlOrPath.includes('http')) {
      const urlParts = fileUrlOrPath.split(`/public/${MAIN_BUCKET}/`);
      if (urlParts.length > 1) {
        filePath = urlParts[1];
      } else {
        return { success: false, error: 'URL does not match master bucket format' };
      }
    }

    const { error } = await supabase.storage
      .from(MAIN_BUCKET)
      .remove([filePath]);

    if (error) {
      console.error('Supabase delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}
