from fastapi import FastAPI

# ---------- App setup ----------
app = FastAPI(title="AttritionIQ Dashboard")

# ---------- Routes ----------
@app.get("/")
def root():
    return {"message": "AttritionIQ API", "status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)