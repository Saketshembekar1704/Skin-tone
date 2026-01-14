import cv2
import numpy as np
from sklearn.cluster import KMeans


# =========================
# IMAGE HANDLING
# =========================

def read_image(file):
    file.file.seek(0)
    image_bytes = np.frombuffer(file.file.read(), np.uint8)
    image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Invalid image file")

    return image


def apply_mask(image, mask):
    if mask.shape[:2] != image.shape[:2]:
        mask = cv2.resize(mask, (image.shape[1], image.shape[0]), interpolation=cv2.INTER_NEAREST)

    masked = cv2.bitwise_and(image, image, mask=mask)
    pixels = masked[mask > 0]
    return pixels


# =========================
# COLOR SPACE CONVERSIONS
# =========================

def rgb_to_lab(pixels):
    pixels = np.uint8(pixels.reshape(-1, 1, 3))
    lab_pixels = cv2.cvtColor(pixels, cv2.COLOR_BGR2LAB)
    return lab_pixels.reshape(-1, 3)


def lab_to_rgb_hex(lab_color):
    lab = np.uint8([[lab_color]])
    bgr = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)[0][0]
    return "#{:02X}{:02X}{:02X}".format(int(bgr[2]), int(bgr[1]), int(bgr[0]))


def hex_to_lab(hex_color):
    hex_color = hex_color.lstrip("#")
    bgr = np.array([[
        [
            int(hex_color[4:6], 16),
            int(hex_color[2:4], 16),
            int(hex_color[0:2], 16)
        ]
    ]], dtype=np.uint8)

    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)
    return lab[0][0]


def calculate_color_similarity(lab1, lab2):
    distance = np.linalg.norm(lab1 - lab2)
    max_distance = 120
    similarity = max(0, 100 - (distance / max_distance) * 100)
    return round(similarity, 1)


# =========================
# DOMINANT COLOR
# =========================

def get_dominant_color(lab_pixels, k=5):
    if len(lab_pixels) < k:
        k = max(1, len(lab_pixels) // 2)

    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(lab_pixels)

    labels, counts = np.unique(kmeans.labels_, return_counts=True)
    dominant_cluster = labels[np.argmax(counts)]

    return kmeans.cluster_centers_[dominant_cluster]


# =========================
# SKIN ANALYSIS
# =========================

def detect_skin_depth(l_value):
    if l_value > 200:
        return "Very Fair"
    elif l_value > 170:
        return "Fair"
    elif l_value > 140:
        return "Wheatish"
    elif l_value > 100:
        return "Dusky"
    else:
        return "Deep"


def detect_undertone(lab_color):
    l, a, b = lab_color
    a_val = a - 128
    b_val = b - 128

    if a_val < 2 and b_val > 5:
        return "Olive"
    if b_val > a_val + 3:
        return "Warm"
    if a_val > b_val + 2:
        return "Cool"
    return "Neutral"


# =========================
# PALETTE RULE ENGINE
# =========================

def get_palette_rules(depth, undertone):
    catalog = {
        "Pure White": "#FFFFFF", "Cream": "#FFFDD0", "Beige": "#F5F5DC",
        "Camel": "#C19A6B", "Tan": "#D2B48C",
        "Grey": "#808080", "Charcoal": "#36454F", "Black": "#000000",

        "Navy": "#000080", "Royal Blue": "#4169E1", "Sky Blue": "#87CEEB",
        "Teal": "#008080", "Cyan": "#00FFFF", "Indigo": "#4B0082",

        "Emerald": "#50C878", "Olive": "#808000", "Bottle Green": "#006A4E",
        "Mint": "#98FF98",

        "Wine": "#722F37", "Burgundy": "#800020", "Maroon": "#800000",
        "Crimson": "#DC143C", "Baby Pink": "#F4C2C2", "Rose Pink": "#FF66CC",
        "Fuchsia": "#FF00FF", "Lavender": "#E6E6FA", "Deep Purple": "#36013F",

        "Mustard": "#FFDB58", "Golden Yellow": "#FFDF00", "Pastel Yellow": "#FDFD96",
        "Rust": "#B7410E", "Burnt Orange": "#CC5500", "Peach": "#FFE5B4",

        "Chocolate Brown": "#7B3F00", "Coffee Brown": "#4B3621",
        "Bronze": "#CD7F32", "Gold": "#FFD700", "Silver": "#C0C0C0", "Rose Gold": "#B76E79"
    }

    recommendations = ["Pure White", "Charcoal", "Black", "Navy", "Royal Blue", "Emerald", "Wine", "Burgundy"]

    if undertone in ["Warm", "Olive"]:
        recommendations += ["Cream", "Camel", "Tan", "Olive", "Mustard", "Gold"]

    if undertone in ["Cool", "Neutral"]:
        recommendations += ["Grey", "Sky Blue", "Lavender", "Silver"]

    if depth in ["Wheatish", "Dusky"]:
        recommendations += ["Teal", "Indigo", "Rose Pink"]

    if depth in ["Dusky", "Deep"]:
        recommendations += ["Bottle Green", "Crimson", "Deep Purple", "Burnt Orange", "Bronze"]

    if depth == "Fair":
        recommendations += ["Baby Pink", "Mint", "Peach", "Pastel Yellow"]

    seen = set()
    results = []
    for name in recommendations:
        if name in catalog and name not in seen:
            seen.add(name)
            results.append({"name": name, "hex": catalog[name]})

    return results


# =========================
# REGION PROCESSING
# =========================

def process_selected_pixels(image_file, mask_file, region_type):
    image = read_image(image_file)
    mask = read_image(mask_file)
    mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)

    selected_pixels = apply_mask(image, mask)
    if len(selected_pixels) == 0:
        return {"error": "No pixels selected!"}

    lab_pixels = rgb_to_lab(selected_pixels)

# 🔒 SAFETY: limit pixels for KMeans
MAX_PIXELS = 5000
if len(lab_pixels) > MAX_PIXELS:
    idx = np.random.choice(len(lab_pixels), MAX_PIXELS, replace=False)
    lab_pixels = lab_pixels[idx]

dominant_color = get_dominant_color(lab_pixels, k=5)

    depth = detect_skin_depth(dominant_color[0])
    undertone = detect_undertone(dominant_color)

    palette = get_palette_rules(depth, undertone)

    enriched_palette = []
    for item in palette:
        color_lab = hex_to_lab(item["hex"])
        match = calculate_color_similarity(dominant_color, color_lab)
        enriched_palette.append({
            "name": item["name"],
            "hex": item["hex"],
            "match_percentage": match
        })

    enriched_palette.sort(key=lambda x: x["match_percentage"], reverse=True)

    return {
        "region": region_type,
        "raw_depth": depth,
        "raw_undertone": undertone,
        "representative_color": lab_to_rgb_hex(dominant_color),
        "recommended_colors": enriched_palette,
        "explanation": f"Based on {depth} skin depth and {undertone} undertone."
    }
