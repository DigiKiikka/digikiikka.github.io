import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import * as THREE from 'three';  // Import THREE for vector3 and other operations
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.single('file'), (req, res) => {
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    // Load STL file
    const loader = new STLLoader();
    const geometry = loader.parse(fileBuffer);

    // Compute bounding box (used for cost estimation)
    geometry.computeBoundingBox();
    const size = geometry.boundingBox.getSize(new THREE.Vector3());

    // Calculate estimated filament usage (simplified)
    const volume = size.x * size.y * size.z;  // Approximation
    const price = volume * 0.05; // Price per cubic mm

    res.json({ price: price.toFixed(2) });

    // Delete uploaded file
    fs.unlinkSync(filePath);
});

// Fixing the duplicate app.listen()
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
