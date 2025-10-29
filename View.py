import os
from collections import defaultdict

# List of folders to ignore
IGNORE_FOLDERS = {".git", "__pycache__", "node_modules", "venv", "sg_env", "sg_env310", "train1", "trainingss"}

# Maximum number of sample files to display per file type
MAX_SAMPLES_PER_TYPE = 3

# Set True to enforce the limit, False to show all files
LIMIT_SAMPLES = True

def print_tree(start_path, indent=""):
    items = sorted(os.listdir(start_path))
    file_type_count = defaultdict(int)  # keep track of files displayed per extension

    for index, item in enumerate(items):
        path = os.path.join(start_path, item)

        # Skip ignored folders
        if os.path.isdir(path) and item in IGNORE_FOLDERS:
            continue

        # If it’s a file, count by extension
        if os.path.isfile(path):
            _, ext = os.path.splitext(item)
            ext = ext.lower()

            if LIMIT_SAMPLES:
                # limit number of files per type
                if file_type_count[ext] >= MAX_SAMPLES_PER_TYPE:
                    if file_type_count[ext] == MAX_SAMPLES_PER_TYPE:
                        print(indent + f"└── ... ({ext} files omitted)")
                        file_type_count[ext] += 1  # so we don't repeat the "..."
                    continue
                file_type_count[ext] += 1

        # Determine prefix
        is_last = index == len(items) - 1
        prefix = "└── " if is_last else "├── "
        print(indent + prefix + item)

        # Recurse into subfolders
        if os.path.isdir(path):
            new_indent = indent + ("    " if is_last else "│   ")
            print_tree(path, new_indent)

# Change "." to your project folder path
print_tree(".")
