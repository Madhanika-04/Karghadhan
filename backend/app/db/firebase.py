"""
app/db/firebase.py
Initialises Firebase Admin SDK and exports the Firestore client instance `db`.
"""
import os
import glob
import logging
from typing import Optional

import firebase_admin
from firebase_admin import credentials, firestore

logger = logging.getLogger(__name__)

# Search for serviceAccountKey.json or any firebase-adminsdk key file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

possible_paths = [
    os.path.join(BASE_DIR, "serviceAccountKey.json"),
    os.path.join(BASE_DIR, "backend", "serviceAccountKey.json"),
    os.path.join(os.getcwd(), "serviceAccountKey.json"),
    os.path.join(os.getcwd(), "backend", "serviceAccountKey.json"),
]

matching_root = glob.glob(os.path.join(BASE_DIR, "*firebase-adminsdk*.json"))
matching_backend = glob.glob(os.path.join(BASE_DIR, "backend", "*firebase-adminsdk*.json"))
matching_cwd = glob.glob(os.path.join(os.getcwd(), "*firebase-adminsdk*.json"))

all_candidate_paths = possible_paths + matching_backend + matching_root + matching_cwd

cred_path: Optional[str] = None
for path in all_candidate_paths:
    if os.path.exists(path):
        cred_path = path
        break

if not firebase_admin._apps:
    if cred_path:
        logger.info("Initializing Firebase Admin SDK with key file: %s", cred_path)
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    else:
        logger.warning("No service account key JSON file found. Attempting Application Default Credentials.")
        cred = credentials.ApplicationDefault()
        firebase_admin.initialize_app(cred)

db = firestore.client()


def get_db():
    """FastAPI dependency that returns the Firestore client."""
    return db
