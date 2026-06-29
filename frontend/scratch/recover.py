import re
import json

LOG_FILE = '/home/deboshree-singha/.gemini/antigravity/brain/d3539006-eb26-4fdc-800e-4012edf3b0d6/.system_generated/logs/overview.txt'

def recover_files():
    with open(LOG_FILE, 'r') as f:
        log_data = f.readlines()
    
    files_to_recover = {
        'FacebookDash.jsx': {},
        'InstagramDash.jsx': {},
        'MetaInnerSidebar.jsx': {}
    }
    
    # We will look for view_file output which shows file content.
    # Output looks like:
    # 70:             <Button variant="outline"
    
    # Or we can look for the output of "view_file" directly in the JSON
    for line in log_data:
        try:
            entry = json.loads(line)
            if entry.get('source') == 'SYSTEM' and entry.get('type') == 'TOOL_RESPONSE':
                for tool_resp in entry.get('tool_responses', []):
                    if tool_resp.get('name') == 'view_file':
                        output = tool_resp.get('output', '')
                        if 'File Path: `file:///home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash/FacebookDash.jsx`' in output:
                            extract_lines('FacebookDash.jsx', output, files_to_recover)
                        elif 'File Path: `file:///home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash/InstagramDash.jsx`' in output:
                            extract_lines('InstagramDash.jsx', output, files_to_recover)
                        elif 'File Path: `file:///home/deboshree-singha/Desktop/incubien/frontend/src/pages/MetaDash/MetaInnerSidebar.jsx`' in output:
                            extract_lines('MetaInnerSidebar.jsx', output, files_to_recover)
        except Exception:
            pass
            
    for filename, lines in files_to_recover.items():
        if lines:
            print(f"Recovered {len(lines)} lines for {filename}")
            # sort lines
            sorted_lines = [lines[k] for k in sorted(lines.keys())]
            with open(filename, 'w') as out_f:
                out_f.write("\n".join(sorted_lines))
        else:
            print(f"Could not recover {filename}")

def extract_lines(filename, output, files_to_recover):
    # Match lines like "1: // some code"
    # Note: it's "<line_number>: <original_line>"
    for line in output.split('\n'):
        match = re.match(r'^(\d+):\s(.*)', line)
        if match:
            line_num = int(match.group(1))
            code = match.group(2)
            files_to_recover[filename][line_num] = code

recover_files()
