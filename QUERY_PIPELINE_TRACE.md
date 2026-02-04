# Query Pipeline End-to-End Trace
**Date:** February 4, 2026  
**Purpose:** Complete verification of filter → query → results flow

---

## STEP 1: Frontend Filter Selection

### Component: `FilterWizard.jsx`

**Input:** User clicks on filter chips
- Level options: `['Primary', 'Secondary', 'Junior College']`
- Subject options: `['Mathematics', 'English', 'Science', 'Chinese', 'Physics', 'Chemistry', 'Biology']`

**State Management:**
```javascript
const [filters, setFilters] = useState({
  level: '',    // Single selection
  subject: ''   // Single selection
})
```

**Output:** State object with selected values
```javascript
{
  level: 'Secondary',      // Example
  subject: 'Mathematics'   // Example
}
```

**Assumptions:**
- ✅ Single level selection only (not multi-select)
- ✅ Single subject selection only (not multi-select)
- ✅ Both filters required before "Apply" button enables
- ✅ No validation of filter values against database

**Transformations:** None - raw user selection stored as-is

---

## STEP 2: Navigation & URL Construction

### Component: `FilterWizard.jsx` → `handleApply()`

**Input:** Filter state object
```javascript
{
  level: 'Secondary',
  subject: 'Mathematics'
}
```

**Process:**
```javascript
const params = new URLSearchParams({
  level: filters.level,
  subject: filters.subject
})
router.push(`/results?${params.toString()}`)
```

**Output:** URL with query parameters
```
/results?level=Secondary&subject=Mathematics
```

**Assumptions:**
- ✅ URL encoding handled by `URLSearchParams`
- ✅ No transformation of filter values
- ✅ Parameter names: `level` and `subject` (singular)

**Transformations:** None - values passed through unchanged

---

## STEP 3: Results Page - URL Parsing

### Component: `results/page.jsx` → `ResultsContent`

**Input:** URL query parameters
```
?level=Secondary&subject=Mathematics
```

**Process:**
```javascript
const searchParams = useSearchParams()
const level = searchParams.get('level')      // 'Secondary'
const subject = searchParams.get('subject')  // 'Mathematics'
```

**Output:** Extracted values
```javascript
level = 'Secondary'
subject = 'Mathematics'
```

**Assumptions:**
- ✅ Values extracted as strings
- ✅ No validation or sanitization
- ✅ Null if parameter missing

**Transformations:** None

---

## STEP 4: API Request Construction

### Component: `results/page.jsx` → `fetchCentres()`

**Input:** Extracted URL parameters
```javascript
level = 'Secondary'
subject = 'Mathematics'
```

**Process:**
```javascript
const params = new URLSearchParams()
if (level) params.append('levels', level)      // ⚠️ NOTE: 'levels' (plural)
if (subject) params.append('subjects', subject) // ⚠️ NOTE: 'subjects' (plural)

const response = await fetch(`/api/tuition-centres?${params.toString()}`)
```

**Output:** API request URL
```
/api/tuition-centres?levels=Secondary&subjects=Mathematics
```

**⚠️ CRITICAL TRANSFORMATION:**
- Frontend uses: `level` (singular)
- API expects: `levels` (plural)
- Frontend uses: `subject` (singular)
- API expects: `subjects` (plural)

**Assumptions:**
- ✅ API expects plural parameter names
- ✅ Single value passed (not comma-separated list)
- ✅ No URL encoding needed (handled by URLSearchParams)

---

## STEP 5: API Route - Parameter Parsing

### File: `src/app/api/tuition-centres/route.js`

**Input:** HTTP GET request
```
/api/tuition-centres?levels=Secondary&subjects=Mathematics
```

**Process:**
```javascript
const { searchParams } = new URL(request.url);

const search = searchParams.get('search') || undefined;
const levelsParam = searchParams.get('levels');           // 'Secondary'
const subjectsParam = searchParams.get('subjects');       // 'Mathematics'
const pageParam = searchParams.get('page');
const limitParam = searchParams.get('limit');

// Parse comma-separated values
const levels = levelsParam 
  ? levelsParam.split(',').map(l => l.trim()).filter(Boolean) 
  : undefined;
const subjects = subjectsParam 
  ? subjectsParam.split(',').map(s => s.trim()).filter(Boolean) 
  : undefined;
```

**Output:** Parsed filter object
```javascript
{
  search: undefined,
  levels: ['Secondary'],      // Array with 1 element
  subjects: ['Mathematics'],  // Array with 1 element
  page: 1,                    // Default
  limit: 20                   // Default
}
```

**Assumptions:**
- ✅ Comma-separated values supported (but frontend sends single value)
- ✅ Whitespace trimmed
- ✅ Empty strings filtered out
- ✅ Undefined if parameter missing

**Transformations:**
- String → Array conversion
- Defaults applied for page/limit

---

## STEP 6: Service Layer - Filter Processing

### File: `src/lib/services/tuitionCentreService.js` → `searchTuitionCentres()`

**Input:** Filter object from API route
```javascript
{
  levels: ['Secondary'],
  subjects: ['Mathematics'],
  page: 1,
  limit: 20
}
```

**Process 1: Level Expansion**
```javascript
expandLevelNames(levelNames) {
  const levelMapping = {
    'Primary': ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6'],
    'Secondary': ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4'],
    'JC': ['JC 1', 'JC 2'],
    'Junior College': ['JC 1', 'JC 2']
  };
  
  // Expand 'Secondary' → ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4']
}
```

**⚠️ CRITICAL TRANSFORMATION:**
```javascript
Input:  ['Secondary']
Output: ['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4']
```

**Process 2: Build WHERE Conditions**
```javascript
const whereConditions = [];

// Level filter (OR logic within levels)
whereConditions.push({
  levels: {
    some: {
      level: {
        OR: [
          { id: 'Secondary 1' },
          { name: { equals: 'Secondary 1' } },
          { id: 'Secondary 2' },
          { name: { equals: 'Secondary 2' } },
          { id: 'Secondary 3' },
          { name: { equals: 'Secondary 3' } },
          { id: 'Secondary 4' },
          { name: { equals: 'Secondary 4' } }
        ]
      }
    }
  }
});

// Subject filter (OR logic within subjects)
whereConditions.push({
  subjects: {
    some: {
      subject: {
        OR: [
          { id: 'Mathematics' },
          { name: { equals: 'Mathematics' } }
        ]
      }
    }
  }
});

// Combine with AND
const where = { AND: whereConditions };
```

**Output:** Prisma WHERE clause
```javascript
{
  AND: [
    {
      levels: {
        some: {
          level: {
            OR: [
              { id: 'Secondary 1' }, { name: { equals: 'Secondary 1' } },
              { id: 'Secondary 2' }, { name: { equals: 'Secondary 2' } },
              { id: 'Secondary 3' }, { name: { equals: 'Secondary 3' } },
              { id: 'Secondary 4' }, { name: { equals: 'Secondary 4' } }
            ]
          }
        }
      }
    },
    {
      subjects: {
        some: {
          subject: {
            OR: [
              { id: 'Mathematics' },
              { name: { equals: 'Mathematics' } }
            ]
          }
        }
      }
    }
  ]
}
```

**Assumptions:**
- ✅ Level expansion happens for grouped names only
- ✅ Specific levels (e.g., 'Primary 1') passed through unchanged
- ✅ OR logic within each filter type (levels, subjects)
- ✅ AND logic between filter types
- ✅ Filters match by ID or name (supports both)

**Transformations:**
- **Level expansion:** 'Secondary' → 4 specific levels
- **Query structure:** Flat array → Nested Prisma query
- **Match strategy:** Single value → ID OR name match

---

## STEP 7: Prisma Query Execution

### File: `tuitionCentreService.js` → Database query

**Input:** Prisma WHERE clause + pagination

**Process:**
```javascript
const [data, total] = await Promise.all([
  this.prisma.tuitionCentre.findMany({
    where: { /* WHERE clause from Step 6 */ },
    skip: 0,      // (page - 1) * limit
    take: 20,     // limit
    include: {
      levels: {
        include: { level: true }
      },
      subjects: {
        include: { subject: true }
      }
    },
    orderBy: { name: 'asc' }
  }),
  this.prisma.tuitionCentre.count({ where: { /* same WHERE */ } })
]);
```

**Generated SQL (conceptual):**
```sql
SELECT tc.*, 
       tcl.levelId, l.name as level_name,
       tcs.subjectId, s.name as subject_name
FROM TuitionCentre tc
LEFT JOIN TuitionCentreLevel tcl ON tc.id = tcl.tuitionCentreId
LEFT JOIN Level l ON tcl.levelId = l.id
LEFT JOIN TuitionCentreSubject tcs ON tc.id = tcs.tuitionCentreId
LEFT JOIN Subject s ON tcs.subjectId = s.id
WHERE EXISTS (
  SELECT 1 FROM TuitionCentreLevel tcl2
  JOIN Level l2 ON tcl2.levelId = l2.id
  WHERE tcl2.tuitionCentreId = tc.id
  AND (l2.id IN ('Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4')
       OR l2.name IN ('Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4'))
)
AND EXISTS (
  SELECT 1 FROM TuitionCentreSubject tcs2
  JOIN Subject s2 ON tcs2.subjectId = s2.id
  WHERE tcs2.tuitionCentreId = tc.id
  AND (s2.id = 'Mathematics' OR s2.name = 'Mathematics')
)
ORDER BY tc.name ASC
LIMIT 20 OFFSET 0;
```

**Output:** Raw database rows
```javascript
[
  {
    id: 'uuid-1',
    name: 'AM Academy',
    location: 'Marine Parade',
    whatsappNumber: '',
    website: 'https://www.amacademysg.com/',
    dataQualityStatus: 'OK',
    levels: [
      { tuitionCentreId: 'uuid-1', levelId: 'level-uuid-1', level: { id: 'level-uuid-1', name: 'Secondary 1' } },
      { tuitionCentreId: 'uuid-1', levelId: 'level-uuid-2', level: { id: 'level-uuid-2', name: 'Secondary 2' } },
      // ... more levels
    ],
    subjects: [
      { tuitionCentreId: 'uuid-1', subjectId: 'subj-uuid-1', subject: { id: 'subj-uuid-1', name: 'Mathematics' } },
      { tuitionCentreId: 'uuid-1', subjectId: 'subj-uuid-2', subject: { id: 'subj-uuid-2', name: 'Science' } },
      // ... more subjects
    ],
    createdAt: '2026-02-03T...',
    updatedAt: '2026-02-03T...'
  },
  // ... more centres
]
```

**Assumptions:**
- ✅ Junction tables (TuitionCentreLevel, TuitionCentreSubject) used for many-to-many
- ✅ EXISTS subqueries for filtering
- ✅ LEFT JOINs for including related data
- ✅ SQLite case-insensitive matching by default

**Transformations:**
- Nested query → SQL JOINs and subqueries
- Prisma relations → Database foreign keys

---

## STEP 8: Service Layer - Response Formatting

### File: `tuitionCentreService.js` → Format results

**Input:** Raw Prisma results

**Process:**
```javascript
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
```

**Output:** Formatted API response
```javascript
{
  data: [
    {
      id: 'uuid-1',
      name: 'AM Academy',
      location: 'Marine Parade',
      whatsappNumber: '',
      whatsappLink: 'https://wa.me/',
      website: 'https://www.amacademysg.com/',
      levels: [
        { id: 'level-uuid-1', name: 'Secondary 1' },
        { id: 'level-uuid-2', name: 'Secondary 2' },
        { id: 'level-uuid-3', name: 'Secondary 3' },
        { id: 'level-uuid-4', name: 'Secondary 4' }
      ],
      subjects: [
        { id: 'subj-uuid-1', name: 'Mathematics' },
        { id: 'subj-uuid-2', name: 'Science' },
        { id: 'subj-uuid-3', name: 'English' }
      ],
      createdAt: '2026-02-03T...',
      updatedAt: '2026-02-03T...'
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 15,
    totalPages: 1
  }
}
```

**Assumptions:**
- ✅ WhatsApp link generated even if number is empty
- ✅ All levels and subjects included (not filtered to match query)
- ✅ Junction table data flattened to simple arrays

**⚠️ CRITICAL TRANSFORMATION:**
- **ALL levels returned**, not just matching ones
- **ALL subjects returned**, not just matching ones
- Centre matches if it has ANY of the queried levels/subjects

**Transformations:**
- Nested junction objects → Flat arrays
- Phone number → WhatsApp link
- Total count → Total pages calculation

---

## STEP 9: API Route - Response Return

### File: `src/app/api/tuition-centres/route.js`

**Input:** Service layer response

**Process:**
```javascript
const result = await tuitionCentreService.searchTuitionCentres(filters);
return NextResponse.json(result, { status: 200 });
```

**Output:** HTTP response
```
Status: 200 OK
Content-Type: application/json

{
  "data": [ /* formatted centres */ ],
  "pagination": { /* pagination info */ }
}
```

**Assumptions:**
- ✅ No additional transformation
- ✅ Error handling wraps service errors

**Transformations:** None

---

## STEP 10: Frontend - Results Display

### Component: `results/page.jsx` → Render cards

**Input:** API response data
```javascript
{
  data: [
    {
      id: 'uuid-1',
      name: 'AM Academy',
      location: 'Marine Parade',
      levels: [
        { id: 'level-uuid-1', name: 'Secondary 1' },
        { id: 'level-uuid-2', name: 'Secondary 2' },
        // ... more levels
      ],
      subjects: [
        { id: 'subj-uuid-1', name: 'Mathematics' },
        { id: 'subj-uuid-2', name: 'Science' },
        // ... more subjects
      ],
      whatsappLink: 'https://wa.me/',
      website: 'https://www.amacademysg.com/'
    }
  ],
  pagination: { total: 15 }
}
```

**Process:**
```javascript
setResults(data.data || [])

// For each result card:
const displayLevel = result.levels?.[0]?.name || level
const displaySubject = result.subjects?.[0]?.name || subject
```

**⚠️ CRITICAL TRANSFORMATION:**
- **Only FIRST level displayed** on card
- **Only FIRST subject displayed** on card
- Falls back to query parameter if no levels/subjects

**Output:** UI cards
```jsx
<button>
  <h3>AM Academy</h3>
  <div>
    <span>Marine Parade</span>
    <span>Secondary 1</span>      {/* First level only */}
    <span>Mathematics</span>       {/* First subject only */}
  </div>
</button>
```

**Assumptions:**
- ✅ First level/subject is representative
- ✅ User doesn't see all matching levels/subjects on card
- ✅ Full details available in modal

**Transformations:**
- Array → First element only
- Full data → Display subset

---

## CRITICAL FINDINGS

### 🔴 Issue 1: Level Expansion Mismatch

**Frontend sends:** `'Secondary'` (grouped name)  
**Service expands to:** `['Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4']`  
**Database has:** Specific levels only (no grouped 'Secondary')

**Result:** ✅ Works correctly due to expansion logic

### 🔴 Issue 2: Display vs. Query Mismatch

**User selects:** `'Secondary'` + `'Mathematics'`  
**Query matches:** Centres with ANY Secondary level + Mathematics  
**Card displays:** Only FIRST level (e.g., 'Secondary 1')  
**User sees:** 'Secondary 1' but selected 'Secondary'

**Result:** ⚠️ Potential confusion - display doesn't match selection

### 🔴 Issue 3: All Levels/Subjects Returned

**Query:** Filter by Secondary + Mathematics  
**Response:** Centre with ALL its levels and subjects  
**Example:** Centre teaches Primary 1-6, Secondary 1-4, JC 1-2  
**Returned:** All levels, not just Secondary 1-4

**Result:** ⚠️ Frontend must filter or user sees irrelevant data

### 🔴 Issue 4: Parameter Name Transformation

**Frontend state:** `level`, `subject` (singular)  
**URL params:** `level`, `subject` (singular)  
**API params:** `levels`, `subjects` (plural)

**Result:** ✅ Handled correctly but inconsistent naming

---

## LOGIC VERIFICATION

### AND/OR Conditions

**Between filter types:** AND  
- Must match level AND subject

**Within filter type:** OR  
- Matches ANY of: Secondary 1 OR Secondary 2 OR Secondary 3 OR Secondary 4

**SQL equivalent:**
```sql
WHERE (level IN ('Secondary 1', 'Secondary 2', 'Secondary 3', 'Secondary 4'))
  AND (subject = 'Mathematics')
```

✅ **Correct:** This is the expected behavior

---

## RECOMMENDATIONS

### 1. Fix Display Mismatch
Show grouped level name on card if user selected grouped name:
```javascript
const displayLevel = level || result.levels?.[0]?.name
```

### 2. Filter Returned Data
Only show levels/subjects that match the query:
```javascript
const matchingLevels = result.levels.filter(l => 
  expandedLevels.includes(l.name)
)
```

### 3. Consistent Naming
Use plural everywhere or singular everywhere:
- Option A: `levels`/`subjects` throughout
- Option B: `level`/`subject` throughout

### 4. Document Expansion Logic
Add comments explaining why 'Secondary' becomes 4 levels

---

## SUMMARY

✅ **Query pipeline works correctly**  
✅ **AND/OR logic is correct**  
✅ **Level expansion works as designed**  
⚠️ **Display shows first level only (may confuse users)**  
⚠️ **All levels/subjects returned (not filtered to match)**  
⚠️ **Parameter naming inconsistent (singular vs plural)**
