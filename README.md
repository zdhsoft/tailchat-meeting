# tailchat-meeting
Tailchat 视频会议

基于 [edumeet](https://github.com/edumeet/edumeet) 进行二次开发。

> 不在原项目的fork上进行开发是因为会进行很多深度的改造，并适配**Tailchat**，因此并不准备回归到原项目.


<!-- ### Quick Start

- 请确保已安装docker

```bash
# 编译docker镜像
sh build-docker.sh
``` -->

### 安装优化

可以使用 `MEDIASOUP_WORKER_BIN` 指定之前编译好的二进制文件, 来阻止`mediasoup`的编译行为

```
MEDIASOUP_WORKER_BIN=/path/to/mediasoup-worker
```

### 翻译

```
cd app
pnpm i18n:extract -- './src/**/*.{ts,tsx,js}' --ignore='**/*.d.ts' --out-file src/intl/translations/en.json --format simple
```
