import React, { useRef, useEffect, useState } from "react";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Flatten from "@flatten-js/core";
const { Polygon, Matrix } = Flatten;

function dividePolygon(poly, rows, cols) {
  // Step 1: Find outer bounds of polygon
  let min_x = Number.POSITIVE_INFINITY;
  let min_y = Number.POSITIVE_INFINITY;
  let max_x = Number.NEGATIVE_INFINITY;
  let max_y = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    min_x = Math.min(min_x, p.x);
    min_y = Math.min(min_y, p.z);
    max_x = Math.max(max_x, p.x);
    max_y = Math.max(max_y, p.z);
  }

  // Step 2: Divide rectangle into grid
  const cell_width = (max_x - min_x) / cols;
  const cell_height = (max_y - min_y) / rows;

  let poly1 = new Polygon([poly.map((p) => [p.x, p.z])]);

  console.log(poly1.isValid());
  // Step 3 and 4: Check cells for overlap
  const rects = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate cell bounds
      const x1 = min_x + col * cell_width;
      const y1 = min_y + row * cell_height;
      const x2 = x1 + cell_width;
      const y2 = y1 + cell_height;

      const squareCell = new Polygon([
        [x1, y1],
        [x2, y1],
        [x2, y2],
        [x1, y2],
      ]);
      // Add cell to list of rectangles
      if (poly1.contains(squareCell)) {
        if (x1 >= min_x && y1 >= min_y && x2 <= max_x && y2 <= max_y) {
          rects.push({
            x: x1.toFixed(3),
            y: y1.toFixed(3),
            width: cell_width.toFixed(3),
            height: cell_height.toFixed(3),
          });
        } else {
          // Calculate intersection between cell and polygon
          const x3 = Math.max(x1, min_x);
          const y3 = Math.max(y1, min_y);
          const x4 = Math.min(x2, max_x);
          const y4 = Math.min(y2, max_y);
          const width = x4 - x3;
          const height = y4 - y3;
          rects.push({
            x: x3.toFixed(3),
            y: y3.toFixed(3),
            width: width.toFixed(3),
            height: height.toFixed(3),
          });
        }
      }
    }
  }
  console.log(rects);
  return rects;
}

function ThreeScene({ cameraStatus }) {
  const containerRef = useRef(null);
  const [model, setModel] = useState(null);
  const [grid, setGrid] = useState({ rows: 0, cols: 0 });
  const modelRef = useRef(null);
  modelRef.current = model;
  const gridRef = useRef(null);
  gridRef.current = grid;

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
    pointer.x = 0;
    pointer.y = 0;
    let squareMin, squareMax, line, line2;

    const loader = new GLTFLoader();
    // foi necessário remover as vigas
    loader.load("./textures/teste.glb", (object) => {
      scene.add(object.scene);
      const boundingBox = new THREE.Box3().setFromObject(object.scene);
      console.log(boundingBox);
      squareMin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xff00ff }));
      squareMin.position.set(boundingBox.min.x, boundingBox.min.y, boundingBox.min.z);
      squareMax = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshStandardMaterial({ color: 0xff00ff }));
      squareMax.position.set(boundingBox.max.x, boundingBox.max.y, boundingBox.max.z);
      const height = squareMax.position.y - squareMin.position.y
      const nRows = Math.abs(Math.floor(squareMax.position.z - squareMin.position.z) * 2);
      const nCols = Math.abs(Math.floor(squareMax.position.x - squareMin.position.x) * 2);
      setGrid({ rows: nRows, cols: nCols });
      const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
      const points = [new THREE.Vector3(boundingBox.max.x, -10, boundingBox.max.z), new THREE.Vector3(boundingBox.max.x, 10, boundingBox.max.z)];
      const points2 = [new THREE.Vector3(boundingBox.min.x, -10, boundingBox.min.z), new THREE.Vector3(boundingBox.min.x, 10, boundingBox.min.z)];
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const geometry2 = new THREE.BufferGeometry().setFromPoints(points2);
      line = new THREE.Line(geometry, material);
      line2 = new THREE.Line(geometry2, material);
      const boxMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, transparent: true, opacity: 0.5 });
      const outerBox = new THREE.Mesh(
        new THREE.BoxGeometry(Math.abs(squareMax.position.x - squareMin.position.x), Math.abs(squareMax.position.y - squareMin.position.y), Math.abs(squareMax.position.z - squareMin.position.z)),
        boxMaterial
      );
      outerBox.position.set((squareMax.position.x + squareMin.position.x) / 2, (squareMax.position.y + squareMin.position.y) / 2, (squareMax.position.z + squareMin.position.z) / 2);
      scene.add(outerBox);
      camera.position.set((squareMax.position.x + squareMin.position.x) / 2, squareMin.position.y+height/10, (squareMax.position.z + squareMin.position.z) / 2);
      camera.lookAt(new THREE.Vector3(camera.position.x - 0.5, camera.position.y, camera.position.z));
      setTimeout(() => setModel(object.scene), 100);
      // sem a latência ele não identifica o 1 ponto
    });

    const light2 = new THREE.PointLight(0xffffff, 0.45);
    light2.position.set(0, 3, 5);
    light2.castShadow = true;
    scene.add(light2);
    const light3 = new THREE.PointLight(0xffffff, 0.075);
    light3.position.set(0, 0, 5);
    light3.castShadow = true;
    scene.add(light3);
    const light = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(light);

    let measureVertices = true;
    let first = true;
    let allPoints = [];
    let lastAngle = null;
    let allLines = [];

    const raycasterFar = 0.15;
    const angleOpening = 10;
    function resetValues() {
      first = true;
      console.log("deu pau");
      allPoints = [];
      lastAngle = null;
      allLines = [];
      camera.position.y += 0.05;
      camera.lookAt(new THREE.Vector3(camera.position.x - 0.5, camera.position.y, camera.position.z));
    }

    function distance(point1, point2) {
      return Math.sqrt((point1.x - point2.x) ** 2 + (point1.z - point2.z) ** 2);
    }

    // adaptar o loop do animate() para while() e fazer somente no começo (ou até dentro do animate, mas dentro de uma iteração só)

    function animate() {
      requestAnimationFrame(animate);
      if (measureVertices && modelRef.current) {
        if (first) {
          raycaster.setFromCamera(pointer, camera);
          raycaster.far = 1000;
          const intersects = raycaster.intersectObjects(scene.children, true);
          if (intersects.length) {
            allPoints.push({
              x: intersects[0].point.x*0.995,
              y: intersects[0].point.y,
              z: intersects[0].point.z,
            });
          }
          first = false;
        }
        if (allPoints.length) {
          let point = allPoints[allPoints.length - 1];
          const centerX = point.x;
          const centerY = point.y;
          const centerZ = point.z;
          const hitAngles = [];
          for (let i = 0; i < 360; i = i + angleOpening) {
            let newPoint = { x: centerX, y: centerY, z: centerZ };
            const newAngle = lastAngle === null ? i : (lastAngle + 180 + angleOpening + i) % 360;
            const origin = new THREE.Vector3(newPoint.x, newPoint.y, newPoint.z);
            raycaster.set(origin, new THREE.Vector3(Math.sin((newAngle * Math.PI) / 180) * raycasterFar, 0, Math.cos((newAngle * Math.PI) / 180) * raycasterFar));
            raycaster.far = raycasterFar;
            const intersects = raycaster.intersectObjects(scene.children, true);
            if (intersects.length) {
              allLines.push({ point: point, angle: newAngle });
              hitAngles.push(newAngle);
            }
          }
          const angle = (hitAngles[0] - angleOpening) % 360;
          const lastAngleRef = lastAngle;
          lastAngle = angle;
          console.log(angle);
          allPoints.push({
            x: point.x + Math.sin((angle * Math.PI) / 180) * raycasterFar,
            y: point.y,
            z: point.z + Math.cos((angle * Math.PI) / 180) * raycasterFar,
          });
          if (!hitAngles[0] || ((lastAngleRef + 180) % 360 === angle && lastAngleRef !== null)) {
            resetValues();
          }
        } else {
          resetValues();
        }
      }

      if (allPoints.length && distance(allPoints[0], allPoints[1]) > distance(allPoints[0], allPoints[allPoints.length - 1]) && measureVertices) {
        scene.add(line, line2, squareMax, squareMin);
        console.log(allPoints);
        measureVertices = false;
        const material = new THREE.LineBasicMaterial({ color: 0xff00ff });
        const material2 = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const points = [];
        allPoints.forEach((vertice) => {
          points.push(new THREE.Vector3(vertice.x, vertice.y, vertice.z));
        });
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line3 = new THREE.Line(geometry, material);
        scene.add(line3);

        allLines.forEach((line) => {
          const points = [];
          points.push(new THREE.Vector3(line.point.x, line.point.y, line.point.z));
          points.push(new THREE.Vector3(line.point.x + Math.sin((line.angle * Math.PI) / 180) * raycasterFar, line.point.y, line.point.z + Math.cos((line.angle * Math.PI) / 180) * raycasterFar));
          const geometry = new THREE.BufferGeometry().setFromPoints(points);
          const newLine = new THREE.Line(geometry, material2);
          scene.add(newLine);
        });
        measureVertices = false;
        allPoints.push(allPoints[0]);
        allPoints.forEach((vertice, index) => {
          const material = new THREE.MeshStandardMaterial();
          material.color = new THREE.Color(`rgb(${Math.floor((index * 255) / allPoints.length)}, 0, 255)`);
          const hitbox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1, 0.05), material);
          hitbox.position.x = vertice.x;
          hitbox.position.z = vertice.z;
          //scene.add(hitbox);
        });
        console.log(gridRef.current);
        const allSquares = dividePolygon(allPoints, gridRef.current.rows, gridRef.current.cols);
        allSquares.forEach((square, index) => {
          const newSquare = new THREE.Mesh(new THREE.BoxGeometry(parseFloat(square.width) * 0.975, 0.25, parseFloat(square.height) * 0.975), new THREE.MeshStandardMaterial({ color: "#00ff00" }));
          newSquare.position.x = parseFloat(square.x) + parseFloat(square.width) / 2;
          newSquare.position.z = parseFloat(square.y) + parseFloat(square.height) / 2;
          scene.add(newSquare);
        });
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
export default ThreeScene;
