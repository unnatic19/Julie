import os, json, base64
from io import BytesIO
from fastapi import FastAPI, UploadFile, Form, HTTPException
from PIL import Image
from openai import OpenAI

# Initialize OpenAI client
openai_api_key = os.getenv("OPENAI_API_KEY")
if not openai_api_key:
    raise ValueError("OPENAI_API_KEY environment variable is required")

client = OpenAI(api_key=openai_api_key)


app = FastAPI(title="Colour Analysis Service")

def to_b64(file: UploadFile) -> str:
    img = Image.open(file.file)
    buf = BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode()

@app.post("/analyze")
async def analyze(
    profile: str = Form(...),          # JSON string
    photo: UploadFile = Form(...)
):
    try:
        prof_dict = json.loads(profile)
    except json.JSONDecodeError:
        raise HTTPException(400, "profile must be valid JSON")

    try:
        b64 = to_b64(photo)
    except Exception:
        raise HTTPException(400, "Invalid image")

    sys_msg = (
        "You are a professional colour analyst. "
        'Return JSON: {"season":"...", "undertone":"...", "palette":["#RRGGBB", ...]}'
    )
    user_msg = f"Client profile:\n{json.dumps(prof_dict)}"

    rsp = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": sys_msg},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_msg},
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64}"}
                    },
                ],
            },
        ],
        max_tokens=700,  # per new guidance
        temperature=0.2,
        response_format={"type": "json_object"},   # << enforce pure JSON
    )

    raw = rsp.choices[0].message.content

    # ── handle empty or invalid JSON ─────────────────────────────
    if not raw:
        raise HTTPException(502, "GPT‑4o returned empty content")

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # log raw for debugging
        print("Colour‑service JSON parse error. Raw response:\n", raw)

        # try once more with a shorter prompt
        retry_rsp = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": sys_msg},
                {"role": "user",   "content": "Return ONLY valid JSON."},
                {"role": "assistant", "content": raw or "<empty>"}
            ],
            max_tokens=150,
            temperature=0.2,
            response_format={"type": "json_object"},
        )
        retry_raw = retry_rsp.choices[0].message.content
        try:
            return json.loads(retry_raw)
        except json.JSONDecodeError:
            raise HTTPException(500, "Colour analysis failed: invalid JSON from model")