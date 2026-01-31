import zipfile
import xml.etree.ElementTree as ET

def get_cell_value(cell, ns):
    """Extract cell value and type"""
    cell_type = cell.get('t', 'n')  # n=number, s=string, str=formula string
    v = cell.find('.//main:v', ns)
    
    if v is not None:
        return v.text, cell_type
    
    # Check for inline string
    is_elem = cell.find('.//main:is', ns)
    if is_elem is not None:
        t = is_elem.find('.//main:t', ns)
        if t is not None:
            return t.text, 'inlineStr'
    
    return None, cell_type

def read_sheet_detailed(zip_ref, sheet_name):
    try:
        with zip_ref.open(f'xl/worksheets/{sheet_name}') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            
            ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            rows_data = []
            for row in root.findall('.//main:row', ns):
                row_num = row.get('r')
                cells = []
                for cell in row.findall('.//main:c', ns):
                    cell_ref = cell.get('r')
                    value, cell_type = get_cell_value(cell, ns)
                    if value:
                        cells.append({
                            'ref': cell_ref,
                            'value': value,
                            'type': cell_type
                        })
                if cells:  # Only add rows with data
                    rows_data.append({
                        'row': row_num,
                        'cells': cells
                    })
            
            return rows_data
    except Exception as e:
        print(f"Error reading {sheet_name}: {e}")
        return []

with zipfile.ZipFile('Master_Enrichment_Database_Singapore.xlsx', 'r') as zip_ref:
    print("=== SHEET 1 (First 20 rows with data) ===")
    sheet1_data = read_sheet_detailed(zip_ref, 'sheet1.xml')
    for row_info in sheet1_data[:20]:
        print(f"\nRow {row_info['row']}:")
        for cell in row_info['cells']:
            print(f"  {cell['ref']}: {cell['value']} (type: {cell['type']})")
