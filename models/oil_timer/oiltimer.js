export class OilTimer {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.glassCanvas = document.createElement('canvas');
        this.glassCtx = this.glassCanvas.getContext('2d');
        this.resizeCanvas();
        
        // Setup canvas layering
        this.setupCanvasLayers();
        
        // Matter.js setup
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        
        // Use Matter.js built-in renderer for particles only
        this.render = Matter.Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: this.canvas.width,
                height: this.canvas.height,
                wireframes: false,
                background: 'transparent',
                showAngleIndicator: false,
                showVelocity: false,
                showDebug: false,
                showStaticBodies: false // Hide physics bodies, show glass separately
            }
        });
        
        // Physics settings
        this.engine.world.gravity.y = 0.8;
        this.engine.world.gravity.x = 0;
        
        // Simulation state
        this.isFlipped = false;
        this.liquidFilterEnabled = true;
        this.particles = [];
        this.staticBodies = [];
        
        // Device orientation and acceleration
        this.deviceGravity = { x: 0, y: 0.7 };
        this.isDeviceOrientationEnabled = false;
        this.isMobileDevice = this.checkIfMobile();
        
        // Performance tracking
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 60;
        
        // Physics parameters
        this.params = {
            gravity: 0.7,
            restitution: 0.1,
            frictionAir: 0.02,
            fallFrictionAir: 0.15,
            particleSize: 10,
            particleCount: 30,
            oilColor: '#ff6b35'
        };
        
        // Liquid effect parameters
        this.liquidParams = {
            blurRadius: 7.5,
            threshold: 15,
            sharpness: 3
        };
        
        
        this.init();
        this.createWorld();
        this.setupGUI();
        this.animate();
        
        // Expose to global scope
        window.oilTimer = this;
    }
    
    setupCanvasLayers() {
        // Position glass canvas behind main canvas
        this.glassCanvas.style.position = 'absolute';
        this.glassCanvas.style.top = '0';
        this.glassCanvas.style.left = '0';
        this.glassCanvas.style.zIndex = '1';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.zIndex = '2';
        
        // Insert glass canvas before main canvas
        this.canvas.parentNode.insertBefore(this.glassCanvas, this.canvas);
    }
    
    resizeCanvas() {
        // Always use full screen regardless of device
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.glassCanvas.width = window.innerWidth;
        this.glassCanvas.height = window.innerHeight;
        
        if (this.render) {
            this.render.canvas.width = this.canvas.width;
            this.render.canvas.height = this.canvas.height;
            this.render.options.width = this.canvas.width;
            this.render.options.height = this.canvas.height;
        }
    }
    
    init() {
        // Setup Matter.js engine options
        this.engine.world.gravity.scale = 0.001;
        this.engine.enableSleeping = false;
        
        // Add mouse control
        this.mouse = Matter.Mouse.create(this.canvas);
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
        
        // Setup device orientation for mobile
        if (this.isMobileDevice) {
            this.setupDeviceOrientation();
        }
    }
    
    checkIfMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               ('ontouchstart' in window) || 
               (navigator.maxTouchPoints > 0);
    }
    
    setupDeviceOrientation() {
        // Request permission for iOS 13+
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        this.enableDeviceOrientation();
                    }
                })
                .catch(console.error);
        } else {
            // For other devices, try to enable directly
            this.enableDeviceOrientation();
        }
    }
    
    enableDeviceOrientation() {
        window.addEventListener('deviceorientation', (event) => {
            this.handleDeviceOrientation(event);
        });
        
        // Fallback to devicemotion if deviceorientation doesn't work
        window.addEventListener('devicemotion', (event) => {
            this.handleDeviceMotion(event);
        });
        
        this.isDeviceOrientationEnabled = true;
    }
    
    handleDeviceOrientation(event) {
        if (!this.isDeviceOrientationEnabled) return;
        
        // Get device orientation (beta = front-to-back tilt, gamma = left-to-right tilt)
        const beta = event.beta || 0;   // -180 to 180 degrees
        const gamma = event.gamma || 0; // -90 to 90 degrees
        
        // Convert orientation to gravity vector
        // Normalize beta and gamma to reasonable ranges for gravity
        const maxTilt = 45; // degrees
        const gravityStrength = this.params.gravity;
        
        // Calculate gravity based on device tilt
        const normalizedBeta = Math.max(-1, Math.min(1, beta / maxTilt));
        const normalizedGamma = Math.max(-1, Math.min(1, gamma / maxTilt));
        
        this.deviceGravity.x = normalizedGamma * gravityStrength;
        this.deviceGravity.y = normalizedBeta * gravityStrength;
        
        // If device is roughly upside down (beta > 90 or beta < -90), flip Y
        if (Math.abs(beta) > 90) {
            this.deviceGravity.y = -this.deviceGravity.y;
        }
        
        // Debug: Console output every 500ms to avoid spam
        if (!this.lastDebugTime || Date.now() - this.lastDebugTime > 500) {
            console.log('🔄 Device Orientation:', {
                beta: beta.toFixed(1),
                gamma: gamma.toFixed(1),
                gravityX: this.deviceGravity.x.toFixed(3),
                gravityY: this.deviceGravity.y.toFixed(3),
                isEnabled: this.isDeviceOrientationEnabled
            });
            this.lastDebugTime = Date.now();
        }
    }
    
    handleDeviceMotion(event) {
        if (!this.isDeviceOrientationEnabled || !event.accelerationIncludingGravity) return;
        
        // Use accelerometer data as fallback
        const accel = event.accelerationIncludingGravity;
        const gravityStrength = this.params.gravity;
        
        // Smooth the values and apply to gravity
        const smoothing = 0.8;
        this.deviceGravity.x = this.deviceGravity.x * smoothing + (accel.x || 0) * (1 - smoothing) * gravityStrength * 0.1;
        this.deviceGravity.y = this.deviceGravity.y * smoothing + (accel.y || 0) * (1 - smoothing) * gravityStrength * 0.1;
        
        // Debug: Console output for device motion every 500ms
        if (!this.lastMotionDebugTime || Date.now() - this.lastMotionDebugTime > 500) {
            console.log('📱 Device Motion:', {
                accelX: (accel.x || 0).toFixed(3),
                accelY: (accel.y || 0).toFixed(3),
                accelZ: (accel.z || 0).toFixed(3),
                gravityX: this.deviceGravity.x.toFixed(3),
                gravityY: this.deviceGravity.y.toFixed(3),
                isEnabled: this.isDeviceOrientationEnabled
            });
            this.lastMotionDebugTime = Date.now();
        }
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
        
        // Apply filter to main canvas only
        if (this.liquidFilterEnabled) {
            this.canvas.style.filter = 'url(#liquid-filter)';
        } else {
            this.canvas.style.filter = 'none';
        }
    }
    
    setupGUI() {
        if (typeof window.lil === 'undefined') {
            setTimeout(() => this.setupGUI(), 100);
            return;
        }
        
        const gui = new window.lil.GUI({ title: 'パラメータ' });
        
        // Physics controls
        const physicsFolder = gui.addFolder('物理パラメータ');
        physicsFolder.add(this.params, 'gravity', 0.1, 2.0, 0.1).name('重力強度');
        physicsFolder.add(this.params, 'restitution', 0.0, 0.8, 0.05).name('弾性');
        physicsFolder.add(this.params, 'frictionAir', 0.0, 0.1, 0.005).name('接地時空気抵抗');
        physicsFolder.add(this.params, 'fallFrictionAir', 0.0, 0.3, 0.01).name('落下時空気抵抗');
        physicsFolder.add(this.params, 'particleSize', 3, 12, 1).name('粒子サイズ');
        physicsFolder.add(this.params, 'particleCount', 10, 150, 10).name('粒子数').onChange(() => {
            this.createOilParticles();
        });
        physicsFolder.open();
        
        // Liquid effect controls
        const liquidFolder = gui.addFolder('流体表現');
        liquidFolder.add(this, 'liquidFilterEnabled').name('流体効果 ON/OFF').onChange(() => {
            this.updateLiquidFilter();
        });
        liquidFolder.add(this.liquidParams, 'blurRadius', 0, 10, 0.5).name('ブラー半径').onChange(() => {
            this.updateLiquidFilter();
        });
        liquidFolder.add(this.liquidParams, 'threshold', 0, 20, 1).name('結合閾値').onChange(() => {
            this.updateLiquidFilter();
        });
        liquidFolder.add(this.liquidParams, 'sharpness', 0, 5, 0.5).name('シャープネス').onChange(() => {
            this.updateLiquidFilter();
        });
        liquidFolder.open();
        
        // Visual controls
        const visualFolder = gui.addFolder('視覚効果');
        visualFolder.addColor(this.params, 'oilColor').name('オイル色');
        visualFolder.open();
        
        // Control buttons
        const controlFolder = gui.addFolder('制御');
        controlFolder.add(this, 'reset').name('リセット');
        
        // Show flip button only for non-mobile devices
        if (!this.isMobileDevice) {
            controlFolder.add(this, 'flip').name('反転');
        } else {
            // Add device orientation toggle for mobile
            controlFolder.add(this, 'toggleDeviceOrientation').name('加速度センサー');
        }
        
        controlFolder.open();
        
        gui.open();
    }
    
    createWorld() {
        // Clear existing bodies
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        
        // Re-add mouse constraint
        Matter.World.add(this.world, this.mouseConstraint);
        
        this.particles = [];
        this.staticBodies = [];
        
        // Create glass container structure
        this.createGlassStructure();
        
        // Create oil particles
        this.createOilParticles();
        
        // Render glass structure on separate canvas
        this.renderGlassStructure();
        
        console.log(`Created ${this.particles.length} particles and ${this.staticBodies.length} static bodies`);
    }
    
    createGlassStructure() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const thickness = 20;
        
        // Container dimensions - responsive width
        const isMobile = width < 768;
        const containerWidth = isMobile ? width * 0.9 : width * 0.35;
        const containerX = (width - containerWidth) / 2;
        
        // Container boundaries (invisible)
        const boundaries = [
            Matter.Bodies.rectangle(-thickness, height/2, thickness, height, { isStatic: true, render: { visible: false } }),
            Matter.Bodies.rectangle(width + thickness, height/2, thickness, height, { isStatic: true, render: { visible: false } }),
            Matter.Bodies.rectangle(width/2, height + thickness, width, thickness, { isStatic: true, render: { visible: false } }),
            Matter.Bodies.rectangle(width/2, -thickness, width, thickness, { isStatic: true, render: { visible: false } })
        ];
        Matter.World.add(this.world, boundaries);
        
        const glassWalls = [];
        
        // Main container walls - left, right, top, bottom
        glassWalls.push(
            // Left wall
            Matter.Bodies.rectangle(containerX - thickness/2, height/2, thickness, height, { isStatic: true, render: { visible: false } }),
            // Right wall
            Matter.Bodies.rectangle(containerX + containerWidth + thickness/2, height/2, thickness, height, { isStatic: true, render: { visible: false } }),
            // Top wall
            Matter.Bodies.rectangle(containerX + containerWidth/2, thickness/2, containerWidth, thickness, { isStatic: true, render: { visible: false } }),
            // Bottom wall
            Matter.Bodies.rectangle(containerX + containerWidth/2, height - thickness/2, containerWidth, thickness, { isStatic: true, render: { visible: false } })
        );
        
        // Create plates based on stair type
        this.createStairPlates(glassWalls, containerX, containerWidth, thickness, height);
        
        // Create inverted plates for display only when gravity is flipped
        this.createInvertedStairPlates(glassWalls, containerX, containerWidth, thickness, height);
        
        this.staticBodies = glassWalls;
        Matter.World.add(this.world, glassWalls);
    }
    
    createStairPlates(glassWalls, containerX, containerWidth, thickness, height) {
        const plateCount = 4;
        const middleStart = thickness * 2;
        const middleEnd = height - thickness * 2;
        const middleHeight = middleEnd - middleStart;
        
        // Add spacing between plates (about 1 oil particle size)
        const plateSpacing = this.params.particleSize * 2;
        const availableHeight = middleHeight - (plateSpacing * (plateCount - 1));
        const plateVerticalSpacing = availableHeight / (plateCount + 1);
        const particleGap = this.params.particleSize * 5;
        const plateLength = containerWidth - particleGap;
        const plateThickness = thickness * 0.6;
        
        // Stair type - step-like structure with 3 degree incline
        const stepAngle = 0.052; // 3 degrees
        const stepHeight = 20;
        
        for (let i = 0; i < plateCount; i++) {
            const baseY = middleStart + (i + 1) * plateVerticalSpacing + (i * plateSpacing);
            const isLeftOriented = i % 2 === 0;
            
            // Create steps with clear height differences
            const stepsPerPlate = 5;
            const stepWidth = plateLength / stepsPerPlate;
            
            for (let j = 0; j < stepsPerPlate; j++) {
                let stepX, stepY;
                
                // Calculate step position with proper height progression
                if (isLeftOriented) {
                    stepX = containerX + stepWidth * (j + 0.5);
                    stepY = baseY - (stepHeight * (stepsPerPlate - 1) / 2) + (j * stepHeight);
                } else {
                    stepX = containerX + containerWidth - stepWidth * (j + 0.5);
                    stepY = baseY - (stepHeight * (stepsPerPlate - 1) / 2) + (j * stepHeight);
                }
                
                // Step surface with 3 degree incline
                const stepSurface = Matter.Bodies.rectangle(stepX, stepY, stepWidth, plateThickness, {
                    isStatic: true,
                    angle: isLeftOriented ? stepAngle : -stepAngle,
                    render: { visible: false },
                    collisionFilter: { mask: 0x0001 },
                    isInverted: false
                });
                glassWalls.push(stepSurface);
                
                // Vertical step riser between steps
                if (j < stepsPerPlate - 1) {
                    const currentStepY = baseY - (stepHeight * (stepsPerPlate - 1) / 2) + (j * stepHeight);
                    const riserHeight = stepHeight;
                    const riserX = isLeftOriented ? stepX + stepWidth/2 : stepX - stepWidth/2;
                    const riserY = currentStepY + stepHeight/2;
                    
                    const stepRiser = Matter.Bodies.rectangle(riserX, riserY, plateThickness, riserHeight, {
                        isStatic: true,
                        angle: 0,
                        render: { visible: false },
                        collisionFilter: { mask: 0x0001 },
                        isInverted: false
                    });
                    glassWalls.push(stepRiser);
                }
            }
        }
    }
    
    createInvertedStairPlates(glassWalls, containerX, containerWidth, thickness, height) {
        const plateCount = 4;
        const middleStart = thickness * 2;
        const middleEnd = height - thickness * 2;
        const middleHeight = middleEnd - middleStart;
        
        // Add spacing between plates (about 1 oil particle size) - same as normal stairs
        const plateSpacing = this.params.particleSize * 2;
        const availableHeight = middleHeight - (plateSpacing * (plateCount - 1));
        const plateVerticalSpacing = availableHeight / (plateCount + 1);
        const particleGap = this.params.particleSize * 5;
        const plateLength = containerWidth - particleGap;
        const plateThickness = thickness * 0.6;
        
        // Inverted stair type - opposite wall connection and reversed slope for upward flow
        const stepAngle = 0.052; // 3 degrees
        const stepHeight = 20;
        
        for (let i = 0; i < plateCount; i++) {
            const baseY = middleStart + (i + 1) * plateVerticalSpacing + (i * plateSpacing);
            const isLeftOriented = i % 2 === 0;
            
            const stepsPerPlate = 5;
            const stepWidth = plateLength / stepsPerPlate;
            
            for (let j = 0; j < stepsPerPlate; j++) {
                let stepX, stepY;
                
                // Switch wall connection and reverse the step direction
                if (isLeftOriented) {
                    // Original left -> move to right wall, but reverse step order
                    stepX = containerX + containerWidth - stepWidth * (stepsPerPlate - j - 0.5);
                    stepY = baseY - (stepHeight * (stepsPerPlate - 1) / 2) + (j * stepHeight);
                } else {
                    // Original right -> move to left wall, but reverse step order
                    stepX = containerX + stepWidth * (stepsPerPlate - j - 0.5);
                    stepY = baseY - (stepHeight * (stepsPerPlate - 1) / 2) + (j * stepHeight);
                }
                
                const stepSurface = Matter.Bodies.rectangle(stepX, stepY, stepWidth, plateThickness, {
                    isStatic: true,
                    angle: isLeftOriented ? stepAngle : -stepAngle, // Back to original slope direction (left to right down)
                    render: { visible: false },
                    collisionFilter: { mask: 0x0000 },
                    isInverted: true
                });
                glassWalls.push(stepSurface);
                
                // Step riser positioned between current and next step (for reversed step order)
                if (j < stepsPerPlate - 1) {
                    const currentStepY = baseY - (stepHeight * (stepsPerPlate - 1) / 2) + (j * stepHeight);
                    const nextStepY = baseY - (stepHeight * (stepsPerPlate - 1) / 2) + ((j + 1) * stepHeight);
                    const riserHeight = stepHeight;
                    
                    // Calculate next step position for proper riser placement
                    let nextStepX;
                    if (isLeftOriented) {
                        nextStepX = containerX + containerWidth - stepWidth * (stepsPerPlate - (j + 1) - 0.5);
                    } else {
                        nextStepX = containerX + stepWidth * (stepsPerPlate - (j + 1) - 0.5);
                    }
                    
                    // Position riser between current and next step
                    const riserX = (stepX + nextStepX) / 2;
                    const riserY = (currentStepY + nextStepY) / 2;
                    
                    const stepRiser = Matter.Bodies.rectangle(riserX, riserY, plateThickness, riserHeight, {
                        isStatic: true,
                        angle: 0, // Keep risers vertical
                        render: { visible: false },
                        collisionFilter: { mask: 0x0000 },
                        isInverted: true
                    });
                    glassWalls.push(stepRiser);
                }
            }
        }
    }
    
    renderGlassStructure() {
        // Clear glass canvas
        this.glassCtx.fillStyle = '#000000';
        this.glassCtx.fillRect(0, 0, this.glassCanvas.width, this.glassCanvas.height);
        
        // Render glass bodies
        this.staticBodies.forEach(body => {
            this.renderGlassBody(body);
        });
    }
    
    renderGlassBody(body) {
        // Check if this body should be rendered as gray (inactive)
        const isInactive = (this.isFlipped && !body.isInverted) || (!this.isFlipped && body.isInverted);
        
        // Glass appearance - white for active, dark gray for inactive
        if (isInactive && body.isInverted !== undefined) {
            this.glassCtx.fillStyle = 'rgba(64, 64, 64, 0.15)';
            this.glassCtx.strokeStyle = 'rgba(64, 64, 64, 0.6)';
            this.glassCtx.lineWidth = 1;
        } else {
            this.glassCtx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.glassCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.glassCtx.lineWidth = 2;
        }
        
        // Use the actual vertices coordinates directly (already in world space)
        const vertices = body.vertices;
        if (vertices.length > 0) {
            this.glassCtx.beginPath();
            this.glassCtx.moveTo(vertices[0].x, vertices[0].y);
            for (let i = 1; i < vertices.length; i++) {
                this.glassCtx.lineTo(vertices[i].x, vertices[i].y);
            }
            this.glassCtx.closePath();
            this.glassCtx.fill();
            this.glassCtx.stroke();
            
            // Add glass highlight
            this.glassCtx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            this.glassCtx.lineWidth = 1;
            this.glassCtx.stroke();
        }
    }
    
    createOilParticles() {
        // Remove existing particles
        if (this.particles.length > 0) {
            Matter.World.remove(this.world, this.particles);
        }
        
        this.particles = [];
        const isMobile = this.canvas.width < 768;
        const containerWidth = isMobile ? this.canvas.width * 0.9 : this.canvas.width * 0.35;
        const containerX = (this.canvas.width - containerWidth) / 2;
        
        // Create initial particles in top 10% of container
        for (let i = 0; i < this.params.particleCount; i++) {
            const x = containerX + 25 + Math.random() * (containerWidth - 50);
            const y = 25 + Math.random() * (this.canvas.height * 0.1);
            
            const particle = Matter.Bodies.circle(x, y, this.params.particleSize, {
                restitution: this.params.restitution,
                friction: 0, // 地面摩擦を明示的に0に設定
                frictionAir: this.params.frictionAir,
                density: 0.002,
                render: {
                    fillStyle: this.params.oilColor,
                    strokeStyle: 'transparent',
                    lineWidth: 0
                }
            });
            
            this.particles.push(particle);
        }
        
        Matter.World.add(this.world, this.particles);
    }
    
    
    updatePhysics() {
        // Update gravity based on device orientation (mobile) or manual flip (desktop)
        if (this.isMobileDevice && this.isDeviceOrientationEnabled) {
            // Use device orientation for mobile
            this.engine.world.gravity.x = this.deviceGravity.x;
            this.engine.world.gravity.y = this.deviceGravity.y;
            
            // Debug: Show applied gravity values every 1000ms
            if (!this.lastAppliedGravityDebugTime || Date.now() - this.lastAppliedGravityDebugTime > 1000) {
                console.log('⚡ Applied Gravity:', {
                    worldGravityX: this.engine.world.gravity.x.toFixed(3),
                    worldGravityY: this.engine.world.gravity.y.toFixed(3),
                    deviceGravityX: this.deviceGravity.x.toFixed(3),
                    deviceGravityY: this.deviceGravity.y.toFixed(3),
                    isMobile: this.isMobileDevice,
                    isOrientationEnabled: this.isDeviceOrientationEnabled
                });
                this.lastAppliedGravityDebugTime = Date.now();
            }
        } else {
            // Use manual flip for desktop
            this.engine.world.gravity.x = 0;
            this.engine.world.gravity.y = this.isFlipped ? -this.params.gravity : this.params.gravity;
        }
        
        // Update particle properties
        this.particles.forEach(particle => {
            // Update visual properties
            if (particle.render) {
                particle.render.fillStyle = this.params.oilColor;
            }
            
            // Update physics properties
            particle.restitution = this.params.restitution;
            particle.friction = 0; // 地面摩擦を明示的に0に設定
            
            // Check if particle is in contact with any static body (grounded)
            const isGrounded = this.isParticleGrounded(particle);
            
            // Apply different air friction based on grounded state
            particle.frictionAir = isGrounded ? this.params.frictionAir : this.params.fallFrictionAir;
            
            // Scale particle if size changed
            const currentRadius = particle.circleRadius || this.params.particleSize;
            if (Math.abs(currentRadius - this.params.particleSize) > 0.1) {
                const scale = this.params.particleSize / currentRadius;
                Matter.Body.scale(particle, scale, scale);
                particle.circleRadius = this.params.particleSize;
            }
        });
    }
    
    isParticleGrounded(particle) {
        // Check actual collision contacts using Matter.js pairs
        const pairs = this.engine.pairs.list;
        
        for (let pair of pairs) {
            if (!pair.isActive) continue;
            
            // Check if this particle is involved in a collision
            if (pair.bodyA === particle || pair.bodyB === particle) {
                const otherBody = pair.bodyA === particle ? pair.bodyB : pair.bodyA;
                
                // Check if the other body is a static body (wall or step)
                if (otherBody.isStatic) {
                    // Additional check: ensure the collision is actually happening (not just near)
                    if (pair.contacts && pair.contacts.length > 0) {
                        return true;
                    }
                }
            }
        }
        
        // Fallback: also check with other particles for particle-to-particle contact
        for (let otherParticle of this.particles) {
            if (otherParticle === particle) continue;
            
            const dx = particle.position.x - otherParticle.position.x;
            const dy = particle.position.y - otherParticle.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = particle.circleRadius + otherParticle.circleRadius;
            
            // If touching another particle, consider it grounded
            if (distance < minDistance + 2) {
                return true;
            }
        }
        
        return false;
    }
    
    toggleDeviceOrientation() {
        if (this.isMobileDevice) {
            if (this.isDeviceOrientationEnabled) {
                this.isDeviceOrientationEnabled = false;
                // Reset to default gravity when disabled
                this.deviceGravity = { x: 0, y: this.params.gravity };
            } else {
                this.setupDeviceOrientation();
            }
        }
    }
    
    reset() {
        this.createWorld();
    }
    
    flip() {
        this.isFlipped = !this.isFlipped;
        
        // Switch physics and visibility of normal and inverted plates
        this.staticBodies.forEach(body => {
            if (body.isInverted !== undefined) {
                if (this.isFlipped) {
                    // When flipped, use inverted plates for physics, normal plates for display only
                    if (body.isInverted) {
                        // Inverted plates: enable physics, invisible (will show on glass canvas)
                        body.render.visible = false;
                        body.collisionFilter.mask = 0x0001; // Enable physics collision
                    } else {
                        // Normal plates: disable physics, show as gray display only
                        body.render.visible = false;
                        body.collisionFilter.mask = 0x0000; // Disable physics collision
                    }
                } else {
                    // When normal, use normal plates for physics, inverted plates for display only
                    if (body.isInverted) {
                        // Inverted plates: disable physics, show as gray display only
                        body.render.visible = false;
                        body.collisionFilter.mask = 0x0000; // Disable physics collision
                    } else {
                        // Normal plates: enable physics, invisible (will show on glass canvas)
                        body.render.visible = false;
                        body.collisionFilter.mask = 0x0001; // Enable physics collision
                    }
                }
            }
        });
        
        // Add some impulse to particles when flipping
        this.particles.forEach(particle => {
            const impulse = {
                x: (Math.random() - 0.5) * 0.02,
                y: this.isFlipped ? -0.02 : 0.02
            };
            Matter.Body.applyForce(particle, particle.position, impulse);
        });
        
        // Update glass display
        this.renderGlassStructure();
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
            
            if (fpsElement) fpsElement.textContent = this.fps;
            if (particleCountElement) particleCountElement.textContent = this.particles.length;
        }
    }
    
    animate() {
        
        
        this.updatePhysics();
        
        // Update Matter.js engine
        Matter.Engine.update(this.engine, 1000 / 60);
        
        // Clear main canvas background
        const ctx = this.canvas.getContext('2d');
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Render particles only (glass is on separate canvas)
        Matter.Render.world(this.render);
        
        this.updateFPS();
        
        requestAnimationFrame(() => this.animate());
    }
}