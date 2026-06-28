import os
import re

DIR = '/home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash/'

for filename in os.listdir(DIR):
    if not filename.endswith('.jsx'):
        continue
        
    filepath = os.path.join(DIR, filename)
    with open(filepath, 'r') as f:
        content = f.read()
        
    original = content
    
    # Remove imports
    content = re.sub(r'import \{ mockFacebookData \} from "@/utils/metaMockData";\n?', '', content)
    content = re.sub(r'import \{ mockInstagramData \} from "@/utils/metaMockData";\n?', '', content)
    
    # Replace default fallbacks
    content = content.replace('const d = data || mockFacebookData;', 'const d = data || {};')
    content = content.replace('const d = data || mockInstagramData;', 'const d = data || {};')
    
    # Safe chaining for objects
    content = content.replace('d.kpis', '(d?.kpis || [])')
    content = content.replace('d.charts.', 'd?.charts?.')
    content = content.replace('d.tables.', 'd?.tables?.')
    
    # Specifically fix nested objects and map loops
    content = re.sub(r'(d\?\.charts\?\.[a-zA-Z0-9_]+)\.map', r'(\1 || []).map', content)
    content = re.sub(r'(d\?\.tables\?\.[a-zA-Z0-9_]+)\.map', r'(\1 || []).map', content)
    
    # More nested mapping fixes: e.g. d?.charts?.audience?.ageGender.map
    # But wait, it might be d?.charts?.audience?.ageGender
    content = content.replace('d?.charts?.audience.', 'd?.charts?.audience?.')
    content = re.sub(r'(d\?\.charts\?\.audience\?\.[a-zA-Z0-9_]+)\.map', r'(\1 || []).map', content)
    
    content = content.replace('d?.charts?.engagementRate.', 'd?.charts?.engagementRate?.')
    content = re.sub(r'(d\?\.charts\?\.engagementRate\?\.[a-zA-Z0-9_]+)\.map', r'(\1 || []).map', content)
    
    # d.data inside props
    # Facebook settings and help don't have data, just remove the import if it exists.
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Refactored {filename}")

print("Done.")
