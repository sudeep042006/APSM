import os
import re

DIR = '/home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash'

def remove_missing_export():
    for fname in os.listdir(DIR):
        if not fname.endswith('.jsx'):
            continue
            
        filepath = os.path.join(DIR, fname)
        with open(filepath, 'r') as f:
            content = f.read()
            
        if 'FacebookTopContent' in content:
            # Replace 'FacebookTopContent,' with ''
            # Also handle cases with space 'FacebookTopContent, '
            content = re.sub(r'FacebookTopContent\s*,\s*', '', content)
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Fixed {fname}")

remove_missing_export()
