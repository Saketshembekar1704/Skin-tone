export default function ResultPanel({ result }) {
  if (!result) return null;

  const { combined_analysis } = result;

  if (!combined_analysis || combined_analysis.error) {
    return (
      <div className="result-error">
        <p>No analysis results available. {combined_analysis?.error || "Please try again."}</p>
      </div>
    );
  }

  const {
    overall_undertone,
    raw_depth,
    raw_undertone,
    representative_color,
    regions_analyzed,
    recommended_clothing_colors,
    explanation
  } = combined_analysis;

  // Fallback for older backend response or single string
  const displayDepth = raw_depth || overall_undertone?.split(" ")[0] || "Unknown";
  const displayUndertone = raw_undertone || overall_undertone?.split(" ")[1] || overall_undertone || "Unknown";

  return (
    <div className="result-panel">
      {/* Header */}
      <div className="result-header animate-fadeInUp">
        <h2>✨ Your Personalized Palette</h2>
        <p className="result-subtitle">
          Based on {regions_analyzed.map((r, i) => (
            <span key={r}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
              {i < regions_analyzed.length - 1 ? (i === regions_analyzed.length - 2 ? " and " : ", ") : ""}
            </span>
          ))} analysis
        </p>
      </div>

      {/* Analysis Badges - Depth & Undertone */}
      <div className="analysis-badges animate-scaleIn">
        {/* Skin Depth */}
        <div className="analysis-card">
          <div className="badge-icon">🌞</div>
          <div className="badge-content">
            <div className="badge-label">Skin Depth</div>
            <div className="badge-value">{displayDepth}</div>
          </div>
        </div>

        {/* Undertone */}
        <div className="analysis-card">
          <div className="badge-icon">🎨</div>
          <div className="badge-content">
            <div className="badge-label">Undertone</div>
            <div className="badge-value">{displayUndertone}</div>
          </div>
        </div>
      </div>

      {/* Color Grid */}
      <div className="color-grid">
        {/* Representative Color */}
        <div className="color-card representative animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
          <div
            className="color-swatch large"
            style={{ backgroundColor: representative_color }}
          >
            <div className="color-label">Your Tone</div>
          </div>
          <div className="color-info">
            <div className="color-name">Representative</div>
            <div className="color-hex">{representative_color}</div>
          </div>
        </div>

        {/* Recommended Colors */}
        {recommended_clothing_colors?.map((color, index) => (
          <div
            key={index}
            className="color-card animate-fadeInUp"
            style={{ animationDelay: `${0.2 + index * 0.1}s` }}
          >
            <div
              className="color-swatch"
              style={{ backgroundColor: color.hex }}
            >
              <div className="match-badge">
                {Math.round(color.match_percentage)}%
              </div>
            </div>
            <div className="color-info">
              <div className="color-name">{color.name}</div>
              <div className="color-hex">{color.hex}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation */}
      <div className="result-explanation animate-fadeIn">
        <div className="explanation-icon">💡</div>
        <p>{explanation}</p>
      </div>
    </div>
  );
}
