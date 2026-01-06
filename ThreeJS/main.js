import * as THREE from 'three';

			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

			import { LightProbeGenerator } from 'three/addons/lights/LightProbeGenerator.js';

			import { LightProbeHelper } from 'three/addons/helpers/LightProbeHelper.js';

			let mesh, renderer, scene, camera;

			let gui;

			let lightProbe;
			let directionalLight;

			// linear color space
			const API = {
				lightProbeIntensity: 1.0,
				directionalLightIntensity: 0.6,
				envMapIntensity: 1
			};

			init();

			function init() {

				// renderer
				renderer = new THREE.WebGLRenderer( { antialias: true } );
				renderer.setPixelRatio( window.devicePixelRatio );
				renderer.setSize( window.innerWidth, window.innerHeight );
				document.body.appendChild( renderer.domElement );

				// tone mapping
				renderer.toneMapping = THREE.NoToneMapping;


				// scene
				scene = new THREE.Scene();

				// camera
				camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1000 );
				camera.position.set( 0, 0, 30 );

				// controls
				const controls = new OrbitControls( camera, renderer.domElement );
				controls.addEventListener( 'change', render );
				controls.minDistance = 10;
				controls.maxDistance = 50;
				controls.enablePan = false;

				// probe
				lightProbe = new THREE.LightProbe();
				scene.add( lightProbe );

				// light
				directionalLight = new THREE.DirectionalLight( 0xffffff, API.directionalLightIntensity );
				directionalLight.position.set( 10, 10, 10 );
				scene.add( directionalLight );

				// envmap
				const genCubeUrls = function ( prefix, postfix ) {

					return [
						prefix + 'px' + postfix, prefix + 'nx' + postfix,
						prefix + 'py' + postfix, prefix + 'ny' + postfix,
						prefix + 'pz' + postfix, prefix + 'nz' + postfix
					];

				};
        
				const urls2 = genCubeUrls( 'img/', '.png' );
                console.log(urls2);

                const urls = [...Array(6)].map(x=>"img/starfield.png");

				new THREE.CubeTextureLoader().load( urls, function ( cubeTexture ) {

                    const color2 = new THREE.Color( 0xffffff );
					//scene.background = cubeTexture;
                    scene.background = color2;

					lightProbe.copy( LightProbeGenerator.fromCubeTexture( cubeTexture ) );
					lightProbe.intensity = API.lightProbeIntensity;
					lightProbe.position.set( - 10, 0, 0 ); // position not used in scene lighting calculations (helper honors the position, however)

					//const geometry = new THREE.SphereGeometry( 5, 64, 32 );



					//const geometry = new THREE.TorusKnotGeometry( 4, 1.5, 256, 32, 2, 3 );

                    const geometry = new THREE.BufferGeometry();
                    // create a simple square shape. We duplicate the top left and bottom right
                    // vertices because each vertex needs to appear once per triangle.
                    const vertices = new Float32Array( [
                        -1.0, -1.0,  1.0, // v0
                        5.0, -1.0,  4, // v1
                        1.0,  1.0,  1.0, // v2
                        1.0,  1.0,  1.0, // v3
                        -1.0,  1.0,  1.0, // v4
                        -1.0, -1.0,  1.0  // v5
                    ] );
                    // itemSize = 3 because there are 3 values (components) per vertex
                    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );


					const material = new THREE.MeshStandardMaterial( {
						color: 0xffffff,
						metalness: 0,
						roughness: 0,
						envMap: cubeTexture,
						envMapIntensity: API.envMapIntensity,
					} );

					// mesh
					mesh = new THREE.Mesh( geometry, material );
					scene.add( mesh );

					// helper
					//const helper = new LightProbeHelper( lightProbe, 1 );
					//scene.add( helper );

					render();

				} );


				// gui
				gui = new GUI( { title: 'Intensity' } );

				gui.add( API, 'lightProbeIntensity', 0, 1, 0.02 )
					.name( 'light probe' )
					.onChange( function () {

						lightProbe.intensity = API.lightProbeIntensity; render();

					} );

				gui.add( API, 'directionalLightIntensity', 0, 1, 0.02 )
					.name( 'directional light' )
					.onChange( function () {

						directionalLight.intensity = API.directionalLightIntensity; render();

					} );

				gui.add( API, 'envMapIntensity', 0, 1, 0.02 )
					.name( 'envMap' )
					.onChange( function () {

						mesh.material.envMapIntensity = API.envMapIntensity; render();

					} );

				// listener
				window.addEventListener( 'resize', onWindowResize );

			}

			function onWindowResize() {

				renderer.setSize( window.innerWidth, window.innerHeight );

				camera.aspect = window.innerWidth / window.innerHeight;
				camera.updateProjectionMatrix();

				render();

			}

			function render() {

				renderer.render( scene, camera );

			}