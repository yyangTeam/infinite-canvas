# Infinite Canvas 部署指南

## 环境要求

- Docker 和 Docker Compose（`docker compose` 子命令可用）
- 开放端口 3000

## 快速部署

```bash
# 1. 创建项目目录
mkdir -p ~/infinite-canvas && cd ~/infinite-canvas

# 2. 创建 docker-compose.yml
cat > docker-compose.yml << 'EOF'
services:
  app:
    image: ghcr.io/yyangteam/infinite-canvas:latest
    container_name: infinite-canvas
    ports:
      - "3000:3000"
    volumes:
      - ./config.json:/app/web/public/config.json:ro
    restart: unless-stopped
EOF

# 3. 创建配置文件
cat > config.json << 'EOF'
{
  "fixedBaseUrl": "",
  "enableVideo": false
}
EOF

# 4. 拉取镜像并启动
docker compose up -d
```

启动后访问 `http://<服务器IP>:3000`。

## 配置说明

编辑 `config.json` 修改运行时配置：

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `fixedBaseUrl` | string | `""` | 固定 AI API 地址，设置后用户无法修改 |
| `enableVideo` | boolean | `false` | 是否启用视频生成功能 |

修改配置后重启容器生效：

```bash
docker compose restart
```

## 自定义端口

如需将服务映射到其他端口（如 8080），修改 `docker-compose.yml` 中的 ports：

```yaml
    ports:
      - "8080:3000"
```

## 指定版本部署

```bash
# 部署指定版本
docker compose pull  # 默认拉取 latest
# 或指定版本标签
docker pull ghcr.io/yyangteam/infinite-canvas:v0.4.1
```

修改 `docker-compose.yml` 中的 image 标签即可锁定版本：

```yaml
    image: ghcr.io/yyangteam/infinite-canvas:v0.4.1
```

## 更新版本

```bash
cd ~/infinite-canvas
docker compose pull
docker compose up -d
```

## 常用运维命令

```bash
# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 停止服务
docker compose down

# 重启服务
docker compose restart
```
