import sys
from dotenv import load_dotenv

load_dotenv()
sys.path = sys.path + ["./app"]

import json
from fastapi import FastAPI
from pydantic import BaseModel
from services.llm_service import LLMService

app = FastAPI()
llm_service = LLMService()


class TextData(BaseModel):
    text: str
    lang: str

@app.get("/")
async def home():
    return json.dumps({"message": "API is running"})

@app.post("/summarize")
async def summarize(data: TextData):
    text = data.text
    lang = data.lang
    response = llm_service.summarize_text(text, lang)
    return {"summary": response}
