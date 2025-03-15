// 3D 場景相關變數
let scene, camera, renderer, controls;
let phoneModel;
let lightContainer;
let autoRotationSpeed = 0.005;
let rotationSpeed = 0.02;
let zoomSpeed = 0.05;

/**
 * Three.js 場景處理模組
 * 負責 3D 渲染、模型載入及場景控制
 */

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

// 移除目前的手機模型
function removeCurrentModel() {
    if (phoneModel) {
        scene.remove(phoneModel);
        phoneModel = null;
    }
}

/**
 * 載入手機 3D 模型
 * @param {string} modelPath - 模型檔案路徑
 * @param {Object} modelData - 模型相關資料
 * @returns {Promise<void>}
 * @throws {Error} 當模型載入失敗時
 */
function loadPhoneModel(modelPath, modelData) {
    return new Promise((resolve, reject) => {
        try {
            removeCurrentModel();  // 在載入新模型前移除舊模型
            const loader = new THREE.GLTFLoader();
            loader.load(
                modelPath,
                (gltf) => {
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
                    resolve();
                },
                undefined,
                (error) => {
                    console.error('模型載入失敗:', error);
                    reject(new Error(`無法載入模型 ${modelPath}: ${error.message}`));
                }
            );
        } catch (error) {
            reject(error);
        }
    });
}

// 建立替代手機模型
function createPlaceholderPhone(phoneColor = 0x000000) {
    removeCurrentModel();  // 在建立替代模型前移除舊模型
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
    stopAutoRotation();
    if (phoneModel) {
        phoneModel.rotation.y += rotationSpeed * direction;
    }
}

function zoomCamera(direction) {
    // 移除對 stopAutoRotation 的呼叫，因為這個函式在此檔案中不存在
    const newZ = camera.position.z + (zoomSpeed * direction);
    if (newZ > 1 && newZ < 20) {
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
    updateScene,
    removeCurrentModel  // 將新函式加入到全域範圍
};