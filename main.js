import * as THREE from 'three';
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import TWEEN from 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.esm.js';

const API_URL = "https://unefa6tosistemas2025api.onrender.com/api/articulos";
window.consultarArticulos = consultarArticulos;

let scene, camera, renderer, objetos = [], raycaster, mouse, controls, infoBox;
let objetoSeleccionado = null;

const botonVolver = document.getElementById("volver");

botonVolver.addEventListener("click", () => {
    if (objetoSeleccionado) {
        
        new TWEEN.Tween(objetoSeleccionado.position)
            .to(objetoSeleccionado.userData.posicionOriginal, 1000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();
    }


    objetos.forEach(obj => obj.visible = true);
    objetoSeleccionado = null;

    
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 2, z: 5 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();


    infoBox.style.display = "none";
    botonVolver.style.display = "none";
});

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

   
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    camera.position.set(0, 2, 5);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener("click", onMouseClick, false);

    infoBox = document.createElement("div");
    infoBox.style.position = "absolute";
    infoBox.style.display = "none";
    infoBox.style.color = "white";
    infoBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    infoBox.style.padding = "10px";
    infoBox.style.borderRadius = "5px";
    document.body.appendChild(infoBox);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();

    objetos.forEach(obj => {
        obj.rotation.y += 0.01;
        obj.position.y = obj.userData.posicionOriginal.y + Math.sin(Date.now() * 0.002) * 0.2;
    });

    TWEEN.update();
    renderer.render(scene, camera);
}

async function consultarArticulos() {
    const cedula = document.getElementById("cedula").value;
    const categoria = document.getElementById("categoria").value;

    if (!cedula) return alert("Ingrese la cédula.");

    try {
        const respuesta = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ "ALUMNO": cedula, "ARTCATEGO": categoria })
        });

        const resultado = await respuesta.json();
        if (!resultado.Resul) return alert(resultado.error);

        limpiarEscena();
        resultado.data.forEach((articulo, index) => {
            agregarCubo(index, articulo);
        });

    } catch (error) {
        console.error("Error en la consulta", error);
    }
}

function agregarCubo(index, articulo) {
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
    const cube = new THREE.Mesh(geometry, material);

    // Posicionar los cubos en una fila
    const posicionOriginal = new THREE.Vector3(index * 2 - 4, 0, 0);
    cube.position.copy(posicionOriginal);
    cube.userData = { ...articulo, posicionOriginal };

    scene.add(cube);
    objetos.push(cube);
}


function onMouseClick(event) {
    // Normalizar coordenadas del mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(objetos);

    if (intersects.length > 0) {
        objetoSeleccionado = intersects[0].object;
        mostrarInfoObjeto(objetoSeleccionado);
    }
    
}

function mostrarInfoObjeto(objeto) {
    
    objetos.forEach(obj => {
        if (obj !== objeto) obj.visible = false;
    });

    botonVolver.style.display = "block";


    new TWEEN.Tween(camera.position)
        .to({ x: objeto.position.x, y: 1, z: 2 }, 1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .start();

    const articulo = objeto.userData;
    infoBox.style.display = "block";
    infoBox.style.left = `${window.innerWidth / 2}px`;
    infoBox.style.top = "50px";
    infoBox.innerText = `${articulo.ARTNUMERO}: ${articulo.ARTDESCRI} ($${articulo.ARTPRECIO})`;
}

function limpiarEscena() {
    objetos.forEach(obj => scene.remove(obj));
    objetos = [];
    infoBox.style.display = "none";
}

init();
