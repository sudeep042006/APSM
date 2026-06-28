import os
import re

FB_FILE = '/home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash/tabs/FacebookTabs.jsx'
IG_FILE = '/home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash/tabs/InstagramTabs.jsx'
OUT_DIR = '/home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash/'

def split_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the start of the first function
    first_func_match = re.search(r'^[ \t]*(?:export\s+)?function ', content, re.MULTILINE)
    if not first_func_match:
        print(f"No functions found in {filepath}")
        return "", {}
    
    imports_text = content[:first_func_match.start()].strip()
    
    # regex to split by any line starting with (optional spaces) export function or function
    # We will use re.finditer to find all function declarations and their start positions
    func_matches = list(re.finditer(r'^[ \t]*(?:export\s+)?function\s+([A-Za-z0-9_]+)\s*\(.*?\)\s*\{', content, re.MULTILINE))
    
    functions = {}
    
    for i, match in enumerate(func_matches):
        start_idx = match.start()
        end_idx = func_matches[i+1].start() if i+1 < len(func_matches) else len(content)
        
        name = match.group(1)
        body = content[start_idx:end_idx].strip()
        
        # Ensure it's exported
        if not body.lstrip().startswith('export'):
            # Replace first occurrence of 'function ' with 'export function '
            body = re.sub(r'^([ \t]*)function ', r'\1export function ', body, count=1)
            
        functions[name] = body
        
    return imports_text, functions

fb_imports, fb_funcs = split_file(FB_FILE)
ig_imports, ig_funcs = split_file(IG_FILE)

shared_func_names = ['EmptyState', 'KpiCard', 'DarkTooltip', 'FacebookTopContent', 'FacebookDataTable', 'InstagramDataTable', 'ProgressBar']

shared_funcs_code = []
for name in shared_func_names:
    if name in fb_funcs:
        shared_funcs_code.append(fb_funcs[name])
    elif name in ig_funcs:
        shared_funcs_code.append(ig_funcs[name])

# We also need to add missing Lucide React imports that caused the Calendar bug.
# We'll just dump all lucide-react icons in the imports.
EXTRA_LUCIDE = "import { Calendar, Target, Users, TrendingUp, Eye, FileText, Video, Heart, Activity, ThumbsUp, MessageCircle, BarChart3 } from 'lucide-react';"

shared_file_content = fb_imports + "\n" + EXTRA_LUCIDE + "\n\n" + "\n\n".join(shared_funcs_code)
with open(os.path.join(OUT_DIR, 'MetaSharedComponents.jsx'), 'w') as f:
    f.write(shared_file_content)

def write_components(funcs, imports, prefix, shared_names):
    shared_imports = f"import {{ {', '.join(shared_names)} }} from './MetaSharedComponents';\n"
    
    for name, code in funcs.items():
        if name in shared_names or name == 'ProgressBar':
            continue # already handled
            
        file_content = imports + "\n" + EXTRA_LUCIDE + "\n" + shared_imports + "\n\n" + code
        with open(os.path.join(OUT_DIR, f"{name}.jsx"), 'w') as f:
            f.write(file_content)

write_components(fb_funcs, fb_imports, 'Facebook', shared_func_names)
write_components(ig_funcs, ig_imports, 'Instagram', shared_func_names)
print("Files split successfully!")
