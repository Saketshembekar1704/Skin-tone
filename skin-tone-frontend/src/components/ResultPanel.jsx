export default function ResultPanel({ result }) {
  if (!result) return null;

  const { combined_analysis } = result;

  if (!combined_analysis || combined_analysis.error) {
    return (
      <div style={{ marginTop: 30, textAlign: "center" }}>
        <p>No analysis results available</p>
      </div>
    );
  }

  const {
    overall_undertone,
    representative_color,
    regions_analyzed,
    recommended_clothing_colors,
    explanation
  } = combined_analysis;

  return (
    <div style={{ marginTop: 30, textAlign: "center" }}>
      <h2>Recommended Clothing Colors</h2>
      <p style={{ color: "#666", fontSize: 14, marginTop: 5 }}>
        Based on {regions_analyzed.map((r, i) => (
          <span key={r}>
            {r.charAt(0).toUpperCase() + r.slice(1)}
            {i < regions_analyzed.length - 1 ? (i === regions_analyzed.length - 2 ? " and " : ", ") : ""}
          </span>
        ))} analysis
      </p>
      <p style={{ color: "#444", fontSize: 16, fontWeight: "600", marginTop: 10 }}>
        Overall Undertone: {overall_undertone}
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: 30,
          gap: 15,
          maxWidth: 800,
          margin: "30px auto 0",
        }}
      >
        {/* Representative color */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 8,
              backgroundColor: representative_color,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: "600",
              color: "#fff",
              textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
            }}
          >
            Main
          </div>
          <div style={{ fontSize: 11, marginTop: 5, color: "#666", fontWeight: "500" }}>
            Your Tone
          </div>
        </div>

        {/* Recommended clothing colors with match percentage */}
        {recommended_clothing_colors?.map((color, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              title={`${color.name} - ${color.match_percentage}% match`}
              style={{
                width: 80,
                height: 80,
                borderRadius: 8,
                backgroundColor: color.hex,
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                paddingBottom: 5,
              }}
            >
              {/* Match percentage badge */}
              <div
                style={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  backgroundColor: "#4CAF50",
                  color: "white",
                  borderRadius: "50%",
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: "bold",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                {Math.round(color.match_percentage)}%
              </div>
            </div>
            <div style={{ fontSize: 12, marginTop: 5, fontWeight: "500" }}>
              {color.name}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: "#666", fontSize: 13, marginTop: 30, fontStyle: "italic" }}>
        {explanation}
      </p>
    </div>
  );
}
