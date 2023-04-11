import React, { useRef, useEffect } from 'react';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
//import marmore from '../textures/marmore.jpg'
import * as THREE from 'three';
import * as turf from '@turf/turf';

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

    // Step 3 and 4: Check cells for overlap
    const polygon = turf.polygon([poly.map(p => [p.x, p.y])]);
    const rects = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Calculate cell bounds
            const x1 = min_x + col * cell_width;
            const y1 = min_y + row * cell_height;
            const x2 = x1 + cell_width;
            const y2 = y1 + cell_height;

            // Check if cell intersects with polygon
            const cell_box = turf.bboxPolygon([x1, y1, x2, y2]);

            const intersection = turf.intersect(polygon, cell_box);
            // Add cell to list of rectangles
            if (intersection !== null && intersection.geometry.type === 'Polygon' && intersection.geometry.coordinates[0].length > 2) {
                if (x1 >= min_x && y1 >= min_y && x2 <= max_x && y2 <= max_y) {
                    rects.push({ x: x1.toFixed(3), y: y1.toFixed(3), width: cell_width.toFixed(3), height: cell_height.toFixed(3) });
                } else {
                    // Calculate intersection between cell and polygon
                    const x3 = Math.max(x1, min_x);
                    const y3 = Math.max(y1, min_y);
                    const x4 = Math.min(x2, max_x);
                    const y4 = Math.min(y2, max_y);
                    const width = x4 - x3;
                    const height = y4 - y3;
                    rects.push({ x: x3.toFixed(3), y: y3.toFixed(3), width: width.toFixed(3), height: height.toFixed(3) });
                }
            }
        }
    }

    return rects;
}
//const floorTexture = new THREE.MeshStandardMaterial({ map: new THREE.TextureLoader().load(marmore) })

function ThreeScene({ cameraStatus, setCamera }) {
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
        const wall43 = new THREE.Mesh(new THREE.BoxGeometry(2.2 * Math.sqrt(2), 2, 0.2), new THREE.MeshStandardMaterial({ color: '#ff0000' }))
        wall43.position.y = 1
        wall43.position.x = -2
        wall43.position.z = 2
        wall43.rotation.y = -Math.PI / 4

        scene.add(wall)
        scene.add(wall2)
        scene.add(wall22)
        scene.add(wall23)
        scene.add(wall32)
        scene.add(wall33)
        scene.add(wall3)
        scene.add(wall4)
        //scene.add(wall42)
        scene.add(wall43)

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
        let verticeCount = 0
        let measureVertices = true
        let angleChange = Math.PI / 90
        //let allSquares = [{ x: -0.967, y: -2.9, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': -2.9, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': -2.9, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': -2.256, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': -2.256, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': -2.256, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': -1.611, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': -1.611, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': -1.611, 'width': 0.644, 'height': 0.644 }, { 'x': -2.9, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -2.256, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -1.611, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 0.967, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 1.611, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 2.256, 'y': -0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -2.9, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -2.256, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -1.611, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 0.967, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 1.611, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 2.256, 'y': -0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -2.9, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -2.256, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -1.611, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 0.967, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 1.611, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': 2.256, 'y': 0.322, 'width': 0.644, 'height': 0.644 }, { 'x': -2.9, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -2.256, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -1.611, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 0.967, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 1.611, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': 2.256, 'y': 0.967, 'width': 0.644, 'height': 0.644 }, { 'x': -2.256, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': -1.611, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': 0.967, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': 1.611, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': 2.256, 'y': 1.611, 'width': 0.644, 'height': 0.644 }, { 'x': -1.611, 'y': 2.256, 'width': 0.644, 'height': 0.644 }, { 'x': -0.967, 'y': 2.256, 'width': 0.644, 'height': 0.644 }, { 'x': -0.322, 'y': 2.256, 'width': 0.644, 'height': 0.644 }, { 'x': 0.322, 'y': 2.256, 'width': 0.644, 'height': 0.644 }, { 'x': 0.967, 'y': 2.256, 'width': 0.644, 'height': 0.644 }, { 'x': 1.611, 'y': 2.256, 'width': 0.644, 'height': 0.644 }, { 'x': 2.256, 'y': 2.256, 'width': 0.644, 'height': 0.644 }]
        /*
        allSquares.forEach((square, index) => {
            const newSquare = new THREE.Mesh(new THREE.BoxGeometry(square.width * 0.975, 0.25, square.height * 0.975), new THREE.MeshStandardMaterial({ color: '#00ff00' }))
            newSquare.position.x = square.x + square.width / 2
            newSquare.position.z = square.y + square.height / 2
            scene.add(newSquare)
        })*/
        function animate() {
            requestAnimationFrame(animate);
            camera.rotation.y += angleChange

            setCamera({ x: camera.position.x, y: camera.position.y, z: camera.position.z, target: { x: controls.target.x, y: controls.target.y, z: controls.target.z } })
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, false);
            if (intersects.length > 0 && measureVertices) {
                const currentPoint = { x: intersects[0].point.x, y: intersects[0].point.z }
                vertices.push(currentPoint)
                verticeCount++
                if (verticeCount >= 1/(angleChange/Math.PI)*2) {
                    measureVertices = false
                    angleChange = 0
                    vertices.push(vertices[0])
                    const allSquares = dividePolygon(vertices, 9, 9)
                    console.log(allSquares.length);
                    allSquares.forEach((square, index) => {
                        const newSquare = new THREE.Mesh(new THREE.BoxGeometry(parseFloat(square.width) * 0.975, 0.25, parseFloat(square.height) * 0.975), new THREE.MeshStandardMaterial({ color: '#00ff00' }))
                        newSquare.position.x = parseFloat(square.x) + parseFloat(square.width) / 2
                        newSquare.position.z = parseFloat(square.y) + parseFloat(square.height) / 2
                        scene.add(newSquare)
                    })
                }
                intersects[0].object.material.color.set(0x0000ff)
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