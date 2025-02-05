import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import * as THREE from 'three';  // Import THREE.js for 3D operations
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

// Create express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });

// Filament Pricing Constants
const FILAMENT_DENSITY = 1.25; // g/cm³ for PLA
const COST_PER_GRAM = 0.02; // $0.02 per gram

// File upload and processing endpoint
app.post('/upload', upload.single('file'), (req, res) => {
    // Check if file is uploaded correctly
    if (!req.file) {
        console.error("No file uploaded.");
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log('File uploaded:', req.file);  // Log uploaded file details

    const filePath = req.file.path;
    
    // Read the uploaded file as a buffer
    const fileBuffer = fs.readFileSync(filePath);

    try {
        // Convert the buffer to an ArrayBuffer
        const arrayBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);

        // Load STL file using the STLLoader
        const loader = new STLLoader();
        const geometry = loader.parse(arrayBuffer);

        // Compute bounding box for cost estimation
        geometry.computeBoundingBox();
        const size = geometry.boundingBox.getSize(new THREE.Vector3());

        // Convert mm³ to cm³
        const volumeCm3 = (size.x * size.y * size.z) / 1000;

        // Estimate weight in grams
        const weightGrams = volumeCm3 * FILAMENT_DENSITY;

        // Calculate cost
        const priceInDollars = weightGrams * COST_PER_GRAM;

        // Send response with the calculated price
        res.json({ price: priceInDollars.toFixed(2) });
    } catch (error) {
        console.error('Error processing the STL file:', error);
        res.status(500).json({ error: "Error processing the STL file" });
    } finally {
        // Delete the uploaded file after processing to avoid storage issues
        fs.unlinkSync(filePath);
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
