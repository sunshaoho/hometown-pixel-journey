Changes in My Hometown — 手机 GitHub 上传版（第 6 版）

这个包已将全部文件放在同一层，没有 assets 文件夹。
网页的素材路径已经同步修改，内容、画面、视频时长和交互保持原第 6 版。
这是独立可部署的预构建文件包，不需要安装依赖或执行编译。

手机上传 GitHub
1. 解压 hometown-phone-upload-v6.zip，打开解压后的文件夹。
2. GitHub 仓库中选择 Add file → Upload files → choose your files。
3. 打开本包解压后的目录，取消 Images / Videos 等类型筛选，选择全部 58 个文件。
4. 文件应全部上传在仓库根目录；不要将解压后最外层文件夹本身再套进仓库。
5. 等待上传完成，点击 Commit changes 保存。单个文件均小于 25 MiB。
6. 原来的 7 个根目录文件如果已提交，新包内同名文件会作为更新上传。
7. 使用新包里的 index.html / opening.js，不要和旧包的路径版本混用。

Cloudflare Pages 连接 GitHub
Framework preset: None
Production branch: main
Build command: exit 0
Build output directory: .
Root directory: 留空

本 ZIP 也可以在 Cloudflare Pages 的直接上传入口整体选择上传。
直接上传项目以后若要使用 Git 自动部署，需要另外创建 Git 集成项目。

播放操作
开头点击 begin the jouney；左右箭头切换场景；视频点击后播放一次并停在最后一帧。
第一个小区点击楼房进入楼道，再点击开始走路。
欧亚先于万达；三个指定章节显示 episode 1、episode 2、episode 3。
小卖部点击后播放约 12 秒走入及右转张望动画，结束后停住；按 R 重播。
首页字体保留原有 Google Fonts 请求，加载失败时使用备用字体。

文件中 assets-journey-、assets-hero- 等前缀是正确文件名，请不要自行去掉或修改。
