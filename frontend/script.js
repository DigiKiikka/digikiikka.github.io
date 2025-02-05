document.getElementById("fileInput").addEventListener("change", previewModel);

function previewModel(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(e.target.result);

        const scene = new THREE.Scene();
        const material = new THREE.MeshStandardMaterial({ color: 0xff5500 });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(400, 400);
        document.getElementById("viewer").innerHTML = "";
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

async function uploadFile() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Please upload a file");

    const formData = new FormData();
    formData.append("model", file);

    const response = await fetch("https://digikiikka-github-io.onrender.com/upload", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    document.getElementById("priceResult").textContent =
        `Estimated Price: $${data.estimatedCost.toFixed(2)}`;
}
