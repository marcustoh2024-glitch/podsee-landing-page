import zipfile
import xml.etree.ElementTree as ET

def read_sheet(zip_ref, sheet_name):
    try:
        with zip_ref.open(f'xl/worksheets/{sheet_name}') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            
            ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            rows = []
            for row in root.findall('.//main:row', ns):
                row_data = []
                for cell in row.findall('.//main:c', ns):
                    v = cell.find('.//main:v', ns)
                    if v is not None:
                        row_data.append(v.text)
                    else:
                        row_data.append('')
                rows.append(row_data)
            
            return rows
    except Exception as e:
        print(f"Error reading {sheet_name}: {e}")
        return []

with zipfile.ZipFile('Master_Enrichment_Database_Singapore.xlsx', 'r') as zip_ref:
    print("=== SHEET 1 ===")
    sheet1_data = read_sheet(zip_ref, 'sheet1.xml')
    print(f"Total rows: {len(sheet1_data)}")
    print("\nFirst 10 rows:")
    for i, row in enumerate(sheet1_data[:10]):
        print(f"Row {i+1}: {row}")
    
    print("\n\n=== SHEET 2 ===")
    sheet2_data = read_sheet(zip_ref, 'sheet2.xml')
    print(f"Total rows: {len(sheet2_data)}")
    print("\nFirst 10 rows:")
    for i, row in enumerate(sheet2_data[:10]):
        print(f"Row {i+1}: {row}")
