import React, { useRef, useEffect } from 'react';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
//import marmore from '../textures/marmore.jpg'
import * as THREE from 'three';
//import path1 from '@/textures/apart_06.glb'
import loadModel from './loadModel';
import { CSG } from 'three-csg-ts'
import Flatten, { polygon } from '@flatten-js/core';
let { intersect, disjoint, equal, touch, inside, contain, covered, cover } = Flatten.Relations;

function dividePolygon(poly, rows, cols) {
    // Step 1: Find outer bounds of polygon
    let min_x = Number.POSITIVE_INFINITY;
    let min_y = Number.POSITIVE_INFINITY;
    let max_x = Number.NEGATIVE_INFINITY;
    let max_y = Number.NEGATIVE_INFINITY;
    for (let i = 0; i < poly.length; i++) {
        const p = poly[i];
        min_x = Math.min(min_x, p.x);
        min_y = Math.min(min_y, p.y);
        max_x = Math.max(max_x, p.x);
        max_y = Math.max(max_y, p.y);
    }

    // Step 2: Divide rectangle into grid
    const cell_width = (max_x - min_x) / cols;
    const cell_height = (max_y - min_y) / rows;

    const poly1 = polygon([poly.map(p => [p.x, p.y])])
    console.log(poly1.isValid())
    // Step 3 and 4: Check cells for overlap
    const rects = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Calculate cell bounds
            const x1 = min_x + col * cell_width;
            const y1 = min_y + row * cell_height;
            const x2 = x1 + cell_width;
            const y2 = y1 + cell_height;

            const squareCell = polygon([[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]]);
            const intersects = intersect(squareCell, poly1)
            console.log(intersects);
            // Add cell to list of rectangles
            if (intersects) {
                if (x1 >= min_x && y1 >= min_y && x2 <= max_x && y2 <= max_y /*&& intersectionArea === rectArea*/) {
                    rects.push({ x: x1.toFixed(3), y: y1.toFixed(3), width: cell_width.toFixed(3), height: cell_height.toFixed(3) });
                } else {
                    // Calculate intersection between cell and polygon
                    const x3 = Math.max(x1, min_x);
                    const y3 = Math.max(y1, min_y);
                    const x4 = Math.min(x2, max_x);
                    const y4 = Math.min(y2, max_y);
                    const width = x4 - x3;
                    const height = y4 - y3;
                    const area = width * height;
                    rects.push({ x: x3.toFixed(3), y: y3.toFixed(3), width: width.toFixed(3), height: height.toFixed(3) });
                }
            }
        }
    }
    console.log(rects);
    return rects;
}
//const floorTexture = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(marmore) })

function ThreeScene({ cameraStatus, setCamera, model }) {
    const containerRef = useRef(null);

    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xffffff);
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        const raycaster = new THREE.Raycaster(camera.getWorldPosition(new THREE.Vector3()), camera.getWorldDirection(new THREE.Vector3()));
        const pointer = new THREE.Vector2();
        pointer.x = 0
        pointer.y = 0

        const light2 = new THREE.PointLight(0xffffff, 0.45);
        light2.position.set(0, 3, 5);
        light2.castShadow = true
        scene.add(light2);
        const light3 = new THREE.PointLight(0xffffff, 0.075);
        light3.position.set(0, 0, 5);
        light3.castShadow = true
        scene.add(light3);
        const light = new THREE.AmbientLight(0xffffff, 0.35)
        scene.add(light)

        console.log(model);

        const size = 100;
        const divisions = 100;
        const gridHelper = new THREE.GridHelper(size, divisions, 0xbbbbbb, 0xbbbbbb);
        //scene.add(gridHelper);

        const wall = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall.position.y = 1
        wall.position.z = 3
        wall.position.x = 1
        const wall2 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall2.position.z = -3
        wall2.position.x = 0
        wall2.position.y = 1
        const wall22 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall22.position.z = -1
        wall22.position.x = -2
        wall22.position.y = 1
        const wall23 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall23.position.z = -2
        wall23.position.x = -1
        wall23.rotation.y = Math.PI / 2
        wall23.position.y = 1
        const wall3 = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall3.position.y = 1
        wall3.position.x = 3
        wall3.rotation.y = Math.PI / 2
        wall3.position.z = 1
        const wall32 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall32.position.y = 1
        wall32.position.x = 2
        wall32.position.z = -1
        const wall33 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall33.position.y = 1
        wall33.position.x = 1
        wall33.rotation.y = Math.PI / 2
        wall33.position.z = -2
        const wall4 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall4.position.y = 1
        wall4.position.x = -3
        wall4.position.z = 0
        wall4.rotation.y = Math.PI / 2
        const wall42 = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall42.position.y = 1
        wall42.position.x = -2
        wall42.position.z = 1
        const wall43 = new THREE.Mesh(new THREE.BoxGeometry(2 * Math.sqrt(2), 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall43.position.y = 1
        wall43.position.x = -2
        wall43.position.z = 2
        wall43.rotation.y = -Math.PI / 4

        wall.updateMatrix()
        wall2.updateMatrix()
        wall22.updateMatrix()
        wall23.updateMatrix()
        wall3.updateMatrix()
        wall32.updateMatrix()
        wall33.updateMatrix()
        wall4.updateMatrix()
        wall43.updateMatrix()

        const allWalls = CSG.union(wall, CSG.union(wall2, CSG.union(wall22, CSG.union(wall23, CSG.union(wall3, CSG.union(wall32, CSG.union(wall33, CSG.union(wall4, wall43))))))))
        scene.add(allWalls)

        const roof = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 20), new THREE.MeshStandardMaterial({ color: '#ffffff' }))
        roof.position.y = 6
        //scene.add(roof)
        const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 20), new THREE.MeshStandardMaterial({ color: '#ffffff' }))
        floor.position.y = 0
        scene.add(floor)

        camera.position.x = cameraStatus.x
        camera.position.y = cameraStatus.y
        camera.position.z = cameraStatus.z
        camera.rotation.y = Math.PI / 2

        controls.target = new THREE.Vector3(cameraStatus.target.x, cameraStatus.target.y, cameraStatus.target.z);
        controls.update();

        let vertices = []
        let angleCount = 0
        let measureVertices = true
        let angleChange = Math.PI / 90

        function animate() {
            requestAnimationFrame(animate);
            camera.rotation.y += angleChange

            setCamera({ x: camera.position.x, y: camera.position.y, z: camera.position.z, target: { x: controls.target.x, y: controls.target.y, z: controls.target.z } })
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, false);
            if (intersects.length > 0 && measureVertices) {
                intersects.forEach(intersection => {
                    const currentPoint = { x: intersection.point.x, y: intersection.point.z }
                    vertices.push(currentPoint)
                })
                angleCount++
                if (angleCount >= 1 / (angleChange / Math.PI) * 2) {
                    const material = new THREE.LineBasicMaterial({ color: 0x0000ff });
                    const points = [];
                    //vertices.push(vertices[0])
                    vertices.forEach(vertice => {
                        points.push(new THREE.Vector3(vertice.x, 1, vertice.y));
                    })
                    const geometry = new THREE.BufferGeometry().setFromPoints(points);
                    const line = new THREE.Line(geometry, material);
                    scene.add(line);
                    vertices.push(vertices[0])
                    measureVertices = false
                    angleChange = 0
                    vertices.forEach((vertice, index) => {
                        const material = new THREE.MeshStandardMaterial();
                        material.color = new THREE.Color(`rgb(${Math.floor(index * 255 / vertices.length)}, 0, 255)`);
                        const hitbox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.05), material)
                        hitbox.position.x = vertice.x
                        hitbox.position.z = vertice.y
                        scene.add(hitbox)
                    })

                    const allSquares = dividePolygon(vertices, 9, 9)
                    allSquares.forEach((square, index) => {
                        const newSquare = new THREE.Mesh(new THREE.BoxGeometry(parseFloat(square.width) * 0.975, 0.25, parseFloat(square.height) * 0.975), new THREE.MeshStandardMaterial({ color: '#00ff00' }))
                        newSquare.position.x = parseFloat(square.x) + parseFloat(square.width) / 2
                        newSquare.position.z = parseFloat(square.y) + parseFloat(square.height) / 2
                        scene.add(newSquare)
                    })
                }
            }
            renderer.render(scene, camera);
        }
        animate();
        return () => {
            containerRef.current.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={containerRef} />;
}
export default ThreeScene