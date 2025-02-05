const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const { STLLoader } = require("three/examples/jsm/loaders/STLLoader.js");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors()); // Allow frontend requests
app.use(express.json());

app.post("/upload", upload.single("model"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const data = fs.readFileSync(filePath);

    const loader = new STLLoader();
    const geometry = loader.parse(data.buffer);
    const volume = calculateVolume(geometry);

    const filamentUsage = volume * 1.25; // Adjust factor based on density
    const costPerMeter = 0.05; // Example filament cost
    const estimatedCost = filamentUsage * costPerMeter;

    res.json({ filamentUsage, estimatedCost });
  } catch (error) {
    res.status(500).json({ error: "Failed to process 3D model" });
  }
});

function calculateVolume(geometry) {
  let volume = 0;
  geometry.computeVertexNormals();
  geometry.faces.forEach((face) => {
    const v1 = geometry.vertices[face.a];
    const v2 = geometry.vertices[face.b];
    const v3 = geometry.vertices[face.c];
    volume += v1.dot(v2.cross(v3)) / 6.0;
  });
  return Math.abs(volume);
}

app.listen(3000, () => console.log("Server running on port 3000"));
