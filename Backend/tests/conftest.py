"""
Pytest configuration file for the Woo-Kit backend tests.
"""
import os
import sys

# Add the parent directory to sys.path so pytest can find our modules
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
