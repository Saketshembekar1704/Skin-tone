import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import CanvasSelector from "./components/CanvasSelector";
import ResultPanel from "./components/ResultPanel";

export default function App() {
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);


  return (
    <div style={{ padding: 40 }}>
      <h1>Skin Tone Detection</h1>

      <ImageUploader onImageLoad={setImageData} />

      {imageData && (
        <CanvasSelector imageData={imageData} onResult={setResult} />
      )}

      {result && <ResultPanel result={result} />}
    </div>
  );
}
