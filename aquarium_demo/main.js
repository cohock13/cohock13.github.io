// 3D Aquarium Demo with Three.js
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { GUI } from 'lil-gui';

// Global variables
let scene, camera, renderer, controls;
let aquariumTank, waterSurface;
let seaweed = [];
let bubbles = [];
let gui;

// Aquarium parameters
const params = {
    bubblesEnabled: true,
    seaweedAnimation: true,
    waterDistortion: 0.1,
    lightIntensity: 1.0,
    causticIntensity: 0.5,
    glassThickness: 0.8,
    glassTransmission: 1.0,
    glassRoughness: 0.0,
    glassReflectivity: 0.1
};

// Create glass material function
function createGlassMaterial() {
    return new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.0,
        roughness: params.glassRoughness,
        transmission: params.glassTransmission,
        thickness: params.glassThickness,
        ior: 1.52,
        reflectivity: params.glassReflectivity,
        clearcoat: 1.0,
        clearcoatRoughness: 0.0,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
    });
}

// Create water material function
function createWaterMaterial() {
    return new THREE.MeshPhysicalMaterial({
        color: 0x006994,
        metalness: 0.0,
        roughness: 0.1,
        transmission: 0.9,
        thickness: 0.5,
        ior: 1.33, // Water refractive index
        reflectivity: 0.3,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
}

// Seaweed vertex shader
const seaweedShaderMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0.0 },
        color: { value: new THREE.Color(0x2d5a2d) }
    },
    vertexShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float time;
        
        void main() {
            vPosition = position;
            vNormal = normal;
            
            vec3 pos = position;
            
            // Add swaying animation based on height
            float sway = sin(time + position.y * 0.5) * 0.3;
            pos.x += sway * (position.y + 1.0) * 0.1;
            pos.z += cos(time * 0.7 + position.y * 0.3) * (position.y + 1.0) * 0.05;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
    `,
    fragmentShader: `
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform vec3 color;
        
        void main() {
            vec3 light = normalize(vec3(1.0, 1.0, 1.0));
            float diff = max(dot(vNormal, light), 0.0);
            
            vec3 finalColor = color * (0.3 + diff * 0.7);
            
            // Add depth-based darkness
            float depth = (vPosition.y + 2.0) / 4.0;
            finalColor *= depth;
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `
});

// Initialize RectAreaLight support
RectAreaLightUniformsLib.init();

// Initialize the aquarium
init();
animate();

function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x001122);
    scene.fog = new THREE.Fog(0x001122, 10, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // Setup lighting
    setupLighting();

    // Create aquarium tank
    createAquariumTank();

    // Create water surface
    createWaterSurface();


    // Create seaweed
    createSeaweed();

    // Create bubbles
    createBubbles();

    // Setup controls
    setupControls();

    // Setup GUI
    setupGUI();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Hide loading screen
    document.getElementById('loading').style.display = 'none';
}

function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404080, 0.3);
    scene.add(ambientLight);

    // Main aquarium light (LED strip on top)
    const aquariumLight = new THREE.RectAreaLight(0xffffff, 15, 14, 2);
    aquariumLight.position.set(0, 8, 0);
    aquariumLight.lookAt(0, 0, 0);
    scene.add(aquariumLight);

    // Secondary aquarium LED lights
    const ledLight1 = new THREE.RectAreaLight(0xe6f3ff, 8, 12, 1);
    ledLight1.position.set(-6, 7, 0);
    ledLight1.lookAt(0, 0, 0);
    scene.add(ledLight1);

    const ledLight2 = new THREE.RectAreaLight(0xe6f3ff, 8, 12, 1);
    ledLight2.position.set(6, 7, 0);
    ledLight2.lookAt(0, 0, 0);
    scene.add(ledLight2);

    // Directional light for shadows and overall illumination
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(0, 10, 0);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 50;
    mainLight.shadow.camera.left = -15;
    mainLight.shadow.camera.right = 15;
    mainLight.shadow.camera.top = 15;
    mainLight.shadow.camera.bottom = -15;
    scene.add(mainLight);

    // Underwater accent lights
    const underLight1 = new THREE.SpotLight(0x4080ff, 3, 15, Math.PI / 6);
    underLight1.position.set(-4, -4, 4);
    underLight1.target.position.set(0, 2, 0);
    scene.add(underLight1);
    scene.add(underLight1.target);

    const underLight2 = new THREE.SpotLight(0x80ff40, 2, 12, Math.PI / 8);
    underLight2.position.set(4, -3, -4);
    underLight2.target.position.set(0, 1, 0);
    scene.add(underLight2);
    scene.add(underLight2.target);

    // Create environment map for realistic glass reflections
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    
    // Create a gradient environment texture for realistic reflections
    const envMapRenderTarget = new THREE.WebGLCubeRenderTarget(512);
    const envMapCamera = new THREE.CubeCamera(0.1, 1000, envMapRenderTarget);
    
    // Create a simple environment scene
    const envScene = new THREE.Scene();
    envScene.background = new THREE.Color(0xf0f0f0); // Light gray instead of blue
    
    // Add some simple geometry for reflections
    const envGeometry = new THREE.SphereGeometry(100, 32, 32);
    const envMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xf0f0f0,
        side: THREE.BackSide
    });
    const envSphere = new THREE.Mesh(envGeometry, envMaterial);
    envScene.add(envSphere);
    
    // Add some clouds
    for (let i = 0; i < 10; i++) {
        const cloudGeometry = new THREE.SphereGeometry(5, 8, 8);
        const cloudMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffffff,
            transparent: true,
            opacity: 0.7
        });
        const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
        cloud.position.set(
            (Math.random() - 0.5) * 200,
            20 + Math.random() * 30,
            (Math.random() - 0.5) * 200
        );
        envScene.add(cloud);
    }
    
    // Render environment map
    envMapCamera.position.set(0, 0, 0);
    envMapCamera.update(renderer, envScene);
    
    // Set scene environment
    scene.environment = envMapRenderTarget.texture;
    
    pmremGenerator.dispose();
}

function createAquariumTank() {
    // Create realistic thick glass tank with individual walls
    const glassThickness = params.glassThickness;
    
    // Create glass material
    const glassMaterial = createGlassMaterial();
    
    // Create tank walls separately for realistic thickness
    const tankGroup = new THREE.Group();
    
    // Front wall
    const frontWallGeometry = new THREE.BoxGeometry(16, 12, glassThickness);
    const frontWall = new THREE.Mesh(frontWallGeometry, glassMaterial);
    frontWall.position.set(0, 0, 5 + glassThickness/2);
    tankGroup.add(frontWall);
    
    // Back wall
    const backWall = new THREE.Mesh(frontWallGeometry, glassMaterial);
    backWall.position.set(0, 0, -5 - glassThickness/2);
    tankGroup.add(backWall);
    
    // Left wall
    const sideWallGeometry = new THREE.BoxGeometry(glassThickness, 12, 10);
    const leftWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    leftWall.position.set(-8 - glassThickness/2, 0, 0);
    tankGroup.add(leftWall);
    
    // Right wall
    const rightWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    rightWall.position.set(8 + glassThickness/2, 0, 0);
    tankGroup.add(rightWall);
    
    // Bottom
    const bottomGeometry = new THREE.BoxGeometry(16 + glassThickness*2, glassThickness, 10 + glassThickness*2);
    const bottom = new THREE.Mesh(bottomGeometry, glassMaterial);
    bottom.position.set(0, -6 - glassThickness/2, 0);
    tankGroup.add(bottom);
    
    aquariumTank = tankGroup;
    scene.add(aquariumTank);

    // Tank floor
    const floorGeometry = new THREE.PlaneGeometry(16, 10);
    const floorMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x8B4513,
        side: THREE.DoubleSide
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -6;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add some rocks
    for (let i = 0; i < 8; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(Math.random() * 0.5 + 0.2);
        const rockMaterial = new THREE.MeshLambertMaterial({ 
            color: new THREE.Color().setHSL(0.1, 0.3, 0.2 + Math.random() * 0.3)
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.set(
            (Math.random() - 0.5) * 14,
            -5.5,
            (Math.random() - 0.5) * 8
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);
    }
}

function createWaterSurface() {
    const waterGeometry = new THREE.PlaneGeometry(16, 10, 32, 32);
    
    // Create water material
    const waterMaterial = createWaterMaterial();
    
    waterSurface = new THREE.Mesh(waterGeometry, waterMaterial);
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.y = 5.5;
    scene.add(waterSurface);
}


function createSeaweed() {
    for (let i = 0; i < 12; i++) {
        const seaweedGroup = new THREE.Group();
        
        // Create seaweed segments
        for (let j = 0; j < 5; j++) {
            const segmentGeometry = new THREE.CylinderGeometry(0.02, 0.05, 0.8, 8);
            const segment = new THREE.Mesh(segmentGeometry, seaweedShaderMaterial.clone());
            segment.position.y = j * 0.7;
            seaweedGroup.add(segment);
        }
        
        seaweedGroup.position.set(
            (Math.random() - 0.5) * 14,
            -6,
            (Math.random() - 0.5) * 8
        );
        
        scene.add(seaweedGroup);
        seaweed.push(seaweedGroup);
    }
}

function createBubbles() {
    const bubbleGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const bubbleMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        roughness: 0.0,
        metalness: 0.0,
        clearcoat: 1.0
    });
    
    for (let i = 0; i < 20; i++) {
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        bubble.position.set(
            (Math.random() - 0.5) * 14,
            -6 + Math.random() * 11,
            (Math.random() - 0.5) * 8
        );
        
        bubble.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.005,
                0.01 + Math.random() * 0.01,
                (Math.random() - 0.5) * 0.005
            ),
            resetY: -6
        };
        
        scene.add(bubble);
        bubbles.push(bubble);
    }
}

function setupControls() {
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 8;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2;
}

function setupGUI() {
    gui = new GUI();
    gui.title('Aquarium Controls');
    
    const glassFolder = gui.addFolder('Glass Properties');
    glassFolder.add(params, 'glassThickness', 0.1, 2.0, 0.1).name('Thickness').onChange(updateGlassProperties);
    glassFolder.add(params, 'glassTransmission', 0.0, 1.0, 0.01).name('Transmission').onChange(updateGlassProperties);
    glassFolder.add(params, 'glassRoughness', 0.0, 0.1, 0.01).name('Roughness').onChange(updateGlassProperties);
    glassFolder.add(params, 'glassReflectivity', 0.0, 0.5, 0.01).name('Reflectivity').onChange(updateGlassProperties);
    
    const effectsFolder = gui.addFolder('Effects');
    effectsFolder.add(params, 'bubblesEnabled').name('Bubbles');
    effectsFolder.add(params, 'seaweedAnimation').name('Seaweed Sway');
    effectsFolder.add(params, 'waterDistortion', 0, 0.5, 0.01).onChange(updateWaterDistortion);
    effectsFolder.add(params, 'causticIntensity', 0, 1, 0.01).onChange(updateCausticIntensity);
    
    const lightFolder = gui.addFolder('Lighting');
    lightFolder.add(params, 'lightIntensity', 0, 2, 0.1).onChange(updateLightIntensity);
}

function updateGlassProperties() {
    // Remove old tank and recreate with new properties
    if (aquariumTank) {
        scene.remove(aquariumTank);
    }
    createAquariumTank();
}

function updateWaterDistortion(value) {
    params.waterDistortion = value;
}

function updateCausticIntensity(value) {
    params.causticIntensity = value;
}

function updateLightIntensity(value) {
    scene.children.forEach(child => {
        if (child.isDirectionalLight || child.isPointLight) {
            child.intensity = value;
        }
    });
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    waterShaderMaterial.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Update controls
    controls.update();
    
    // No shader updates needed for MeshPhysicalMaterial
    
    // Update seaweed animation
    if (params.seaweedAnimation) {
        seaweed.forEach(plant => {
            plant.children.forEach(segment => {
                if (segment.material && segment.material.uniforms) {
                    segment.material.uniforms.time.value = time;
                }
            });
        });
    }
    
    
    // Update bubbles
    if (params.bubblesEnabled) {
        bubbles.forEach(bubble => {
            bubble.position.add(bubble.userData.velocity);
            
            // Reset bubble when it reaches surface
            if (bubble.position.y > 5) {
                bubble.position.y = bubble.userData.resetY;
                bubble.position.x = (Math.random() - 0.5) * 14;
                bubble.position.z = (Math.random() - 0.5) * 8;
            }
            
            // Add some random movement
            bubble.position.x += Math.sin(time + bubble.position.y) * 0.001;
            bubble.position.z += Math.cos(time + bubble.position.y) * 0.001;
        });
    }
    
    // Render
    renderer.render(scene, camera);
}

// Update todos
console.log('🏺 Aquarium with realistic glass loaded successfully! 🏺');