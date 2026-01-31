import { prisma } from '../prisma.js';

/**
 * Service class for tuition centre operations
 * Handles business logic for searching, filtering, and retrieving tuition centres
 */
class TuitionCentreService {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  /**
   * Search and filter tuition centres
   * @param {Object} filters - Filter options
   * @param {string} filters.search - Search term for name or location
   * @param {string[]} filters.levels - Array of level IDs or names
   * @param {string[]} filters.subjects - Array of subject IDs or names
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Results per page (default: 20)
   * @returns {Promise<Object>} Search results with pagination
   */
  async searchTuitionCentres(filters = {}) {
    const { search, levels, subjects, page = 1, limit = 20 } = filters;

    // Build where clause with AND logic between filter types
    const whereConditions = [];

    // Build search filter (name OR location, case-insensitive)
    // Note: SQLite doesn't support mode: 'insensitive', but contains is case-insensitive by default in SQLite
    if (search && search.trim()) {
      whereConditions.push({
        OR: [
          { name: { contains: search.trim() } },
          { location: { contains: search.trim() } }
        ]
      });
    }

    // Build level filter (OR logic within levels)
    if (levels && levels.length > 0) {
      whereConditions.push({
        levels: {
          some: {
            level: {
              OR: levels.map(level => ({
                OR: [
                  { id: level },
                  { name: { equals: level } }
                ]
              }))
            }
          }
        }
      });
    }

    // Build subject filter (OR logic within subjects)
    if (subjects && subjects.length > 0) {
      whereConditions.push({
        subjects: {
          some: {
            subject: {
              OR: subjects.map(subject => ({
                OR: [
                  { id: subject },
                  { name: { equals: subject } }
                ]
              }))
            }
          }
        }
      });
    }

    // Combine all filters with AND logic
    const where = whereConditions.length > 0 ? { AND: whereConditions } : {};

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute query with pagination
    const [data, total] = await Promise.all([
      this.prisma.tuitionCentre.findMany({
        where,
        skip,
        take: limit,
        include: {
          levels: {
            include: {
              level: true
            }
          },
          subjects: {
            include: {
              subject: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      }),
      this.prisma.tuitionCentre.count({ where })
    ]);

    // Format results with WhatsApp links and flatten relationships
    const formattedData = data.map(centre => ({
      id: centre.id,
      name: centre.name,
      location: centre.location,
      whatsappNumber: centre.whatsappNumber,
      whatsappLink: this.formatWhatsAppLink(centre.whatsappNumber),
      website: centre.website,
      levels: centre.levels.map(l => ({
        id: l.level.id,
        name: l.level.name
      })),
      subjects: centre.subjects.map(s => ({
        id: s.subject.id,
        name: s.subject.name
      })),
      createdAt: centre.createdAt,
      updatedAt: centre.updatedAt
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);

    return {
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  /**
   * Get tuition centre by ID
   * @param {string} id - Tuition centre ID
   * @returns {Promise<Object>} Tuition centre details
   */
  async getTuitionCentreById(id) {
    if (!id) {
      throw new Error('Tuition centre ID is required');
    }

    const centre = await this.prisma.tuitionCentre.findUnique({
      where: { id },
      include: {
        levels: {
          include: {
            level: true
          }
        },
        subjects: {
          include: {
            subject: true
          }
        }
      }
    });

    if (!centre) {
      const error = new Error('Tuition centre not found');
      error.statusCode = 404;
      throw error;
    }

    // Format response with WhatsApp link and flatten relationships
    return {
      id: centre.id,
      name: centre.name,
      location: centre.location,
      whatsappNumber: centre.whatsappNumber,
      whatsappLink: this.formatWhatsAppLink(centre.whatsappNumber),
      website: centre.website,
      levels: centre.levels.map(l => ({
        id: l.level.id,
        name: l.level.name
      })),
      subjects: centre.subjects.map(s => ({
        id: s.subject.id,
        name: s.subject.name
      })),
      createdAt: centre.createdAt,
      updatedAt: centre.updatedAt
    };
  }

  /**
   * Format WhatsApp link from phone number
   * @param {string} phoneNumber - Phone number
   * @returns {string} WhatsApp link
   */
  formatWhatsAppLink(phoneNumber) {
    if (!phoneNumber) {
      return '';
    }

    // Strip all non-digit characters except leading '+'
    const cleaned = phoneNumber.replace(/[^\d+]/g, '');
    
    // Remove the leading '+' to get only digits
    const digits = cleaned.replace(/^\+/, '');
    
    // Generate WhatsApp link
    return `https://wa.me/${digits}`;
  }
}

export default TuitionCentreService;
