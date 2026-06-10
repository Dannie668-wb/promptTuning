from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from api.generate import router as generate_router
from api.playground import router as playground_router

load_dotenv()

app = FastAPI(title="a2ui AI Page Generator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate_router)
app.include_router(playground_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
