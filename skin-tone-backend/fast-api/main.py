from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from ml_model import process_selected_pixels, combine_region_analyses

app = FastAPI(title="Skin Tone Backend")

# ✅ CORS (React @ localhost:5173 or 5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Health check (prevents 404 confusion)
@app.get("/")
def root():
    return {"status": "Skin tone backend is running"}

# ✅ Analyze endpoint
@app.post("/analyze")
async def analyze_image(
    image: UploadFile = File(...),
    hair_mask: UploadFile = File(None),
    skin_mask: UploadFile = File(None),
    hand_mask: UploadFile = File(None),
    region_type: str = Form(...)
):
    # Process each region individually
    hair_analysis = None
    skin_analysis = None
    hand_analysis = None
    
    if hair_mask:
        try:
            hair_analysis = process_selected_pixels(image, hair_mask, "hair")
        except Exception as e:
            hair_analysis = {"error": str(e)}
    
    if skin_mask:
        try:
            skin_analysis = process_selected_pixels(image, skin_mask, "skin")
        except Exception as e:
            skin_analysis = {"error": str(e)}
    
    if hand_mask:
        try:
            hand_analysis = process_selected_pixels(image, hand_mask, "hand")
        except Exception as e:
            hand_analysis = {"error": str(e)}
    
    # Combine all analyses into a single unified palette
    combined_analysis = combine_region_analyses(
        hair_analysis=hair_analysis,
        skin_analysis=skin_analysis,
        hand_analysis=hand_analysis
    )
    
    return {
        "status": "success",
        "combined_analysis": combined_analysis
    }
