import sys
import os

# Add backend folder to sys.path so imports resolve seamlessly
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app import app

if __name__ == '__main__':
    app.run()
