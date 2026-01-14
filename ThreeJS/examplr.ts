<script type="module">
    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
    import { createNoise2D, createNoise3D, createNoise4D } from 'simplex-noise';

    // Global variables
    let scene, camera, renderer, controls;
    let planetSystem, planet, clouds, rings, moons = [];
    let stars = [];
    let planetInfo = {};

    // Noise generators
    let noise2D, noise3D, noise4D;

    // Initialize
    init();

    // Initialization function
    function init() {
      // Create noise generators
      noise2D = createNoise2D();
      noise3D = createNoise3D();
      noise4D = createNoise4D();

      // Create scene
      scene = new THREE.Scene();

      // Create camera
      camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 2000);
      camera.position.z = 5;

      // Create renderer
      renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      // Add renderer to DOM
      document.getElementById('canvas').appendChild(renderer.domElement);

      // Create controls
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 2;
      controls.maxDistance = 20;

      // Add ambient light and directional light
      const ambientLight = new THREE.AmbientLight(0x333333);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xffffff, 3);
      sunLight.position.set(5, 3, 5);
      scene.add(sunLight);

      // Create starry background
      createStarBackground();

      // Create planet system container
      planetSystem = new THREE.Object3D();
      scene.add(planetSystem);

      // Generate initial planet
      generatePlanet();

      // Event listeners
      window.addEventListener('resize', onWindowResize);
      window.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
          regeneratePlanet();
        }
      });

      // Add double-click event listener
      window.addEventListener('dblclick', (e) => {
          regeneratePlanet();
      });

      // Add generate button click listener
      document.getElementById('generate-btn').addEventListener('click', () => {
          regeneratePlanet();
      });

      // Add export button click listener
      document.getElementById('export-btn').addEventListener('click', showExportConfirmation);

      // Add confirmation dialog listeners
      document.getElementById('confirm-export').addEventListener('click', () => {
        hideExportConfirmation();
        exportPlanetModel();
      });

      document.getElementById('cancel-export').addEventListener('click', hideExportConfirmation);

      // Hide loading prompt
      setTimeout(() => {
        document.getElementById('loading').style.display = 'none';
      }, 1000);

      // Start animation loop
      animate();
    }

    // Show export confirmation dialog
    function showExportConfirmation() {
      document.getElementById('confirmation-dialog').style.display = 'block';
    }

    // Hide export confirmation dialog
    function hideExportConfirmation() {
      document.getElementById('confirmation-dialog').style.display = 'none';
    }

    // Export planet model as GLB
    function exportPlanetModel() {
      const clone = planetSystem.clone(true);
      clone.traverse(obj => {
        // Hide orbit lines
        if(obj.type === 'Line') {
          obj.visible = false;
        }
        
        // Handle materials conversion
        if(obj.material) {
          // Handle ShaderMaterial for clouds
          if(obj.material.type === 'ShaderMaterial') {            
            // For cloud layer (has alpha uniform)
            if(obj.material.uniforms && obj.material.uniforms.alpha) {
              const cloudMaterial = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: 0.6,
                roughness: 0.3,
                metalness: 0.1
              });
              obj.material = cloudMaterial;
            }
            // For rings (has baseColor uniform)
            else if(obj.material.uniforms && obj.material.uniforms.baseColor) {
              const ringColor = obj.material.uniforms.baseColor.value;
              const ringMaterial = new THREE.MeshStandardMaterial({
                color: ringColor,
                transparent: true,
                opacity: 0.7,
                roughness: 0.5,
                metalness: 0.2,
                side: THREE.DoubleSide
              });
              obj.material = ringMaterial;
            }
            // Generic fallback for other shader materials
            else {
              const genericMaterial = new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                transparent: true,
                opacity: 0.8,
                roughness: 0.5,
                metalness: 0.2
              });
              obj.material = genericMaterial;
            }
          }
        }
      });

      const exportScene = new THREE.Scene();
      exportScene.add(clone);
      
      const exporter = new GLTFExporter();
      
      try {
        exporter.parse(
          exportScene,
          (glbArrayBuffer) => {
            if(glbArrayBuffer instanceof ArrayBuffer && glbArrayBuffer.byteLength > 1000) {
              saveArrayBuffer(glbArrayBuffer, `${planetInfo.name}.glb`);
              console.log("Export successful! File size:", Math.round(glbArrayBuffer.byteLength / 1024), "KB");
            } else {
              console.error("Export failed: Invalid or too small model data", glbArrayBuffer);
            }
          },
          (error) => {
            console.error("Export error:", error);
          },
          { binary: true }
        );
      } catch(err) {
        console.error("Export exception:", err);
      }
    }

    // Helper function to save array buffer as file
    function saveArrayBuffer(buffer, filename) {
      const blob = new Blob([buffer], { type: 'application/octet-stream' });
      saveBlob(blob, filename);
    }

    // Helper function to save blob as file
    function saveBlob(blob, filename) {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      // Release URL object
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }

    // Create starry background
    function createStarBackground() {
      const starCount = 2000;
      const starGeometry = new THREE.BufferGeometry();
      const starPositions = [];
      const starColors = [];

      for (let i = 0; i < starCount; i++) {
        // Randomly distribute stars on a sphere
        const theta = 2 * Math.PI * Math.random();
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 800 + Math.random() * 200;

        const x = radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.sin(phi) * Math.sin(theta);
        const z = radius * Math.cos(phi);

        starPositions.push(x, y, z);

        // Random star colors
        const colorChoice = Math.random();
        let color;

        if (colorChoice < 0.6) {
          // White/blue-white stars
          const blueWhite = 0.8 + Math.random() * 0.2;
          color = new THREE.Color(blueWhite, blueWhite, 1);
        } else if (colorChoice < 0.8) {
          // Yellow stars
          color = new THREE.Color(1, 0.9, 0.6);
        } else if (colorChoice < 0.95) {
          // Red stars
          color = new THREE.Color(1, 0.5 + Math.random() * 0.3, 0.5);
        } else {
          // Blue stars
          color = new THREE.Color(0.5, 0.7, 1);
        }

        starColors.push(color.r, color.g, color.b);
      }

      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
      starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

      const starMaterial = new THREE.PointsMaterial({
        size: 1.5,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
      });

      stars = new THREE.Points(starGeometry, starMaterial);
      scene.add(stars);
    }

    // Generate random planet
    function generatePlanet() {
      // Clear previous planet system
      while (planetSystem.children.length > 0) {
        const object = planetSystem.children[0];
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
        planetSystem.remove(object);
      }

      moons = [];

      // Random planet features
      planetInfo = {
        name: generatePlanetName(),
        radius: 1 + Math.random() * 0.5,
        rotationSpeed: 0.001 + Math.random() * 0.002,
        hasRings: Math.random() < 0.3,
        hasClouds: Math.random() < 0.7,
        hasOcean: Math.random() < 0.6,
        moonCount: Math.floor(Math.random() * 4),
        type: getPlanetType(),
        seed: Math.random() * 1000
      };

      // Create planet base
      createPlanetBase();

      // If has ocean, add ocean layer
      if (planetInfo.hasOcean) {
        createOcean();
      }

      // If has clouds, add cloud layer
      if (planetInfo.hasClouds) {
        createClouds();
      }

      // If has rings, add planetary rings
      if (planetInfo.hasRings) {
        createRings();
      }

      // Add satellites (moons)
      createMoons();

      // Display planet information
      displayPlanetInfo();
    }

    // Generate planet name
    function generatePlanetName() {
      const prefixes = ["New", "Alpha", "Beta", "Gamma", "Delta", "Terra", "Omega", "Ceres", "Nibu", "Astra", "Kronos", "Zeta", "Kuiper", "Hayden", "Olymp", "Plato", "Zeus", "Carmen"];
      const suffixes = ["I", "II", "III", "IV", "V", "Star", "World", "Planet", "Particle", "Sun", "b", "c", "d", "α", "β", "γ"];

      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

      return `${prefix}-${suffix}`;
    }

    // Get planet type
    function getPlanetType() {
      const types = [
        { name: "Rocky Planet", prob: 0.3 },
        { name: "Ice Planet", prob: 0.2 },
        { name: "Gas Giant", prob: 0.2 },
        { name: "Lava Planet", prob: 0.1 },
        { name: "Ocean Planet", prob: 0.15 },
        { name: "Desert Planet", prob: 0.05 }
      ];

      const rand = Math.random();
      let cumProb = 0;

      for (const type of types) {
        cumProb += type.prob;
        if (rand < cumProb) {
          return type.name;
        }
      }

      return types[0].name; // Default to first type
    }

    // Create planet base
    function createPlanetBase() {
      // Set color and material based on planet type
      let baseColor, highlightColor, lowlightColor, roughness, metalness;

      switch (planetInfo.type) {
        case "Rocky Planet":
          baseColor = new THREE.Color(0.6 + Math.random() * 0.3, 0.4 + Math.random() * 0.3, 0.3 + Math.random() * 0.3);
          highlightColor = new THREE.Color(baseColor.r + 0.2, baseColor.g + 0.2, baseColor.b + 0.1);
          lowlightColor = new THREE.Color(baseColor.r - 0.2, baseColor.g - 0.2, baseColor.b - 0.1);
          roughness = 0.8;
          metalness = 0.1;
          break;
        case "Ice Planet":
          baseColor = new THREE.Color(0.8 + Math.random() * 0.2, 0.8 + Math.random() * 0.2, 0.9 + Math.random() * 0.1);
          highlightColor = new THREE.Color(0.9, 0.9, 1.0);
          lowlightColor = new THREE.Color(0.6, 0.7, 0.8);
          roughness = 0.5;
          metalness = 0.3;
          break;
        case "Gas Giant":
          baseColor = new THREE.Color(0.4 + Math.random() * 0.3, 0.4 + Math.random() * 0.5, 0.6 + Math.random() * 0.4);
          highlightColor = new THREE.Color(baseColor.r + 0.1, baseColor.g + 0.2, baseColor.b + 0.2);
          lowlightColor = new THREE.Color(baseColor.r - 0.1, baseColor.g - 0.1, baseColor.b - 0.2);
          roughness = 0.3;
          metalness = 0.2;
          break;
        case "Lava Planet":
          baseColor = new THREE.Color(0.7 + Math.random() * 0.3, 0.3 + Math.random() * 0.2, 0.2);
          highlightColor = new THREE.Color(1.0, 0.6, 0.0);
          lowlightColor = new THREE.Color(0.5, 0.1, 0.0);
          roughness = 0.7;
          metalness = 0.4;
          break;
        case "Ocean Planet":
          baseColor = new THREE.Color(0.2, 0.4 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
          highlightColor = new THREE.Color(0.3, 0.6, 0.9);
          lowlightColor = new THREE.Color(0.1, 0.2, 0.4);
          roughness = 0.4;
          metalness = 0.3;
          break;
        case "Desert Planet":
          baseColor = new THREE.Color(0.8 + Math.random() * 0.2, 0.7 + Math.random() * 0.2, 0.4 + Math.random() * 0.3);
          highlightColor = new THREE.Color(1.0, 0.9, 0.6);
          lowlightColor = new THREE.Color(0.6, 0.5, 0.3);
          roughness = 0.9;
          metalness = 0.0;
          break;
        default:
          baseColor = new THREE.Color(0.5, 0.5, 0.5);
          highlightColor = new THREE.Color(0.7, 0.7, 0.7);
          lowlightColor = new THREE.Color(0.3, 0.3, 0.3);
          roughness = 0.5;
          metalness = 0.2;
      }

      // Create planet geometry
      const resolution = 128; // Terrain resolution
      const geometry = new THREE.IcosahedronGeometry(planetInfo.radius, 8);

      // Generate height map and vertex colors
      const positions = geometry.attributes.position;
      const vertexCount = positions.count;

      // Create vertex color array
      const colors = new Float32Array(vertexCount * 3);
      const seed = planetInfo.seed;

      // Maximum height variation
      const heightScale = 0.1 + Math.random() * 0.1;

      // Iterate through all vertices, apply noise and color
      for (let i = 0; i < vertexCount; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const z = positions.getZ(i);

        // Normalize position to get direction
        const nx = x / planetInfo.radius;
        const ny = y / planetInfo.radius;
        const nz = z / planetInfo.radius;

        // Apply multi-layer noise to create complex terrain
        let frequency = 1.0;
        let noise = 0;
        let amplitude = 1.0;

        for (let octave = 0; octave < 4; octave++) {
          const noiseValue = noise3D(
            nx * frequency + seed, 
            ny * frequency + seed, 
            nz * frequency + seed
          ) * 0.5 + 0.5;

          noise += noiseValue * amplitude;
          amplitude *= 0.5;
          frequency *= 2.0;
        }

        // If gas giant, apply banded pattern
        if (planetInfo.type === "Gas Giant") {
          const latitudeBands = 5 + Math.floor(Math.random() * 7);
          const latitude = Math.acos(ny) / Math.PI;
          const bandPattern = Math.sin(latitude * Math.PI * latitudeBands);
          noise = noise * 0.7 + bandPattern * 0.3;
        }

        // Color interpolation based on noise
        let color;
        if (noise > 0.6) {
          // Highlands
          color = highlightColor;
        } else if (noise < 0.4) {
          // Lowlands
          color = lowlightColor;
        } else {
          // Mid-terrain
          const t = (noise - 0.4) / 0.2;
          color = new THREE.Color(
            baseColor.r * (1 - t) + highlightColor.r * t,
            baseColor.g * (1 - t) + highlightColor.g * t,
            baseColor.b * (1 - t) + highlightColor.b * t
          );
        }

        // If has ocean, adjust color to make lowlands darker
        if (planetInfo.hasOcean && noise < 0.5) {
          color = lowlightColor;
        }

        // Store color in array
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        // Apply height variation
        const heightOffset = (noise - 0.5) * heightScale;
        const magnitude = Math.sqrt(x*x + y*y + z*z);
        const factor = (planetInfo.radius + heightOffset) / magnitude;

        // Apply height distortion
        positions.setXYZ(
          i,
          x * factor,
          y * factor,
          z * factor
        );
      }

      // Add color attribute to geometry
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Update normals
      geometry.computeVertexNormals();

      // Create material
      const material = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: roughness,
        metalness: metalness,
        flatShading: planetInfo.type !== "Gas Giant" // Gas giants use smooth shading
      });

      // Create planet mesh
      planet = new THREE.Mesh(geometry, material);
      planetSystem.add(planet);
    }

    // Create ocean layer
    function createOcean() {
      const oceanColor = getPlanetOceanColor();
      const oceanGeometry = new THREE.IcosahedronGeometry(planetInfo.radius * 1.001, 6);

      const oceanMaterial = new THREE.MeshPhysicalMaterial({
        color: oceanColor,
        roughness: 0.1,
        metalness: 0.0,
        transmission: 0.95,
        ior: 1.4,
        thickness: 0.2,
        envMapIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        opacity: 0.85,
      });

      const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);

      // Adjust ocean surface based on height map
      const positions = planet.geometry.attributes.position;
      const oceanPositions = oceanGeometry.attributes.position;
      const vertexCount = oceanPositions.count;

      const oceanLevel = 0.45; // Ocean level height threshold

      for (let i = 0; i < vertexCount; i++) {
        const x = oceanPositions.getX(i);
        const y = oceanPositions.getY(i);
        const z = oceanPositions.getZ(i);

        // Normalize direction
        const direction = new THREE.Vector3(x, y, z).normalize();

        // Find the closest point on the original planet
        let minDistance = Infinity;
        let closestIndex = 0;

        for (let j = 0; j < positions.count; j++) {
          const px = positions.getX(j);
          const py = positions.getY(j);
          const pz = positions.getZ(j);

          const planetDirection = new THREE.Vector3(px, py, pz).normalize();
          const distance = direction.distanceTo(planetDirection);

          if (distance < minDistance) {
            minDistance = distance;
            closestIndex = j;
          }
        }

        // Get height of the point on the original planet
        const px = positions.getX(closestIndex);
        const py = positions.getY(closestIndex);
        const pz = positions.getZ(closestIndex);

        const magnitude = Math.sqrt(px*px + py*py + pz*pz);
        const heightFactor = magnitude / planetInfo.radius;

        // Ocean only covers areas below a certain height
        if (heightFactor < 1 + oceanLevel * 0.1) {
          oceanPositions.setXYZ(i, x, y, z);
        } else {
          // If above sea level, let the ocean surface sink
          const factor = (planetInfo.radius * 0.998) / Math.sqrt(x*x + y*y + z*z);
          oceanPositions.setXYZ(i, x * factor, y * factor, z * factor);
        }
      }

      // Update geometry
      oceanGeometry.computeVertexNormals();
      oceanMaterial.needsUpdate = true;

      planetSystem.add(ocean);
    }

    // Get planet ocean color
    function getPlanetOceanColor() {
      const type = planetInfo.type;

      if (type === "Ocean Planet") {
        // Blue ocean
        return new THREE.Color(0.0, 0.3 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
      } else if (type === "Ice Planet") {
        // Ice blue ocean
        return new THREE.Color(0.7, 0.8, 0.9 + Math.random() * 0.1);
      } else if (type === "Lava Planet") {
        // Orange-red lava
        return new THREE.Color(0.9 + Math.random() * 0.1, 0.3 + Math.random() * 0.2, 0.1);
      } else {
        // Default blue
        return new THREE.Color(0.1, 0.3, 0.6 + Math.random() * 0.4);
      }
    }

    // Create cloud layer
    function createClouds() {
      const cloudsGeometry = new THREE.IcosahedronGeometry(planetInfo.radius * 1.02, 6);
      const vertexCount = cloudsGeometry.attributes.position.count;

      // Cloud layer colors and alpha arrays
      const cloudColors = new Float32Array(vertexCount * 3);
      const cloudAlpha = new Float32Array(vertexCount);
      const seed = planetInfo.seed + 100;

      // Cloud base color based on planet type
      let cloudBaseColor;

      switch (planetInfo.type) {
        case "Gas Giant":
          cloudBaseColor = new THREE.Color(0.95, 0.95, 1.0);
          break;
        case "Lava Planet":
          cloudBaseColor = new THREE.Color(0.7, 0.3, 0.2);
          break;
        default:
          cloudBaseColor = new THREE.Color(0.9, 0.9, 0.95);
      }

      // Iterate through cloud vertices, apply noise
      for (let i = 0; i < vertexCount; i++) {
        const position = new THREE.Vector3(
          cloudsGeometry.attributes.position.getX(i),
          cloudsGeometry.attributes.position.getY(i),
          cloudsGeometry.attributes.position.getZ(i)
        );

        // Normalize direction
        position.normalize();

        // Cloud noise
        let frequency = 2.0;
        let noiseValue = 0;
        let amplitude = 1.0;

        for (let octave = 0; octave < 4; octave++) {
          const value = noise3D(
            position.x * frequency + seed,
            position.y * frequency + seed,
            position.z * frequency + seed
          ) * 0.5 + 0.5;

          noiseValue += value * amplitude;
          amplitude *= 0.5;
          frequency *= 2.0;
        }

        // Add large-scale cloud formations
        const largeClouds = noise2D(position.x * 0.5 + seed, position.y * 0.5 + seed) * 0.5 + 0.5;
        noiseValue = noiseValue * 0.6 + largeClouds * 0.4;

        // Apply latitude variation - fewer clouds near poles
        const latitude = Math.acos(position.y / position.length()) / Math.PI;
        const latitudeFactor = Math.sin(latitude * Math.PI); // Most at equator, least at poles

        // Calculate cloud density
        const cloudDensity = Math.pow(noiseValue, 1.5) * latitudeFactor;

        // Set alpha (cloud density)
        const cloudThreshold = 0.5 + Math.random() * 0.1;
        const alpha = cloudDensity > cloudThreshold ? 
                      Math.min(1.0, (cloudDensity - cloudThreshold) * 5) : 
                      0;

        // Save color and alpha
        cloudColors[i * 3] = cloudBaseColor.r;
        cloudColors[i * 3 + 1] = cloudBaseColor.g;
        cloudColors[i * 3 + 2] = cloudBaseColor.b;
        cloudAlpha[i] = alpha * 0.9; // Maximum 90% opacity

        // Random height variation
        const heightVariation = (noiseValue - 0.5) * 0.03;
        const newLength = planetInfo.radius * (1.02 + heightVariation);
        position.normalize().multiplyScalar(newLength);

        cloudsGeometry.attributes.position.setXYZ(i, position.x, position.y, position.z);
      }

      // Set cloud colors and alpha
      cloudsGeometry.setAttribute('color', new THREE.BufferAttribute(cloudColors, 3));
      cloudsGeometry.setAttribute('alpha', new THREE.BufferAttribute(cloudAlpha, 1));

      // Cloud shader material
      const cloudMaterial = new THREE.ShaderMaterial({
        vertexShader: `
          attribute vec3 color;
          attribute float alpha;
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            vColor = color;
            vAlpha = alpha;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vColor;
          varying float vAlpha;

          void main() {
            if (vAlpha < 0.01) discard;
            gl_FragColor = vec4(vColor, vAlpha);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });

      // Create clouds
      clouds = new THREE.Mesh(cloudsGeometry, cloudMaterial);
      clouds.rotation.y = Math.random() * Math.PI * 2;
      planetSystem.add(clouds);
    }

    // Create planetary rings
    function createRings() {
      // Ring size and features
      const innerRadius = planetInfo.radius * 1.5;
      const outerRadius = planetInfo.radius * (2.5 + Math.random() * 1.0);
      const segments = 128;

      // Create ring geometry
      const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, segments);

      // Random ring color and material
      const baseColor = new THREE.Color();
      const hue = Math.random();
      const saturation = 0.3 + Math.random() * 0.4;
      const lightness = 0.5 + Math.random() * 0.4;

      baseColor.setHSL(hue, saturation, lightness);

      // Create ring material
      const ringMaterial = new THREE.ShaderMaterial({
        uniforms: {
          baseColor: { value: baseColor },
          innerRadius: { value: innerRadius },
          outerRadius: { value: outerRadius },
          seed: { value: planetInfo.seed + 200 }
        },
        vertexShader: `
          varying vec2 vUv;
          varying float vDistance;

          void main() {
            vUv = uv;
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vDistance = length(position.xy);
            gl_Position = projectionMatrix * viewMatrix * worldPosition;
          }
        `,
        fragmentShader: `
          uniform vec3 baseColor;
          uniform float innerRadius;
          uniform float outerRadius;
          uniform float seed;

          varying vec2 vUv;
          varying float vDistance;

          float hash(float n) {
            return fract(sin(n) * 43758.5453);
          }

          void main() {
            float t = (vDistance - innerRadius) / (outerRadius - innerRadius);

            float ringPattern = sin(t * 50.0 + hash(seed) * 10.0) * 0.5 + 0.5;

            float numGaps = 3.0 + floor(hash(seed + 0.1) * 5.0);
            float gapPattern = sin(vUv.x * 3.14159 * 2.0 * numGaps) * 0.5 + 0.5;
            gapPattern = smoothstep(0.4, 0.6, gapPattern);

            float density = 0.3 + hash(seed + t) * 0.7;

            float alpha = t * (1.0 - t) * 4.0;
            alpha *= gapPattern;
            alpha *= density;

            vec3 color = baseColor * (0.8 + ringPattern * 0.4);

            float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
            float lightEffect = 0.7 + 0.3 * sin(angle + seed);
            color *= lightEffect;

            if (alpha < 0.01) discard;
            gl_FragColor = vec4(color, alpha * 0.8);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
      });

      rings = new THREE.Mesh(ringGeometry, ringMaterial);
      rings.rotation.x = Math.PI / 2;

      const tiltAngle = Math.random() * 0.5;
      rings.rotation.y = Math.random() * Math.PI * 2;
      rings.rotation.z = tiltAngle;

      planetSystem.add(rings);
    }

    // Create satellites (moons)
    function createMoons() {
      const moonCount = planetInfo.moonCount;

      for (let i = 0; i < moonCount; i++) {
        const moonSystem = new THREE.Object3D();

        const moonRadius = 0.1 + Math.random() * 0.2;
        const orbitRadius = planetInfo.radius * (2.0 + i * 0.8 + Math.random() * 0.5);
        const orbitSpeed = 0.001 + Math.random() * 0.002;
        let moonRotationSpeed = 0.002 + Math.random() * 0.002;

        const moonGeometry = new THREE.IcosahedronGeometry(moonRadius, 4);

        const positions = moonGeometry.attributes.position;
        const moonColors = new Float32Array(positions.count * 3);

        const moonBaseColor = new THREE.Color(0.7 + Math.random() * 0.3, 0.7 + Math.random() * 0.3, 0.7 + Math.random() * 0.3);
        const moonDarkColor = new THREE.Color(0.4 + Math.random() * 0.2, 0.4 + Math.random() * 0.2, 0.4 + Math.random() * 0.2);

        for (let j = 0; j < positions.count; j++) {
          const x = positions.getX(j);
          const y = positions.getY(j);
          const z = positions.getZ(j);

          const direction = new THREE.Vector3(x, y, z).normalize();

          const detail = noise3D(
            direction.x * 3.0 + planetInfo.seed + i * 100,
            direction.y * 3.0 + planetInfo.seed + i * 100,
            direction.z * 3.0 + planetInfo.seed + i * 100
          ) * 0.5 + 0.5;

          const craterCount = 5;
          let craterValue = 0;

          for (let c = 0; c < craterCount; c++) {
            const craterPos = new THREE.Vector3(
              Math.random() * 2 - 1,
              Math.random() * 2 - 1,
              Math.random() * 2 - 1
            ).normalize();

            const distToCrater = direction.distanceTo(craterPos);
            const craterSize = 0.1 + Math.random() * 0.2;

            if (distToCrater < craterSize) {
              const craterDepth = (craterSize - distToCrater) / craterSize;
              craterValue += craterDepth * craterDepth * 0.5;
            }
          }

          const color = new THREE.Color();
          color.copy(moonBaseColor).lerp(moonDarkColor, 1 - (detail - craterValue));

          moonColors[j * 3] = color.r;
          moonColors[j * 3 + 1] = color.g;
          moonColors[j * 3 + 2] = color.b;

          const heightFactor = 1.0 - craterValue * 0.3;
          positions.setXYZ(
            j,
            x * heightFactor,
            y * heightFactor,
            z * heightFactor
          );
        }

        moonGeometry.setAttribute('color', new THREE.BufferAttribute(moonColors, 3));
        moonGeometry.computeVertexNormals();

        const moonMaterial = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.9,
          metalness: 0.1,
          flatShading: true
        });

        const moon = new THREE.Mesh(moonGeometry, moonMaterial);

        const orbitGeometry = new THREE.BufferGeometry();
        const orbitPoints = [];
        const orbitSegments = 128;

        for (let j = 0; j <= orbitSegments; j++) {
          const angle = (j / orbitSegments) * Math.PI * 2;
          orbitPoints.push(
            Math.cos(angle) * orbitRadius,
            0,
            Math.sin(angle) * orbitRadius
          );
        }

        orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));

        const orbitMaterial = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.1
        });

        const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

        orbit.rotation.x = Math.random() * 0.3;
        orbit.rotation.y = Math.random() * Math.PI * 2;

        const angle = Math.random() * Math.PI * 2;
        moon.position.set(
          Math.cos(angle) * orbitRadius,
          0,
          Math.sin(angle) * orbitRadius
        );

        moons.push({
          system: moonSystem,
          moon: moon,
          orbitRadius: orbitRadius,
          orbitSpeed: orbitSpeed,
          orbitAngle: angle,
          rotationSpeed: moonRotationSpeed
        });

        moonSystem.add(orbit);
        moonSystem.add(moon);

        moonSystem.rotation.x = Math.random() * 0.3;
        moonSystem.rotation.z = Math.random() * 0.3;

        planetSystem.add(moonSystem);
      }
    }

    // Display planet information
    function displayPlanetInfo() {
      const infoElement = document.getElementById('planet-info');

      let info = `<h3>${planetInfo.name}</h3>`;
      info += `<p>Type: ${planetInfo.type}</p>`;

      if (planetInfo.hasOcean) {
        info += `<p>Feature: Has ocean</p>`;
      }

      if (planetInfo.hasClouds) {
        info += `<p>Feature: Has cloud layer</p>`;
      }

      if (planetInfo.hasRings) {
        info += `<p>Feature: Has planetary rings</p>`;
      }

      if (planetInfo.moonCount > 0) {
        info += `<p>Number of satellites: ${planetInfo.moonCount}</p>`;
      }

      infoElement.innerHTML = info;
    }

    // Regenerate planet
    function regeneratePlanet() {
      const oldPlanetSystem = planetSystem;
      const newPlanetSystem = new THREE.Object3D();

      newPlanetSystem.position.z = 20;
      scene.add(newPlanetSystem);

      planetSystem = newPlanetSystem;
      generatePlanet();

      // Transition animation
      const moveOut = () => {
        oldPlanetSystem.position.z += 0.1;
        oldPlanetSystem.rotation.y += 0.01;
        oldPlanetSystem.scale.multiplyScalar(0.99);

        if (oldPlanetSystem.position.z > 10) {
          scene.remove(oldPlanetSystem);
          return true;
        }
        return false;
      };

      // Move in animation
      const moveIn = () => {
        newPlanetSystem.position.z -= 0.2;
        if (newPlanetSystem.position.z <= 0) {
          newPlanetSystem.position.z = 0;
          return true;
        }
        return false;
      };

      // Transition function
      const transition = () => {
        const outComplete = moveOut();
        const inComplete = moveIn();
        if (!outComplete || !inComplete) {
          requestAnimationFrame(transition);
        }
      };

      transition();
    }

    // Update function
    function updateScene(delta) {
      if (planet) {
        planet.rotation.y += planetInfo.rotationSpeed * delta;
      }

      if (clouds) {
        clouds.rotation.y += planetInfo.rotationSpeed * 0.8 * delta;
      }

      moons.forEach(moonData => {
        moonData.orbitAngle += moonData.orbitSpeed * delta;
        moonData.moon.position.x = Math.cos(moonData.orbitAngle) * moonData.orbitRadius;
        moonData.moon.position.z = Math.sin(moonData.orbitAngle) * moonData.orbitRadius;
        moonData.moon.rotation.y += moonData.rotationSpeed * delta;
      });
    }

    // Resize window
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);

      controls.update();

      if (stars) {
        stars.position.copy(camera.position);
      }

      updateScene(1.0);
      renderer.render(scene, camera);
    }
  </script>