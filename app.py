import sys
import os
import importlib.util

# Get absolute path to backend folder
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Load backend/app.py module explicitly
backend_app_path = os.path.join(backend_dir, 'app.py')
spec = importlib.util.spec_from_file_location("backend_app_module", backend_app_path)
backend_app_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(backend_app_module)

# Expose WSGI application object for Gunicorn
app = backend_app_module.app

if __name__ == '__main__':
    app.run()
