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
   * Expand grouped level names to specific levels
   * E.g., "Secondary" -> ["S1", "S2", "S3", "S4"]
   * 
   * Note: Database uses short format (P1, S1, JC1) not long format
   */
  expandLevelNames(levelNames) {
    const levelMapping = {
      'Primary': ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
      'Secondary': ['S1', 'S2', 'S3', 'S4'],
      'JC': ['JC1', 'JC2'],
      'Junior College': ['JC1', 'JC2']
    };

    const expandedLevels = [];
    
    for (const level of levelNames) {
      const trimmedLevel = level.trim();
      
      // Check if it's a grouped level name
      if (levelMapping[trimmedLevel]) {
        expandedLevels.push(...levelMapping[trimmedLevel]);
      } else {
        // Keep the original level name
        expandedLevels.push(trimmedLevel);
      }
    }
    
    return [...new Set(expandedLevels)]; // Remove duplicates
  }

  /**
   * Search and filter tuition centres
   * @param {Object} filters - Filter options
   * @param {string} filters.search - Search term for name or location
   * @param {string[]} filters.levels - Level names or IDs (supports expansion: "Secondary" -> S1-S4)
   * @param {string[]} filters.subjects - Subject names or IDs (exact matching only)
   * @param {number} filters.page - Page number (default: 1)
   * @param {number} filters.limit - Results per page (default: 20)
   * @returns {Promise<Object>} Search results with pagination
   * 
   * Filter Logic:
   * - OR within selected levels (e.g., S1 OR S2)
   * - OR within selected subjects (e.g., Physics OR Chemistry)
   * - AND between level vs subject (centres must have offerings matching BOTH)
   * - Uses Offering table for explicit level-subject combinations
   */
  async searchTuitionCentres(filters = {}) {
    const { search, levels, subjects, page = 1, limit = 20 } = filters;

    // Build where clause
    const where = {};
    const andConditions = [];

    // Build search filter (name OR location, case-insensitive)
    if (search && search.trim()) {
      andConditions.push({
        OR: [
          { name: { contains: search.trim() } },
          { location: { contains: search.trim() } }
        ]
      });
    }

    // Build level/subject filters using Offering table
    if (levels && levels.length > 0) {
      // Expand grouped level names (e.g., "Secondary" -> ["S1", "S2", "S3", "S4"])
      const expandedLevels = this.expandLevelNames(levels);
      
      // Get level IDs from names
      const levelRecords = await this.prisma.level.findMany({
        where: {
          name: { in: expandedLevels }
        },
        select: { id: true }
      });
      
      const levelIds = levelRecords.map(l => l.id);
      
      if (levelIds.length > 0) {
        andConditions.push({
          offerings: {
            some: {
              levelId: { in: levelIds }
            }
          }
        });
      }
    }

    if (subjects && subjects.length > 0) {
      // Get subject IDs from names (exact matching only)
      const subjectRecords = await this.prisma.subject.findMany({
        where: {
          name: { in: subjects }
        },
        select: { id: true }
      });
      
      const subjectIds = subjectRecords.map(s => s.id);
      
      if (subjectIds.length > 0) {
        andConditions.push({
          offerings: {
            some: {
              subjectId: { in: subjectIds }
            }
          }
        });
      }
    }

    // Combine AND conditions
    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

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
