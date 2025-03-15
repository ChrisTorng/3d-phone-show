// 全域變數
let scene, camera, renderer, controls;
let phoneModel, ambientLight, directionalLight;
let currentPhone = 'phone1';

// 手機資料
const phoneData = {
    phone1: {
        name: '旗艦 X1 Pro',
        modelPath: 'models/CHT baby.glb',
        scale: 1.5,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        specs: {
            screenSize: '6.7 吋 AMOLED',
            processor: '高通驍龍 8 Gen 1',
            camera: '108MP + 48MP + 12MP',
            battery: '5000mAh',
            storage: '256GB'
        }
    },
    phone2: {
        name: '輕薄 Y2',
        modelPath: 'models/CHT baby color.glb',
        scale: 1.5,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        specs: {
            screenSize: '6.1 吋 OLED',
            processor: '高通驍龍 778G',
            camera: '64MP + 12MP',
            battery: '4500mAh',
            storage: '128GB'
        }
    },
    phone3: {
        name: '超能 Z5',
        modelPath: 'models/phone3.glb',
        scale: 1.5,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        specs: {
            screenSize: '6.9 吋 Dynamic AMOLED',
            processor: 'Apple A16',
            camera: '50MP + 50MP + 12MP + 8MP',
            battery: '4800mAh',
            storage: '512GB'
        }
    }
};

// 初始化函式
function init() {
    // 建立場景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8f9fa);
    
    // 建立相機
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    
    // 建立渲染器
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    
    // 建立軌道控制
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    
    // 添加光源
    addLights();
    
    // 載入預設手機模型
    loadPhoneModel(phoneData[currentPhone].modelPath);
    
    // 更新手機規格資訊
    updatePhoneInfo(currentPhone);
    
    // 添加窗口調整大小事件
    window.addEventListener('resize', onWindowResize, false);
    
    // 添加控制按鈕事件
    document.getElementById('rotate-left').addEventListener('click', rotateModelLeft);
    document.getElementById('rotate-right').addEventListener('click', rotateModelRight);
    document.getElementById('zoom-in').addEventListener('click', zoomIn);
    document.getElementById('zoom-out').addEventListener('click', zoomOut);
    
    // 添加導航菜單事件
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const phoneId = this.getAttribute('data-model');
            changePhone(phoneId);
            
            // 更新活躍狀態
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // 初始運行動畫
    animate();
}

// 添加光源
function addLights() {
    // 增加環境光的強度
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // 增加主要方向光的強度
    directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // 添加第二個方向光，從另一個角度照射
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, 5, -10);
    scene.add(directionalLight2);
    
    // 添加柔和的點光源，從前方照亮模型
    const pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position.set(0, 0, 10);
    scene.add(pointLight);
}

// 載入手機模型
function loadPhoneModel(modelPath) {
    // 如果已有模型，先移除
    if (phoneModel) {
        scene.remove(phoneModel);
    }
    
    const loader = new THREE.GLTFLoader();
    
    loader.load(
        modelPath,
        function (gltf) {
            phoneModel = gltf.scene;
            const data = phoneData[currentPhone];
            
            phoneModel.scale.set(data.scale, data.scale, data.scale);
            phoneModel.position.set(data.position.x, data.position.y, data.position.z);
            phoneModel.rotation.set(data.rotation.x, data.rotation.y, data.rotation.z);
            
            // 確保材質可以接收光源
            phoneModel.traverse((node) => {
                if (node.isMesh) {
                    node.material.needsUpdate = true;
                    
                    // 為材質設定更好的光照響應
                    if (node.material) {
                        // 提高金屬感和光澤度
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
        },
        undefined,
        function (error) {
            console.error('載入模型時發生錯誤:', error);
            createPlaceholderPhone();
        }
    );
}

// 建立替代手機模型
function createPlaceholderPhone() {
    // 建立簡單的手機模型（矩形）
    const phoneGeometry = new THREE.BoxGeometry(1, 2, 0.1);
    const screenGeometry = new THREE.PlaneGeometry(0.9, 1.8);
    
    // 根據當前手機選擇不同顏色
    let phoneColor;
    switch(currentPhone) {
        case 'phone1':
            phoneColor = 0x000000; // 黑色
            break;
        case 'phone2':
            phoneColor = 0x1E88E5; // 藍色
            break;
        case 'phone3':
            phoneColor = 0x43A047; // 綠色
            break;
        default:
            phoneColor = 0x000000;
    }
    
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: phoneColor });
    const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x121212 });
    
    const phoneMesh = new THREE.Mesh(phoneGeometry, bodyMaterial);
    const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
    
    screenMesh.position.z = 0.051;
    
    phoneModel = new THREE.Group();
    phoneModel.add(phoneMesh);
    phoneModel.add(screenMesh);
    
    scene.add(phoneModel);
}

// 更改手機模型
function changePhone(phoneId) {
    if (phoneData[phoneId]) {
        currentPhone = phoneId;
        loadPhoneModel(phoneData[phoneId].modelPath);
        updatePhoneInfo(phoneId);
    }
}

// 更新手機資訊
function updatePhoneInfo(phoneId) {
    const data = phoneData[phoneId];
    
    document.getElementById('phone-name').textContent = data.name;
    document.getElementById('screen-size').textContent = data.specs.screenSize;
    document.getElementById('processor').textContent = data.specs.processor;
    document.getElementById('camera').textContent = data.specs.camera;
    document.getElementById('battery').textContent = data.specs.battery;
    document.getElementById('storage').textContent = data.specs.storage;
}

// 旋轉模型
function rotateModelLeft() {
    if (phoneModel) {
        phoneModel.rotation.y -= Math.PI / 6;
    }
}

function rotateModelRight() {
    if (phoneModel) {
        phoneModel.rotation.y += Math.PI / 6;
    }
}

// 縮放
function zoomIn() {
    if (camera.position.z > 2) {
        camera.position.z -= 0.5;
    }
}

function zoomOut() {
    if (camera.position.z < 10) {
        camera.position.z += 0.5;
    }
}

// 視窗大小調整
function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// 動畫迴圈
function animate() {
    requestAnimationFrame(animate);
    
    if (phoneModel) {
        // 添加輕微自動旋轉效果
        // phoneModel.rotation.y += 0.002;
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 頁面載入完成後執行初始化
window.addEventListener('DOMContentLoaded', init);