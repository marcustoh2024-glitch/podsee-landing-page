import zipfile
import xml.etree.ElementTree as ET

# Excel files are zip archives
with zipfile.ZipFile('Master_Enrichment_Database_Singapore.xlsx', 'r') as zip_ref:
    # List all files in the archive
    print("Files in Excel archive:")
    for name in zip_ref.namelist()[:10]:
        print(f"  {name}")
    
    # Try to read shared strings (contains cell values)
    try:
        with zip_ref.open('xl/sharedStrings.xml') as f:
            tree = ET.parse(f)
            root = tree.getroot()
            
            # Extract namespace
            ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            
            strings = []
            for si in root.findall('.//main:si', ns):
                t = si.find('.//main:t', ns)
                if t is not None:
                    strings.append(t.text)
            
            print(f"\n\nTotal shared strings: {len(strings)}")
            print("\nFirst 50 strings (likely column headers and data):")
            for i, s in enumerate(strings[:50]):
                print(f"{i}: {s}")
    except Exception as e:
        print(f"Error reading shared strings: {e}")
