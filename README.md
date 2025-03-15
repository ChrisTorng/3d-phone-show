# 3D 手機展示平台

這是一個使用 Three.js 建立的互動式 3D 手機展示平台，允許使用者以 360 度檢視不同的手機模型並查看其規格資訊。

## 線上展示

您可以在這裡查看線上展示：[3D 手機展示平台](https://3d-phone-show.vercel.app/)

## 功能

- 3D 手機模型的互動式展示
- 支援多種手機模型的切換
- 手動旋轉和縮放控制
- 自動旋轉展示模式
- 顯示手機的詳細規格資訊
- 響應式設計，適應不同螢幕大小

## 技術堆疊

### 前端
- HTML5
- CSS3
- JavaScript
- Three.js (3D 渲染函式庫)
- GLTFLoader (用於載入 3D 模型)
- OrbitControls (用於互動控制)

### 後端
- Python
- Flask (Web 框架)

### 測試
- Jest (JavaScript 測試框架)
- Pytest (Python 測試框架)

### 部署
- Vercel

## 使用方式

1. 在瀏覽器中開啟 `index.html` 檔案
2. 使用導航選單切換不同的手機模型
3. 使用控制按鈕旋轉和縮放模型：
   - 左/右按鈕：旋轉模型
   - 放大/縮小按鈕：調整相機距離
   - 自動旋轉按鈕：啟動/停止自動展示模式
4. 查看右側面板中顯示的手機規格資訊

## 模型資訊

目前支援的手機模型：
- iPhone 16 Pro Max
- Samsung Galaxy S25 Ultra
- Samsung Galaxy Z Flip 3

## 檔案結構

```
/
├── index.html          # 主要 HTML 檔案
├── index.py           # Flask 後端應用程式
├── css/
│   └── style.css      # 樣式表
├── js/
│   ├── main.js        # 主要程式碼
│   ├── three-handler.js # Three.js 相關處理
│   └── __tests__/     # JavaScript 測試檔案
├── data/
│   └── phones.json    # 手機資料配置
├── models/            # 3D 模型檔案
│   ├── iphone_16_pro_max.glb
│   ├── samsung_galaxy_s22_ultra.glb
│   └── Samsung_Galaxy_Z_Flip_3.glb
└── tests/             # Python 測試檔案
```

## 開發設定

### 前端開發
```bash
npm install           # 安裝相依套件
npm test             # 執行測試
```

### 後端開發
```bash
pip install -r requirements.txt  # 安裝相依套件
python index.py                  # 啟動開發伺服器
pytest                          # 執行測試
```

## 自訂

若要新增更多手機模型，編輯 `data/phones.json` 檔案，加入新的手機資訊和規格。每個手機項目需要包含：
- 名稱
- 3D 模型路徑
- 縮放比例
- 位置和旋轉設定
- 詳細規格資訊

## 授權資訊

本專案採用 [MIT 授權條款](LICENSE) 發布。請查看 LICENSE 檔案以獲取更多資訊。