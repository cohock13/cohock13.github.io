# GitHub Pages 公開手順

## 必要なファイルのコピー
```bash
# 作業ディレクトリ作成
mkdir -p /tmp/oil_timer_deploy
cd /tmp/oil_timer_deploy

# 必要なファイルのみコピー
cp /home/syamaji/claude-test/oil_timer_demo/index.html .
cp /home/syamaji/claude-test/oil_timer_demo/main.js .
cp /home/syamaji/claude-test/oil_timer_demo/oiltimer.js .
```

## Gitでのデプロイ
```bash
# リポジトリをクローン
git clone https://github.com/cohock13/cohock13.github.io.git
cd cohock13.github.io

# フォルダ構造作成
mkdir -p oik/models/oil_timer

# ファイルをコピー
cp /tmp/oil_timer_deploy/* oik/models/oil_timer/

# コミット & プッシュ
git add oik/models/oil_timer/
git commit -m "Add oil timer simulator"
git push origin master
```

## 公開URL
https://cohock13.github.io/oik/models/oil_timer/

## 注意点
- GitHub Pagesは静的サイトのみ対応
- `package.json`等のNode.js依存ファイルは不要
- CDNからのライブラリ読み込みなので動作可能