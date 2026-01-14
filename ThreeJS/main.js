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


        function setTriangle(arr) {
            const material = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
            //const geometry = new THREE.TorusKnotGeometry( 4, 1.5, 256, 32, 2, 3 );

            const geometry = new THREE.BufferGeometry();
            // create a simple square shape. We duplicate the top left and bottom right
            // vertices because each vertex needs to appear once per triangle.
            const vertices = new Float32Array(arr);
            console.log(arr.length);
            // itemSize = 3 because there are 3 values (components) per vertex
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, Math.round(3)));

            const mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }

        function getRandomInteger(min, max) {
            return Math.floor(Math.random() * (max - min)) + min;
        }


        function renderSpheroid() {
            const radius = getRandomInteger(2, 6);
            const detail = 3;
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
                    if (distance < distanceLimit) {
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


            function getOneToXArray(n) {
                return Array(n).fill(null).map((_, i) => i);
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

                const roughness = 0.01 * getRandomInteger(0, getRandomInteger(1, 10));
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

                const maxLimit = (radius / detail) / 3;

                setPosition(
                    limit(xpos, Math.random() * maxLimit * 3), limit(ypos, Math.random() * maxLimit * 3), limit(zpos, Math.random() * maxLimit * 3)
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

            mesh = new THREE.Mesh(geometry, material);
            scene.add(mesh);
        }

        renderSpheroid();

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

        function renderRings() {

            const geometry2 = new THREE.RingGeometry(10, 20, 32);
            const material2 = new THREE.MeshBasicMaterial({ color: getRandomHexColor(), side: THREE.DoubleSide, opacity: 0.25, transparent: true });
            const mesh2 = new THREE.Mesh(geometry2, material2);
            mesh2.rotation.x = Math.PI * Math.random();
            mesh2.rotation.y = Math.PI * Math.random();
            mesh2.rotation.z = Math.PI * Math.random();
            scene.add(mesh2);

        }

        renderRings();

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

}