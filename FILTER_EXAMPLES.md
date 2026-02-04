# Filter Query Examples

## Quick Reference for Tuition Centre Filtering

### Base URL
```
GET /api/tuition-centres
```

### Example Queries

#### 1. Get All Centres (No Filters)
```
GET /api/tuition-centres
```
**Returns**: All 10 centres

---

#### 2. Search by Location
```
GET /api/tuition-centres?search=Tampines
```
**Returns**: Centres in Tampines (1 centre)

```
GET /api/tuition-centres?search=Jurong
```
**Returns**: Centres matching "Jurong" (1 centre - Jurong East)

---

#### 3. Filter by Single Level
```
GET /api/tuition-centres?levels=Primary
```
**Returns**: Centres offering Primary level (6 centres)

```
GET /api/tuition-centres?levels=Junior College
```
**Returns**: Centres offering Junior College (4 centres)

---

#### 4. Filter by Multiple Levels (OR Logic)
```
GET /api/tuition-centres?levels=Primary,Secondary
```
**Returns**: Centres offering Primary OR Secondary (9 centres)

```
GET /api/tuition-centres?levels=IB,IGCSE
```
**Returns**: Centres offering IB OR IGCSE (3 centres)

---

#### 5. Filter by Single Subject
```
GET /api/tuition-centres?subjects=Mathematics
```
**Returns**: Centres offering Mathematics (10 centres - all)

```
GET /api/tuition-centres?subjects=Physics
```
**Returns**: Centres offering Physics (4 centres)

---

#### 6. Filter by Multiple Subjects (OR Logic)
```
GET /api/tuition-centres?subjects=Physics,Chemistry
```
**Returns**: Centres offering Physics OR Chemistry (4 centres)

```
GET /api/tuition-centres?subjects=Physics,Chemistry,Biology
```
**Returns**: Centres offering any science subject (4 centres)

---

#### 7. Combine Location + Level (AND Logic)
```
GET /api/tuition-centres?search=Tampines&levels=Primary
```
**Returns**: Centres in Tampines that offer Primary (1 centre)

---

#### 8. Combine Level + Subject (AND Logic)
```
GET /api/tuition-centres?levels=Primary&subjects=Mathematics
```
**Returns**: Centres offering Primary AND Mathematics (6 centres)

```
GET /api/tuition-centres?levels=Secondary&subjects=Physics
```
**Returns**: Centres offering Secondary AND Physics (3 centres)

---

#### 9. Combine All Three Filters (AND Logic)
```
GET /api/tuition-centres?search=Jurong East&levels=Secondary&subjects=Physics
```
**Returns**: Centres in Jurong East that offer Secondary AND Physics (1 centre)

---

#### 10. Complex Multi-Value Filters
```
GET /api/tuition-centres?levels=Primary,Secondary&subjects=Mathematics,English
```
**Returns**: Centres offering (Primary OR Secondary) AND (Mathematics OR English) (9 centres)

---

#### 11. Pagination
```
GET /api/tuition-centres?page=1&limit=5
```
**Returns**: First 5 centres

```
GET /api/tuition-centres?page=2&limit=5
```
**Returns**: Next 5 centres

---

#### 12. Combined Filters with Pagination
```
GET /api/tuition-centres?levels=Primary&subjects=Mathematics&page=1&limit=3
```
**Returns**: First 3 centres offering Primary AND Mathematics

---

## Filter Logic Summary

### AND Logic (Across Filter Types)
When combining different filter types, results must match ALL criteria:
- `search` AND `levels` AND `subjects`

**Example**: `?search=Tampines&levels=Primary` returns centres that are BOTH in Tampines AND offer Primary.

### OR Logic (Within Same Filter Type)
When providing multiple values for the same filter, results match ANY value:
- `levels=Primary,Secondary` → Primary OR Secondary
- `subjects=Physics,Chemistry` → Physics OR Chemistry

**Example**: `?levels=Primary,Secondary` returns centres that offer Primary OR Secondary (or both).

### Empty Filters
No filters = return all centres

### No Results
If no centres match the criteria, returns empty array with `total: 0`

---

## Response Format

```json
{
  "data": [
    {
      "id": "...",
      "name": "ABC Learning Centre",
      "location": "Tampines",
      "whatsappNumber": "+6591234567",
      "whatsappLink": "https://wa.me/6591234567",
      "website": "https://abclearning.com",
      "levels": [
        { "id": "...", "name": "Primary" },
        { "id": "...", "name": "Secondary" }
      ],
      "subjects": [
        { "id": "...", "name": "Mathematics" },
        { "id": "...", "name": "Science" },
        { "id": "...", "name": "English" }
      ],
      "createdAt": "2026-02-04T...",
      "updatedAt": "2026-02-04T..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 10,
    "totalPages": 1
  }
}
```

---

## Test Dataset Reference

### Centres by Location
- **Tampines**: ABC Learning Centre
- **Jurong East**: Bright Minds Education
- **Bishan**: Excel Tuition Hub
- **Woodlands**: Future Scholars Academy
- **Clementi**: Knowledge Hub
- **Ang Mo Kio**: Prime Education Centre
- **Bedok**: Smart Learning Studio
- **Hougang**: Top Achievers Tuition
- **Yishun**: Victory Learning Centre
- **Punggol**: Wisdom Education Hub

### Centres by Level
- **Primary**: 6 centres
- **Secondary**: 7 centres
- **Junior College**: 4 centres
- **IB**: 2 centres
- **IGCSE**: 2 centres

### Centres by Subject
- **Mathematics**: 10 centres (all)
- **English**: 7 centres
- **Science**: 6 centres
- **Physics**: 4 centres
- **Chemistry**: 4 centres
- **Chinese**: 4 centres
- **Biology**: 2 centres
- **History**: 1 centre
- **Geography**: 1 centre
