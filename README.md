<<<<<<< HEAD
# Resume template

*A simple Jekyll + GitHub Pages powered resume template.*

![img](images/screenshot.png)

## Docs

### Running locally

To test locally, run the following in your terminal:

1. Clone repo locally
1. `bundle install`
2. `bundle exec jekyll serve`
3. Open your browser to `localhost:4000`

### Running locally with Docker

To test locally with docker, run the following in your terminal after installing docker into your system:

1. `docker image build -t resume-template .`
2. `docker run --rm --name resume-template -v "$PWD":/home/app --network host resume-template`

### Customizing

First you'll want to fork the repo to your own account. Then clone it locally and customize, or use the GitHub web editor to customize.

#### Options/configuration

Most of the basic customization will take place in the `/_config.yml` file. Here is a list of customizations available via `/_config.yml`:

[...write these out...]

#### Editing content

Most of the content configuration will take place in the `/_layouts/resume.html` file. Simply edit the markup there accordingly

### Publishing to GitHub Pages for free

[GitHub Pages](https://pages.github.com/) will host this for free with your GitHub account. Just make sure you're using a `gh-pages` branch, and the site will automatically be available at `yourusername.github.io/resume-template` (you can rename the repo to resume for your own use if you want it to be available at `yourusername.github.io/resume`). You can also add a CNAME if you want it to be available at a custom domain...

### Configuring with your own domain name

To setup your GH Pages site with a custom domain, [follow the instructions](https://help.github.com/articles/setting-up-a-custom-domain-with-github-pages/) on the GitHub Help site for that topic.

### Themes

Right now resume-template only has one theme. More are coming :soon: though. :heart:

## Roadmap

A feature roadmap is [available here](https://github.com/jglovier/resume-template/projects/1). If you features suggestions, please [open a new issue](https://github.com/jglovier/resume-template/issues/new).

## Contributing

If you spot a bug, or want to improve the code, or even make the dummy content better, you can do the following:

1. [Open an issue](https://github.com/jglovier/resume-template/issues/new) describing the bug or feature idea
2. Fork the project, make changes, and submit a pull request

## License

The code and styles are licensed under the MIT license. [See project license.](LICENSE) Obviously you should not use the content of this demo repo in your own resume. :wink:

Disclaimer: Use of Homer J. Simpson image and name used under [Fair Use](https://en.wikipedia.org/wiki/Fair_use) for educational purposes. Project license does not apply to use of this material.
=======
 # /models 数理モデル<br>

 ## Nagel-Schreckenbergモデル
 
 https://cohock13.github.io/models/Nagel-Schreckenberg/
 
 <img src="https://user-images.githubusercontent.com/55901554/163255204-2bf925fc-abdd-4f92-b528-8674825107d0.PNG" width="500">

 交通流のモデルの一つ．<br>
 黒いセルが車に相当し，パラメータによっては渋滞が発生する．<br>
 
 ## Boidsモデル
 
 https://cohock13.github.io/models/boids/
 
  <img src="https://user-images.githubusercontent.com/55901554/163255255-4fe33a59-ec8f-456d-b9c9-c7c43d22969f.PNG" width="500">

 Boidsモデルのシミュレータ．右上のGUIから様々なパラメータを調節可能．<br>
 素直にO(N^2)で動かしているので計算量改善が課題．あと軸つける．<br>
 
 ## ドライブシミュレータ
 
 https://cohock13.github.io/models/car_simulator/a/
 
 <img src="https://user-images.githubusercontent.com/55901554/163255280-6f83ebf7-31ff-45f2-b6f1-80f146f251b3.PNG" width="500">

 cで視点切り替えが可能．WAS/矢印キーで操作．<br>
 右上のGUIから，加速度などの物理情報やキーボードの時系列データを出力が可能．<br>
 
 ## 質点の移動度評価テスト
 
 https://cohock13.github.io/models/cell-eval-3d/
 
 <img src="https://user-images.githubusercontent.com/55901554/163255315-fb34cc9a-f9a5-41e1-be1f-40f9e84759bb.PNG" width="500">

 たたき台として作成したシミュレータ．<br>
 左側はランダムな，右側は赤と緑が沿った動きをする．<br>
 GUIは未整備．
 
 ## 1次元ミミズモデル
 
 https://cohock13.github.io/models/earthworm/
 
 <img src="https://user-images.githubusercontent.com/55901554/163255339-8de8e676-9ced-4ea3-b2af-5bdcebf164c6.PNG" width="500">

 1次元のバネ-質点系でモデル化したミミズのモデル．<br>
 rを0以上にしてGUIのRTS(バネの自然長）を調節することによって，身体に波が伝わる．<br>
 背景がわかりづらいので軸を置きたい...<br>
 
 ## 2次遅れ系のステップ応答
 
 https://cohock13.github.io/models/system-control-a/
 
  <img src="https://user-images.githubusercontent.com/55901554/163255360-b0822875-f6ec-43b4-b6bc-86c549a71865.PNG" width="500">

 制御工学のTAで作成した二次遅れ系のシミュレータ．<br>
 固有角周波数と減衰比を右上のGUIから調節．<br>
 
>>>>>>> cab6985991374dc7a498e22df77f69fd9f39d63b
