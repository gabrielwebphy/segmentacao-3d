import React, { useRef, useEffect } from 'react';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
//import marmore from '../textures/marmore.jpg'
import * as THREE from 'three';

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
        scene.add(roof)
        const floor = new THREE.Mesh(new THREE.BoxGeometry(20, 0.2, 20), new THREE.MeshStandardMaterial({ color: '#ffffff' }))
        floor.position.y = 0
        scene.add(floor)

        camera.position.x = cameraStatus.x
        camera.position.y = cameraStatus.y
        camera.position.z = cameraStatus.z

        controls.target = new THREE.Vector3(cameraStatus.target.x, cameraStatus.target.y, cameraStatus.target.z);
        controls.update();

        let cameraGridPoints = []
        for (let i = 0; i < 50; i++) {
            let innerArray = []
            let zCoordinate = (i - 25) / 2
            for (let x = 0; x < 50; x++) {
                innerArray.push({ z: zCoordinate, x: (x - 25) / 2 })
            }
            cameraGridPoints.push(innerArray)
        }

        let previousPoint2 = { x: 0, y: 0, d: 0 }
        let previousPoint = { x: 0, y: 0, d: 0 }
        let vertices = []
        let measureVertices = false
        let firstRender = true
        let angleChange = 0//Math.PI / 270

        function distance(p1, p2) {
            return Math.sqrt((p1.x - p2.x) ** 2 + (p1.z - p2.z) ** 2)
        }
        function samePlane(point1, point2, point3) {
            let xCoordinates = [point1.x, point2.x, point3.x].sort()
            if (xCoordinates[0] === xCoordinates[2]) { return true }

            let zCoordinates = [point1.z, point2.z, point3.z].sort()
            if (zCoordinates[0] === zCoordinates[2]) { return true }

            // Seria bom ter uma margem de erro, tratando a linha entre os pontos como uma função, e aumentando
            // e diminuindo a altura da função, e checando se o resultado é maior e menor, sendo assim ele estaria dentro.
            if (point2.x === point1.x + point3.x / 2 && point2.z === point1.z + point3.z / 2) { return true }

            return false;
        }
        //const newRaycaster = new THREE.Raycaster();
        //const direction = new THREE.Vector3(1, 0, 0);

        function animate() {
            if (firstRender) {
                const deletedPoints = []
                firstRender = false
                cameraGridPoints.forEach((row, i) => {
                    row.forEach((cell, j) => {
                        const newRaycaster = new THREE.Raycaster();
                        const direction = new THREE.Vector3(0, 0, 1);
                        const raycasterPosition = new THREE.Vector3(cell.x, 1, cell.z)
                        newRaycaster.set(raycasterPosition, direction);
                        const intersects = newRaycaster.intersectObject(wall);
                        //console.log(intersects)
                        if (intersects.length > 0) {
                            console.log('foi', i, j)
                        }
                        else {
                            deletedPoints.unshift({ row: i, col: j })
                        }
                    })
                })
                console.log(deletedPoints)
                deletedPoints.forEach(point => {
                    cameraGridPoints[point.row].splice(point.col, 1)
                })
                cameraGridPoints.forEach(row => {
                    row.forEach(cell => {
                        const square = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: '#ff00ff' }))
                        square.position.x = cell.x
                        square.position.z = cell.z
                        square.position.y = 0.15
                        scene.add(square)
                    })
                })
            }

            requestAnimationFrame(animate);
            camera.rotation.y += angleChange

            setCamera({ x: camera.position.x, y: camera.position.y, z: camera.position.z, target: { x: controls.target.x, y: controls.target.y, z: controls.target.z } })
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(scene.children, false);
            if (intersects.length > 0 && measureVertices) {
                const currentPoint = { d: intersects[0].distance, x: intersects[0].point.x, z: intersects[0].point.z }
                if ((previousPoint.d > currentPoint.d && previousPoint.d > previousPoint2.d) || (previousPoint.d < currentPoint.d && previousPoint.d < previousPoint2.d && !samePlane(previousPoint2, previousPoint, currentPoint))) {
                    if (!vertices.length || distance(vertices[0], currentPoint) > 0.025) {
                        vertices.push(currentPoint)
                    }
                    else {
                        console.log(vertices)
                        measureVertices = false
                        angleChange = 0
                        vertices.forEach(vertice => {
                            const coordinateMarker = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.1, 0.25), new THREE.MeshStandardMaterial({ transparent: true, color: '#00ff00' }))
                            coordinateMarker.position.y = 1.05
                            coordinateMarker.position.x = vertice.x
                            coordinateMarker.position.z = vertice.z
                            scene.add(coordinateMarker)
                        })
                    }
                }
                previousPoint2 = previousPoint
                previousPoint = currentPoint
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