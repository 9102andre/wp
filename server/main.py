from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from scraper import scrape_medical_data
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    query: str

@app.post("/scrape")
async def scrape(request: ScrapeRequest):
    result = scrape_medical_data(request.query)
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
