import os
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv

load_dotenv()

if not firebase_admin._apps:
    cred_path = os.environ["FIREBASE_CRED"]
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {'databaseURL': 'https://test-gaming-dashboard-default-rtdb.europe-west1.firebasedatabase.app/'})


def get_game_stats():
    ref = db.reference("/playtime")
    return ref.get() or {}


def get_pinned_items():
    ref = db.reference("/pinned")
    pinned = ref.get() or {"games": []}
    return pinned

def pin_item(data):
    v = data.get("value")

    if not v:
        return {"error": "Value required"}, 400
    
    ref = db.reference("/pinned")
    pinned = ref.get() or {"games": []}
    
    pinned["games"].append(v)
    ref.set(pinned)
    return {"message": f"{v} pinned with success"}

def unpin_item(data):
    v = data.get("value")
    
    if not v:
        return {"error": "Value required"}, 400
    
    ref = db.reference("/pinned")
    pinned = ref.get() or {"games": []}
    
    if v in pinned["games"]:
        pinned["games"].remove(v)
    
    ref.set(pinned)
    return {"message": f"{v} unpinned with success"}
