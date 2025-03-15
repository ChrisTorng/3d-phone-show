/**
 * 主控模組測試
 */

// 模擬 Three.js 相關的全域變數和函式
global.THREE = {
    Scene: jest.fn(),
    PerspectiveCamera: jest.fn(),
    WebGLRenderer: jest.fn(() => ({
        setSize: jest.fn(),
        domElement: document.createElement('canvas')
    })),
    Color: jest.fn(),
    Group: jest.fn(),
    AmbientLight: jest.fn(),
    DirectionalLight: jest.fn(),
    PointLight: jest.fn(),
    BoxGeometry: jest.fn(),
    PlaneGeometry: jest.fn(),
    MeshPhongMaterial: jest.fn(),
    MeshBasicMaterial: jest.fn(),
    Mesh: jest.fn(),
    GLTFLoader: jest.fn()
};

// 模擬 OrbitControls
global.THREE.OrbitControls = jest.fn(() => ({
    enableDamping: false,
    dampingFactor: 0,
    update: jest.fn()
}));

describe('主控模組', () => {
    beforeEach(() => {
        // 重置 DOM
        document.body.innerHTML = `
            <div id="canvas-container"></div>
            <div id="phone-menu"></div>
            <div id="phone-name"></div>
            <div id="screen-size"></div>
            <div id="processor"></div>
            <div id="camera"></div>
            <div id="battery"></div>
            <div id="storage"></div>
        `;
        
        // 清除全域變數的模組快取
        jest.resetModules();
    });
    
    test('應該正確載入並初始化', async () => {
        // 模擬成功的 API 回應
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({
                    phone1: {
                        name: '測試手機',
                        modelPath: 'test/path',
                        specs: {
                            screenSize: '6.1 吋',
                            processor: '測試處理器',
                            camera: '測試相機',
                            battery: '測試電池',
                            storage: '測試儲存空間'
                        }
                    }
                })
            })
        );
        
        // 載入主要程式碼
        require('../main.js');
        
        // 觸發 DOMContentLoaded 事件
        const event = new Event('DOMContentLoaded');
        window.dispatchEvent(event);
        
        // 等待非同步操作完成
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // 驗證 API 是否被呼叫
        expect(fetch).toHaveBeenCalledWith('/api/phones');
        
        // 驗證 DOM 是否正確更新
        const phoneMenu = document.getElementById('phone-menu');
        expect(phoneMenu.innerHTML).not.toBe('');
        expect(phoneMenu.querySelector('a')).not.toBeNull();
    });
    
    test('應該正確處理 API 錯誤', async () => {
        // 模擬 API 錯誤
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500
            })
        );
        
        // 載入主要程式碼
        require('../main.js');
        
        // 觸發 DOMContentLoaded 事件
        const event = new Event('DOMContentLoaded');
        window.dispatchEvent(event);
        
        // 等待非同步操作完成
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // 驗證錯誤訊息是否顯示
        const errorMessage = document.querySelector('.error-message');
        expect(errorMessage).not.toBeNull();
    });
});