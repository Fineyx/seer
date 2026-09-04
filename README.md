# 星辉计算台 · 赛尔号精灵能力值计算器

一个可部署到网页、也可打包成 Android APK 的赛尔号精灵能力值计算器。

## 本地运行

无需安装依赖，在仓库根目录启动任意静态服务器即可：

```bash
npx serve .
```

浏览器打开终端输出的地址。数据文件是 [`data/species.data`](data/species.data)，页面启动时先读缓存，点击“同步数据”会重新拉取该文件；这样网页端和 APK 都能在发布新数据后更新。

## GitHub 维护

- `main` 分支推送后，`.github/workflows/pages.yml` 自动发布网页到 GitHub Pages。
- 推送 tag（例如 `v1.0.0`）后，`.github/workflows/android.yml` 自动构建并上传 APK artifact。
- 更新精灵时只需编辑 `data/species.data`，保持 `species[].stats` 中的六项字段：`hp`、`attack`、`defense`、`spAttack`、`spDefense`、`speed`。

首次使用时在 GitHub 仓库 Settings → Pages 选择 GitHub Actions。APK 构建不依赖本机 Android SDK。

## 计算规则

体力值和其他能力值按标准种族值 / 个体值（IV）/ 努力值（EV）/ 性格修正规则计算，等级、IV、EV 均在页面输入边界内校验。

## 目录

```text
index.html        网页入口
styles.css        界面样式
app.js            计算与数据同步逻辑
data/species.data 精灵数据
android/          Android WebView 壳
```
