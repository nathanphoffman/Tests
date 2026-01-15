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
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // tone mapping
    renderer.toneMapping = THREE.NoToneMapping;


    // scene
    scene = new THREE.Scene();

    // camera
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 0, 30);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.addEventListener('change', render);
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.enablePan = false;

    // probe
    lightProbe = new THREE.LightProbe();
    scene.add(lightProbe);

    // light
    directionalLight = new THREE.DirectionalLight(0xffffff, API.directionalLightIntensity);
    directionalLight.position.set(10, 10, 10);
    scene.add(directionalLight);

    // envmap
    const genCubeUrls = function (prefix, postfix) {

        return [
            prefix + 'px' + postfix, prefix + 'nx' + postfix,
            prefix + 'py' + postfix, prefix + 'ny' + postfix,
            prefix + 'pz' + postfix, prefix + 'nz' + postfix
        ];

    };

    const urls2 = genCubeUrls('img/', '.png');
    console.log(urls2);

    const urls = [...Array(6)].map(x => "img/starfield.png");

    new THREE.CubeTextureLoader().load(urls, function (cubeTexture) {

        //const color2 = new THREE.Color(0xffffff);
        scene.background = cubeTexture;

        lightProbe.copy(LightProbeGenerator.fromCubeTexture(cubeTexture));
        lightProbe.intensity = API.lightProbeIntensity;
        lightProbe.position.set(- 10, 0, 0); // position not used in scene lighting calculations (helper honors the position, however)


        function getRandomInteger(min, max) {
            return Math.floor(Math.random() * (max + 1 - min)) + (min);
        }

        function getOneToXArray(n) {
            return Array(n).fill(null).map((_, i) => i);
        }

        const detail = 4;

        function renderSpheroid(radius) {

            const distanceLimit = Number(radius / (detail));

            //const geometry = new THREE.IcosahedronGeometry(1, 1);
            //const geometry = new THREE.TorusKnotGeometry( 4, 1.5, 256, 32, 2, 3 );
            //const geometry = new THREE.SphereGeometry(5, 64, 32);
            const geometry = new THREE.IcosahedronGeometry(radius, detail);

            const positions = geometry.attributes.position;
            const vertexCount = positions.count;
            console.log(vertexCount);

            let processed = []; // {x,y,z,xpos,ypos,zpos}

            function getRecordsProcessedAt(x, y, z) {
                return processed.filter((record) => record.x === x && record.y === y && record.z === z);
            }

            function getAdjustmentNearMatchedPosition(x1, y1, z1) {
                let xDelta = 0;
                let yDelta = 0;
                let zDelta = 0;

                const matchedPositions = processed.filter(({ x, y, z, _xpos, _ypos, _zpos }) => {
                    const distance = getDistanceBetweenPoints({ x1, z1, y1, x2: x, y2: y, z2: z });
                    //console.log(distance);

                    console.log("distance limit is ", distanceLimit);
                    if (distance < distanceLimit / 4) {
                        xDelta += _xpos;
                        yDelta += _ypos;
                        zDelta += _zpos;
                    }
                });

                return { xDelta, yDelta, zDelta };
            }

            function getDistanceBetweenPoints({ x1, x2, y1, y2, z1, z2 }) {

                const xComponent = Math.exp((x2 - x1), 2);
                const yComponent = Math.exp((y2 - y1), 2);
                const zComponent = Math.exp((z2 - z1), 2);

                return Math.sqrt(xComponent + yComponent + zComponent);
            }

            function randomForLoop(iterations, fn) {
                let iterator = getOneToXArray(iterations);
                //console.log(iterator.length);
                let trueSafetySatisfies = 0;

                while (trueSafetySatisfies++ < 10000) {

                    const randomIndex = getRandomInteger(0, iterator.length - 1);
                    //console.log(randomIndex);

                    const selectedPosition = iterator[randomIndex];
                    iterator.splice(randomIndex, 1);
                    fn(selectedPosition);
                    if (iterator.length === 0) break;
                }
            }


            function randomColor() {
                return Math.floor(Math.random() * 16777215).toString(16);
            }

            randomForLoop(10, (idx) => console.log(idx));

            randomForLoop(vertexCount, (i) => {

                //console.log(vertexCount);

                const x = positions.getX(i);
                const y = positions.getY(i);
                const z = positions.getZ(i);

                function setPosition(_xpos, _ypos, _zpos) {
                    positions.setXYZ(
                        i, x + _xpos, y + _ypos, z + _zpos
                    );

                    processed.push({ x, y, z, _xpos, _ypos, _zpos });
                }

                const records = getRecordsProcessedAt(x, y, z);
                if (records.length > 0) {
                    const record = records[0];

                    // every vertex is joined by several polygons, if the same point that multiple polygons is shared has been updated
                    // we must move all matching polygon corners to that new position to prevent holes
                    setPosition(record._xpos, record._ypos, record._zpos);
                    return;
                }

                /*
                                const nx = x / radius;
                                const ny = y / radius;
                                const nz = z / radius;
                */
                function getRandom() {
                    return Math.ceil(Math.random() * 10) - 5;
                }

                let xpos = 0;
                let ypos = 0;
                let zpos = 0;

                const roughness = 0.005 * getRandomInteger(getRandomInteger(0, 2), getRandomInteger(2, 100 / radius));
                const { xDelta, yDelta, zDelta } = getAdjustmentNearMatchedPosition(x, y, z);

                //.log(xDelta, yDelta, zDelta);

                xpos += roughness * getRandom() * xDelta + roughness * getRandom() - roughness * getRandom();
                ypos += roughness * getRandom() * yDelta + roughness * getRandom() - roughness * getRandom();
                zpos += roughness * getRandom() * zDelta + roughness * getRandom() - roughness * getRandom();

                console.log(xpos, ypos, zpos);

                function limit(pos, maxLimit) {
                    if (pos > maxLimit) return maxLimit;
                    else if (pos < -1 * maxLimit) return -1 * maxLimit;
                    else return pos;
                }

                const maxLimit = (radius / detail) / 4;

                setPosition(
                    limit(xpos, Math.random() * maxLimit * 2), limit(ypos, Math.random() * maxLimit * 2), limit(zpos, Math.random() * maxLimit * 2)
                );

            });



            const material = new THREE.MeshStandardMaterial({
                side: THREE.DoubleSide,
                color: `#${randomColor()}`,
                metalness: 0,
                roughness: 5,
                envMap: cubeTexture,
                envMapIntensity: API.envMapIntensity,
            });

            return new THREE.Mesh(geometry, material);
        }

        function getRandomHexColor() {
            // Generate random values for red, green, and blue
            const randomRed = Math.floor(Math.random() * 256);
            const randomGreen = Math.floor(Math.random() * 256);
            const randomBlue = Math.floor(Math.random() * 256);

            // Combine them into a single number
            const hexColor = (randomRed << 16) | (randomGreen << 8) | randomBlue;

            // Return the color as a number in the format 0xRRGGBB
            return hexColor;
        }

        function renderRings(radius) {

            const ringDistance = radius * 3 + getRandomInteger(1, radius + 1);
            const ringThickness = 1 + getRandomInteger(1, radius * 5);

            const geometry2 = new THREE.RingGeometry(ringDistance, ringThickness, 32);
            const material2 = new THREE.MeshBasicMaterial({ color: getRandomHexColor(), side: THREE.DoubleSide, opacity: 0.25, transparent: true });
            const mesh2 = new THREE.Mesh(geometry2, material2);
            mesh2.rotation.x = Math.PI * Math.random();
            mesh2.rotation.y = Math.PI * Math.random();
            mesh2.rotation.z = Math.PI * Math.random();
            scene.add(mesh2);

        }

        const planetRadius = getRandomInteger(1, 4);
        const planet = renderSpheroid(planetRadius);
        scene.add(planet);

        const d6 = getRandomInteger(1, 6);
        console.log(d6);
        if (d6 === 6) renderRings(planetRadius);

        const d62 = getRandomInteger(1, getRandomInteger(1,3));
        if (d62 < planetRadius) {
            getOneToXArray(d62).forEach((i) => renderMoon(i));
        }

        function renderMoon(idx) {
            const moonRadius = getRandomInteger(1, getRandomInteger(1, planetRadius - 1))
            const moon = renderSpheroid(moonRadius);

            const newPosition = planetRadius * 2 + moonRadius * 2;

            function moonOffset() {
                return 1 - getRandomInteger(1, 10) / 2;
            }

            if (idx === 1) {
                moon.position.x = newPosition;
                moon.position.y = moon.position.y += moonOffset();
                moon.position.z = moon.position.z += moonOffset();
            }
            else if (idx === 2) {
                moon.position.x = -1 * newPosition;
                moon.position.y = moon.position.y += moonOffset();
                moon.position.z = moon.position.z += moonOffset();
            }
            else if (idx === 3) {
                moon.position.z = newPosition;
                moon.position.y = moon.position.y += moonOffset();
                moon.position.x = moon.position.x += moonOffset();
            }
            else if (idx === 4) {
                moon.position.z = -1 * newPosition;
                moon.position.y = moon.position.y += moonOffset();
                moon.position.x = moon.position.x += moonOffset();
            }

            scene.add(moon);
        }


        /*
                setTriangle([
                        3, 3, 3, // v0
                        6, 3, 3,
                        6, 6, 3, // v2
                    ]);
        
                        setTriangle([
                        3, 3, 3, // v0
                        6, 3, 3,
                        3, 3, 0, // v2
                    ]);
        */


        render();

    });


    // listener
    window.addEventListener('resize', onWindowResize);

}

function onWindowResize() {

    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    render();

}

function render() {


    renderer.render(scene, camera);
    /*
        const postProcessing = new THREE.PostProcessing( renderer );
        const scenePass = pass( scene, camera );
        // outline parameter
        const edgeStrength = uniform( 3.0 );
        const edgeGlow = uniform( 0.0 );
        const edgeThickness = uniform( 1.0 );
        const visibleEdgeColor = uniform( new THREE.Color( 0xffffff ) );
        const hiddenEdgeColor = uniform( new THREE.Color( 0x4e3636 ) );
        outlinePass = outline( scene, camera, {
            selectedObjects,
            edgeGlow,
            edgeThickness
        } );
        // compose custom outline
        const { visibleEdge, hiddenEdge } = outlinePass;
        const outlineColor = visibleEdge.mul( visibleEdgeColor ).add( hiddenEdge.mul( hiddenEdgeColor ) ).mul( edgeStrength );
        postProcessing.outputNode = outlineColor.add( scenePass );
    
    */
}