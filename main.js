import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

// Set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set up scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(10, 15, -22);

// Set up orbit controls
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

// Create plane mesh and add to scene
const planeMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        visible: false
    })
);
planeMesh.rotateX(-Math.PI / 2);
scene.add(planeMesh);

// Add grid to scene
const grid = new THREE.GridHelper(20, 20);
scene.add(grid);

// Create highlight mesh and add to scene
const highlightMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
        side: THREE.DoubleSide,
        transparent: true
    })
);
highlightMesh.rotateX(-Math.PI / 2);
highlightMesh.position.set(0.5, 0, 0.5);
scene.add(highlightMesh);

// Set up raycaster for mouse interaction
const mousePosition = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
let intersects;

window.addEventListener('mousemove', function(e) {
  // Calculate mouse position in normalized device coordinates
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
  
  // Update the raycaster with the new mouse position and camera
  raycaster.setFromCamera(mousePosition, camera);
  
  // Find intersections between the raycaster and the plane mesh
  intersects = raycaster.intersectObject(planeMesh);
  
  // Check if there is an intersection
  if(intersects.length > 0) {
      // Get the first intersection point
      const intersect = intersects[0];
      
      // Highlight position by rounding down to the nearest integer and adding 0.5
      const highlightPos = new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
      
      // Set the position of the highlight mesh
      highlightMesh.position.set(highlightPos.x, 0, highlightPos.z);

      // Check if an object exists at the highlight position
      const objectExist = objects.find(function(object) {
          return (object.position.x === highlightMesh.position.x)
          && (object.position.z === highlightMesh.position.z)
      });

      // Change highlight mesh color based on whether an object exists at the highlight position
      if(!objectExist)
          highlightMesh.material.color.setHex(0xFFFFFF);
      else
          highlightMesh.material.color.setHex(0xFF0000);
  }
});


// Create sphere mesh for objects
const sphereMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 4, 2),
    new THREE.MeshBasicMaterial({
        wireframe: true,
        color: 0xFFEA00
    })
);

// Array to store objects
const objects = [];

// Handle mouse clicks
window.addEventListener('mousedown', function() {
    const objectExist = objects.find(function(object) {
        return (object.position.x === highlightMesh.position.x)
        && (object.position.z === highlightMesh.position.z)
    });

    if(!objectExist) {
        if(intersects.length > 0) {
            const sphereClone = sphereMesh.clone();
            sphereClone.position.copy(highlightMesh.position);
            scene.add(sphereClone);
            objects.push(sphereClone);
            highlightMesh.material.color.setHex(0xFF0000);
        }
    }
    console.log(scene.children.length);
});

// Animation loop
function animate(time) {
    highlightMesh.material.opacity = 1 + Math.sin(time / 120);
    objects.forEach(function(object) {
        object.rotation.x = time / 1000;
        object.rotation.z = time / 1000;
        object.position.y = 0.5 + 0.5 * Math.abs(Math.sin(time / 1000));
    });
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

// Handle window resize
window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
