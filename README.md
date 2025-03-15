# 3D 手機展示平台

這是一個使用 Three.js 建立的互動式 3D 手機展示平台，允許使用者以 360 度檢視不同的手機模型並查看其規格資訊。

## 線上展示

您可以在這裡查看線上展示：[3D 手機展示平台](https://christorng.github.io/3d-phone-show/)

## 功能

- 3D 手機模型的互動式展示
- 支援多種手機模型的切換
- 手動旋轉和縮放控制
- 自動旋轉展示模式
- 顯示手機的詳細規格資訊
- 響應式設計，適應不同螢幕大小

## 技術堆疊

- HTML5
- CSS3
- JavaScript
- Three.js (3D 渲染函式庫)
- GLTFLoader (用於載入 3D 模型)
- OrbitControls (用於互動控制)

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
- 旗艦 X1 Pro
- 輕薄 Y2
- 超能 Z5

## 檔案結構

```
/
├── index.html        # 主要 HTML 檔案
├── css/
│   └── style.css     # 樣式表
├── js/
│   └── main.js       # JavaScript 主要程式碼
└── models/           # 3D 模型檔案
    ├── CHT baby.glb
    └── CHT baby color.glb
```

## 自訂

若要新增更多手機模型，可編輯 `main.js` 中的 `phoneData` 物件，加入新的模型資訊和規格。

## 授權資訊

本專案採用 [MIT 授權條款](LICENSE) 發布。請查看 LICENSE 檔案以獲取更多資訊。