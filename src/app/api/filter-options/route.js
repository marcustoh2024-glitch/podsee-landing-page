import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/filter-options
 * Returns available filter options based on actual offerings data
 * 
 * Response:
 * - enabled: boolean - whether filters are enabled (based on feature flag + data availability)
 * - levels: string[] - available level names from offerings
 * - subjects: string[] - available subject names from offerings
 */
export async function GET() {
  try {
    // Check if we have offerings data
    const offeringsCount = await prisma.offering.count();
    
    if (offeringsCount === 0) {
      // No offerings yet - filters disabled
      return NextResponse.json({
        enabled: false,
        levels: [],
        subjects: [],
        reason: 'Filters temporarily disabled. No offerings data yet.'
      });
    }
    
    // Get unique levels and subjects from offerings
    const [levels, subjects] = await Promise.all([
      prisma.level.findMany({
        where: {
          offerings: {
            some: {} // Only levels that have offerings
          }
        },
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      }),
      prisma.subject.findMany({
        where: {
          offerings: {
            some: {} // Only subjects that have offerings
          }
        },
        select: {
          id: true,
          name: true
        },
        orderBy: {
          name: 'asc'
        }
      })
    ]);
    
    // Return enabled state with available options
    return NextResponse.json({
      enabled: true,
      levels: levels.map(l => l.name),
      subjects: subjects.map(s => s.name)
    });
    
  } catch (error) {
    console.error('Error in GET /api/filter-options:', error);
    
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch filter options'
        }
      },
      { status: 500 }
    );
  }
}
