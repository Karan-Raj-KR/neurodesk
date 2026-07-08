import json
import os
import asyncio
import time
from datetime import datetime
from typing import List, Dict, Any
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

# Explicitly load .env from the same directory as main.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, ".env")
print(f"Loading .env from: {ENV_PATH}")
load_dotenv(dotenv_path=ENV_PATH)

_key = os.environ.get("NVIDIA_API_KEY")
if _key:
    print(f"Loaded NVIDIA_API_KEY: {_key[:8]}...{_key[-4:]} (Total length: {len(_key)})")
else:
    print("NVIDIA_API_KEY is NOT set in environment!")

app = FastAPI(title="NeuroDesk API")

# Enable CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage
data_store: Dict[str, Any] = {
    "locations": [],
    "static_decisions": []
}
audit_log: List[Dict[str, Any]] = []

def load_seed_data():
    try:
        with open("seed_data.json", "r") as f:
            data = json.load(f)
            data_store["locations"] = data.get("locations", [])
            data_store["static_decisions"] = data.get("static_decisions", [])
    except Exception as e:
        print(f"Error loading seed data: {e}")

@app.on_event("startup")
def startup_event():
    load_seed_data()

@app.get("/locations")
def get_locations():
    return data_store["locations"]

@app.get("/decisions/feed")
def get_decisions_feed(refresh: bool = False):
    cards = []
    
    # Check cache first
    cache_path = os.path.join(BASE_DIR, "cached_critical_card.json")
    if not refresh and os.path.exists(cache_path):
        try:
            with open(cache_path, "r") as f:
                cached_card = json.load(f)
            print("Loaded critical card from cache.")
            cards.append(cached_card)
            cards.extend(data_store["static_decisions"])
            return cards
        except Exception as e:
            print(f"Error reading cache: {e}")
            
    # Generate dynamic Card 1 via NVIDIA NIM
    nvidia_api_key = os.getenv("NVIDIA_API_KEY")
    if nvidia_api_key:
        client = OpenAI(
            base_url="https://integrate.api.nvidia.com/v1",
            api_key=nvidia_api_key,
            timeout=30.0,
            max_retries=0
        )
        system_prompt = (
            "You are a Churn Risk Analyzer for Indian gyms. "
            "You must return ONLY a raw JSON object with no markdown formatting, "
            "no backticks, and no extra text. "
            "The JSON must have exactly these keys: "
            "headline, evidence, confidence_pct, revenue_at_risk_inr, recommended_action, sample_whatsapp_message."
        )
        user_prompt = (
            "Whitefield location. 23 members, all part of an Infosys corporate batch "
            "that joined together in March. Attendance dropped sharply after Nov 15, "
            "which is when their project sprint cycle ended. Historically, corporate "
            "batch members who miss 2+ consecutive weeks before their renewal date "
            "churn at 71%. Renewal window closes in 6 weeks. "
            "The sample_whatsapp_message should be personalized (member name 'Rohit', "
            "trainer name 'Coach Anand', mentions their usual 7 AM slot)."
        )
        
        try:
            print("Starting NVIDIA API call...")
            start_time = time.time()
            response = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="meta/llama-3.3-70b-instruct",
                temperature=0.2,
                max_tokens=1024,
            )
            elapsed = time.time() - start_time
            print(f"NVIDIA API call completed in {elapsed:.2f} seconds.")
            content = response.choices[0].message.content
            if content.startswith("```json"):
                content = content.strip("```json").strip("```")
            elif content.startswith("```"):
                content = content.strip("```")
            
            card1_data = json.loads(content.strip())
            card1_data["id"] = "decision-1"
            card1_data["type"] = "critical"
            cards.append(card1_data)
            
            # Save to cache
            try:
                with open(cache_path, "w") as f:
                    json.dump(card1_data, f)
                print("Saved critical card to cache.")
            except Exception as e:
                print(f"Error saving to cache: {e}")
                
        except Exception as e:
            elapsed = time.time() - start_time
            print(f"Error generating NVIDIA NIM response after {elapsed:.2f} seconds: {e}")
            cards.append({
                "id": "decision-1",
                "type": "critical",
                "headline": "Error generating insights",
                "evidence": f"Failed to connect to NVIDIA API. Check your NVIDIA_API_KEY.",
                "confidence_pct": 0,
                "revenue_at_risk_inr": 0,
                "recommended_action": "Add NVIDIA_API_KEY to .env and restart backend.",
                "sample_whatsapp_message": ""
            })
    else:
        cards.append({
            "id": "decision-1",
            "type": "critical",
            "headline": "Missing NVIDIA API Key",
            "evidence": "The NVIDIA_API_KEY environment variable is not set.",
            "confidence_pct": 0,
            "revenue_at_risk_inr": 0,
            "recommended_action": "Add NVIDIA_API_KEY to .env and restart backend.",
            "sample_whatsapp_message": ""
        })

    # Add static cards
    cards.extend(data_store["static_decisions"])
    return cards

@app.post("/decisions/{decision_id}/approve")
async def approve_decision(decision_id: str):
    await asyncio.sleep(1.5)
    timestamp = datetime.now().isoformat()
    # Simple logic to determine recipient count based on decision ID
    recipient_count = 23 if decision_id == "decision-1" else 15 if decision_id == "decision-3" else 1
    
    audit_log.append({
        "action": "decision_approved",
        "recipient_count": recipient_count,
        "timestamp": timestamp
    })
    return {"status": "sent", "timestamp": timestamp}

@app.get("/audit-log")
def get_audit_log():
    return audit_log
