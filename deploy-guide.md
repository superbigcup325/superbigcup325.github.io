# 部署到 username.github.io

## 方式一：GitHub Actions（推荐）

1. 在 GitHub 创建或打开名为 `username.github.io` 的仓库。
2. 将本项目推送到该仓库的 `main` 分支。
3. 进入仓库 **Settings → Pages**，将 **Source** 设为 **GitHub Actions**。
4. 推送后 Actions 会自动执行 `.github/workflows/deploy.yml`，构建 `public/` 并部署。
5. 访问 `https://username.github.io/` 查看。

## 方式二：手动部署

```bash
npm install
node build.js
```

将 `public/` 目录中的所有文件推送到 `username.github.io` 仓库根目录。

## 头像与背景图

将图片放入 `src/assets/images/`，然后编辑根目录 `config.json`：

```json
{
  "siteName": "Tutorial Blog",
  "homePostCount": 5,
  "avatar": "assets/images/avatar.svg",
  "backgroundImage": "assets/images/background.svg"
}
```

路径相对于生成的 `public/` 目录。构建时会自动复制 `src/assets/images/` 到 `public/assets/images/`。
