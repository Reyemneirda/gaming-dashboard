from . import firebase_service as fs
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Gaming Dashboard API", version="1.0.0")

class PinItem(BaseModel):
    value: str

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Gaming Dashboard API", "version": "1.0.0"}
    

@app.get("/api/pinned")
async def get_pinned():
    try:
        pinned = fs.get_pinned_items()
        return {"success": True, "data": pinned}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/pin")
async def pin_item(item: PinItem):
    try:
        result = fs.pin_item(item.model_dump())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/unpin")
async def unpin_item(item: PinItem):
    try:
        result = fs.unpin_item(item.model_dump())
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 