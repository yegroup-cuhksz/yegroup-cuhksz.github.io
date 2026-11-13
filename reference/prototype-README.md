# Ye Group 本地静态网站

按 [原网站](https://yegroup.cuhk.edu.cn/) 的公开内容重构，内容采集日期：2026-11-12。保留英文正文，重新设计页面布局。

## 预览

直接用浏览器打开根目录的 `index.html`。所有页面、照片、CSS、JavaScript 和 CV 均在本地；正常浏览不需要 WordPress、Node.js 或网络。论文和外部机构链接需要联网。

也可以在此目录启动本地服务：

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

然后访问 <http://127.0.0.1:8000>。按 `Ctrl+C` 停止服务。

## 页面

- `index.html`：主页、研究入口、最新论文及原站三张图库图片。
- `research/index.html`：XENONnT、RELICS 的完整介绍及参考文献。
- `people/index.html`：9 位成员，链接到各自的独立个人页。
- `alumni/index.html`：7 位校友。
- `publication/index.html`：15 篇论文，支持关键词和年份组合筛选。
- `opening/index.html`：博士生、博士后招聘条件及申请材料。
- `contact/index.html`：地址、邮箱及电话。

## 更新内容与样式

1. 修改 `data/site.json` 中的成员、论文、校友、图库或联系方式。
2. 个人介绍修改 `data/<成员英文名>.html`。研究正文修改 `data/research-*.html`，招聘正文修改 `data/opening.html`。
3. 图片放在 `assets/images/`，相对路径填入 JSON。文字中的本地文件链接使用 `assets/` 开头的路径。
4. 样式在 `assets/styles.css`；菜单和论文筛选在 `assets/site.js`；页面结构在 `scripts/build_site.py`。
5. 运行以下命令重新生成页面并检查：

```sh
python3 scripts/build_site.py
python3 scripts/check_site.py
```

构建和检查仅使用 Python 标准库，不需要安装依赖。生成后的 HTML 也可以直接编辑，但下次构建会覆盖这些编辑；建议修改 `data/` 或构建脚本。

所有正文已写入 HTML，关闭 JavaScript 后仍可阅读和导航。JavaScript 仅增强手机菜单和论文筛选。

## 已完成的检查

- 16 个页面及 341 处本地链接、资源、锚点检查通过。
- 9 份成员正文、研究正文、招聘正文与来源比对通过；15 篇论文链接及 7 位校友清单核对通过。
- 在本机 Safari 实际查看了首页和论文页的桌面排版。图片、字体和本地文件链接正常载入。
- 搜索、年份组合筛选、无结果提示、重置、菜单开关及 Escape 逻辑通过 DOM 模拟检查。浏览器输入自动化随后不可用，尚未完成真实浏览器中的筛选交互验收，也尚未完成手机实机排版检查。

## 内容来源与待核对项

- `reference/original/`：16 个原站页面的 HTML 快照，供核对和追溯，不参与新站运行。
- `reference/source-inventory.json`：来源网址、正文、图片映射及抓取时间。
- `scripts/capture_source.py`、`scripts/import_content.py`：最初采集与转换工具。日常更新不需要运行；重新导入会覆盖 `data/`。
- 原站 XENONnT 研究介绍中，提及 XENONnT 新物理限制及 2022 年结果的 `[2]` 与下方参考文献列表对应关系疑似有误，且存在 `Date` 等拼写。此次迁移保留原文，待课题组确认后修改。
- 原站 Jiafu Li 个人介绍欢迎本科生加入，但 Opening 页面写明目前没有本科生职位。两处按原文保留，正式上线前应统一。
- 招聘状态、成员身份、办公室及个人履历按采集时原站记录保留，未自行更新。
- 原站 WordPress 评论、追踪脚本、订阅入口和管理工具未移入静态站。新站不提供表单提交后台，联系及申请通过邮箱进行。
- 现有 `fig/` 中的两张图片未改动或替换；第一版使用原站素材。

## 以后部署

可把根目录 `index.html`、其余 15 个页面对应目录以及 `assets/` 放到任意静态 Web 服务器。页面使用相对链接，也能放在域名子目录下。`data/`、`scripts/`、`reference/` 和 `fig/` 无需上传。此版仅在本地创建，没有发布，也没有修改线上 WordPress。
