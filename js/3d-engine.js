<script type="module" src="js/3d-engine.js" defer></script>

// Full 3D viewer with Three.js + OrbitControls
// Uses #designCanvas as a live texture

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js";

function init3DViewer() {
  const container = document.getElementById("modelViewer");
  const designCanvas = document.getElementById("designCanvas");
  if (!container || !designCanvas) return;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05030a);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    35,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 1.2, 3);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x222233, 0.8);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x8888ff, 0.6);
  rimLight.position.set(-4, 3, -2);
  scene.add(rimLight);

  // Product geometry (placeholder: rounded box)
  const geometry = new THREE.BoxGeometry(1.8, 1.0, 0.2);

  // Texture from design canvas
  const designTexture = new THREE.CanvasTexture(designCanvas);
  designTexture.encoding = THREE.sRGBEncoding;

  const material = new THREE.MeshStandardMaterial({
    map: designTexture,
    metalness: 0.1,
    roughness: 0.6,
  });

  const productMesh = new THREE.Mesh(geometry, material);
  productMesh.castShadow = true;
  productMesh.receiveShadow = true;
  scene.add(productMesh);

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(10, 10);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x111018,
    roughness: 0.9,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.6;
  ground.receiveShadow = true;
  scene.add(ground);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 2;
  controls.maxDistance = 6;
  controls.target.set(0, 0.4, 0);

  // Resize handling
  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    // Keep texture in sync with 2D editor
    designTexture.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

// Expose to editor.js
window.init3DViewer = init3DViewer;
