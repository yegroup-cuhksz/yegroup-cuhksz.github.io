# 方案 2：托管静态站点部署指南

本文档描述 Ye Group 官网从 WordPress.com 迁移到受管静态托管的完整流程。可用的
基础设施包括阿里云 OSS + CDN、腾讯云 COS + CDN，或学校提供的等效静态托管平台。

> **当前状态。** 本文档是部署方案，不代表生产环境已经迁移。当前
> `yegroup.cuhk.edu.cn` 仍通过 CNAME 指向
> `yegroupcuhksz.wordpress.com`。在备用 WordPress 站点和新站均验证通过之前，不得修改
> 学校 DNS。

## 1. 目标与边界

### 1.1 目标

- 正式网址继续使用 `https://yegroup.cuhk.edu.cn`。
- 使用 Astro 构建的纯静态 `dist/`，生产环境不运行 Node.js、Nginx 或数据库。
- 日常维护以 GitHub 仓库为唯一源码来源。
- 推送 `main` 后可以自动构建、上传并刷新 CDN。
- 保留 WordPress.com 作为切换期间的快速回滚路径。
- 旧 WordPress 页面、媒体和 CV 地址继续返回正确的 `301` 或 `410`。

### 1.2 非目标

- 不把 WordPress 数据库或 PHP 运行时迁移到新站。
- 不在云服务器 ECS/CVM 上自行安装 Nginx。
- 不承诺在没有 HTTP 边缘规则时能够处理 WordPress 查询参数。
- 不在首次部署时删除 WordPress 站点、域名映射或云端内容。

## 2. 总体架构

推荐的正式架构如下：

```text
维护者电脑                         GitHub
    |                                |
    | git push origin main           |
    +------------------------------->|
                                     |
                                     | GitHub Actions
                                     v
                             npm ci / npm run build
                                     |
                                     | dist/
                                     v
                         OSS / COS object storage
                                     |
                                     | origin fetch
                                     v
                                  CDN
                                     |
                                     | CNAME
                                     v
                         https://yegroup.cuhk.edu.cn

WordPress.com（保留至少 30 天）
  yegroupcuhksz.wordpress.com
  + 现有 yegroup.cuhk.edu.cn 域名映射
```

切换前，访客由学校 CNAME 引导到 WordPress.com。切换后，同一条 CNAME 改为指向 CDN，
WordPress.com 仍可从其 `wordpress.com` 地址访问。DNS 回退即可恢复旧站入口。

## 3. 开始前必须确认

在创建资源前填写下表。没有确认的事项不应进入生产切换。

| 项目 | 记录 |
| --- | --- |
| 云平台：阿里云 / 腾讯云 / 学校平台 | ____ |
| 云账号持有人和计费主体 | ____ |
| 资源地域 | ____ |
| `cuhk.edu.cn` ICP 备案状态 | ____ |
| Bucket 名称 | ____ |
| CDN 加速域名 | ____ |
| CDN 提供的 CNAME 目标 | ____ |
| 学校 DNS 联系人 | ____ |
| WordPress.com 管理员 | ____ |
| WordPress 内容导出负责人 | ____ |
| 计划切换日期 | ____ |
| WordPress 保留截止日期 | ____ |

优先使用学校已有、由学校管理的云账号。不要把大学域名长期绑定到个人云账号；账号交接、
备案主体、发票和事故处理都会因此变得困难。

## 4. 云平台选择

两家平台都可以部署当前静态站。页面数量不是选择依据，真正需要比较的是学校已有资源、
备案可达性和负责域名的人员。

| 能力 | 阿里云 | 腾讯云 |
| --- | --- | --- |
| 对象存储 | OSS | COS |
| 静态网站 | OSS 静态网站托管 | COS 静态网站 |
| 边缘分发 | CDN | CDN |
| 命令行工具 | `ossutil` | `coscli` |
| 域名验证 | 云平台要求的 TXT/CNAME 验证 | 云平台要求的 TXT/CNAME 验证 |
| 自定义域名 HTTPS | OSS 或 CDN 绑定证书 | COS 或 CDN 绑定证书 |
| 旧查询参数重定向 | CDN 规则或边缘脚本 | CDN 规则或边缘函数 |

选择原则：

1. 学校已有账户、合同和备案时，使用已有平台。
2. 没有既有资源时，再比较两家平台在校园网和移动网络中的实际访问质量。
3. 中国大陆地域通常有 ICP 备案要求；中国香港等非内地地域通常不需要 ICP，但仍要做域名
   归属验证，并从校园网、手机网络和境外网络分别测试。

参考：

- [阿里云 OSS 自定义域名](https://help.aliyun.com/zh/oss/user-guide/access-buckets-via-custom-domain-names)
- [阿里云 OSS 静态网站托管](https://help.aliyun.com/en/oss/user-guide/hosting-static-websites)
- [腾讯云 COS 自定义域名](https://cloud.tencent.com/document/product/436/102509)
- [腾讯云 COS 静态网站](https://cloud.tencent.com/document/product/436/56555)

## 5. 构建产物约定

生产发布内容只有 `dist/`。仓库中的 `src/`、`docs/`、`scripts/`、`public/` 源文件、
`node_modules/`、`.astro/` 和 Git 元数据都不能上传到公开存储桶。

同时满足以下条件才算有效构建：

```text
Node.js             22.22.0
构建命令             npm run build
发布目录             dist/
内容校验             自动包含在 npm run build 中
页面数量             当前为 27 个页面
运行时依赖           无
```

Linux 构建环境应使用仓库已有的命令：

```sh
npm ci
npm run check
npm run build
```

当前 Windows 上的 `npm run build` 受 POSIX 环境变量写法影响，直接运行会失败。在修复
[`package.json`](../package.json) 之前，本地可以使用：

```powershell
$env:ASTRO_TELEMETRY_DISABLED = "1"
npm run media
npm run check
npx astro build
```

发布前确认：

- `dist/index.html` 存在。
- `dist/404.html` 存在。
- `dist/sitemap.xml` 和 `dist/robots.txt` 存在。
- `dist/media/` 已由媒体生成步骤创建。
- `dist/assets/images/cv.pdf` 存在。
- `dist/_astro/` 中的指纹资源存在。

## 6. 云资源规划

### 6.1 推荐资源

正式站建议创建：

1. 一个专用对象存储 Bucket。
2. 一个指向该 Bucket 的 CDN 加速域名。
3. 一个仅用于部署的 RAM/CAM 子账号或角色。
4. 一个自定义域名和 HTTPS 证书。
5. 可选的日志、版本控制和告警。

不需要创建云服务器、数据库、VPC 内服务或容器集群。

### 6.2 Bucket 命名

建议使用类似名称：

```text
yegroup-site-prod
```

OSS Bucket 名称通常要求全局唯一，最终名称以控制台可用性为准。不要把 Bucket 名称写成
学校域名，也不要开启匿名写入或目录列表。

### 6.3 权限模型

不要使用云账号主账号 AccessKey。创建只负责发布的对象存储子账号，最小权限应包括：

- 列出目标前缀；
- 上传目标对象；
- 在启用版本控制后删除目标前缀中过期的对象；
- 如使用 CDN 刷新 API，仅允许刷新指定域名。

权限范围限定到目标 Bucket 的站点前缀，不要授予整个账号的所有 Bucket 或所有云资源权限。

建议开启 Bucket 版本控制。自动同步通常会删除 `dist/` 中已不存在的旧资源；版本控制可以在
误删时恢复上一版文件。

## 7. 一次性云平台配置

### 7.1 阿里云 OSS + CDN

1. 在 OSS 控制台创建 Bucket，选择已确认的地域。
2. 开启版本控制。
3. 开通静态网站托管，设置：

   ```text
   默认首页：index.html
   默认 404：404.html
   ```

4. 关闭目录列表，禁止匿名写入。
5. 在 OSS 或 CDN 中添加自定义域名，并按控制台要求完成域名归属验证。
6. 为中国大陆地域确认 ICP 备案；中国内地 Bucket 的自定义域名不能绕过备案要求。
7. 配置 CDN 源站为 Bucket 的静态网站地址。
8. 在 CDN 中绑定 `yegroup.cuhk.edu.cn` 的 HTTPS 证书。
9. 配置缓存规则、压缩和错误页缓存。
10. 在 CDN 控制台取得最终 CNAME 目标。

阿里云 OSS 默认域名可能对网页文件附加强制下载行为。正式网站必须通过已验证的自定义域名
或 CDN 域名访问，不能把 OSS 默认域名当作最终网址。

### 7.2 腾讯云 COS + CDN

1. 在 COS 控制台创建 Bucket，选择已确认的地域。
2. 开启版本控制。
3. 开启静态网站功能，设置：

   ```text
   索引文档：index.html
   错误文档：404.html
   ```

4. 关闭目录列表，禁止匿名写入。
5. 在 COS 或 CDN 中添加自定义域名，并完成域名归属验证。
6. 为中国大陆地域确认 ICP 备案；非内地地域仍需完成平台要求的域名验证。
7. 添加 CDN 加速域名，源站选择 COS 静态网站源站。
8. 配置 HTTPS 证书、缓存和响应头。
9. 在 CDN 控制台取得最终 CNAME 目标。

### 7.3 公共配置

两种平台都应完成：

- 强制 HTTPS，HTTP 自动跳转 HTTPS。
- 启用 Brotli 或 Gzip 压缩。
- 不暴露 Bucket 文件列表。
- 不在 HTML 中写入云平台默认域名。
- 对 HTML、XML、TXT 使用短缓存或不缓存。
- 对 `/_astro/` 指纹资源使用长期缓存。
- 对 `/media/` 和 `/assets/images/` 使用长期缓存。
- 使未知目录返回真实的 HTTP `404`，不能返回 `200` 的软 404。
- 保留 `/robots.txt`、`/sitemap.xml` 和 `/assets/images/cv.pdf` 的准确内容类型。

缓存建议：

| 路径 | 缓存策略 |
| --- | --- |
| `/`、`/**/index.html` | `no-cache` 或短缓存 |
| `/sitemap.xml`、`/robots.txt` | `no-cache` |
| `/_astro/*` | 30 天以上，指纹变化后缓存键变化 |
| `/media/*` | 7～30 天 |
| `/assets/images/*` | 7～30 天 |

每次发布后至少刷新 HTML、404、sitemap 和 robots 的 CDN 缓存。图片和指纹资源只有在文件名
未变化但内容被替换时才需要刷新。

## 8. 首次手动发布

在自动部署配置完成前，先通过手工上传验证 Bucket、CDN 和 HTTPS。

### 8.1 构建并打包

```powershell
Set-Location C:\Users\Administrator\Desktop\Group_page\ye-group-website
$env:ASTRO_TELEMETRY_DISABLED = "1"
npm ci
npm run media
npm run check
npx astro build
```

保留一份可回滚的构建快照：

```powershell
$release = Get-Date -Format "yyyyMMdd-HHmmss"
Compress-Archive -Path .\dist\* `
  -DestinationPath ".\release-$release.zip" -Force
```

`release-*.zip` 不应提交到 Git；构建记录和文件校验值应保存到部署日志。

### 8.2 阿里云上传

先安装并配置 `ossutil`，然后执行：

```powershell
ossutil sync .\dist\ oss://<bucket-name>/ --delete
```

`--delete` 会删除 Bucket 目标前缀中不存在于本次 `dist/` 的文件。只能在以下条件全部满足时
使用：

- Bucket 已开启版本控制；
- 目标前缀专用于本网站；
- 已确认本地构建成功；
- 已保存本次和上一次发布的构建记录。

阿里云官方语法参考：
[ossutil sync](https://help.aliyun.com/zh/oss/developer-reference/synchronize-local-files-to-oss)。

### 8.3 腾讯云上传

先安装并配置 `coscli`，然后执行：

```powershell
coscli sync .\dist\ cos://<bucket-alias>/ -r --delete
```

同样只有在 Bucket 已开启版本控制且目标前缀专用于本网站时，才允许使用 `--delete`。

腾讯云官方语法参考：
[coscli sync](https://cloud.tencent.com/document/product/436/63670)。

### 8.4 验证首次发布

先在云平台提供的测试域名或临时域名上检查：

1. `/` 返回首页。
2. `/people/`、`/research/`、`/gallery/` 和 `/activities/` 可以直接请求。
3. 刷新嵌套页面不会返回 404。
4. CSS、JavaScript、WebP 和原图均返回 `200`。
5. CV PDF 可以下载并具有正确的 `application/pdf` 类型。
6. 不存在的路径返回 HTTP `404`。
7. 正式域名尚未切换时，不修改学校 CNAME。

## 9. GitHub Actions 自动部署

GitHub Actions 负责从 Git 提交构建并上传 `dist/`。对象存储不会自行理解 Astro 项目，
因此需要一个显式工作流。

### 9.1 工作流结构

建议创建 `.github/workflows/deploy-static.yml`，结构如下：

```yaml
name: Deploy static site

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22.22.0
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build and validate
        run: npm run build

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: site-dist
          path: dist/
          retention-days: 14

      # 在这里加入选定云平台的 CLI 安装和上传步骤。
      # CLI 必须固定版本并校验官方发布包。
      # 上传后执行 CDN 缓存刷新。
```

在正式启用自动部署前补齐云平台步骤。CLI 安装包版本要在仓库或工作流中固定，不要直接使用
未校验的临时下载地址。

### 9.2 GitHub Secrets

阿里云可配置：

```text
OSS_ACCESS_KEY_ID
OSS_ACCESS_KEY_SECRET
OSS_BUCKET
OSS_ENDPOINT
```

腾讯云可配置：

```text
COS_SECRET_ID
COS_SECRET_KEY
COS_BUCKET
COS_REGION
```

如果工作流还调用 CDN 刷新 API，再增加只允许刷新本域名的独立凭据。不要复用对象存储的
上传密钥。

### 9.3 自动部署规则

- 只有推送 `main` 才触发生产部署。
- Pull Request 只构建和验证，不上传生产 Bucket。
- 同一时间只允许一个生产部署，避免两个版本并发覆盖。
- 上传失败时工作流必须返回非零状态。
- 上传成功但 CDN 刷新失败时，也应把部署标记为失败。
- 保留至少最近 10 次构建产物或部署记录。
- 凭据轮换时先更新 GitHub Secrets，再禁用旧子账号密钥。

如果学校不允许 GitHub Actions 访问云资源，保留 GitHub 作为源码来源，使用本地发布脚本或
学校批准的持续集成平台执行相同的 build、sync 和 cache-purge 步骤。

## 10. CDN 与旧 WordPress URL

静态对象存储不会执行 Nginx 的 `map` 规则。现有
[`DEPLOYMENT.md`](./DEPLOYMENT.md) 附录中的旧地址映射必须迁移到 CDN 的跳转规则或边缘函数。

### 10.1 查询参数跳转

至少保留：

```text
/?page_id=92   -> 301 https://yegroup.cuhk.edu.cn/
/?page_id=109  -> 301 https://yegroup.cuhk.edu.cn/alumni/
```

规则必须：

- 仅在根路径上匹配；
- 允许查询参数以不同顺序出现；
- 跳转目标不携带原查询参数；
- 不会在跳转后再次匹配并形成循环；
- 不把请求 Host 直接拼进跳转目标。

如果云平台只支持路径重写，不支持查询参数匹配，需要启用 CDN 边缘脚本/函数，或明确记录
该兼容性缺口。不要用首页 JavaScript 跳转代替 `301` 作为长期方案。

### 10.2 旧媒体和 CV

以下路径应永久跳转到对应的本地资源：

| 旧路径 | 新路径 |
| --- | --- |
| `/wp-content/uploads/2024/11/cv.pdf` | `/assets/images/cv.pdf` |
| `/wp-content/uploads/2024/11/jingqiang2-689642022-e1732801026118.jpg` | `/assets/images/profile_photo/jingqiang2-689642022-e1732801026118.jpg` |
| `/wp-content/uploads/2024/11/renyuanyuan-346225708-e1732800139141.jpeg` | `/assets/images/profile_photo/renyuanyuan-346225708-e1732800139141.jpeg` |
| `/wp-content/uploads/2024/11/tempimageu02rr4.jpg` | `/assets/images/profile_photo/tempimageu02rr4.jpg` |
| `/wp-content/uploads/2024/11/tianyuanzha.jpg` | `/assets/images/profile_photo/tianyuanzha.jpg` |
| `/wp-content/uploads/2024/11/yejingqiang1.jpg` | `/assets/images/profile_photo/yejingqiang1.jpg` |
| `/wp-content/uploads/2024/12/logo_standard.png` | `/assets/images/logo/logo_standard.png` |
| `/wp-content/uploads/2024/12/relics_logo.jpg` | `/assets/images/logo/relics_logo.jpg` |
| `/wp-content/uploads/2024/12/tempimagetm8w31.jpg` | `/assets/images/profile_photo/tempimagetm8w31.jpg` |
| `/wp-content/uploads/2025/01/e181_1.png` | `/assets/images/research_photo/e181_1.png` |
| `/wp-content/uploads/2025/01/groupphoto_20240711.jpg` | `/assets/images/group_photo/groupphoto_20240711.jpg` |
| `/wp-content/uploads/2025/01/groupphoto_20250110-1.jpg` | `/assets/images/group_photo/groupphoto_20250110-1.jpg` |
| `/wp-content/uploads/2025/05/xiaolingcheng-2.jpg` | `/assets/images/profile_photo/xiaolingcheng-2.jpg` |
| `/wp-content/uploads/2025/05/xiaolingcheng1.jpg` | `/assets/images/profile_photo/xiaolingcheng1.jpg` |
| `/wp-content/uploads/2025/05/zixichen-e1747299946193.jpg` | `/assets/images/profile_photo/zixichen-e1747299946193.jpg` |
| `/wp-content/uploads/2025/09/jiafuli.png` | `/assets/images/profile_photo/jiafuli.png` |
| `/wp-content/uploads/2026/09/haoyun.jpeg` | `/assets/images/profile_photo/haoyun.jpeg` |

所有跳转目标必须是固定本地路径，不能从请求参数、Host 或用户输入生成目标地址。

### 10.3 已退役的 WordPress 路径

以下前缀不应回退到首页：

```text
/wp-admin
/wp-login.php
/xmlrpc.php
/wp-json
/wp-includes
/wp-content/plugins
```

可以返回 `410 Gone`；如果平台不支持 `410`，至少返回真实 `404`，不能返回 `200`。

### 10.4 完整 URL 清单

上述规则只覆盖编写部署方案时已知的地址。切换前必须从 WordPress.com 获取：

- 所有已发布页面；
- 所有文章；
- WordPress.com sitemap；
- 媒体库路径；
- 对外发布过的 PDF 和图片链接。

将每个旧地址标记为“跳转到新地址”或“返回 410”。没有完成清单就不要修改 DNS。

## 11. WordPress.com 迁移前准备

无需在部署新站或准备 DNS 时关闭 WordPress。切换前先完成备份：

1. WordPress.com 管理后台执行 **Tools → Export → All content**。
2. 导出页面、文章、媒体引用和站内链接清单。
3. 保存 WordPress.com 公共 sitemap。
4. 下载媒体库中仍然需要保留的原图、PDF 和证书文件。
5. 记录 WordPress 管理员账号、域名映射状态和套餐到期日期。
6. 将导出文件保存到学校批准的位置，不提交到公开 Git 仓库。

WordPress.com 并非自行维护的 WordPress 服务器，因此没有传统意义上可导入的数据库备份。
导出内容和媒体文件要分别保存。

## 12. 切换前验收

新站必须在云平台临时地址验收通过。至少检查：

- 首页、Research、People、Publications、Openings、Contact、Alumni、Gallery 和 News。
- 9 个成员详情页、4 个相册详情页、2 个活动详情页和 1 个新闻详情页。
- 所有 CSS、JavaScript、WebP、原图、CV 和 favicon。
- `/sitemap.xml` 和 `/robots.txt`。
- 未知地址返回真实 `404`。
- `/?page_id=92`、`/?page_id=109` 及其带额外参数的变体。
- 所有旧 `/wp-content/uploads/...` 路径。
- canonical 和 Open Graph URL 均为正式域名。
- 校园网、手机蜂窝网络和境外网络的实际访问速度。
- HTTP 自动跳转 HTTPS。
- CDN 缓存刷新后，HTML 立即展示新版本。
- 在平台部署历史中完成一次测试回滚，再恢复当前版本。

切换前如果新闻内容仍处于编辑预览状态，应先决定保留、改为草稿或删除。当前内容校验通过
并不等于内容已经获得公开发布批准。

## 13. 正式切换步骤

### D-7 至 D-1

1. 完成新站验收、学校审批和 WordPress 内容导出。
2. 在 CDN 中预配置正式域名和证书；若平台必须先验证 CNAME，记录证书签发所需时间和
   负责人。
3. 将当前 CNAME TTL 从 3600 秒降低到 300 秒。
4. 记录当前 DNS 值：

   ```text
   yegroup.cuhk.edu.cn CNAME yegroupcuhksz.wordpress.com
   ```

5. 确认 WordPress.com 域名映射和站点仍有效。
6. 冻结 WordPress 和 GitHub 上的非必要内容修改，避免切换期间出现两个不同版本。

### 切换当天

1. 从 `main` 重新构建并确认提交哈希。
2. 上传新版本，刷新 HTML、404 和 sitemap 缓存。
3. 保持 WordPress.com 不变。
4. 请学校 IT 只修改 `yegroup.cuhk.edu.cn` 的 CNAME，不改 NS、MX、TXT 或其他子域名。
5. 等待 DNS 传播，并检查权威 DNS 已返回新目标。
6. 检查 HTTPS 证书域名、有效期和完整证书链。
7. 执行第 12 节的完整验收。
8. 检查旧 WordPress 回退地址仍可访问。

### 切换后 0～30 天

- 保留 WordPress.com 站点和域名映射。
- 保留旧 CNAME 值和 WordPress 导出文件。
- 持续检查证书、旧链接、404、CDN 缓存和访问错误。
- 不在刚切换完成时取消 WordPress 套餐或删除站点。
- 至少 30 天后再评估移除域名映射和套餐；删除内容前再次导出并归档。

## 14. 回滚

### 14.1 新站部署版本有问题

如果正式域名已经指向新平台，但某个版本有错误：

1. 在平台部署历史中选择上一个已知正常版本；或
2. 将存储桶同步回上一份已验证的 `dist/`；或
3. 在 Git 中回退提交并重新自动部署。

然后刷新 HTML、404 和 sitemap 缓存，并重新检查首页、嵌套路径和资源。

### 14.2 DNS、证书或平台整体不可用

请学校 IT 将 CNAME 恢复为：

```text
yegroupcuhksz.wordpress.com
```

等待 TTL 生效。DNS 回滚成功后，再次验证 WordPress 首页、成员页、旧媒体和 CV 地址。

回滚时记录：

```text
发现问题时间：
失败版本或提交：
回滚方式：
DNS 恢复时间：
验证结果：
后续修复负责人：
```

## 15. 日常维护流程

内容维护只修改 Git 管理的内容文件，不直接在 OSS/COS 控制台编辑 HTML：

```text
本地编辑 Markdown / JSON / Astro
  ↓
npm run check
  ↓
本地预览或提交 Pull Request
  ↓
合并到 main
  ↓
GitHub Actions 自动构建
  ↓
上传 dist/ 并刷新 CDN
```

发布后至少检查：

- 首页是否出现预期内容；
- 新页面是否可直接访问和刷新；
- 图片是否生效；
- 404 和旧链接未被破坏；
- 部署日志没有警告或失败。

凭据、证书、云账号负责人、WordPress 保留期限和 DNS 联系人应记录在密码管理器或学校批准的
内部文档中，不要写入公开仓库。

## 16. 完成标准

只有以下全部满足，迁移才视为完成：

- `https://yegroup.cuhk.edu.cn` 指向托管平台，HTTPS 有效。
- WordPress.com 仍可通过 `yegroupcuhksz.wordpress.com` 访问。
- 27 个 Astro 页面和全部静态资源通过验收。
- 旧页面、媒体和 CV 路径符合 `301`/`410` 策略。
- 未知路径返回真实 HTTP `404`。
- 推送 `main` 能自动构建并发布，失败时不会覆盖已知正常版本。
- 至少完成一次部署回滚演练。
- 学校已确认云账号、备案、续费和域名责任。
- WordPress 内容和媒体已导出并归档。
- WordPress 域名映射在切换后至少保留 30 天的计划已明确。
