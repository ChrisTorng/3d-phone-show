import json
import os
import pytest
from index import app

@pytest.fixture
def client():
    """建立測試用的 Flask 客戶端"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@pytest.fixture
def mock_phones_data(tmp_path):
    """建立測試用的手機資料"""
    test_data = {
        "phone1": {
            "name": "測試手機 1",
            "modelPath": "models/test-model-1.glb",
            "scale": 1.0,
            "position": {"x": 0, "y": 0, "z": 0},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "specs": {
                "screenSize": "6.1 吋",
                "processor": "測試處理器",
                "camera": "測試相機",
                "battery": "4000mAh",
                "storage": "128GB"
            }
        },
        "phone2": {
            "name": "測試手機 2",
            "modelPath": "models/test-model-2.glb",
            "scale": 1.0,
            "position": {"x": 0, "y": 0, "z": 0},
            "rotation": {"x": 0, "y": 0, "z": 0},
            "specs": {
                "screenSize": "6.5 吋",
                "processor": "測試處理器 2",
                "camera": "測試相機 2",
                "battery": "4500mAh",
                "storage": "256GB"
            }
        }
    }
    
    # 確保資料目錄存在
    data_dir = tmp_path / "data"
    data_dir.mkdir(exist_ok=True)
    phones_file = data_dir / "phones.json"
    
    # 寫入測試資料
    phones_file.write_text(json.dumps(test_data, ensure_ascii=False), encoding='utf-8')
    
    # 設定應用程式配置
    app.config['DATA_PATH'] = str(phones_file)
    
    return test_data

def test_index_route(client):
    """測試首頁路由"""
    response = client.get('/')
    assert response.status_code == 200

def test_get_all_phones(client, mock_phones_data):
    """測試獲取所有手機資料的 API"""
    response = client.get('/api/phones')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data == mock_phones_data
    assert len(data) == 2

def test_get_specific_phone(client, mock_phones_data):
    """測試獲取特定手機資料的 API"""
    response = client.get('/api/phones/phone1')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data == mock_phones_data['phone1']

def test_get_nonexistent_phone(client):
    """測試獲取不存在手機資料的錯誤處理"""
    response = client.get('/api/phones/nonexistent')
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'error' in data

def test_models_route(client):
    """測試模型檔案路由"""
    response = client.get('/api/models')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert isinstance(data, list)

def test_static_routes(client):
    """測試靜態資源路由"""
    # 測試 CSS 路由
    response = client.get('/css/style.css')
    assert response.status_code in [200, 404]  # 檔案可能存在或不存在
    
    # 測試 JavaScript 路由
    response = client.get('/js/main.js')
    assert response.status_code in [200, 404]  # 檔案可能存在或不存在
