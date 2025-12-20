export class OilTimer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        
        // Create separate canvases for different layers
        this.backgroundCanvas = document.createElement('canvas');
        this.backgroundCtx = this.backgroundCanvas.getContext('2d');
        
        this.oilCanvas = document.createElement('canvas');
        this.oilCtx = this.oilCanvas.getContext('2d');
        
        this.stairsCanvas = document.createElement('canvas');
        this.stairsCtx = this.stairsCanvas.getContext('2d');
        
        this.wallsCanvas = document.createElement('canvas');
        this.wallsCtx = this.wallsCanvas.getContext('2d');
        
        this.resizeCanvas();
        
        // Setup canvas layering
        this.setupCanvasLayers();
        
        // Matter.js setup
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        
        // Use Matter.js built-in renderer for particles only on oil canvas
        this.render = Matter.Render.create({
            canvas: this.oilCanvas,
            engine: this.engine,
            options: {
                width: this.oilCanvas.width,
                height: this.oilCanvas.height,
                wireframes: false,
                background: 'transparent',
                showAngleIndicator: false,
                showVelocity: false,
                showDebug: false,
                showStaticBodies: false
            }
        });
        
        // Physics settings
        this.engine.world.gravity.y = 0.8;
        this.engine.world.gravity.x = 0;
        
        // Simulation state
        this.isFlipped = false;
        this.liquidFilterEnabled = true;
        this.mochiParticles = [];    // Array of mochi particle systems
        this.staticBodies = [];
        
        // Oil spawning state
        this.lastSpawnTime = 0;
        this.nextParticleIndex = 0;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // Physics parameters
        this.params = {
            gravity: 2.0,
            particleCount: 6,        // Number of mochi particle systems (not used for spawning)
            oilColor: '#ff6b35',
            spawnInterval: 2000      // Oil spawn interval in milliseconds
        };
        
        // Mochi particle system parameters (based on p5js soft body physics)
        this.mochiParams = {
            spheresPerParticle: 7,      // Number of spheres per mochi particle (1 center + 6 outer)
            sphereRadius: 10,           // Radius of each sphere
            stiffness: 0.08,            // Spring stiffness (低いほど柔らかい)
            damping: 0.2,             // Spring damping (高いと動きがぬるっと止まる)
            restitution: 0,            // Bounce factor for individual spheres
            length: 30,                // Spring natural length (少し短めにすると収縮力が働く)
            friction: 0,
            frictionAir: 0,
            density: 0.003,
            centerMass: 0.65,           // Center sphere mass multiplier
            outerMass: 0.2,            // Outer spheres mass multiplier
            constraintVisible: false,  // Show spring constraints
            // Advanced mochi parameters
            outerSpringStiffness: 0.15, // Stiffness between outer spheres
            compressionForce: 0.8,     // Force that keeps spheres together
            surfaceTension: 0.2        // Surface tension effect
        };
        
        // Liquid effect parameters
        this.liquidParams = {
            blurRadius: 20,
            threshold: 50,
            sharpness: 5
        };
        
        this.init();
        this.createWorld();
        this.setupGUI();
        this.animate();
        
        // Expose to global scope for debugging
        window.mochiOilTimer = this;
    }
    
    setupCanvasLayers() {
        const parentElement = this.canvas.parentNode;
        
        // Setup background canvas (z-index: 1)
        this.backgroundCanvas.style.position = 'absolute';
        this.backgroundCanvas.style.top = '0';
        this.backgroundCanvas.style.left = '0';
        this.backgroundCanvas.style.zIndex = '1';
        
        // Setup oil canvas (z-index: 2)
        this.oilCanvas.style.position = 'absolute';
        this.oilCanvas.style.top = '0';
        this.oilCanvas.style.left = '0';
        this.oilCanvas.style.zIndex = '2';
        
        // Setup stairs canvas (z-index: 3)
        this.stairsCanvas.style.position = 'absolute';
        this.stairsCanvas.style.top = '0';
        this.stairsCanvas.style.left = '0';
        this.stairsCanvas.style.zIndex = '3';
        
        // Setup walls canvas (z-index: 4)
        this.wallsCanvas.style.position = 'absolute';
        this.wallsCanvas.style.top = '0';
        this.wallsCanvas.style.left = '0';
        this.wallsCanvas.style.zIndex = '4';
        
        // Hide the original canvas as we'll use our custom layers
        this.canvas.style.display = 'none';
        
        // Insert all canvases in order
        parentElement.insertBefore(this.backgroundCanvas, this.canvas);
        parentElement.insertBefore(this.oilCanvas, this.canvas);
        parentElement.insertBefore(this.stairsCanvas, this.canvas);
        parentElement.insertBefore(this.wallsCanvas, this.canvas);
    }
    
    resizeCanvas() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        // Resize all canvases
        this.canvas.width = width;
        this.canvas.height = height;
        this.backgroundCanvas.width = width;
        this.backgroundCanvas.height = height;
        this.oilCanvas.width = width;
        this.oilCanvas.height = height;
        this.stairsCanvas.width = width;
        this.stairsCanvas.height = height;
        this.wallsCanvas.width = width;
        this.wallsCanvas.height = height;
        
        if (this.render) {
            this.render.canvas = this.oilCanvas;
            this.render.canvas.width = width;
            this.render.canvas.height = height;
            this.render.options.width = width;
            this.render.options.height = height;
        }
    }
    
    init() {
        // Setup Matter.js engine options
        this.engine.world.gravity.scale = 0.001;
        this.engine.enableSleeping = false;
        
        // Add mouse control
        this.mouse = Matter.Mouse.create(this.oilCanvas);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
        
        Matter.World.add(this.world, this.mouseConstraint);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createWorld();
        });
        
        // Apply initial filters
        this.updateLiquidFilter();
    }
    
    updateLiquidFilter() {
        // Update SVG filter parameters
        const filter = document.querySelector('#liquid-filter feGaussianBlur');
        const colorMatrix = document.querySelector('#liquid-filter feColorMatrix');
        
        if (filter) {
            filter.setAttribute('stdDeviation', this.liquidParams.blurRadius);
        }
        
        if (colorMatrix) {
            const matrixValues = `1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 ${this.liquidParams.threshold} -${this.liquidParams.sharpness}`;
            colorMatrix.setAttribute('values', matrixValues);
        }
        
        // Apply filter to oil canvas only
        if (this.liquidFilterEnabled) {
            this.oilCanvas.style.filter = 'url(#liquid-filter)';
        } else {
            this.oilCanvas.style.filter = 'none';
        }
    }
    
    setupGUI() {
        if (typeof window.lil === 'undefined') {
            setTimeout(() => this.setupGUI(), 100);
            return;
        }
        
        const gui = new window.lil.GUI({ title: 'オイルタイマー 設定' });
        
        // Only the 5 requested controls
        gui.add(this.params, 'spawnInterval', 500, 3000, 100).name('オイル出現間隔 (ms)');
        gui.addColor(this.params, 'oilColor').name('色').onChange(() => {
            this.updateMochiProperties();
        });
        gui.add(this.mochiParams, 'constraintVisible').name('ばね表示').onChange(() => {
            this.updateConstraintVisibility();
        });
        gui.add(this, 'liquidFilterEnabled').name('流体効果 ON/OFF').onChange(() => {
            this.updateLiquidFilter();
        });
        gui.add(this, 'reset').name('リセット');
    }
    
    createWorld() {
        // Clear existing bodies
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        
        // Re-add mouse constraint
        Matter.World.add(this.world, this.mouseConstraint);
        
        this.mochiParticles = [];
        this.staticBodies = [];
        
        // Create glass container structure
        this.createGlassStructure();
        
        // Create mochi oil particles
        this.createMochiParticles();
        
        // Render structures on separate canvases
        this.renderBackground();
        this.renderStairs();
        this.renderWalls();
        
        console.log(`Created ${this.mochiParticles.length} mochi particles and ${this.staticBodies.length} static bodies`);
    }
    
    separateStructuresForRendering() {
        this.wallBodies = this.staticBodies.slice(0, 2); // First 2 bodies are main walls
        this.stairBodies = this.staticBodies.slice(2);   // Rest are stairs
    }
    
    createGlassStructure() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const thickness = 20;
        
        // Container dimensions - responsive width
        const isMobile = width < 768;
        const containerWidth = isMobile ? width * 0.9 : width * 0.45;
        const containerX = (width - containerWidth) / 2;
        
        // Container boundaries (invisible) - only left and right walls
        const boundaries = [
            Matter.Bodies.rectangle(-thickness, height/2, thickness, height, { isStatic: true, friction: 0, frictionStatic: 0, restitution: 0, render: { visible: false } }),
            Matter.Bodies.rectangle(width + thickness, height/2, thickness, height, { isStatic: true, friction: 0, frictionStatic: 0, restitution: 0, render: { visible: false } })
        ];
        Matter.World.add(this.world, boundaries);
        
        const glassWalls = [];
        
        // Main container walls - only left and right walls
        glassWalls.push(
            // Left wall
            Matter.Bodies.rectangle(containerX - thickness/2, height/2, thickness, height, { isStatic: true, friction: 0, frictionStatic: 0, restitution: 0, render: { visible: false } }),
            // Right wall
            Matter.Bodies.rectangle(containerX + containerWidth + thickness/2, height/2, thickness, height, { isStatic: true, friction: 0, frictionStatic: 0, restitution: 0, render: { visible: false } })
        );
        
        // Create stairs for testing mochi behavior - similar to original oil timer
        this.createMochiTestStairs(glassWalls, containerX, containerWidth, thickness, height);
        
        this.staticBodies = glassWalls;
        Matter.World.add(this.world, glassWalls);
        
        // Separate stairs and walls for rendering
        this.separateStructuresForRendering();
    }
    
    createMochiTestStairs(glassWalls, containerX, containerWidth, thickness, height) {
        const plateCount = 3;
        const stepsPerPlate = 4;
        const stepHeight = 150; // 各ステップの縦の進み幅（≒最小マージン）
        const stepWidth = containerWidth * 0.9;
        const topY = 80; // 一番上の階段の基準高さ（spawnY = 0 から少し下）
        const margin = 50;
        
        for (let i = 0; i < plateCount; i++) {
            let baseY;

            if (i === 0) {
                // 最上段は固定（オイル出現地点近く）
                baseY = topY;
            } else {
                // 各プレートに 150px の余白 + 階段高さの合計分だけ下にずらす
                const previousStepHeight = stepsPerPlate * (stepHeight / 2);
                baseY = topY + i * (previousStepHeight + margin);
            }

            const isLeftOriented = i % 2 === 0;

            for (let j = 0; j < stepsPerPlate; j++) {
                const stepX = isLeftOriented
                    ? containerX + (stepWidth / stepsPerPlate) * (j + 0.5)
                    : containerX + containerWidth - (stepWidth / stepsPerPlate) * (j + 0.5);

                const stepY = baseY + j * (stepHeight / 2);

                const stepSurface = Matter.Bodies.rectangle(
                    stepX,
                    stepY,
                    stepWidth / stepsPerPlate,
                    thickness * 0.6,
                    {
                        isStatic: true,
                        angle: isLeftOriented ? 0.05 : -0.05,
                        friction: 0,
                        frictionStatic: 0,
                        restitution: 0,
                        render: { visible: false }
                    }
                );

                glassWalls.push(stepSurface);
            }
        }
    }

    createMochiParticles() {
        // Remove existing mochi particle systems
        this.mochiParticles.forEach(mochiParticle => {
            this.removeMochiParticle(mochiParticle);
        });
        
        this.mochiParticles = [];
        this.nextParticleIndex = 0;
        
        // No initial particles - they will be spawned automatically
    }
    
    createMochiParticle(centerX, centerY, index) {
        const spheres = [];
        const constraints = [];
        const numSpheres = this.mochiParams.spheresPerParticle;
        const radius = this.mochiParams.sphereRadius;
        
        // Create center sphere (acts as the core of the mochi particle)
        const centerSphere = Matter.Bodies.circle(centerX, centerY, radius, {
            restitution: this.mochiParams.restitution,
            friction: this.mochiParams.friction,
            frictionAir: this.mochiParams.frictionAir,
            density: this.mochiParams.density * this.mochiParams.centerMass,
            render: {
                fillStyle: this.params.oilColor,
                strokeStyle: 'transparent',
                lineWidth: 0
            },
            mochiIndex: index,
            sphereType: 'center'
        });
        spheres.push(centerSphere);
        
        // Create outer spheres arranged in a circle around center
        const outerCount = numSpheres - 1;
        const angleStep = (2 * Math.PI) / outerCount;
        const arrangementRadius = this.mochiParams.length * 0.7;
        
        for (let i = 0; i < outerCount; i++) {
            const angle = i * angleStep;
            const x = centerX + Math.cos(angle) * arrangementRadius;
            const y = centerY + Math.sin(angle) * arrangementRadius;
            
            const outerSphere = Matter.Bodies.circle(x, y, radius * 0.85, {
                restitution: this.mochiParams.restitution,
                friction: this.mochiParams.friction,
                frictionAir: this.mochiParams.frictionAir,
                density: this.mochiParams.density * this.mochiParams.outerMass,
                render: {
                    fillStyle: this.params.oilColor,
                    strokeStyle: 'transparent',
                    lineWidth: 0
                },
                mochiIndex: index,
                sphereType: 'outer',
                outerIndex: i
            });
            
            spheres.push(outerSphere);
            
            // Create spring constraint between center and outer sphere
            const centerConstraint = Matter.Constraint.create({
                bodyA: centerSphere,
                bodyB: outerSphere,
                length: this.mochiParams.length,
                stiffness: this.mochiParams.stiffness,
                damping: this.mochiParams.damping,
                render: {
                    visible: this.mochiParams.constraintVisible,
                    strokeStyle: 'rgba(255, 255, 255, 0.3)',
                    lineWidth: 1
                }
            });
            
            constraints.push(centerConstraint);
        }
        
        // Create constraints between adjacent outer spheres for surface tension
        for (let i = 0; i < outerCount; i++) {
            const nextIndex = (i + 1) % outerCount;
            const outerConstraint = Matter.Constraint.create({
                bodyA: spheres[1 + i], // outer spheres start at index 1
                bodyB: spheres[1 + nextIndex],
                length: this.mochiParams.length * 1.1, // Slightly longer for flexibility
                stiffness: this.mochiParams.outerSpringStiffness, // Softer connection
                damping: this.mochiParams.damping * 0.8,
                render: {
                    visible: this.mochiParams.constraintVisible,
                    strokeStyle: 'rgba(255, 255, 255, 0.2)',
                    lineWidth: 1
                }
            });
            
            constraints.push(outerConstraint);
        }
        
        // Add cross-connections for extra stability (every other outer sphere)
        for (let i = 0; i < outerCount; i += 2) {
            const oppositeIndex = (i + Math.floor(outerCount / 2)) % outerCount;
            if (oppositeIndex !== i) {
                const crossConstraint = Matter.Constraint.create({
                    bodyA: spheres[1 + i],
                    bodyB: spheres[1 + oppositeIndex],
                    length: this.mochiParams.length * 1.8,
                    stiffness: this.mochiParams.stiffness * 0.3, // Much softer for internal structure
                    damping: this.mochiParams.damping * 1.2,
                    render: {
                        visible: this.mochiParams.constraintVisible,
                        strokeStyle: 'rgba(255, 255, 255, 0.1)',
                        lineWidth: 1
                    }
                });
                
                constraints.push(crossConstraint);
            }
        }
        
        return {
            index: index,
            spheres: spheres,
            constraints: constraints,
            centerSphere: centerSphere
        };
    }
    
    removeMochiParticle(mochiParticle) {
        if (mochiParticle.spheres.length > 0) {
            Matter.World.remove(this.world, mochiParticle.spheres);
        }
        if (mochiParticle.constraints.length > 0) {
            Matter.World.remove(this.world, mochiParticle.constraints);
        }
    }
    
    recreateMochiSystem() {
        // Store current center positions and velocities
        const positions = this.mochiParticles.map(mp => ({
            x: mp.centerSphere.position.x,
            y: mp.centerSphere.position.y,
            vx: mp.centerSphere.velocity.x,
            vy: mp.centerSphere.velocity.y
        }));
        
        // Recreate all mochi particles
        this.createMochiParticles();
        
        // Restore center positions and velocities if possible
        for (let i = 0; i < Math.min(positions.length, this.mochiParticles.length); i++) {
            const center = this.mochiParticles[i].centerSphere;
            Matter.Body.setPosition(center, { x: positions[i].x, y: positions[i].y });
            Matter.Body.setVelocity(center, { x: positions[i].vx, y: positions[i].vy });
            
            // Arrange outer spheres around new center position with slight random offset
            const mochiParticle = this.mochiParticles[i];
            const outerCount = mochiParticle.spheres.length - 1;
            const angleStep = (2 * Math.PI) / outerCount;
            const arrangementRadius = this.mochiParams.length * 0.7;
            
            for (let j = 0; j < outerCount; j++) {
                const angle = j * angleStep + (Math.random() - 0.5) * 0.3; // Small random offset
                const x = positions[i].x + Math.cos(angle) * arrangementRadius;
                const y = positions[i].y + Math.sin(angle) * arrangementRadius;
                Matter.Body.setPosition(mochiParticle.spheres[1 + j], { x, y });
            }
        }
    }
    
    updateMochiConstraints() {
        this.mochiParticles.forEach(mochiParticle => {
            mochiParticle.constraints.forEach((constraint, index) => {
                const outerCount = mochiParticle.spheres.length - 1;
                
                if (index < outerCount) {
                    // Center-to-outer constraints
                    constraint.length = this.mochiParams.length;
                    constraint.stiffness = this.mochiParams.stiffness;
                    constraint.damping = this.mochiParams.damping;
                } else if (index < outerCount * 2) {
                    // Outer-to-outer adjacent constraints
                    constraint.length = this.mochiParams.length * 1.1;
                    constraint.stiffness = this.mochiParams.outerSpringStiffness;
                    constraint.damping = this.mochiParams.damping * 0.8;
                } else {
                    // Cross constraints
                    constraint.length = this.mochiParams.length * 1.8;
                    constraint.stiffness = this.mochiParams.stiffness * 0.3;
                    constraint.damping = this.mochiParams.damping * 1.2;
                }
            });
        });
    }
    
    updateMochiSphereSize() {
        this.mochiParticles.forEach(mochiParticle => {
            mochiParticle.spheres.forEach((sphere, index) => {
                const targetRadius = index === 0 ? 
                    this.mochiParams.sphereRadius : 
                    this.mochiParams.sphereRadius * 0.85;
                const currentRadius = sphere.circleRadius || targetRadius;
                
                if (Math.abs(currentRadius - targetRadius) > 0.1) {
                    const scale = targetRadius / currentRadius;
                    Matter.Body.scale(sphere, scale, scale);
                    sphere.circleRadius = targetRadius;
                }
            });
        });
    }
    
    updateMochiProperties() {
        this.mochiParticles.forEach(mochiParticle => {
            mochiParticle.spheres.forEach(sphere => {
                sphere.restitution = this.mochiParams.restitution;
                sphere.friction = this.mochiParams.friction;
                sphere.frictionAir = this.mochiParams.frictionAir;
                
                // Update color
                if (sphere.render) {
                    sphere.render.fillStyle = this.params.oilColor;
                }
            });
        });
    }
    
    updateMochiMasses() {
        this.mochiParticles.forEach(mochiParticle => {
            mochiParticle.spheres.forEach((sphere, index) => {
                const massMultiplier = index === 0 ? 
                    this.mochiParams.centerMass : 
                    this.mochiParams.outerMass;
                Matter.Body.setDensity(sphere, this.mochiParams.density * massMultiplier);
            });
        });
    }
    
    updateConstraintVisibility() {
        this.mochiParticles.forEach(mochiParticle => {
            mochiParticle.constraints.forEach(constraint => {
                constraint.render.visible = this.mochiParams.constraintVisible;
            });
        });
    }
    
    renderBackground() {
        // Clear background canvas and add dark background
        this.backgroundCtx.fillStyle = '#000000';
        this.backgroundCtx.fillRect(0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
    }
    
    renderStairs() {
        // Clear stairs canvas
        this.stairsCtx.clearRect(0, 0, this.stairsCanvas.width, this.stairsCanvas.height);
        
        // Render stair bodies
        if (this.stairBodies) {
            this.stairBodies.forEach(body => {
                this.renderGlassBody(this.stairsCtx, body, 'rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.4)');
            });
        }
    }
    
    renderWalls() {
        // Clear walls canvas
        this.wallsCtx.clearRect(0, 0, this.wallsCanvas.width, this.wallsCanvas.height);
        
        // Render wall bodies
        if (this.wallBodies) {
            this.wallBodies.forEach(body => {
                this.renderGlassBody(this.wallsCtx, body, 'rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.6)');
            });
        }
    }
    
    renderGlassBody(ctx, body, fillStyle, strokeStyle) {
        // Glass appearance
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        
        // Render based on body type
        if (body.circleRadius) {
            // Circle body (bumps)
            ctx.beginPath();
            ctx.arc(body.position.x, body.position.y, body.circleRadius, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
        } else {
            // Rectangle body (walls and plates)
            const vertices = body.vertices;
            if (vertices.length > 0) {
                ctx.beginPath();
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let i = 1; i < vertices.length; i++) {
                    ctx.lineTo(vertices[i].x, vertices[i].y);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Add glass highlight
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    updatePhysics() {
        // Update gravity
        this.engine.world.gravity.x = 0;
        this.engine.world.gravity.y = this.isFlipped ? -this.params.gravity : this.params.gravity;
        
        // Update all mochi particle properties
        this.updateMochiProperties();
        
        // Apply subtle forces for mochi behavior enhancement
        this.applyMochiForces();
    }
    
    applyMochiForces() {
        // Apply additional forces to enhance mochi-like behavior
        this.mochiParticles.forEach(mochiParticle => {
            const centerSphere = mochiParticle.centerSphere;
            const outerSpheres = mochiParticle.spheres.slice(1);
            
            // Calculate center of mass
            let totalMass = centerSphere.mass;
            let comX = centerSphere.position.x * centerSphere.mass;
            let comY = centerSphere.position.y * centerSphere.mass;
            
            outerSpheres.forEach(sphere => {
                totalMass += sphere.mass;
                comX += sphere.position.x * sphere.mass;
                comY += sphere.position.y * sphere.mass;
            });
            
            comX /= totalMass;
            comY /= totalMass;
            
            // Apply gentle cohesion force to keep mochi together
            const cohesionStrength = 0.0002 * this.mochiParams.compressionForce;
            
            outerSpheres.forEach(sphere => {
                const dx = comX - sphere.position.x;
                const dy = comY - sphere.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > this.mochiParams.length * 1.5) {
                    const forceX = dx * cohesionStrength;
                    const forceY = dy * cohesionStrength;
                    Matter.Body.applyForce(sphere, sphere.position, { x: forceX, y: forceY });
                }
            });
        });
    }
    
    reset() {
        this.createWorld();
    }
    
    flip() {
        this.isFlipped = !this.isFlipped;
        
        // Add some impulse to all spheres when flipping for dramatic effect
        this.mochiParticles.forEach(mochiParticle => {
            mochiParticle.spheres.forEach(sphere => {
                const impulse = {
                    x: (Math.random() - 0.5) * 0.02,
                    y: this.isFlipped ? -0.015 : 0.015
                };
                Matter.Body.applyForce(sphere, sphere.position, impulse);
            });
        });
        
        // Update structure displays
        this.renderStairs();
        this.renderWalls();
    }
    
    spawnOilParticle() {
        const isMobile = this.canvas.width < 768;
        const containerWidth = isMobile ? this.canvas.width * 0.9 : this.canvas.width * 0.45;
        const containerX = (this.canvas.width - containerWidth) / 2;
        
        // Spawn position at left upper area near the stairs
        const spawnX = containerX + 50; // Left side with some randomness
        const spawnY = 0; // Top area with some randomness
        
        const mochiParticle = this.createMochiParticle(spawnX, spawnY, this.nextParticleIndex);
        this.mochiParticles.push(mochiParticle);
        this.nextParticleIndex++;
        
        // Add to physics world
        Matter.World.add(this.world, mochiParticle.spheres);
        Matter.World.add(this.world, mochiParticle.constraints);
        
        console.log(`Spawned oil particle #${mochiParticle.index} at (${spawnX.toFixed(1)}, ${spawnY.toFixed(1)})`);
    }
    
    updateOilSpawning() {
        const currentTime = performance.now();
        
        if (currentTime - this.lastSpawnTime >= this.params.spawnInterval) {
            this.spawnOilParticle();
            this.lastSpawnTime = currentTime;
        }
    }
    
    removeOffScreenParticles() {
        const screenHeight = this.canvas.height;
        const removalThreshold = screenHeight + 100; // Add some buffer to ensure complete removal
        
        // Check each mochi particle system
        this.mochiParticles = this.mochiParticles.filter(mochiParticle => {
            // Check if the center sphere has fallen below the screen
            const centerY = mochiParticle.centerSphere.position.y;
            
            if (centerY > removalThreshold) {
                // Remove this mochi particle system from the physics world
                this.removeMochiParticle(mochiParticle);
                return false; // Remove from array
            }
            
            return true; // Keep in array
        });
    }
    
    updateFPS() {
        this.frameCount++;
        const now = performance.now();
        if (now - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
            this.frameCount = 0;
            this.lastTime = now;
            
            // Update UI
            const fpsElement = document.getElementById('fps');
            const particleCountElement = document.getElementById('particleCount');
            const totalSpheres = this.mochiParticles.reduce((sum, mp) => sum + mp.spheres.length, 0);
            
            if (fpsElement) fpsElement.textContent = this.fps;
            if (particleCountElement) particleCountElement.textContent = `${this.mochiParticles.length} (${totalSpheres} spheres)`;
        }
    }
    
    animate() {
        this.updatePhysics();
        
        // Update Matter.js engine
        Matter.Engine.update(this.engine, 1000 / 60);
        
        // Spawn new oil particles at intervals
        this.updateOilSpawning();
        
        // Remove oil particles that have fallen below the screen
        this.removeOffScreenParticles();
        
        // Clear oil canvas background
        this.oilCtx.clearRect(0, 0, this.oilCanvas.width, this.oilCanvas.height);
        
        // Render particles and constraints
        Matter.Render.world(this.render);
        
        this.updateFPS();
        
        requestAnimationFrame(() => this.animate());
    }
}