// 全域變數
let scene, camera, renderer, controls;
let phoneModel;
let lightContainer; // 新增一個光源容器
let currentPhone = 'phone1';
let phoneData = {}; // 初始化空的物件，將從 API 載入資料

// 動畫控制變數
let isRotatingLeft = false;
let isRotatingRight = false;
let isZoomingIn = false;
let isZoomingOut = false;
let rotationSpeed = 0.02; // 旋轉速度
let zoomSpeed = 0.05;     // 縮放速度

// 自由展示控制變數
let isAutoRotating = false;
let autoRotationSpeed = 0.005; // 自動旋轉的速度，比手動慢一些

// 初始化函式
async function init() {
    // 先從 API 載入手機資料
    try {
        await fetchPhoneData();
    } catch (error) {
        console.error('無法從 API 載入手機資料:', error);
        // 發生錯誤時顯示錯誤訊息
        showErrorMessage('無法載入手機資料，請重新整理頁面或稍後再試。');
        return;
    }
    
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
    
    // 添加控制按鈕事件 - 使用 mousedown、mouseup 和 mouseleave 事件
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    
    // 左旋轉按鈕事件
    rotateLeftBtn.addEventListener('mousedown', () => { isRotatingLeft = true; });
    rotateLeftBtn.addEventListener('mouseup', () => { isRotatingLeft = false; });
    rotateLeftBtn.addEventListener('mouseleave', () => { isRotatingLeft = false; });
    rotateLeftBtn.addEventListener('touchstart', () => { isRotatingLeft = true; });
    rotateLeftBtn.addEventListener('touchend', () => { isRotatingLeft = false; });
    
    // 右旋轉按鈕事件
    rotateRightBtn.addEventListener('mousedown', () => { isRotatingRight = true; });
    rotateRightBtn.addEventListener('mouseup', () => { isRotatingRight = false; });
    rotateRightBtn.addEventListener('mouseleave', () => { isRotatingRight = false; });
    rotateRightBtn.addEventListener('touchstart', () => { isRotatingRight = true; });
    rotateRightBtn.addEventListener('touchend', () => { isRotatingRight = false; });
    
    // 放大按鈕事件
    zoomInBtn.addEventListener('mousedown', () => { isZoomingIn = true; });
    zoomInBtn.addEventListener('mouseup', () => { isZoomingIn = false; });
    zoomInBtn.addEventListener('mouseleave', () => { isZoomingIn = false; });
    zoomInBtn.addEventListener('touchstart', () => { isZoomingIn = true; });
    zoomInBtn.addEventListener('touchend', () => { isZoomingIn = false; });
    
    // 縮小按鈕事件
    zoomOutBtn.addEventListener('mousedown', () => { isZoomingOut = true; });
    zoomOutBtn.addEventListener('mouseup', () => { isZoomingOut = false; });
    zoomOutBtn.addEventListener('mouseleave', () => { isZoomingOut = false; });
    zoomOutBtn.addEventListener('touchstart', () => { isZoomingOut = true; });
    zoomOutBtn.addEventListener('touchend', () => { isZoomingOut = false; });
    
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
    
    // 添加自由展示按鈕事件
    const autoRotateBtn = document.getElementById('auto-rotate');
    if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', toggleAutoRotation);
    }
    
    // 添加控制器互動事件 - 當使用者開始拖動控制器時停止自動旋轉
    controls.addEventListener('start', () => {
        stopAutoRotation();
    });
    
    // 初始運行動畫
    animate();
}

// 從 API 載入手機資料
async function fetchPhoneData() {
    try {
        const response = await fetch('/api/phones');
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
        }
        phoneData = await response.json();
        console.log('成功從 API 載入手機資料:', phoneData);
        return phoneData;
    } catch (error) {
        console.error('載入手機資料時發生錯誤:', error);
        throw error;
    }
}

// 從 API 載入特定手機資料
async function fetchPhoneById(phoneId) {
    try {
        const response = await fetch(`/api/phones/${phoneId}`);
        if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
        }
        const data = await response.json();
        phoneData[phoneId] = data;
        console.log(`成功從 API 載入 ${phoneId} 資料:`, data);
        return data;
    } catch (error) {
        console.error(`載入 ${phoneId} 資料時發生錯誤:`, error);
        throw error;
    }
}

// 顯示錯誤訊息
function showErrorMessage(message) {
    // 建立一個錯誤訊息元素
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.8)';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '15px';
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '10px';
    errorDiv.style.left = '50%';
    errorDiv.style.transform = 'translateX(-50%)';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '1000';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    
    errorDiv.textContent = message;
    
    // 添加關閉按鈕
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.marginLeft = '10px';
    closeButton.style.backgroundColor = 'transparent';
    closeButton.style.border = 'none';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', () => {
        document.body.removeChild(errorDiv);
    });
    
    errorDiv.appendChild(closeButton);
    document.body.appendChild(errorDiv);
    
    // 5秒後自動消失
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

// 添加光源
function addLights() {
    // 建立一個光源容器 - 此容器將不受物件旋轉影響
    lightContainer = new THREE.Group();
    scene.add(lightContainer);
    
    // 增加環境光的強度 - 環境光不需要方向性，直接添加到場景
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    
    // 增加主要方向光的強度 - 方向光需要固定相對於相機的位置
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(0, 10, 10);
    lightContainer.add(directionalLight);
    
    // 添加第二個方向光，從另一個角度照射
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight2.position.set(-10, 5, -10);
    lightContainer.add(directionalLight2);
    
    // 添加柔和的點光源，從前方照亮模型
    const pointLight = new THREE.PointLight(0xffffff, 0.7);
    pointLight.position.set(0, 0, 10);
    lightContainer.add(pointLight);
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
            
            // 模型載入後啟動自由展示
            startAutoRotation();
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
    
    // 替代模型載入後也啟動自由展示
    startAutoRotation();
}

// 更改手機模型
async function changePhone(phoneId) {
    try {
        // 如果還沒有這個手機的資料，從 API 載入
        if (!phoneData[phoneId]) {
            await fetchPhoneById(phoneId);
        }
        
        currentPhone = phoneId;
        loadPhoneModel(phoneData[phoneId].modelPath);
        updatePhoneInfo(phoneId);
    } catch (error) {
        console.error(`更改手機模型時發生錯誤: ${error}`);
        showErrorMessage(`無法載入 ${phoneId} 的資料，請稍後再試。`);
    }
}

// 自由展示控制函式
function startAutoRotation() {
    isAutoRotating = true;
    updateAutoRotationButtonState();
}

function stopAutoRotation() {
    isAutoRotating = false;
    updateAutoRotationButtonState();
}

function toggleAutoRotation() {
    isAutoRotating = !isAutoRotating;
    updateAutoRotationButtonState();
}

function updateAutoRotationButtonState() {
    const autoRotateBtn = document.getElementById('auto-rotate');
    if (autoRotateBtn) {
        if (isAutoRotating) {
            autoRotateBtn.classList.add('active');
        } else {
            autoRotateBtn.classList.remove('active');
        }
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
        stopAutoRotation();
        phoneModel.rotation.y -= rotationSpeed;
    }
}

function rotateModelRight() {
    if (phoneModel) {
        stopAutoRotation();
        phoneModel.rotation.y += rotationSpeed;
    }
}

// 縮放
function zoomIn() {
    if (camera.position.z > 1) {
        stopAutoRotation();
        camera.position.z -= zoomSpeed;
    }
}

function zoomOut() {
    if (camera.position.z < 10) {
        stopAutoRotation();
        camera.position.z += zoomSpeed;
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
    
    // 處理持續旋轉
    if (isRotatingLeft) {
        rotateModelLeft();
    }
    if (isRotatingRight) {
        rotateModelRight();
    }
    
    // 處理持續縮放
    if (isZoomingIn) {
        zoomIn();
    }
    if (isZoomingOut) {
        zoomOut();
    }
    
    // 處理自動旋轉
    if (isAutoRotating && phoneModel) {
        phoneModel.rotation.y += autoRotationSpeed;
    }
    
    // 更新光源容器位置，使其跟隨相機
    if (lightContainer) {
        // 將光源容器位置重設，讓它相對於世界坐標系固定
        lightContainer.position.copy(camera.position);
        lightContainer.quaternion.copy(camera.quaternion);
    }
    
    controls.update();
    renderer.render(scene, camera);
}

// 頁面載入完成後執行初始化
window.addEventListener('DOMContentLoaded', init);