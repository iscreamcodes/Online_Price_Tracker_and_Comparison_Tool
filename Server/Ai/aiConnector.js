import { spawn } from "child_process";

export function matchProductsAI(product, candidates) {
  return new Promise((resolve, reject) => {
    const py = spawn("python", [
      "D:/Desktop/Project_Implementation/Online_Price_Tracker_and_Comparison_Tool/Server/Ai/ai_matcher.py",
      JSON.stringify(product),
      JSON.stringify(candidates),
    ]);

    let output = "";
    py.stdout.on("data", (data) => (output += data.toString()));
    py.stderr.on("data", (err) => console.error("AI Error:", err.toString()));
    py.on("close", () => {
      try {
        resolve(JSON.parse(output));
      } catch {
        resolve([]);
      }
    });
  });
}
