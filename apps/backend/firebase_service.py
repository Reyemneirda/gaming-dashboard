import os
import firebase_admin
from firebase_admin import credentials, db
from dotenv import load_dotenv
from datetime import datetime, timedelta
import requests
import random

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

def get_last_update_time():
    ref = db.reference("/metadata/last_updated")
    return ref.get() or datetime.now().isoformat()

def update_analytics_cache():
    try:
        ref = db.reference("/metadata/last_updated")
        ref.set(datetime.now().isoformat())
        
        analytics_ref = db.reference("/analytics")
        current_analytics = analytics_ref.get() or {}
        
        stats = get_detailed_stats()
        total_games = len(stats)
        total_playtime = sum(game_stats['total_minutes'] for game_stats in stats.values())
        
        new_analytics = {
            **current_analytics,
            "total_games_tracked": total_games,
            "total_playtime_minutes": total_playtime,
            "last_calculated": datetime.now().isoformat(),
            "active_games_this_week": len([g for g, s in stats.items() if s['last_played'] and 
                                         datetime.fromisoformat(s['last_played']) > datetime.now() - timedelta(days=7)])
        }
        
        analytics_ref.set(new_analytics)
        return new_analytics
        
    except Exception as e:
        print(f"Error updating analytics cache: {e}")
        return {}


def fetch_trending_games():
    try:
        RAWG_API_KEY = os.getenv('RAWG_API_KEY', 'your_key')
        today = datetime.now()
        week_ago = today - timedelta(days=7)
        
        params = {
            'key': RAWG_API_KEY,
            'dates': f'{week_ago.strftime("%Y-%m-%d")},{today.strftime("%Y-%m-%d")}',
            'ordering': '-added,-rating',
            'page_size': 6
        }
        
        response = requests.get("https://api.rawg.io/api/games", params=params, timeout=10)
        
        if response.status_code == 200:
            games_data = response.json()
            trending_games = []
            
            for game in games_data.get('results', [])[:6]:
                trending_game = {
                    'id': game.get('id'),
                    'name': game.get('name'),
                    'background_image': game.get('background_image'),
                    'rating': game.get('rating', 0),
                    'released': game.get('released'),
                    'genres': [g.get('name') for g in game.get('genres', [])[:2]],
                    'platforms': [p.get('platform', {}).get('name') for p in game.get('platforms', [])[:3]],
                    'added': game.get('added', 0)
                }
                trending_games.append(trending_game)
            
            trending_ref = db.reference("/trending_games")
            trending_ref.set({
                "games": trending_games,
                "last_updated": datetime.now().isoformat()
            })
            
            return trending_games
        else:
            return get_mock_trending()
            
    except Exception as e:
        print(f"Trending fetch error: {e}")
        return get_mock_trending()

def get_mock_trending():
    mock_games = [
        {"name": "Cyberpunk 2077", "rating": 4.1, "genres": ["RPG", "Action"], "added": 15000},
        {"name": "Baldur's Gate 3", "rating": 4.6, "genres": ["RPG", "Strategy"], "added": 12000},
        {"name": "Spider-Man 2", "rating": 4.4, "genres": ["Action", "Adventure"], "added": 11000},
        {"name": "Alan Wake 2", "rating": 4.3, "genres": ["Horror", "Action"], "added": 9500},
        {"name": "Starfield", "rating": 3.8, "genres": ["RPG", "Sci-Fi"], "added": 8800},
        {"name": "Hogwarts Legacy", "rating": 4.2, "genres": ["RPG", "Adventure"], "added": 8200}
    ]
    
    trending_games = []
    for i, game in enumerate(mock_games):
        trending_games.append({
            'id': 1000 + i,
            'name': game['name'],
            'background_image': f'https://via.placeholder.com/300x200?text={game["name"].replace(" ", "+")}',
            'rating': game['rating'],
            'released': (datetime.now() - timedelta(days=random.randint(7, 60))).strftime('%Y-%m-%d'),
            'genres': game['genres'],
            'platforms': ['PC', 'PlayStation 5', 'Xbox Series X'],
            'added': game['added']
        })
    
    trending_ref = db.reference("/trending_games")
    trending_ref.set({
        "games": trending_games,
        "last_updated": datetime.now().isoformat()
    })
    
    return trending_games

def get_trending_games():
    try:
        trending_ref = db.reference("/trending_games")
        trending_data = trending_ref.get()
        
        if trending_data:
            return trending_data
        else:
            games = get_mock_trending()
            return {
                "games": games,
                "last_updated": datetime.now().isoformat()
            }
    except Exception as e:
        return {"games": [], "last_updated": None}
