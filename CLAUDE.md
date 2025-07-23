# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This repository contains a Three.js pixelated postprocessing demo located in the `pixel_demo/` directory. The demo showcases advanced WebGL postprocessing effects with dynamic switching between realistic and pixelated rendering modes.

## Development Commands

### Running the Demo
```bash
cd pixel_demo
npm install  # Install dependencies if needed
npm start    # Start development server on http://localhost:8080
```

The demo uses ES modules with import maps for browser compatibility and serves files using the `serve` package.

## Architecture Overview

### Core Components

**Main Application (`main.js`)**
- **Rendering Pipeline**: Dual-mode rendering system that switches between `RenderPass` (realistic) and `RenderPixelatedPass` (pixelated) based on `pixelSize` parameter
- **Scene Management**: Modular setup with separate functions for lighting, scene objects, postprocessing, and controls
- **Effect Composition**: Uses Three.js `EffectComposer` with conditional pass switching via `updateRenderPasses()`

**Module Loading (`index.html`)**
- Uses import maps to resolve bare module specifiers (`'three'`) to CDN URLs
- Enables direct browser module loading without bundling

### Key Technical Details

**Conditional Rendering Logic**
- `pixelSize <= 1`: Uses normal `RenderPass` for realistic rendering
- `pixelSize > 1`: Uses `RenderPixelatedPass` with configurable edge detection
- GUI controls dynamically update the active rendering pipeline

**Dependencies**
- Three.js v0.168.0 (core library and postprocessing addons)
- lil-gui (parameter controls)
- serve (development server)

### Scene Objects Architecture
The demo creates a variety of 3D objects to showcase the pixelated effect:
- Procedural textures (checkerboard pattern via Canvas API)
- Animated geometry (rotating icosahedron, torus knot)
- Multi-material spheres with HSL color generation
- Shadow-casting setup with multiple light sources

## Module Resolution

The project uses browser-native ES modules with import maps for dependency resolution. All Three.js addons are loaded from CDN using the `three/addons/` path mapping, allowing for clean import statements without relative paths.