import requests
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("WATSON_API_KEY")
INSTANCE_URL = os.getenv("WATSON_INSTANCE_URL")

def analyze_text(text, features=None):
    """
    Analyze text using Watson NLU.

    Args:
        text (str): The text to analyze.
        features (dict, optional): Custom features to extract. Defaults to keywords, entities, concepts.

    Returns:
        dict: The JSON response from Watson NLU.
    """
    if features is None:
        features = {
            "keywords": {"limit": 10},
            "entities": {"limit": 10},
            "concepts": {"limit": 5}
        }

    url = f"{INSTANCE_URL}/v1/analyze"
    
    params = {"version": "2022-04-07"}
    
    data = {
        "text": text,
        "features": features
    }
    
    response = requests.post(
        url,
        params=params,
        json=data,
        auth=("apikey", API_KEY)
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Watson NLU API Error: {response.status_code} - {response.text}")
