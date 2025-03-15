import pytest
import os
import sys

# 將專案根目錄加入 Python 路徑
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

@pytest.fixture(autouse=True)
def setup_test_environment():
    """設定測試環境"""
    # 設定測試用的環境變數
    os.environ['FLASK_ENV'] = 'testing'
    yield
    # 測試後清理環境變數
    if 'FLASK_ENV' in os.environ:
        del os.environ['FLASK_ENV']
