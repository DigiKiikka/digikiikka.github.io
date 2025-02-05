document.getElementById("fileInput").addEventListener("change", previewModel);

function previewModel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(e.target.result);

        // Create Scene
        const scene = new THREE.Scene();

        // Add Light (Fixes Black Screen)
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 5, 5);
        scene.add(light);
        
        // Add Ambient Light
        const ambientLight = new THREE.AmbientLight(0x404040); 
        scene.add(ambientLight);

        // Create Mesh
        const material = new THREE.MeshStandardMaterial({ color: 0xff5500 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Fix Camera Position
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 100);

        // Create Renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(500, 500);
        document.getElementById("viewer").innerHTML = "";  // Clear previous model
        document.getElementById("viewer").appendChild(renderer.domElement);

        function animate() {
            requestAnimationFrame(animate);
            mesh.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();
    };
    reader.readAsArrayBuffer(file);
}



function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file!");
        return;
    }

    const formData = new FormData();
    formData.append("file", file);  // Ensure the field name is 'file'

    fetch("https://digikiikka-github-io.onrender.com/upload", {
        method: "POST",
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log("Success:", data);
        alert(`Estimated price: ${data.price}`);
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}
