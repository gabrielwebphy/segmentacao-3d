import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
export default async function loadModel(url) {
    return new Promise(function (resolve, reject) {
        const loader = new GLTFLoader();
        loader.load(
            url,
            function (gltf) {
                gltf.scene.traverse(async function (node) {
                });
                resolve(gltf.scene);
            },
            function (xhr) { },
            function (error) {
                console.log(error);
            }
        );
    });
}
