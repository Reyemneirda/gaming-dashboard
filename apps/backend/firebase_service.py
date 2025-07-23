import os
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv
from datetime import datetime, timedelta

load_dotenv()

if not firebase_admin._apps:
    cred_path = os.environ["FIREBASE_CRED"]
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {'databaseURL': 'https://test-gaming-dashboard-default-rtdb.europe-west1.firebasedatabase.app/'})

def get_game_stats():
    ref = db.reference("/playtime")
    return ref.get() or {}

def get_detailed_stats():
    ref = db.reference("/sessions")
    sessions = ref.get() or {}
    stats = {}
    for game, game_sessions in sessions.items():
        total_minutes = sum(session.get('minutes', 0) for session in game_sessions)
        sessions_count = len(game_sessions)
        last_session = max(game_sessions, key=lambda x: x.get('date', '')) if game_sessions else None
        
        stats[game] = {
            'total_minutes': total_minutes,
            'sessions_count': sessions_count,
            'last_played': last_session.get('date') if last_session else None,
            'average_session': total_minutes / sessions_count if sessions_count > 0 else 0
        }
    
    return stats

def add_play_session(data):
    game = data.get("game")
    minutes = data.get("minutes", 0)
    date = data.get("date", datetime.now().isoformat())
    
    if not game or not isinstance(minutes, int) or minutes <= 0:
        return {"error": "Données invalides"}, 400
    
    session_ref = db.reference(f"/sessions/{game}")
    sessions = session_ref.get() or []
    sessions.append({
        "minutes": minutes,
        "date": date,
        "timestamp": datetime.now().isoformat()
    })
    session_ref.set(sessions)
    
    total_ref = db.reference(f"/playtime/{game}")
    current_total = total_ref.get() or 0
    total_ref.set(current_total + minutes)
    
    return {"message": f"{minutes} minutes ajoutées à {game}", "total": current_total + minutes}

def get_recent_sessions(days=7):
    ref = db.reference("/sessions")
    all_sessions = ref.get() or {}
    
    cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
    recent_sessions = {}
    
    for game, sessions in all_sessions.items():
        recent = [s for s in sessions if s.get('date', '') >= cutoff_date]
        if recent:
            recent_sessions[game] = recent
    
    return recent_sessions

def get_pinned_items():
    ref = db.reference("/pinned")
    pinned = ref.get() or {"games": []}
    return pinned

def pin_item(data):
    t = data.get("type")
    v = data.get("value")
    
    if not t or not v:
        return {"error": "Type and value required"}, 400
    
    ref = db.reference("/pinned")
    pinned = ref.get() or {"games": []}
    
    if t == "game" and v not in pinned["games"]:
        pinned["games"].append(v)
    else:
        return {"error": "Invalid type or element already pinned"}, 400
    
    ref.set(pinned)
    return {"message": f"{v} pinned with success"}

def unpin_item(data):
    t = data.get("type")
    if t != "game":
        return {"error": "Type must be 'game'"}, 400
    
    v = data.get("value")
    
    if not v:
        return {"error": "Value required"}, 400
    
    ref = db.reference("/pinned")
    pinned = ref.get() or {"games": []}
    
    if v in pinned["games"]:
        pinned["games"].remove(v)
    
    ref.set(pinned)
    return {"message": f"{v} unpinned with success"}
