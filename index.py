"""
3D Phone Show API 伺服器

這個模組提供 3D Phone Show 網站的後端 API 服務，包含：
- 靜態資源提供（HTML、CSS、JavaScript、3D 模型檔案）
- 手機資料 API
- 3D 模型檔案管理 API

需求套件：
- Flask: Web 框架
- Werkzeug: 安全性功能
"""

from flask import Flask, send_from_directory, jsonify
from werkzeug.security import safe_join
import os
import json

app = Flask(__name__)

# 定義靜態資源的根目錄
APP_ROOT = os.path.dirname(os.path.abspath(__file__))

def load_phones_data():
    """
    讀取手機資料檔案
    
    從設定的路徑或預設路徑讀取 phones.json 檔案
    
    回傳:
        dict: 手機資料字典物件
        若發生錯誤則回傳空字典
    """
    try:
        data_path = app.config.get('DATA_PATH', os.path.join(APP_ROOT, 'data', 'phones.json'))
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f'讀取手機資料錯誤: {str(e)}')
        return {}

@app.route('/')
def index():
    """提供首頁 HTML"""
    return send_from_directory('.', 'index.html')

@app.route('/css/<path:path>')
def send_css(path):
    """
    提供 CSS 檔案
    
    參數:
        path (str): CSS 檔案路徑
    """
    return send_from_directory('css', path)

@app.route('/js/<path:path>')
def send_js(path):
    """
    提供 JavaScript 檔案
    
    參數:
        path (str): JavaScript 檔案路徑
    """
    return send_from_directory('js', path)

@app.route('/models/<path:path>')
def send_model(path):
    """
    提供 3D 模型檔案
    
    參數:
        path (str): 模型檔案路徑
        
    回傳:
        成功: 檔案串流
        失敗: 錯誤訊息與狀態碼
    """
    try:
        safe_path = safe_join(APP_ROOT, 'models', path)
        if not safe_path or not os.path.exists(safe_path):
            return jsonify({'error': '找不到指定模型'}), 404
        return send_from_directory('models', path)
    except Exception as e:
        return jsonify({'error': f'無法存取模型: {str(e)}'}), 500

@app.route('/api/phones', methods=['GET'])
def get_phones():
    """
    取得所有手機資料
    
    回傳:
        dict: 完整手機資料字典
    """
    phones_data = load_phones_data()
    return jsonify(phones_data)

@app.route('/api/phones/<phone_id>', methods=['GET'])
def get_phone(phone_id):
    """
    取得特定手機資料
    
    參數:
        phone_id (str): 手機識別碼
        
    回傳:
        成功: 特定手機資料
        失敗: 錯誤訊息與 404 狀態碼
    """
    phones_data = load_phones_data()
    if phone_id in phones_data:
        return jsonify(phones_data[phone_id])
    else:
        return jsonify({'error': '找不到手機資料'}), 404

@app.route('/api/models', methods=['GET'])
def get_models():
    """
    取得所有可用的 3D 模型檔案清單
    
    回傳:
        成功: 模型檔案清單，包含檔名、路徑、大小與最後修改時間
        失敗: 錯誤訊息與狀態碼
    """
    models_dir = os.path.join(APP_ROOT, 'models')
    models_list = []
    
    try:
        for filename in os.listdir(models_dir):
            file_path = os.path.join(models_dir, filename)
            if os.path.isfile(file_path):
                file_stats = os.stat(file_path)
                models_list.append({
                    'name': filename,
                    'path': f'models/{filename}',
                    'size': file_stats.st_size,
                    'last_modified': file_stats.st_mtime
                })
        return jsonify(models_list)
    except Exception as e:
        return jsonify({'error': f'無法獲取模型清單: {str(e)}'}), 500

@app.errorhandler(Exception)
def handle_error(e):
    """
    全域錯誤處理器
    
    參數:
        e (Exception): 異常物件
        
    回傳:
        tuple: (錯誤訊息, 500 狀態碼)
    """
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except OSError as e:
        print(f'伺服器啟動錯誤: {e}')
        import sys
        sys.exit(1)