// 全域變數
let currentPhone = 'phone1';
let phoneData = {}; // 初始化空的物件，將從 API 載入資料

// 控制變數
let isRotatingLeft = false;
let isRotatingRight = false;
let isZoomingIn = false;
let isZoomingOut = false;
let isAutoRotating = false;

// 初始化函式
async function init() {
    try {
        await fetchPhoneData();
    } catch (error) {
        console.error('無法從 API 載入手機資料:', error);
        showErrorMessage('無法載入手機資料，請重新整理頁面或稍後再試。');
        return;
    }
    
    // 初始化 3D 場景
    const container = document.getElementById('canvas-container');
    ThreeHandler.initThreeScene(container);
    
    // 載入預設手機模型
    ThreeHandler.loadPhoneModel(phoneData[currentPhone].modelPath, phoneData[currentPhone])
        .then(() => {
            startAutoRotation();
        })
        .catch(error => {
            console.error('載入模型時發生錯誤:', error);
            ThreeHandler.createPlaceholderPhone();
            startAutoRotation();
        });
    
    // 更新手機規格資訊
    updatePhoneInfo(currentPhone);
    
    // 添加窗口調整大小事件
    window.addEventListener('resize', () => {
        const container = document.getElementById('canvas-container');
        ThreeHandler.resizeRenderer(container);
    }, false);
    
    // 添加控制按鈕事件
    setupControlButtons();
    
    // 添加導航菜單事件
    setupNavigationMenu();
    
    // 初始運行動畫
    animate();
}

// 設定控制按鈕
function setupControlButtons() {
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const autoRotateBtn = document.getElementById('auto-rotate');
    
    // 旋轉控制
    setupButtonControl(rotateLeftBtn, 
        () => { isRotatingLeft = true; }, 
        () => { isRotatingLeft = false; }
    );
    
    setupButtonControl(rotateRightBtn,
        () => { isRotatingRight = true; },
        () => { isRotatingRight = false; }
    );
    
    // 縮放控制
    setupButtonControl(zoomInBtn,
        () => { isZoomingIn = true; },
        () => { isZoomingIn = false; }
    );
    
    setupButtonControl(zoomOutBtn,
        () => { isZoomingOut = true; },
        () => { isZoomingOut = false; }
    );
    
    // 自動旋轉按鈕
    if (autoRotateBtn) {
        autoRotateBtn.addEventListener('click', toggleAutoRotation);
    }
}

// 設定按鈕控制
function setupButtonControl(button, startCallback, stopCallback) {
    if (!button) return;
    
    button.addEventListener('mousedown', startCallback);
    button.addEventListener('mouseup', stopCallback);
    button.addEventListener('mouseleave', stopCallback);
    button.addEventListener('touchstart', startCallback);
    button.addEventListener('touchend', stopCallback);
}

// 設定導航菜單
function setupNavigationMenu() {
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const phoneId = this.getAttribute('data-model');
            changePhone(phoneId);
            
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            this.classList.add('active');
        });
    });
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

// 更改手機模型
async function changePhone(phoneId) {
    try {
        if (!phoneData[phoneId]) {
            await fetchPhoneById(phoneId);
        }
        
        currentPhone = phoneId;
        await ThreeHandler.loadPhoneModel(phoneData[phoneId].modelPath, phoneData[phoneId]);
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
        autoRotateBtn.classList.toggle('active', isAutoRotating);
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

// 動畫迴圈
function animate() {
    requestAnimationFrame(animate);
    
    if (isRotatingLeft) {
        ThreeHandler.rotateModel(-1);
    }
    if (isRotatingRight) {
        ThreeHandler.rotateModel(1);
    }
    
    if (isZoomingIn) {
        // 在縮放時停止自動旋轉
        if (isAutoRotating) {
            stopAutoRotation();
        }
        ThreeHandler.zoomCamera(-1);
    }
    if (isZoomingOut) {
        // 在縮放時停止自動旋轉
        if (isAutoRotating) {
            stopAutoRotation();
        }
        ThreeHandler.zoomCamera(1);
    }
    
    if (isAutoRotating) {
        ThreeHandler.autoRotateModel();
    }
    
    ThreeHandler.updateScene();
}

// 頁面載入完成後執行初始化
window.addEventListener('DOMContentLoaded', init);