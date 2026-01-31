import zipfile
import xml.etree.ElementTree as ET
from collections import Counter

def get_cell_value(cell, ns):
    """Extract cell value and type"""
    cell_type = cell.get('t', 'n')
    v = cell.find('.//main:v', ns)
    
    if v is not None:
        return v.text, cell_type
    
    is_elem = cell.find('.//main:is', ns)
    if is_elem is not None:
        t = is_elem.find('.//main:t', ns)
        if t is not None:
            return t.text, 'inlineStr'
    
    return None, cell_type

def read_sheet_as_rows(zip_ref, sheet_name):
    """Read sheet and return as list of dictionaries"""
    try:
        with zip_ref.open(f'xl/worksheets/{sheet_name}') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            
            ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            # Get headers from first row
            headers = []
            first_row = root.find('.//main:row[@r="1"]', ns)
            if first_row:
                for cell in first_row.findall('.//main:c', ns):
                    value, _ = get_cell_value(cell, ns)
                    headers.append(value if value else '')
            
            # Get data rows
            rows = []
            for row in root.findall('.//main:row', ns):
                row_num = int(row.get('r'))
                if row_num == 1:  # Skip header
                    continue
                
                row_dict = {}
                for cell in row.findall('.//main:c', ns):
                    cell_ref = cell.get('r')
                    col_letter = ''.join(filter(str.isalpha, cell_ref))
                    col_idx = ord(col_letter) - ord('A')
                    
                    if col_idx < len(headers):
                        value, _ = get_cell_value(cell, ns)
                        if value:
                            row_dict[headers[col_idx]] = value
                
                if row_dict:  # Only add non-empty rows
                    rows.append(row_dict)
            
            return headers, rows
    except Exception as e:
        print(f"Error reading {sheet_name}: {e}")
        return [], []

with zipfile.ZipFile('Master_Enrichment_Database_Singapore.xlsx', 'r') as zip_ref:
    print("=" * 80)
    print("MASTER ENRICHMENT DATABASE ANALYSIS")
    print("=" * 80)
    
    headers, rows = read_sheet_as_rows(zip_ref, 'sheet1.xml')
    
    print(f"\nTotal Records: {len(rows)}")
    print(f"\nColumns ({len(headers)}):")
    for i, header in enumerate(headers, 1):
        print(f"  {i}. {header}")
    
    # Analyze data
    print("\n" + "=" * 80)
    print("DATA ANALYSIS")
    print("=" * 80)
    
    # Count unique centres
    centre_names = [row.get('Centre Name', '') for row in rows if row.get('Centre Name')]
    unique_centres = len(set(centre_names))
    print(f"\nUnique Tuition Centres: {unique_centres}")
    print(f"Total Branches/Locations: {len(rows)}")
    
    # Area distribution
    areas = [row.get('Area', '') for row in rows if row.get('Area')]
    area_counts = Counter(areas)
    print(f"\nDistribution by Area:")
    for area, count in sorted(area_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {area}: {count} locations")
    
    # Subjects offered
    all_subjects = []
    for row in rows:
        subjects = row.get('Subjects Offered', '')
        if subjects and subjects != 'N/A':
            # Split by comma and clean
            subj_list = [s.strip() for s in subjects.split(',')]
            all_subjects.extend(subj_list)
    
    subject_counts = Counter(all_subjects)
    print(f"\nTop 15 Subjects Offered:")
    for subject, count in subject_counts.most_common(15):
        print(f"  {subject}: {count} centres")
    
    # Levels offered
    all_levels = []
    for row in rows:
        levels = row.get('Levels Offered', '')
        if levels and levels != 'N/A':
            level_list = [l.strip() for l in levels.split(',')]
            all_levels.extend(level_list)
    
    level_counts = Counter(all_levels)
    print(f"\nLevels Offered:")
    for level, count in sorted(level_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  {level}: {count} centres")
    
    # Contact info availability
    has_landline = sum(1 for row in rows if row.get('Landline') and row.get('Landline') != 'N/A')
    has_whatsapp = sum(1 for row in rows if row.get('WhatsApp') and row.get('WhatsApp') != 'N/A')
    has_website = sum(1 for row in rows if row.get('Official Website') and row.get('Official Website') != 'N/A')
    
    print(f"\nContact Information Availability:")
    print(f"  Landline: {has_landline}/{len(rows)} ({has_landline*100//len(rows)}%)")
    print(f"  WhatsApp: {has_whatsapp}/{len(rows)} ({has_whatsapp*100//len(rows)}%)")
    print(f"  Website: {has_website}/{len(rows)} ({has_website*100//len(rows)}%)")
    
    # Sample records
    print("\n" + "=" * 80)
    print("SAMPLE RECORDS (First 3)")
    print("=" * 80)
    for i, row in enumerate(rows[:3], 1):
        print(f"\nRecord {i}:")
        for key, value in row.items():
            print(f"  {key}: {value}")
