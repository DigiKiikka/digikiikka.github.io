import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import * as THREE from 'three';  
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// **MAXIMUM BUILD VOLUME (mm)**
const MAX_BUILD_X = 220;
const MAX_BUILD_Y = 220;
const MAX_BUILD_Z = 225;

// **Filament Properties**
const FILAMENT_DENSITY = 1.25; // g/cm³ (PLA)
const COST_PER_GRAM = 0.02; // $0.02 per gram

app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        console.error("No file uploaded.");
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log('File uploaded:', req.file);

    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);

    try {
        const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer);

        geometry.computeBoundingBox();
        const size = geometry.boundingBox.getSize(new THREE.Vector3());

        let scaleFactor = 1.0;
        if (size.x > MAX_BUILD_X || size.y > MAX_BUILD_Y || size.z > MAX_BUILD_Z) {
            scaleFactor = Math.min(MAX_BUILD_X / size.x, MAX_BUILD_Y / size.y, MAX_BUILD_Z / size.z);
        }

        const scaledSize = {
            x: size.x * scaleFactor,
            y: size.y * scaleFactor,
            z: size.z * scaleFactor,
        };

        const volumeCm3 = (scaledSize.x * scaledSize.y * scaledSize.z) / 1000;
        const modelWeight = volumeCm3 * FILAMENT_DENSITY;
        const price = modelWeight * COST_PER_GRAM;

        const surfaceAreaCm2 = 2 * (scaledSize.x * scaledSize.y + scaledSize.y * scaledSize.z + scaledSize.x * scaledSize.z) / 100;

        res.json({
            originalSize: { x: size.x, y: size.y, z: size.z },
            scaledSize,
            scaleFactor,
            materialVolume: volumeCm3.toFixed(2),
            boundingBoxVolume: (size.x * size.y * size.z / 1000).toFixed(2),
            surfaceArea: surfaceAreaCm2.toFixed(2),
            modelWeight: modelWeight.toFixed(2),
            price: price.toFixed(2)
        });

    } catch (error) {
        console.error('Error processing the STL file:', error);
        res.status(500).json({ error: "Error processing the STL file" });
    } finally {
        fs.unlinkSync(filePath);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
