import cv2
import numpy as np
from sklearn.cluster import KMeans


def read_image(file):
    file.file.seek(0)
    image_bytes = np.frombuffer(file.file.read(), np.uint8)
    image = cv2.imdecode(image_bytes, cv2.IMREAD_COLOR)

    if image is None:
        raise ValueError("Invalid image file")

    return image


def apply_mask(image, mask):
    # Ensure mask is the same size as the image
    if mask.shape[:2] != image.shape[:2]:
        mask = cv2.resize(mask, (image.shape[1], image.shape[0]), interpolation=cv2.INTER_NEAREST)
    
    masked = cv2.bitwise_and(image, image, mask=mask)
    pixels = masked[mask > 0]
    return pixels


def rgb_to_lab(pixels):
    pixels = np.uint8(pixels.reshape(-1, 1, 3))
    lab_pixels = cv2.cvtColor(pixels, cv2.COLOR_BGR2LAB)
    return lab_pixels.reshape(-1, 3)


def get_dominant_color(lab_pixels, k=5):
    if len(lab_pixels) < k:
        k = max(1, len(lab_pixels) // 2)

    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    kmeans.fit(lab_pixels)

    labels, counts = np.unique(kmeans.labels_, return_counts=True)
    dominant_cluster = labels[np.argmax(counts)]

    return kmeans.cluster_centers_[dominant_cluster]


def detect_undertone(lab_color):
    _, a, b = lab_color

    if a >= 20 and b >= 15:
        return "Warm"
    elif a < 20 and b < 15:
        return "Cool"
    else:
        return "Neutral"


def lab_to_rgb_hex(lab_color):
    lab = np.uint8([[lab_color]])
    rgb = cv2.cvtColor(lab, cv2.COLOR_LAB2RGB)[0][0]
    return '#%02x%02x%02x' % tuple(rgb)


def recommend_palette(undertone):
    palettes = {
        "Warm": ["Olive", "Mustard", "Coral", "Brown", "Terracotta", "Peach", "Gold"],
        "Cool": ["Navy Blue", "Emerald", "Lavender", "Grey", "Turquoise", "Silver", "Plum"],
        "Neutral": ["Black", "White", "Teal", "Soft Pink", "Beige", "Charcoal", "Mint"]
    }
    return palettes.get(undertone, [])


def name_to_hex(name):
    color_map = {
        "Olive": "#808000",
        "Mustard": "#FFDB58",
        "Coral": "#FF7F50",
        "Brown": "#A52A2A",
        "Terracotta": "#E2725B",
        "Peach": "#FFE5B4",
        "Gold": "#FFD700",
        "Navy Blue": "#000080",
        "Emerald": "#50C878",
        "Lavender": "#E6E6FA",
        "Grey": "#808080",
        "Turquoise": "#40E0D0",
        "Silver": "#C0C0C0",
        "Plum": "#8E4585",
        "Black": "#000000",
        "White": "#FFFFFF",
        "Teal": "#008080",
        "Soft Pink": "#FFB6C1",
        "Beige": "#F5F5DC",
        "Charcoal": "#36454F",
        "Mint": "#98FF98"
    }
    return color_map.get(name, "#000000")


def hex_to_lab(hex_color):
    """Convert hex color to LAB color space."""
    # Remove '#' if present
    hex_color = hex_color.lstrip('#')
    
    # Convert hex to RGB
    r = int(hex_color[0:2], 16)
    g = int(hex_color[2:4], 16)
    b = int(hex_color[4:6], 16)
    
    # Convert RGB to LAB using OpenCV (BGR order)
    rgb_array = np.uint8([[[b, g, r]]])  # Note: BGR for OpenCV
    lab_array = cv2.cvtColor(rgb_array, cv2.COLOR_BGR2LAB)
    
    return lab_array[0][0]


def calculate_color_similarity(lab_color1, lab_color2):
    """
    Calculate color similarity using Delta E (CIE76) formula.
    Returns a percentage (0-100) where higher means more similar.
    """
    # Delta E formula: sqrt((L1-L2)^2 + (a1-a2)^2 + (b1-b2)^2)
    delta_e = np.sqrt(
        (lab_color1[0] - lab_color2[0]) ** 2 +
        (lab_color1[1] - lab_color2[1]) ** 2 +
        (lab_color1[2] - lab_color2[2]) ** 2
    )
    
    # Convert Delta E to percentage
    # Delta E of 0 = 100% match, Delta E > 100 = 0% match
    # We use a slightly adjusted formula for better distribution
    match_percentage = max(0, 100 - (delta_e * 0.7))  # Scale factor for better range
    
    return round(match_percentage, 1)


def process_selected_pixels(image_file, mask_file, region_type):
    image = read_image(image_file)
    mask = read_image(mask_file)

    mask = cv2.cvtColor(mask, cv2.COLOR_BGR2GRAY)

    selected_pixels = apply_mask(image, mask)
    if len(selected_pixels) == 0:
        return {"error": "No pixels selected!"}

    lab_pixels = rgb_to_lab(selected_pixels)
    dominant_color = get_dominant_color(lab_pixels, k=5)

    undertone = detect_undertone(dominant_color)
    palette_names = recommend_palette(undertone)
    palette_hex = [name_to_hex(c) for c in palette_names]

    representative_color = lab_to_rgb_hex(dominant_color)

    # Calculate match percentages for each recommended color
    recommended_colors_with_match = []
    for name, hex_color in zip(palette_names, palette_hex):
        color_lab = hex_to_lab(hex_color)
        match_percentage = calculate_color_similarity(dominant_color, color_lab)
        recommended_colors_with_match.append({
            "name": name,
            "hex": hex_color,
            "match_percentage": match_percentage
        })
    
    # Sort by match percentage (descending - best matches first)
    recommended_colors_with_match.sort(key=lambda x: x["match_percentage"], reverse=True)

    return {
        "region": region_type,
        "dominant_lab_color": dominant_color.tolist(),
        "representative_color": representative_color,
        "undertone": undertone,
        "recommended_colors": recommended_colors_with_match,
        "explanation": f"{undertone} undertones are enhanced by these colors."
    }


def combine_region_analyses(hair_analysis=None, skin_analysis=None, hand_analysis=None):
    """
    Combine analyses from multiple regions into a single unified clothing recommendation.
    Weights: Skin (50%), Hair (30%), Hand (20%)
    """
    # Collect valid analyses
    regions_data = []
    weights = []
    
    if skin_analysis and "error" not in skin_analysis:
        regions_data.append(skin_analysis)
        weights.append(0.5)  # Skin is most important
    
    if hair_analysis and "error" not in hair_analysis:
        regions_data.append(hair_analysis)
        weights.append(0.3)
    
    if hand_analysis and "error" not in hand_analysis:
        regions_data.append(hand_analysis)
        weights.append(0.2)
    
    if not regions_data:
        return {"error": "No valid analysis data"}
    
    # Normalize weights if some regions are missing
    total_weight = sum(weights)
    weights = [w / total_weight for w in weights]
    
    # Determine overall undertone (majority vote, fallback to skin)
    undertones = [r["undertone"] for r in regions_data]
    overall_undertone = max(set(undertones), key=undertones.count)
    
    # Get all recommended colors from the primary undertone palette
    palette_names = recommend_palette(overall_undertone)
    palette_hex = [name_to_hex(c) for c in palette_names]
    
    # Calculate weighted match percentages for each color
    combined_colors = []
    for name, hex_color in zip(palette_names, palette_hex):
        color_lab = hex_to_lab(hex_color)
        
        # Calculate weighted average match percentage across all regions
        weighted_match = 0
        for region_data, weight in zip(regions_data, weights):
            # Find match for this color in the region's analysis
            region_dominant_lab = np.array(region_data["dominant_lab_color"])
            match = calculate_color_similarity(region_dominant_lab, color_lab)
            weighted_match += match * weight
        
        combined_colors.append({
            "name": name,
            "hex": hex_color,
            "match_percentage": round(weighted_match, 1)
        })
    
    # Sort by combined match percentage
    combined_colors.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    # Calculate average representative color (weighted)
    avg_lab = np.zeros(3)
    for region_data, weight in zip(regions_data, weights):
        avg_lab += np.array(region_data["dominant_lab_color"]) * weight
    
    representative_color = lab_to_rgb_hex(avg_lab)
    
    # Determine which regions were analyzed
    regions_analyzed = []
    if hair_analysis and "error" not in hair_analysis:
        regions_analyzed.append("hair")
    if skin_analysis and "error" not in skin_analysis:
        regions_analyzed.append("skin")
    if hand_analysis and "error" not in hand_analysis:
        regions_analyzed.append("hand")
    
    return {
        "overall_undertone": overall_undertone,
        "representative_color": representative_color,
        "regions_analyzed": regions_analyzed,
        "recommended_clothing_colors": combined_colors,
        "explanation": f"These colors complement your overall {overall_undertone.lower()} tones."
    }

