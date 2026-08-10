import os
import sys
import time
import zipfile
import tempfile
import fnmatch
from pathlib import Path

# Paths & Settings
PROJECT_ROOT = Path(__file__).resolve().parent.parent
ZIP_FILENAME = "patchpilot-ai.zip"
ZIP_FILEPATH = PROJECT_ROOT / ZIP_FILENAME

# Ignored directory names (at any depth)
IGNORE_DIRS = {
    "node_modules",
    ".venv",
    "venv",
    "dist",
    ".git",
    ".gemini",
    "__pycache__",
    ".idea",
    ".vscode",
}

# Ignored file patterns
IGNORE_PATTERNS = [
    "*.zip",
    "*.pyc",
    "*.pyo",
    "*.tmp",
    "*.log",
    ".DS_Store",
    "Thumbs.db",
    "*.env.local",
]

def should_ignore(path: Path) -> bool:
    # Check parts for ignored directories
    for part in path.parts:
        if part in IGNORE_DIRS:
            return True
    
    # Check filename patterns
    filename = path.name
    for pattern in IGNORE_PATTERNS:
        if fnmatch.fnmatch(filename, pattern):
            return True
            
    return False

def create_zip():
    temp_zip_path = PROJECT_ROOT / f".{ZIP_FILENAME}.tmp"
    total_files = 0
    start_time = time.time()
    
    try:
        with zipfile.ZipFile(temp_zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
            for root, dirs, files in os.walk(PROJECT_ROOT):
                # Filter directories in-place to avoid descending into ignored dirs
                dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
                
                rel_dir = Path(root).relative_to(PROJECT_ROOT)
                if should_ignore(rel_dir):
                    continue
                
                # Add empty directory entry if needed
                if rel_dir != Path(".") and not files and not dirs:
                    zf.write(root, arcname=str(rel_dir).replace("\\", "/") + "/")
                
                for file in files:
                    file_path = Path(root) / file
                    rel_file_path = file_path.relative_to(PROJECT_ROOT)
                    
                    if should_ignore(rel_file_path):
                        continue
                        
                    arcname = str(rel_file_path).replace("\\", "/")
                    zf.write(file_path, arcname=arcname)
                    total_files += 1

        # Replace existing zip file atomically
        if temp_zip_path.exists():
            if ZIP_FILEPATH.exists():
                try:
                    ZIP_FILEPATH.unlink()
                except Exception:
                    pass
            temp_zip_path.replace(ZIP_FILEPATH)
            
        size_mb = ZIP_FILEPATH.stat().st_size / (1024 * 1024)
        elapsed = time.time() - start_time
        print(f"[{time.strftime('%H:%M:%S')}] Updated '{ZIP_FILENAME}': {total_files} files, {size_mb:.2f} MB ({elapsed:.2f}s)")
        return True
    except Exception as e:
        print(f"[{time.strftime('%H:%M:%S')}] Error creating zip: {e}", file=sys.stderr)
        if temp_zip_path.exists():
            try:
                temp_zip_path.unlink()
            except Exception:
                pass
        return False

def get_dir_snapshot(root_dir: Path) -> dict:
    """Returns a mapping of rel_path -> mtime for all non-ignored files."""
    snapshot = {}
    try:
        for root, dirs, files in os.walk(root_dir):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for file in files:
                file_path = Path(root) / file
                rel_path = file_path.relative_to(root_dir)
                if should_ignore(rel_path):
                    continue
                try:
                    snapshot[str(rel_path)] = file_path.stat().st_mtime
                except (OSError, FileNotFoundError):
                    pass
    except Exception:
        pass
    return snapshot

def watch_and_sync(debounce_seconds=1.5, poll_interval=0.8):
    print(f"[*] Watching for file changes in {PROJECT_ROOT}...")
    print(f"[*] Output: {ZIP_FILEPATH}")
    print("[*] Press Ctrl+C to stop.\n")
    
    create_zip()
    last_snapshot = get_dir_snapshot(PROJECT_ROOT)
    pending_update = False
    last_change_time = 0

    while True:
        try:
            time.sleep(poll_interval)
            current_snapshot = get_dir_snapshot(PROJECT_ROOT)
            
            # Check if files were added, deleted, or modified
            if current_snapshot != last_snapshot:
                last_snapshot = current_snapshot
                pending_update = True
                last_change_time = time.time()

            # Debounced trigger
            if pending_update and (time.time() - last_change_time >= debounce_seconds):
                pending_update = False
                create_zip()
                last_snapshot = get_dir_snapshot(PROJECT_ROOT)

        except KeyboardInterrupt:
            print("\n[*] Stopping auto-zip watcher.")
            break
        except Exception as e:
            print(f"[*] Watcher loop error: {e}", file=sys.stderr)
            time.sleep(2)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ("--watch", "-w"):
        watch_and_sync()
    else:
        create_zip()
