from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__)

# 定義靜態資源的根目錄
APP_ROOT = os.path.dirname(os.path.abspath(__file__))

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
    return send_from_directory('models', path)

# API 路由：獲取所有手機資料
@app.route('/api/phones', methods=['GET'])
def get_phones():
    # 這裡模擬從資料庫或檔案中讀取手機資料
    phones_data = {
        'phone1': {
            'name': '旗艦 X1 Pro',
            'modelPath': 'models/CHT baby.glb',
            'scale': 1.5,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'specs': {
                'screenSize': '6.7 吋 AMOLED',
                'processor': '高通驍龍 8 Gen 1',
                'camera': '108MP + 48MP + 12MP',
                'battery': '5000mAh',
                'storage': '256GB'
            }
        },
        'phone2': {
            'name': '輕薄 Y2',
            'modelPath': 'models/CHT baby color.glb',
            'scale': 1.5,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'specs': {
                'screenSize': '6.1 吋 OLED',
                'processor': '高通驍龍 778G',
                'camera': '64MP + 12MP',
                'battery': '4500mAh',
                'storage': '128GB'
            }
        },
        'phone3': {
            'name': '超能 Z5',
            'modelPath': 'models/phone3.glb',
            'scale': 1.5,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'specs': {
                'screenSize': '6.9 吋 Dynamic AMOLED',
                'processor': 'Apple A16',
                'camera': '50MP + 50MP + 12MP + 8MP',
                'battery': '4800mAh',
                'storage': '512GB'
            }
        }
    }
    return jsonify(phones_data)

# API 路由：獲取特定手機資料
@app.route('/api/phones/<phone_id>', methods=['GET'])
def get_phone(phone_id):
    # 這裡模擬從資料庫或檔案中讀取手機資料
    phones_data = {
        'phone1': {
            'name': '旗艦 X1 Pro',
            'modelPath': 'models/CHT baby.glb',
            'scale': 1.5,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'specs': {
                'screenSize': '6.7 吋 AMOLED',
                'processor': '高通驍龍 8 Gen 1',
                'camera': '108MP + 48MP + 12MP',
                'battery': '5000mAh',
                'storage': '256GB'
            }
        },
        'phone2': {
            'name': '輕薄 Y2',
            'modelPath': 'models/CHT baby color.glb',
            'scale': 1.5,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'specs': {
                'screenSize': '6.1 吋 OLED',
                'processor': '高通驍龍 778G',
                'camera': '64MP + 12MP',
                'battery': '4500mAh',
                'storage': '128GB'
            }
        },
        'phone3': {
            'name': '超能 Z5',
            'modelPath': 'models/phone3.glb',
            'scale': 1.5,
            'position': {'x': 0, 'y': 0, 'z': 0},
            'rotation': {'x': 0, 'y': 0, 'z': 0},
            'specs': {
                'screenSize': '6.9 吋 Dynamic AMOLED',
                'processor': 'Apple A16',
                'camera': '50MP + 50MP + 12MP + 8MP',
                'battery': '4800mAh',
                'storage': '512GB'
            }
        }
    }
    
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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)