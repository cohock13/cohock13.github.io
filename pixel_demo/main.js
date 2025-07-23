// Import Three.js core and necessary addons
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPixelatedPass } from 'three/addons/postprocessing/RenderPixelatedPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GUI } from 'lil-gui';

// Global variables
let scene, camera, renderer, composer;
let controls;
let meshes = [];
let gui;
let renderPass, renderPixelatedPass, outputPass;

// Parameters for pixelated effect
const params = {
    pixelSize: 6,
    normalEdgeStrength: 0.3,
    depthEdgeStrength: 0.4,
    pixelAlignedPanning: true
};

// Initialize the demo
init();
animate();

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151729);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Setup lighting
    setupLighting();

    // Create scene objects
    createSceneObjects();

    // Setup postprocessing
    setupPostprocessing();

    // Setup controls
    setupControls();

    // Setup GUI
    setupGUI();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Point light for additional illumination
    const pointLight = new THREE.PointLight(0x4080ff, 1, 100);
    pointLight.position.set(-10, 10, 10);
    scene.add(pointLight);

    // Create environment map for realistic reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    
    // Create a simple environment texture
    const envMapTexture = new THREE.CubeTextureLoader().load([
        // Simple gradient cube map for reflections
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    ]);
    
    scene.environment = pmremGenerator.fromCubemap(envMapTexture).texture;
    pmremGenerator.dispose();
}

function createSceneObjects() {
    // Create textured plane (ground)
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x808080,
        transparent: true,
        opacity: 0.8
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -3;
    plane.receiveShadow = true;
    scene.add(plane);
    meshes.push(plane);

    // Create rotating icosahedron
    const icosahedronGeometry = new THREE.IcosahedronGeometry(1.5, 0);
    const icosahedronMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x4080ff,
        shininess: 100
    });
    const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
    icosahedron.position.set(0, 0, 0);
    icosahedron.castShadow = true;
    scene.add(icosahedron);
    meshes.push(icosahedron);

    // Create textured box
    const boxGeometry = new THREE.BoxGeometry(2, 2, 2);
    
    // Create a simple procedural texture
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    // Create checkerboard pattern
    const tileSize = 8;
    for (let x = 0; x < canvas.width; x += tileSize) {
        for (let y = 0; y < canvas.height; y += tileSize) {
            const isEven = (Math.floor(x / tileSize) + Math.floor(y / tileSize)) % 2 === 0;
            ctx.fillStyle = isEven ? '#ff4080' : '#80ff40';
            ctx.fillRect(x, y, tileSize, tileSize);
        }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    
    const boxMaterial = new THREE.MeshPhongMaterial({ 
        map: texture,
        shininess: 50
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(4, 1, 0);
    box.castShadow = true;
    scene.add(box);
    meshes.push(box);

    // Create torus knot
    const torusKnotGeometry = new THREE.TorusKnotGeometry(1, 0.3, 100, 16);
    const torusKnotMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xff8040,
        shininess: 100
    });
    const torusKnot = new THREE.Mesh(torusKnotGeometry, torusKnotMaterial);
    torusKnot.position.set(-4, 1, 0);
    torusKnot.castShadow = true;
    scene.add(torusKnot);
    meshes.push(torusKnot);

    // Create spheres with different materials
    for (let i = 0; i < 5; i++) {
        const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        let sphereMaterial;
        
        if (i === 0) {
            // Create realistic thick glass material
            sphereMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                metalness: 0.0,
                roughness: 0.0,
                transmission: 0.9,
                thickness: 0.5,
                ior: 1.5,
                reflectivity: 0.8,
                clearcoat: 1.0,
                clearcoatRoughness: 0.0,
                transparent: true,
                opacity: 0.8
            });
        } else {
            sphereMaterial = new THREE.MeshPhongMaterial({ 
                color: new THREE.Color().setHSL(i / 5, 0.8, 0.6),
                shininess: 100
            });
        }
        
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(
            Math.sin(i * Math.PI * 2 / 5) * 6,
            Math.cos(i * 0.5) * 2,
            Math.cos(i * Math.PI * 2 / 5) * 6
        );
        sphere.castShadow = true;
        scene.add(sphere);
        meshes.push(sphere);
    }
}

function setupPostprocessing() {
    // Create effect composer
    composer = new EffectComposer(renderer);

    // Create normal render pass
    renderPass = new RenderPass(scene, camera);
    
    // Create pixelated render pass
    renderPixelatedPass = new RenderPixelatedPass(params.pixelSize, scene, camera);
    renderPixelatedPass.normalEdgeStrength = params.normalEdgeStrength;
    renderPixelatedPass.depthEdgeStrength = params.depthEdgeStrength;
    renderPixelatedPass.pixelAlignedPanning = params.pixelAlignedPanning;

    // Add output pass
    outputPass = new OutputPass();
    
    // Initially set up passes based on pixelSize
    updateRenderPasses();
}

function updateRenderPasses() {
    // Clear existing passes
    composer.passes = [];
    
    if (params.pixelSize <= 1) {
        // Use normal rendering for pixelSize = 1 (realistic look)
        composer.addPass(renderPass);
    } else {
        // Use pixelated rendering for pixelSize > 1
        renderPixelatedPass.pixelSize = params.pixelSize;
        renderPixelatedPass.normalEdgeStrength = params.normalEdgeStrength;
        renderPixelatedPass.depthEdgeStrength = params.depthEdgeStrength;
        renderPixelatedPass.pixelAlignedPanning = params.pixelAlignedPanning;
        composer.addPass(renderPixelatedPass);
    }
    
    // Always add output pass last
    composer.addPass(outputPass);
}

function setupControls() {
    // Setup orbit controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
}

function setupGUI() {
    // Create GUI
    gui = new GUI();
    gui.title('Pixelated Postprocessing Controls');

    // Pixel size control
    gui.add(params, 'pixelSize', 1, 20, 1).onChange(function(value) {
        updateRenderPasses();
    });

    // Normal edge strength control
    gui.add(params, 'normalEdgeStrength', 0, 2, 0.1).onChange(function(value) {
        if (params.pixelSize > 1) {
            renderPixelatedPass.normalEdgeStrength = value;
        }
    });

    // Depth edge strength control
    gui.add(params, 'depthEdgeStrength', 0, 1, 0.1).onChange(function(value) {
        if (params.pixelSize > 1) {
            renderPixelatedPass.depthEdgeStrength = value;
        }
    });

    // Pixel aligned panning toggle
    gui.add(params, 'pixelAlignedPanning').onChange(function(value) {
        if (params.pixelSize > 1) {
            renderPixelatedPass.pixelAlignedPanning = value;
        }
    });

    // Additional controls folder
    const cameraFolder = gui.addFolder('Camera');
    cameraFolder.add(controls, 'enableDamping').name('Damping');
    cameraFolder.add(controls, 'autoRotate').name('Auto Rotate');
    cameraFolder.add(controls, 'autoRotateSpeed', 0.1, 10, 0.1).name('Rotate Speed');
}

function onWindowResize() {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Update composer size
    composer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Animate meshes
    const time = Date.now() * 0.001;
    
    // Rotate icosahedron
    if (meshes[1]) {
        meshes[1].rotation.x = time * 0.5;
        meshes[1].rotation.y = time * 0.3;
    }

    // Rotate textured box
    if (meshes[2]) {
        meshes[2].rotation.x = time * 0.3;
        meshes[2].rotation.z = time * 0.2;
    }

    // Rotate torus knot
    if (meshes[3]) {
        meshes[3].rotation.x = time * 0.2;
        meshes[3].rotation.y = time * 0.4;
    }

    // Animate spheres
    for (let i = 4; i < meshes.length; i++) {
        if (meshes[i]) {
            meshes[i].position.y = Math.sin(time + i) * 1.5;
            meshes[i].rotation.x = time * 0.5;
            meshes[i].rotation.y = time * 0.3;
        }
    }

    // Render using effect composer
    composer.render();
}