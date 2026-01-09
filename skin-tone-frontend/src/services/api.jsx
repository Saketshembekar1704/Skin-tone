function canvasToFile(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert canvas to blob"));
        return;
      }
      resolve(new File([blob], filename, { type: "image/png" }));
    });
  });
}

export async function sendToBackend(imageFile, masks, regionType) {
  const formData = new FormData();
  
  // Add the original image
  formData.append("image", imageFile);
  
  // Convert each mask canvas to a file and append it
  if (masks.hair) {
    const hairMaskFile = await canvasToFile(masks.hair, "hair_mask.png");
    formData.append("hair_mask", hairMaskFile);
  }
  
  if (masks.skin) {
    const skinMaskFile = await canvasToFile(masks.skin, "skin_mask.png");
    formData.append("skin_mask", skinMaskFile);
  }
  
  if (masks.hand) {
    const handMaskFile = await canvasToFile(masks.hand, "hand_mask.png");
    formData.append("hand_mask", handMaskFile);
  }
  
  formData.append("region_type", regionType);

  const response = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Backend error ${response.status}: ${errorText}`);
  }

  return await response.json();
}


