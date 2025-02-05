document.getElementById("fileInput").addEventListener("change", previewModel);

let modelMesh = null;
let scaleFactor = 1.0;

// Maximum build volume (mm)
const MAX_BUILD_X = 220;
const MAX_BUILD_Y = 220;
const MAX_BUILD_Z = 225;

function previewModel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(e.target.result);

        // Compute bounding box to determine size
        const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
        const size = bbox.getSize(new THREE.Vector3());

        // Auto-scale if larger than max build size
        scaleFactor = Math.min(MAX_BUILD_X / size.x, MAX_BUILD_Y / size.y, MAX_BUILD_Z / size.z, 1);

        // Create Scene
        const scene = new THREE.Scene();

        // Lighting
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040));

        // Create Material & Mesh
        const material = new THREE.MeshStandardMaterial({ color: 0xff5500 });
        modelMesh = new THREE.Mesh(geometry, material);
        modelMesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
        scene.add(modelMesh);

        // Camera Setup
        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.set(0, 0, Math.max(size.x, size.y, size.z) * 2);

        // Renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(500, 500);
        document.getElementById("viewer").innerHTML = "";  
        document.getElementById("viewer").appendChild(renderer.domElement);

        function animate() {
            requestAnimationFrame(animate);
            modelMesh.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    };
    reader.readAsArrayBuffer(file);
}

// Upload file and calculate price
function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    fetch("https://digikiikka-github-io.onrender.com/upload", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);

        // Update UI with model details
        document.getElementById("modelInfo").innerHTML = `
            <h3>${file.name} - ${Math.round(scaleFactor * 100)}% Scale</h3>
            <p><strong>Material Volume:</strong> ${data.materialVolume} cm³</p>
            <p><strong>Bounding Box Volume:</strong> ${data.boundingBoxVolume} cm³</p>
            <p><strong>Surface Area:</strong> ${data.surfaceArea} cm²</p>
            <p><strong>Model Weight:</strong> ${data.modelWeight} g</p>
            <p><strong>Model Dimensions:</strong> ${data.scaledSize.x.toFixed(2)} × ${data.scaledSize.y.toFixed(2)} × ${data.scaledSize.z.toFixed(2)} mm</p>
            <p><strong>Estimated Price:</strong> $${data.price}</p>
        `;

    })
    .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while processing the file.");
    });
}
