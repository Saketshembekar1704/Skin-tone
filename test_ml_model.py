
import sys
import os
import cv2
import numpy as np

# Add backend directory to path
sys.path.append(r"c:\Users\Namrata Sancheti\OneDrive\Desktop\Skin_dection_ML_Project\Skin-tone\skin-tone-backend\fast-api")

try:
    import ml_model
    print("✅ ml_model imported successfully")
except Exception as e:
    print(f"❌ Failed to import ml_model: {e}")
    sys.exit(1)

# Test helper functions
try:
    # Test 1: Detect Depth
    l_val = 210
    depth = ml_model.detect_skin_depth(l_val)
    print(f"L={l_val} -> Depth: {depth}")
    assert depth == "Very Fair"

    # Test 2: Detect Undertone (Warm)
    # Warm: b > a + 3
    # Neutral is 128, 128
    # a=128 (neutral), b=140 (+12 yellow) -> Diff = 12 > 3 -> Warm
    lab_warm = np.array([180, 128, 140], dtype=np.uint8)
    ut_warm = ml_model.detect_undertone(lab_warm)
    print(f"LAB={lab_warm} -> Undertone: {ut_warm}")
    assert ut_warm == "Warm"

    # Test 3: Get Palette
    palette = ml_model.get_palette_rules("Fair", "Warm")
    print(f"Fair + Warm Palette items: {len(palette)}")
    assert len(palette) > 0
    print(f"Sample color: {palette[0]}")

    # Test 4: Hex to Lab
    hex_code = "#FF0000" # Red
    lab = ml_model.hex_to_lab(hex_code)
    print(f"Hex {hex_code} -> LAB {lab}")
    
    print("\n✅ All logic tests passed!")

except Exception as e:
    print(f"\n❌ Logic test failed: {e}")
    import traceback
    traceback.print_exc()
