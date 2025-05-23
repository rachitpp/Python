#!/usr/bin/env python
"""
Deployment Checker for Dental X-ray Analysis Application

This script verifies that all the necessary prerequisites and configurations
are in place for deploying the application.
"""

import os
import sys
import shutil
import subprocess
import importlib.util
from pathlib import Path

# Terminal colors for output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_status(message, status, details=None):
    """Print a status message with colored formatting."""
    if status == "OK":
        status_str = f"{Colors.GREEN}[OK]{Colors.ENDC}"
    elif status == "WARNING":
        status_str = f"{Colors.WARNING}[WARNING]{Colors.ENDC}"
    elif status == "FAIL":
        status_str = f"{Colors.FAIL}[FAIL]{Colors.ENDC}"
    else:
        status_str = f"[{status}]"
    
    print(f"{status_str} {message}")
    
    if details:
        print(f"     {Colors.BLUE}{details}{Colors.ENDC}")

def check_python_version():
    """Check if Python version is compatible."""
    import platform
    version = platform.python_version()
    major, minor, _ = map(int, version.split('.'))
    
    if major >= 3 and minor >= 9:
        print_status(f"Python version: {version}", "OK")
        return True
    else:
        print_status(f"Python version: {version}", "FAIL", 
                     "Python 3.9+ is required. Please upgrade your Python installation.")
        return False

def check_directory_structure():
    """Verify the project directory structure."""
    expected_dirs = ["backend", "frontend"]
    missing_dirs = []
    
    for d in expected_dirs:
        if not os.path.isdir(d):
            missing_dirs.append(d)
    
    if not missing_dirs:
        print_status("Directory structure", "OK")
        return True
    else:
        print_status("Directory structure", "FAIL", 
                     f"Missing directories: {', '.join(missing_dirs)}. Make sure you're running this script from the project root.")
        return False

def check_backend_dependencies():
    """Check if all required backend dependencies are available."""
    try:
        os.chdir("backend")
        
        # Check if requirements.txt exists
        if not os.path.isfile("requirements.txt"):
            print_status("Backend requirements.txt", "FAIL", "File not found")
            os.chdir("..")
            return False
        
        # Check if all packages in requirements.txt are installed
        with open("requirements.txt") as f:
            requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]
        
        missing_packages = []
        for req in requirements:
            # Extract package name from requirement line (ignoring version specifiers)
            package_name = req.split('==')[0].split('>=')[0].split('<=')[0].strip()
            
            # Check if the package is importable
            if importlib.util.find_spec(package_name) is None:
                missing_packages.append(package_name)
        
        os.chdir("..")
        
        if not missing_packages:
            print_status("Backend dependencies", "OK")
            return True
        else:
            print_status("Backend dependencies", "FAIL", 
                         f"Missing packages: {', '.join(missing_packages)}. Run 'pip install -r backend/requirements.txt'")
            return False
    except Exception as e:
        os.chdir("..")
        print_status("Backend dependencies check", "FAIL", str(e))
        return False

def check_frontend_dependencies():
    """Check if all required frontend dependencies are available."""
    try:
        os.chdir("frontend")
        
        # Check if package.json exists
        if not os.path.isfile("package.json"):
            print_status("Frontend package.json", "FAIL", "File not found")
            os.chdir("..")
            return False
        
        # Check if node_modules exists
        if not os.path.isdir("node_modules"):
            print_status("Frontend dependencies", "WARNING", 
                         "node_modules directory not found. Run 'npm install' in the frontend directory.")
            os.chdir("..")
            return False
        
        # Check for npm/node
        npm_path = shutil.which("npm")
        if not npm_path:
            print_status("npm installation", "FAIL", 
                         "npm not found in PATH. Please install Node.js and npm.")
            os.chdir("..")
            return False
        
        os.chdir("..")
        print_status("Frontend dependencies", "OK")
        return True
    except Exception as e:
        os.chdir("..")
        print_status("Frontend dependencies check", "FAIL", str(e))
        return False

def check_api_keys():
    """Check if the necessary API keys are configured."""
    # Check for .env file or environment variables
    env_path = os.path.join("backend", ".env")
    has_env_file = os.path.isfile(env_path)
    
    if has_env_file:
        with open(env_path) as f:
            env_content = f.read()
        
        has_roboflow = "ROBOFLOW_API_KEY" in env_content
        has_openai = "OPENAI_API_KEY" in env_content
    else:
        has_roboflow = "ROBOFLOW_API_KEY" in os.environ
        has_openai = "OPENAI_API_KEY" in os.environ
    
    if has_roboflow and has_openai:
        print_status("API Keys", "OK")
        return True
    elif not has_env_file:
        print_status("API Keys", "WARNING", 
                     "No .env file found in backend directory. Make sure to set environment variables during deployment.")
        return True
    else:
        missing = []
        if not has_roboflow:
            missing.append("ROBOFLOW_API_KEY")
        if not has_openai:
            missing.append("OPENAI_API_KEY")
        
        print_status("API Keys", "WARNING", 
                     f"Missing keys: {', '.join(missing)}. Add them to backend/.env file or set as environment variables.")
        return False

def main():
    """Run all deployment checks."""
    print(f"{Colors.HEADER}{Colors.BOLD}Dental X-ray Analysis Application - Deployment Checker{Colors.ENDC}\n")
    
    checks = [
        check_python_version,
        check_directory_structure,
        check_backend_dependencies,
        check_frontend_dependencies,
        check_api_keys
    ]
    
    results = [check() for check in checks]
    
    print("\n" + "-" * 50)
    
    if all(results):
        print(f"\n{Colors.GREEN}{Colors.BOLD}All checks passed! Your application is ready for deployment.{Colors.ENDC}")
        print("\nFor deployment instructions, see:")
        print(f"{Colors.BLUE}- backend/deploy-instructions.md{Colors.ENDC}")
        print(f"{Colors.BLUE}- frontend/deploy-instructions.md{Colors.ENDC}")
        print(f"{Colors.BLUE}- quick-deploy-guide.md{Colors.ENDC}")
        return 0
    else:
        print(f"\n{Colors.WARNING}{Colors.BOLD}Some checks failed. Please fix the issues before deployment.{Colors.ENDC}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 