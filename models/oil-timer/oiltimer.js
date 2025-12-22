/**
 * Oil Timer Simulator
 * 
 * This implementation includes liquid effect techniques inspired by:
 * "Canvas Liquid Effect" by n3r4zzurr0
 * https://github.com/n3r4zzurr0/canvas-liquid-effect
 * 
 * The SVG filter approach for creating liquid-like visual effects
 * is adapted from the above repository.
 */
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
        
        // Custom rendering (Matter.js renderer disabled)
        
        // Physics settings
        this.engine.world.gravity.y = 1.0;
        this.engine.world.gravity.x = 0;
        
        // Simulation state
        this.isFlipped = false;
        this.liquidParticles = [];    // Array of liquid particle systems
        this.staticBodies = [];
        this.pinwheel = null;          // Rotating pinwheel
        
        // Oil spawning state
        this.lastSpawnTime = 0;
        this.nextParticleIndex = 0;
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // Physics parameters
        this.params = {
            gravity: 1.0,
            particleCount: 6,        // Number of liquid particle systems (not used for spawning)
            oilColor: '#ff6b35',
            spawnInterval: 2000,     // Oil spawn interval in milliseconds
            containerWidth: 800,     // Fixed oil timer container width in pixels
            pinwheelBlades: 4,       // Number of pinwheel blades
            pinwheelOffsetX: 35       // Horizontal offset from oil spawn position (in pixels)
        };
        
        // Liquid particle system parameters (based on p5js soft body physics)
        this.liquidSystemParams = {
            spheresPerParticle: 7,      // Number of spheres per liquid particle (1 center + 6 outer)
            sphereRadius: 3,           // Radius of each sphere
            stiffness: 0.2,            // Spring stiffness (低いほど柔らかい)
            damping: 0.000,             // Spring damping (高いと動きがぬるっと止まる)
            restitution: 0.0,            // Bounce factor for individual spheres
            length: 15,                // Spring natural length (少し短めにすると収縮力が働く)
            friction: 0.1,
            frictionAir: 0.000,
            density: 0.01,
            centerMass: 0.20,           // Center sphere mass multiplier
            outerMass: 0.05,            // Outer spheres mass multiplier
            constraintVisible: true,  // Show spring constraints
            // Advanced liquid parameters
            outerSpringStiffness: 0.3, // Stiffness between outer spheres
            compressionForce: 0.0,     // Force that keeps spheres together
            surfaceTension: 0.2        // Surface tension effect
        };

        this.init();
        this.createWorld();
        this.setupGUI();
        this.animate();
        
        // Expose to global scope for debugging
        window.liquidOilTimer = this;
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
    }
    
    init() {
        // Setup Matter.js engine options
        this.engine.world.gravity.scale = 0.0015;
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
    }
    
    setupGUI() {
        if (typeof window.lil === 'undefined') {
            setTimeout(() => this.setupGUI(), 100);
            return;
        }
        
        const gui = new window.lil.GUI({ title: 'オイルタイマー 設定' });
        
        // Basic controls
        gui.add(this.params, 'spawnInterval', 500, 3000, 100).name('オイル出現間隔 (ms)');
        gui.addColor(this.params, 'oilColor').name('色').onChange(() => {
            this.updateLiquidProperties();
        });
        gui.add(this.liquidSystemParams, 'constraintVisible').name('ばね表示').onChange(() => {
            this.updateConstraintVisibility();
        });

        gui.add(this, 'reset').name('リセット');
    }
    
    createWorld() {
        // Clear existing bodies
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        
        // Re-add mouse constraint
        Matter.World.add(this.world, this.mouseConstraint);
        
        this.liquidParticles = [];
        this.staticBodies = [];
        
        // Create glass container structure
        this.createGlassStructure();
        
        // Create liquid oil particles
        this.createLiquidParticles();
        
        // Render structures on separate canvases
        this.renderBackground();
        this.renderStairs();
        this.renderWalls();
    }
    
    separateStructuresForRendering() {
        this.wallBodies = this.staticBodies.slice(0, 2); // First 2 bodies are main walls
        this.stairBodies = this.staticBodies.slice(2);   // Rest are stairs
    }
    
    createGlassStructure() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const thickness = 20;

        // Container dimensions - responsive below 900px, fixed above
        const containerWidth = width < 900 ? width * 0.92 : this.params.containerWidth;
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
        
        // Create pinwheel
        this.createPinwheel();

        // Create stairs for testing liquid behavior - similar to original oil timer
        this.createLiquidTestStairs(glassWalls, containerX, containerWidth, thickness, height);

        this.staticBodies = glassWalls;
        Matter.World.add(this.world, glassWalls);

        // Separate stairs and walls for rendering
        this.separateStructuresForRendering();
    }

    createPinwheel() {
        // Pinwheel position - with proper spacing from oil spawn and first step
        const width = this.canvas.width;
        const responsiveContainerWidth = width < 900 ? width * 0.92 : this.params.containerWidth;
        const actualContainerX = (width - responsiveContainerWidth) / 2;

        const baseStepWidth = 80;
        const availableWidth = responsiveContainerWidth * 0.9;
        const minSteps = 3;
        const calculatedSteps = Math.floor(availableWidth / baseStepWidth);
        const stepsPerPlate = Math.max(minSteps, calculatedSteps);
        const actualStepWidth = availableWidth / stepsPerPlate;

        const topY = 100; // First step Y position (moved down to make room)
        const spawnY = 50; // Oil spawn Y position (safe margin from top)

        // Pinwheel size - smaller to not overlap with center
        const pinwheelRadius = responsiveContainerWidth * 0.08; // Slightly smaller

        // Pinwheel position with proper spacing
        const pinwheelX = actualContainerX + actualStepWidth * 0.5 + this.params.pinwheelOffsetX;
        const marginAbovePinwheel = 20; // Margin between spawn and pinwheel
        const marginBelowPinwheel = 20; // Margin between pinwheel and first step

        // Position pinwheel between spawn and first step
        const pinwheelY = spawnY + marginAbovePinwheel + pinwheelRadius;

        // Create static center anchor (invisible, collision-free)
        const centerRadius = 5;
        const centerAnchor = Matter.Bodies.circle(pinwheelX, pinwheelY, centerRadius, {
            isStatic: true,
            collisionFilter: {
                mask: 0 // No collision with anything
            },
            render: { visible: false }
        });

        // Create pinwheel blades as composite body
        const bladeCount = this.params.pinwheelBlades;
        const bladeWidth = pinwheelRadius * 0.5;
        const bladeHeight = pinwheelRadius * 0.12;
        const blades = [];

        for (let i = 0; i < bladeCount; i++) {
            const angle = (i / bladeCount) * Math.PI * 2;
            // Position blades from center
            const bladeX = Math.cos(angle) * pinwheelRadius * 0.65;
            const bladeY = Math.sin(angle) * pinwheelRadius * 0.65;

            const blade = Matter.Bodies.rectangle(
                pinwheelX + bladeX,
                pinwheelY + bladeY,
                bladeWidth,
                bladeHeight,
                {
                    angle: angle,
                    render: { visible: false }
                }
            );

            blades.push(blade);
        }

        // Create rotating composite body from blades
        const pinwheelComposite = Matter.Body.create({
            parts: blades,
            friction: 0.3,
            frictionAir: 0.05, // Air resistance for smooth acceleration/deceleration (damping effect)
            restitution: 0.5,
            density: 0.001
        });

        // Set reasonable inertia (higher = slower acceleration/deceleration)
        Matter.Body.setInertia(pinwheelComposite, 100);

        // Create revolute joint (rotation around fixed center)
        const pinwheelConstraint = Matter.Constraint.create({
            bodyA: centerAnchor,
            bodyB: pinwheelComposite,
            pointA: { x: 0, y: 0 },
            pointB: { x: 0, y: 0 },
            stiffness: 1,
            length: 0,
            render: { visible: false }
        });

        Matter.World.add(this.world, [centerAnchor, pinwheelComposite, pinwheelConstraint]);

        this.pinwheel = {
            anchor: centerAnchor,
            body: pinwheelComposite,
            constraint: pinwheelConstraint,
            x: pinwheelX,
            y: pinwheelY,
            radius: pinwheelRadius,
            bladeCount: bladeCount,
            centerRadius: centerRadius
        };
    }
    
    createLiquidTestStairs(glassWalls, containerX, containerWidth, thickness, height) {
        const plateCount = 10;
        const baseStepWidth = 80; // 基本のstep幅
        const stepHeight = 70; // 各ステップの縦の進み幅（≒最小マージン）
        const availableWidth = containerWidth * 0.9; // 利用可能幅
        const minSteps = 3; // 最小ステップ数（これ以下だと油が流れない）
        const calculatedSteps = Math.floor(availableWidth / baseStepWidth);
        const stepsPerPlate = Math.max(minSteps, calculatedSteps); // 最低3ステップを確保
        // 実際のステップ幅（小さい画面では幅を調整）
        const actualStepWidth = availableWidth / stepsPerPlate;
        const topY = 250; // 一番上の階段の基準高さ（spawnY = 0 から少し下）
        const margin = 10;
        
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
                // First step (j=0) has 5x steeper angle to prevent oil from getting stuck
                const baseAngle = 0.05;
                const angleMultiplier = j === 0 ? 7.5 : 2;  // steeper for first step
                const stepAngle = (isLeftOriented ? baseAngle : -baseAngle) * angleMultiplier;

                // Calculate step position with responsive width
                const stepX = isLeftOriented
                    ? containerX + actualStepWidth * (j + 0.5)  // Pack from left
                    : containerX + containerWidth - actualStepWidth * (j + 0.5); // Pack from right

                const stepY = baseY + j * (stepHeight / 2);

                // Only first two steps (j=0 and j=1) have wider overlap to fill gap, others use actual size
                const stepWidthIndividual = (j === 0 || j === 1)
                    ? actualStepWidth * 1.1  // 10% overlap for first two steps
                    : actualStepWidth;       // Actual size for other steps
                
                const stepSurface = Matter.Bodies.rectangle(
                    stepX,
                    stepY,
                    stepWidthIndividual,
                    thickness * 0.6,
                    {
                        isStatic: true,
                        angle: stepAngle,
                        friction: 0,
                        frictionStatic: 0,
                        restitution: 0,
                        chamfer: { radius: 6 },
                        render: { visible: false }
                    }
                );

                glassWalls.push(stepSurface);
            }
        }
    }

    createLiquidParticles() {
        // Remove existing liquid particle systems
        this.liquidParticles.forEach(liquidParticle => {
            this.removeLiquidParticle(liquidParticle);
        });
        
        this.liquidParticles = [];
        this.nextParticleIndex = 0;
        
        // No initial particles - they will be spawned automatically
    }
    
    createLiquidParticle(centerX, centerY, index) {
        const spheres = [];
        const constraints = [];
        const numSpheres = this.liquidSystemParams.spheresPerParticle;
        const radius = this.liquidSystemParams.sphereRadius;
        
        // Create center sphere (acts as the core of the liquid particle)
        const centerSphere = Matter.Bodies.circle(centerX, centerY, radius, {
            restitution: this.liquidSystemParams.restitution,
            friction: this.liquidSystemParams.friction,
            frictionAir: this.liquidSystemParams.frictionAir,
            density: this.liquidSystemParams.density * this.liquidSystemParams.centerMass,
            collisionFilter: {
                group: -1  // Negative group means no collision with same group
            },
            render: {
                fillStyle: this.params.oilColor,
                strokeStyle: 'transparent',
                lineWidth: 0
            },
            liquidIndex: index,
            sphereType: 'center'
        });
        spheres.push(centerSphere);
        
        // Create outer spheres arranged in an ellipse around center (horizontal 1.5x vertical)
        const outerCount = numSpheres - 1;
        const angleStep = (2 * Math.PI) / outerCount;
        const baseRadius = this.liquidSystemParams.length * 0.7;
        const horizontalRadius = baseRadius * 1.5; // 1.5x horizontal
        const verticalRadius = baseRadius * 1.0;   // 1.0x vertical
        
        for (let i = 0; i < outerCount; i++) {
            const angle = i * angleStep;
            const x = centerX + Math.cos(angle) * horizontalRadius;
            const y = centerY + Math.sin(angle) * verticalRadius;
            
            const outerSphere = Matter.Bodies.circle(x, y, radius * 0.85, {
                restitution: this.liquidSystemParams.restitution,
                friction: this.liquidSystemParams.friction,
                frictionAir: this.liquidSystemParams.frictionAir,
                density: this.liquidSystemParams.density * this.liquidSystemParams.outerMass,
                collisionFilter: {
                    group: -1  // Negative group means no collision with same group
                },
                render: {
                    fillStyle: this.params.oilColor,
                    strokeStyle: 'transparent',
                    lineWidth: 0
                },
                liquidIndex: index,
                sphereType: 'outer',
                outerIndex: i
            });
            
            spheres.push(outerSphere);
            
            // Create spring constraint between center and outer sphere
            const centerConstraint = Matter.Constraint.create({
                bodyA: centerSphere,
                bodyB: outerSphere,
                length: this.liquidSystemParams.length,
                stiffness: this.liquidSystemParams.stiffness,
                damping: this.liquidSystemParams.damping,
                render: {
                    visible: this.liquidSystemParams.constraintVisible,
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
                length: this.liquidSystemParams.length * 1.1, // Slightly longer for flexibility
                stiffness: this.liquidSystemParams.outerSpringStiffness, // Softer connection
                damping: this.liquidSystemParams.damping * 0.8,
                render: {
                    visible: this.liquidSystemParams.constraintVisible,
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
                    length: this.liquidSystemParams.length * 1.8,
                    stiffness: this.liquidSystemParams.stiffness * 0.3, // Much softer for internal structure
                    damping: this.liquidSystemParams.damping * 1.2,
                    render: {
                        visible: this.liquidSystemParams.constraintVisible,
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
    
    removeLiquidParticle(liquidParticle) {
        if (liquidParticle.spheres.length > 0) {
            Matter.World.remove(this.world, liquidParticle.spheres);
        }
        if (liquidParticle.constraints.length > 0) {
            Matter.World.remove(this.world, liquidParticle.constraints);
        }
    }
    
    recreateLiquidSystem() {
        // Store current center positions and velocities
        const positions = this.liquidParticles.map(mp => ({
            x: mp.centerSphere.position.x,
            y: mp.centerSphere.position.y,
            vx: mp.centerSphere.velocity.x,
            vy: mp.centerSphere.velocity.y
        }));
        
        // Recreate all liquid particles
        this.createLiquidParticles();
        
        // Restore center positions and velocities if possible
        for (let i = 0; i < Math.min(positions.length, this.liquidParticles.length); i++) {
            const center = this.liquidParticles[i].centerSphere;
            Matter.Body.setPosition(center, { x: positions[i].x, y: positions[i].y });
            Matter.Body.setVelocity(center, { x: positions[i].vx, y: positions[i].vy });
            
            // Arrange outer spheres around new center position in elliptical pattern with slight random offset
            const liquidParticle = this.liquidParticles[i];
            const outerCount = liquidParticle.spheres.length - 1;
            const angleStep = (2 * Math.PI) / outerCount;
            const baseRadius = this.liquidSystemParams.length * 0.7;
            const horizontalRadius = baseRadius * 1.5; // 1.5x horizontal
            const verticalRadius = baseRadius * 1.0;   // 1.0x vertical
            
            for (let j = 0; j < outerCount; j++) {
                const angle = j * angleStep + (Math.random() - 0.5) * 0.3; // Small random offset
                const x = positions[i].x + Math.cos(angle) * horizontalRadius;
                const y = positions[i].y + Math.sin(angle) * verticalRadius;
                Matter.Body.setPosition(liquidParticle.spheres[1 + j], { x, y });
            }
        }
    }
    
    updateLiquidConstraints() {
        this.liquidParticles.forEach(liquidParticle => {
            liquidParticle.constraints.forEach((constraint, index) => {
                const outerCount = liquidParticle.spheres.length - 1;
                
                if (index < outerCount) {
                    // Center-to-outer constraints
                    constraint.length = this.liquidSystemParams.length;
                    constraint.stiffness = this.liquidSystemParams.stiffness;
                    constraint.damping = this.liquidSystemParams.damping;
                } else if (index < outerCount * 2) {
                    // Outer-to-outer adjacent constraints
                    constraint.length = this.liquidSystemParams.length * 1.1;
                    constraint.stiffness = this.liquidSystemParams.outerSpringStiffness;
                    constraint.damping = this.liquidSystemParams.damping * 0.8;
                } else {
                    // Cross constraints
                    constraint.length = this.liquidSystemParams.length * 1.8;
                    constraint.stiffness = this.liquidSystemParams.stiffness * 0.3;
                    constraint.damping = this.liquidSystemParams.damping * 1.2;
                }
            });
        });
    }
    
    updateLiquidSphereSize() {
        this.liquidParticles.forEach(liquidParticle => {
            liquidParticle.spheres.forEach((sphere, index) => {
                const targetRadius = index === 0 ? 
                    this.liquidSystemParams.sphereRadius : 
                    this.liquidSystemParams.sphereRadius * 0.85;
                const currentRadius = sphere.circleRadius || targetRadius;
                
                if (Math.abs(currentRadius - targetRadius) > 0.1) {
                    const scale = targetRadius / currentRadius;
                    Matter.Body.scale(sphere, scale, scale);
                    sphere.circleRadius = targetRadius;
                }
            });
        });
    }
    
    updateLiquidProperties() {
        this.liquidParticles.forEach(liquidParticle => {
            liquidParticle.spheres.forEach(sphere => {
                sphere.restitution = this.liquidSystemParams.restitution;
                sphere.friction = this.liquidSystemParams.friction;
                sphere.frictionAir = this.liquidSystemParams.frictionAir;
                
                // Update color
                if (sphere.render) {
                    sphere.render.fillStyle = this.params.oilColor;
                }
            });
        });
    }
    
    updateLiquidMasses() {
        this.liquidParticles.forEach(liquidParticle => {
            liquidParticle.spheres.forEach((sphere, index) => {
                const massMultiplier = index === 0 ? 
                    this.liquidSystemParams.centerMass : 
                    this.liquidSystemParams.outerMass;
                Matter.Body.setDensity(sphere, this.liquidSystemParams.density * massMultiplier);
            });
        });
    }
    
    updateConstraintVisibility() {
        this.liquidParticles.forEach(liquidParticle => {
            liquidParticle.constraints.forEach(constraint => {
                constraint.render.visible = this.liquidSystemParams.constraintVisible;
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
    
    renderOilParticles() {
        const ctx = this.oilCtx;

        this.liquidParticles.forEach(liquidParticle => {
            const spheres = liquidParticle.spheres;
            if (spheres.length < 2) return;

            // If constraint visibility is ON, only draw constraints and spheres
            if (this.liquidSystemParams.constraintVisible) {
                this.renderSpheresAndConstraints(liquidParticle);
            } else {
                // Otherwise, draw smooth blob-like shape
                const outerSpheres = spheres.slice(1);
                if (outerSpheres.length < 3) return;

                // Sort outer spheres by angle around center for proper curve drawing
                const center = spheres[0].position;
                const sortedSpheres = outerSpheres.map(sphere => ({
                    sphere: sphere,
                    angle: Math.atan2(sphere.position.y - center.y, sphere.position.x - center.x)
                })).sort((a, b) => a.angle - b.angle).map(item => item.sphere);

                // Draw smooth blob-like shape with high curvature
                ctx.fillStyle = this.params.oilColor;
                ctx.beginPath();
                this.drawSmoothBlob(ctx, sortedSpheres);
                ctx.closePath();
                ctx.fill();
            }
        });
    }

    drawSmoothBlob(ctx, spheres) {
        if (spheres.length < 3) return;

        const positions = spheres.map(s => s.position);

        // Use high smoothness factor for blob-like appearance
        const smoothness = 0.4; // Higher = more rounded, blob-like

        // Start from midpoint between first and second sphere
        const start = this.getMidpoint(positions[positions.length - 1], positions[0]);
        ctx.moveTo(start.x, start.y);

        // Draw curve through all spheres with smooth control points
        for (let i = 0; i < positions.length; i++) {
            const current = positions[i];
            const next = positions[(i + 1) % positions.length];
            const prev = positions[(i - 1 + positions.length) % positions.length];

            // Calculate control points that create smooth, rounded curves
            // Push control points outward from sphere centers for blobbiness
            const angle1 = Math.atan2(current.y - prev.y, current.x - prev.x);
            const angle2 = Math.atan2(next.y - current.y, next.x - current.x);

            // Extend control points beyond sphere radius for smoothness
            const distance = Math.sqrt(
                Math.pow(next.x - current.x, 2) +
                Math.pow(next.y - current.y, 2)
            );

            const cp1x = current.x + Math.cos(angle1) * distance * smoothness;
            const cp1y = current.y + Math.sin(angle1) * distance * smoothness;
            const cp2x = current.x + Math.cos(angle2) * distance * smoothness;
            const cp2y = current.y + Math.sin(angle2) * distance * smoothness;

            const mid = this.getMidpoint(current, next);

            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, mid.x, mid.y);
        }
    }

    getMidpoint(p1, p2) {
        return {
            x: (p1.x + p2.x) / 2,
            y: (p1.y + p2.y) / 2
        };
    }

    renderSpheresAndConstraints(liquidParticle) {
        const ctx = this.oilCtx;

        // Draw constraints (springs) first
        liquidParticle.constraints.forEach(constraint => {
            const bodyA = constraint.bodyA;
            const bodyB = constraint.bodyB;

            ctx.strokeStyle = constraint.render.strokeStyle || 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(bodyA.position.x, bodyA.position.y);
            ctx.lineTo(bodyB.position.x, bodyB.position.y);
            ctx.stroke();
        });

        // Draw spheres (particles) on top
        liquidParticle.spheres.forEach((sphere, index) => {
            const radius = index === 0 ?
                this.liquidSystemParams.sphereRadius :
                this.liquidSystemParams.sphereRadius * 0.85;

            ctx.fillStyle = this.params.oilColor;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.arc(sphere.position.x, sphere.position.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
    }

    renderPinwheel() {
        if (!this.pinwheel) return;

        const ctx = this.oilCtx;
        const pinwheel = this.pinwheel;
        const angle = pinwheel.body.angle;

        ctx.save();
        ctx.translate(pinwheel.x, pinwheel.y);
        ctx.rotate(angle);

        // Draw center circle
        ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, pinwheel.centerRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Draw blades - smaller and glass-colored
        const bladeCount = pinwheel.bladeCount;
        const bladeLength = pinwheel.radius * 0.75; // Reduced
        const bladeWidth = pinwheel.radius * 0.12; // Reduced

        for (let i = 0; i < bladeCount; i++) {
            const bladeAngle = (i / bladeCount) * Math.PI * 2;

            ctx.save();
            ctx.rotate(bladeAngle);

            // Glass-like gradient (matching stairs)
            const gradient = ctx.createLinearGradient(0, -bladeWidth/2, 0, bladeWidth/2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
            gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0.15)');

            ctx.fillStyle = gradient;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)'; // Glass edge
            ctx.lineWidth = 1.5;

            // Draw rounded rectangle blade - positioned to not overlap center
            const bladeX = pinwheel.radius * 0.65;
            const bladeY = 0;

            ctx.beginPath();
            ctx.roundRect(bladeX - bladeLength/2, bladeY - bladeWidth/2, bladeLength, bladeWidth, bladeWidth/2);
            ctx.fill();
            ctx.stroke();

            ctx.restore();
        }

        ctx.restore();
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
        
        // Update all liquid particle properties
        this.updateLiquidProperties();
        
        // Apply subtle forces for liquid behavior enhancement
        this.applyLiquidForces();
    }
    
    applyLiquidForces() {
        // Apply additional forces to enhance liquid-like behavior
        this.liquidParticles.forEach(liquidParticle => {
            const centerSphere = liquidParticle.centerSphere;
            const outerSpheres = liquidParticle.spheres.slice(1);
            
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
            
            // Apply gentle cohesion force to keep liquid together
            const cohesionStrength = 0.0002 * this.liquidSystemParams.compressionForce;
            
            outerSpheres.forEach(sphere => {
                const dx = comX - sphere.position.x;
                const dy = comY - sphere.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > this.liquidSystemParams.length * 1.5) {
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
        this.liquidParticles.forEach(liquidParticle => {
            liquidParticle.spheres.forEach(sphere => {
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
        const width = this.canvas.width;
        const containerWidth = width < 900 ? width * 0.92 : this.params.containerWidth;
        const containerX = (width - containerWidth) / 2;

        // Calculate first step position (matches createLiquidTestStairs logic)
        const baseStepWidth = 80;
        const availableWidth = containerWidth * 0.9;
        const minSteps = 3;
        const calculatedSteps = Math.floor(availableWidth / baseStepWidth);
        const stepsPerPlate = Math.max(minSteps, calculatedSteps);
        const actualStepWidth = availableWidth / stepsPerPlate;
        const topY = 40;

        // First plate (i=0) is left-oriented, first step (j=0)
        const firstStepX = containerX + actualStepWidth * 0.5;

        // Spawn position directly above the first left step
        const spawnX = firstStepX;
        const spawnY = topY - 30; // Slightly above the first step
        
        const liquidParticle = this.createLiquidParticle(spawnX, spawnY, this.nextParticleIndex);
        this.liquidParticles.push(liquidParticle);
        this.nextParticleIndex++;
        
        // Add to physics world
        Matter.World.add(this.world, liquidParticle.spheres);
        Matter.World.add(this.world, liquidParticle.constraints);
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
        
        // Check each liquid particle system
        this.liquidParticles = this.liquidParticles.filter(liquidParticle => {
            // Check if the center sphere has fallen below the screen
            const centerY = liquidParticle.centerSphere.position.y;
            
            if (centerY > removalThreshold) {
                // Remove this liquid particle system from the physics world
                this.removeLiquidParticle(liquidParticle);
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
            const totalSpheres = this.liquidParticles.reduce((sum, mp) => sum + mp.spheres.length, 0);
            
            if (fpsElement) fpsElement.textContent = this.fps;
            if (particleCountElement) particleCountElement.textContent = `${this.liquidParticles.length} (${totalSpheres} spheres)`;
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

        // Render pinwheel first (behind oil particles)
        this.renderPinwheel();

        // Custom render oil particles with smooth curves
        this.renderOilParticles();

        this.updateFPS();
        
        requestAnimationFrame(() => this.animate());
    }
}