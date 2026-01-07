// src/components/ResultPanel.jsx
export default function ResultPanel({ result }) {
  return (
    <div>
      <h2>Result</h2>
      <pre>{JSON.stringify(result, null, 2)}</pre>
    </div>
  );
}
