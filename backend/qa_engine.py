import os
import requests
from dotenv import load_dotenv
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.embeddings import HuggingFaceEmbeddings

load_dotenv()

# WatsonX Config
API_KEY = os.getenv("WATSONX_API_KEY")
WATSONX_URL = os.getenv("WATSONX_URL")

# FAISS Config
INDEX_PATH = "vector_store/faiss_index"

# ---- FAISS Helper Functions ---- #

def build_faiss_index(text, index_path=INDEX_PATH):
    splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    chunks = splitter.split_text(text)

    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectordb = FAISS.from_texts(chunks, embeddings)

    vectordb.save_local(index_path)
    print(f"✅ FAISS index built and saved at {index_path}")

def get_similar_chunks(question, index_path=INDEX_PATH, k=3):
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    vectordb = FAISS.load_local(index_path, embeddings,allow_dangerous_deserialization=True)

    docs = vectordb.similarity_search(question, k=k)
    return "\n\n".join([doc.page_content for doc in docs])

# ---- WatsonX API Call ---- #

def get_iam_token():
    iam_url = "https://iam.cloud.ibm.com/identity/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = f"apikey={API_KEY}&grant_type=urn:ibm:params:oauth:grant-type:apikey"

    response = requests.post(iam_url, headers=headers, data=data)

    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        raise Exception(f"Failed to get IAM token: {response.text}")

def ask_watsonx_with_context(question):
    token = get_iam_token()

    context = get_similar_chunks(question)

    url = f"{WATSONX_URL}/ml/v1/text/generation?version=2024-03-29"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }

    prompt = f"""You are an AI assistant. Answer the question based only on the following PDF context.

Context:
{context}

Question:
{question}

Answer:"""

    payload = {
        "model_id": "meta-llama/llama-3-3-70b-instruct",
        "input": prompt,
        "parameters": {
            "max_new_tokens": 1024
        },
        "project_id": "4bd5cd97-1d38-4a39-8191-661a0c10e535"
    }

    response = requests.post(url, headers=headers, json=payload)

    if response.status_code == 200:
        return response.json().get("results", [{}])[0].get("generated_text", "No answer returned.")
    else:
        return f"Error: {response.status_code} - {response.text}"
