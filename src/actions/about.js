'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getSessionAdmin } from '@/actions/auth';

/**
 * Fetch the about page data
 */
export async function getAboutPageData() {
  try {
    const data = await prisma.aboutPageData.findUnique({
      where: { id: 'default' }
    });
    
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching about page data:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update the about page data (Admin only)
 */
export async function updateAboutPageData(data) {
  try {
    // 1. Verify admin
    const admin = await getSessionAdmin();
    if (!admin.success) {
      throw new Error('Unauthorized');
    }

    // 2. Update or create the default about page data
    const updated = await prisma.aboutPageData.upsert({
      where: { id: 'default' },
      update: {
        title: data.title,
        introText: data.introText,
        heroImage: data.heroImage,
        secondaryImage: data.secondaryImage,
        teamMembers: data.teamMembers,
        features: data.features
      },
      create: {
        id: 'default',
        title: data.title,
        introText: data.introText,
        heroImage: data.heroImage,
        secondaryImage: data.secondaryImage,
        teamMembers: data.teamMembers,
        features: data.features
      }
    });

    // 3. Revalidate the public about route
    revalidatePath('/about');
    revalidatePath('/about-us');

    return { success: true, data: updated };
  } catch (error) {
    console.error('Error updating about page data:', error);
    return { success: false, error: error.message };
  }
}
