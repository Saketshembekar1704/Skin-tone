// src/services/api.js
export async function sendToBackend(image, mask) {
  const blob = await fetch(image.src).then((r) => r.blob());

  const formData = new FormData();
  formData.append("image", blob);
  formData.append("mask", JSON.stringify(mask));

  const res = await fetch("http://localhost:8000/analyze", {
    method: "POST",
    body: formData,
  });

  return res.json();
}


// src/services/api.js
/*export async function sendToBackend(image, mask) {
  console.log("MOCK backend called");
  console.log("Mask points:", mask.length);

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        skin_type: "Light / Honey",
        undertone: "Warm",
        top_colors: [
          { color: "Olive Green", percent: 32 },
          { color: "Mustard Yellow", percent: 24 },
          { color: "Cream", percent: 18 }
        ],
        explanation:
          "Warm undertones pair well with earthy and warm colors, providing natural contrast."
      });
    }, 800);
  });
} */
