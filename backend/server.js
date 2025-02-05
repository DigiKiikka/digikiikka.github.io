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

app.post('/upload', upload.single('file'), (req, res) => {
    // Check if file is uploaded correctly
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    console.log('File uploaded:', req.file);  // Log uploaded file details

    const filePath = req.file.path;
    
    // Read the uploaded file as a buffer
    const fileBuffer = fs.readFileSync(filePath);

    try {
        // Load STL file using the STLLoader
        const loader = new STLLoader();
        const geometry = loader.parse(fileBuffer);

        // Compute bounding box for cost estimation
        geometry.computeBoundingBox();
        const size = geometry.boundingBox.getSize(new THREE.Vector3());

        // Calculate estimated filament usage (simplified using bounding box dimensions)
        const volume = size.x * size.y * size.z;  // Approximation of volume in cubic mm
        const price = volume * 0.05; // Price per cubic mm (you can adjust this formula)

        // Send the calculated price as the response
        res.json({ price: price.toFixed(2) });
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
