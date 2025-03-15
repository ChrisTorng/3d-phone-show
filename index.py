from flask import Flask, send_from_directory, jsonify
from werkzeug.security import safe_join
import os
import json

app = Flask(__name__)

# 定義靜態資源的根目錄
APP_ROOT = os.path.dirname(os.path.abspath(__file__))

# 讀取手機資料的函式
def load_phones_data():
    try:
        data_path = app.config.get('DATA_PATH', os.path.join(APP_ROOT, 'data', 'phones.json'))
        with open(data_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f'讀取手機資料錯誤: {str(e)}')
        return {}

# 首頁路由
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

# CSS 檔案路由
@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('css', path)

# JavaScript 檔案路由
@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

# 3D 模型檔案路由
@app.route('/models/<path:path>')
def send_model(path):
    try:
        # 使用 safe_join 確保安全的路徑處理
        safe_path = safe_join(APP_ROOT, 'models', path)
        if not safe_path or not os.path.exists(safe_path):
            return jsonify({'error': '找不到指定模型'}), 404
        return send_from_directory('models', path)
    except Exception as e:
        return jsonify({'error': f'無法存取模型: {str(e)}'}), 500

# API 路由：獲取所有手機資料
@app.route('/api/phones', methods=['GET'])
def get_phones():
    phones_data = load_phones_data()
    return jsonify(phones_data)

# API 路由：獲取特定手機資料
@app.route('/api/phones/<phone_id>', methods=['GET'])
def get_phone(phone_id):
    phones_data = load_phones_data()
    if phone_id in phones_data:
        return jsonify(phones_data[phone_id])
    else:
        return jsonify({'error': '找不到手機資料'}), 404

# API 路由：獲取所有可用的模型檔案
@app.route('/api/models', methods=['GET'])
def get_models():
    models_dir = os.path.join(APP_ROOT, 'models')
    models_list = []
    
    # 取得所有模型檔案列表
    try:
        for filename in os.listdir(models_dir):
            file_path = os.path.join(models_dir, filename)
            if os.path.isfile(file_path):
                # 取得檔案資訊
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

# 新增錯誤處理機制
@app.errorhandler(Exception)
def handle_error(e):
    return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    try:
        app.run(host='0.0.0.0', port=5000, debug=True)
    except OSError as e:
        print(f'伺服器啟動錯誤: {e}')
        # 確保正確清理資源
        import sys
        sys.exit(1)