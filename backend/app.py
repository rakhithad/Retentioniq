from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---------- App setup ----------
app = FastAPI(title="AttritionIQ Dashboard")

# ---------- Routes ----------
@app.get("/")
def root():
    return {"message": "AttritionIQ API", "status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

    app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)