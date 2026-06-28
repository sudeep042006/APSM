import os
import re

DIR = '/home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash'

def fix_imports():
    for fname in os.listdir(DIR):
        if not fname.endswith('.jsx'):
            continue
            
        filepath = os.path.join(DIR, fname)
        with open(filepath, 'r') as f:
            content = f.read()
            
        # Find all lucide-react imports
        # import { TrendingUp, ... } from "lucide-react";
        # import { Calendar, ... } from 'lucide-react';
        
        matches = re.findall(r'import\s+\{([^}]+)\}\s+from\s+[\'"]lucide-react[\'"];?', content)
        
        if len(matches) > 1:
            all_icons = set()
            for match in matches:
                # split by comma, clean up
                icons = [i.strip() for i in match.split(',')]
                for i in icons:
                    if i:
                        all_icons.add(i)
                        
            # Remove all existing lucide-react imports
            content = re.sub(r'import\s+\{[^}]+\}\s+from\s+[\'"]lucide-react[\'"];?\n?', '', content)
            
            # Add the new combined import right after other imports
            new_import = f"import {{ {', '.join(sorted(list(all_icons)))} }} from 'lucide-react';\n"
            
            # Find a good place to insert (after standard imports or at top)
            content = new_import + content
            
            with open(filepath, 'w') as f:
                f.write(content)
            print(f"Fixed imports in {fname}")

fix_imports()
