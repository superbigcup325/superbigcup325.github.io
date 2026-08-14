# 图片资源

在此目录存放头像与背景图，并在根目录 `config.json` 中配置：

```json
{
  "avatar": "assets/images/avatar.svg",
  "backgroundImage": "assets/images/background.svg"
}
```

路径相对于生成的 `public/` 目录。构建时会自动将本目录复制到 `public/assets/images/`。
