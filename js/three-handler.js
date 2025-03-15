// 3D 場景相關變數
let scene, camera, renderer, controls;
let phoneModel;
let lightContainer;
let autoRotationSpeed = 0.005;
let rotationSpeed = 0.02;
let zoomSpeed = 0.05;

// 初始化 3D 場景
function initThreeScene(container) {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    addLights();
    
    return { scene, camera, renderer, controls };
}

// 添加光源
function addLights() {
    lightContainer = new THREE.Group();
    scene.add(lightContainer);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(0, 10, 10);
    lightContainer.add(directionalLight);
    
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, 5, -10);
    lightContainer.add(directionalLight2);
    
    const pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position.set(0, 0, 10);
    lightContainer.add(pointLight);
}

// 載入手機模型
function loadPhoneModel(modelPath, modelData) {
    if (phoneModel) {
        scene.remove(phoneModel);
    }
    
    const loader = new THREE.GLTFLoader();
    
    return new Promise((resolve, reject) => {
        loader.load(
            modelPath,
            function (gltf) {
                phoneModel = gltf.scene;
                
                phoneModel.scale.set(modelData.scale, modelData.scale, modelData.scale);
                phoneModel.position.set(
                    modelData.position.x, 
                    modelData.position.y, 
                    modelData.position.z
                );
                phoneModel.rotation.set(
                    modelData.rotation.x, 
                    modelData.rotation.y, 
                    modelData.rotation.z
                );
                
                phoneModel.traverse((node) => {
                    if (node.isMesh) {
                        node.material.needsUpdate = true;
                        if (node.material) {
                            if (node.material.metalness !== undefined) {
                                node.material.metalness = 0.5;
                            }
                            if (node.material.roughness !== undefined) {
                                node.material.roughness = 0.2;
                            }
                        }
                    }
                });
                
                scene.add(phoneModel);
                resolve(phoneModel);
            },
            undefined,
            reject
        );
    });
}

// 建立替代手機模型
function createPlaceholderPhone(phoneColor = 0x000000) {
    const phoneGeometry = new THREE.BoxGeometry(1, 2, 0.1);
    const screenGeometry = new THREE.PlaneGeometry(0.9, 1.8);
    
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: phoneColor });
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x121212 });
    
    const phoneMesh = new THREE.Mesh(phoneGeometry, bodyMaterial);
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    
    screenMesh.position.z = 0.051;
    
    phoneModel = new THREE.Group();
    phoneModel.add(phoneMesh);
    phoneModel.add(screenMesh);
    
    scene.add(phoneModel);
    
    return phoneModel;
}

// 模型控制函式
function rotateModel(direction) {
    if (phoneModel) {
        phoneModel.rotation.y += rotationSpeed * direction;
    }
}

function zoomCamera(direction) {
    const newZ = camera.position.z + (zoomSpeed * direction);
    if (newZ > 1 && newZ < 10) {
        camera.position.z = newZ;
    }
}

function autoRotateModel() {
    if (phoneModel) {
        phoneModel.rotation.y += autoRotationSpeed;
    }
}

function updateLightPosition() {
    if (lightContainer) {
        lightContainer.position.copy(camera.position);
        lightContainer.quaternion.copy(camera.quaternion);
    }
}

function resizeRenderer(container) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 動畫更新
function updateScene() {
    controls.update();
    updateLightPosition();
    renderer.render(scene, camera);
}

// 將所有函式加入全域範圍
window.ThreeHandler = {
    initThreeScene,
    loadPhoneModel,
    createPlaceholderPhone,
    rotateModel,
    zoomCamera,
    autoRotateModel,
    resizeRenderer,
    updateScene
};