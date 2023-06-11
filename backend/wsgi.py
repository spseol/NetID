import os
import sys

dir = os.path.dirname(__file__)
if dir:
    os.chdir(dir)
    sys.path.insert(0, dir)

from app import app as application
