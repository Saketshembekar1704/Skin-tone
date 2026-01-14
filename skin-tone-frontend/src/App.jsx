import { useState } from "react";
import ImageUploader from "./components/ImageUploader";
import CanvasSelector from "./components/CanvasSelector";
import ResultPanel from "./components/ResultPanel";

export default function App() {
  const [imageData, setImageData] = useState(null);
  const [result, setResult] = useState(null);

  return (
    <div className="app-container">
      {/* Hero Section */}
      <div className="hero-section animate-fadeInUp">
        <h1>Virtual Try-On Studio</h1>
        <p className="hero-subtitle">
          Discover your perfect colors with AI-powered skin tone analysis
        </p>
      </div>

      {/* Main Content Card */}
      <div className="main-card glass-card animate-fadeInUp">
        <ImageUploader onImageLoad={setImageData} />

        {imageData && (
          <div className="canvas-section animate-scaleIn">
            <CanvasSelector imageData={imageData} onResult={setResult} />
          </div>
        )}

        {result && (
          <div className="results-section">
            <ResultPanel result={result} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="footer animate-fadeIn">
        <p>Powered by Advanced ML Skin Tone Detection</p>
      </div>
    </div>
  );
}
