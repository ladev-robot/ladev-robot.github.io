---
title: ROS 环境部署（Ubuntu + Noetic）
description: 在 Windows 上部署 Ubuntu（双系统/虚拟机/WSL）并安装 ROS Noetic，含验证与常见问题。
excerpt: 本章解决「在哪跑 ROS、怎么装」——推荐 WSL2 + Ubuntu 20.04 + Noetic，跑通 roscore 验证。
datetime: 2026-06-04T10:05:00.000Z
slug: ros-environment-setup
featured: false
category: Robotics
tags:
  - ros
  - tutorial
  - noetic
  - ubuntu
  - wsl
author: Ao
language: Chinese
toc: true
coverImage: /blog/ros.webp
coverImageAlt: ROS 环境部署
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ros.webp
ogImageAlt: ROS 环境部署
---
本章命令速查见文末 [附录：命令速查](#5-附录命令速查)。系列总览见 [ROS 教程索引](ros-tutorial-index.md)。

## 0. 本章你要学什么

> 更新：2026-06-04

---

**本章解决什么问题**：ROS 基于 Linux，Windows 用户需要先有一个 Ubuntu 环境，再安装 ROS。

**学完能做什么**：选定部署方式、完成 ROS Noetic 安装，并用 `rosversion -d` 与 `roscore` 验证。

**对应仓库**：环境就绪后，下一章在 `~/ros` 创建工作空间。

### 核心概念

| 项目 | 说明 |
|------|------|
| ROS 1 Noetic | 对应 Ubuntu 20.04 的 ROS 版本（本系列使用） |
| roscore | ROS Master，几乎所有节点运行前要先启动 |
| source setup.bash | 加载 ROS 环境变量，否则找不到 `rosrun` 等命令 |

---

## 1. 场景一：选择 Ubuntu 部署方式

#### 场景

你在 Windows 电脑上学习 ROS，需要选一个能跑 Ubuntu 的方案。

#### 实操

| 部署方式 | 优势 | 劣势 | 适用场景 |
|----------|------|------|----------|
| **双系统** | 性能最佳，硬件直通 | 切换系统不便 | 长期开发、需要高性能 |
| **虚拟机** | 与 Windows 交互方便 | 性能有损耗 | 学习、测试 |
| **WSL 2** | 启动快、与 Windows 集成好 | 图形/硬件支持有限 | **新手推荐** |

**新手推荐路径**：Windows 10/11 → **WSL 2 + Ubuntu 20.04** → **ROS Noetic**

#### 小结

- 快速入门选 WSL 2；需要 RViz/Gazebo 重度仿真可考虑虚拟机或双系统。
- Ubuntu 与 ROS 版本要匹配：20.04 → Noetic。

---

## 2. 场景二：WSL 2 安装 Ubuntu（推荐）

#### 场景

Windows 10/11 用户，希望最快搭好 Linux 环境。

#### 实操

以管理员身份打开 PowerShell 或 Windows Terminal：

```bash
# 安装 WSL 和 Ubuntu 20.04
wsl --install -d Ubuntu-20.04
```

安装完成后设置 Linux 用户名和密码，验证：

```bash
wsl --list --verbose          # 查看发行版，VERSION 应为 2
wsl --set-default Ubuntu-20.04
```

常用维护命令：

```bash
wsl --shutdown    # 关闭 WSL
wsl --update      # 更新 WSL 内核
```

若版本为 WSL 1，可升级：

```bash
wsl --set-version Ubuntu-20.04 2
```

#### 小结

WSL 2 是本系列默认假设环境；图形界面需 WSLg（Win11）或 X11 转发。

---

## 3. 场景三：虚拟机 / 双系统（可选）

#### 场景

WSL 无法满足图形仿真或硬件需求时。

#### 实操

**虚拟机**：安装 VMware 或 VirtualBox，分配至少 4GB 内存、40GB 磁盘，安装 Ubuntu 20.04 ISO。

**双系统**：用 [Rufus](https://rufus.ie/zh/) 制作启动盘，BIOS 设 U 盘启动，安装时选「与 Windows 共存」。安装前备份数据，预留至少 50GB。

详细步骤可参考：
- [VMware + Ubuntu 安装教程](https://blog.csdn.net/AOLIU/article/details/150493773)
- [Ubuntu 官方下载](https://ubuntu.com/download)
- [中科大镜像](http://mirrors.ustc.edu.cn/ubuntu-releases/)

#### 小结

虚拟机适合「边用 Windows 边学 ROS」；双系统适合长期、高性能开发。

---

## 4. 场景四：安装 ROS Noetic

#### 场景

Ubuntu 20.04 已就绪，需要安装 ROS 并验证。

#### 实操

**方式一：一键安装（推荐）**

```bash
wget http://fishros.com/install -O fishros && . fishros
```

脚本会检测系统并安装对应 ROS 版本、配置环境变量。

**方式二：手动安装**

参考 [ROS 安装详细教程](https://blog.csdn.net/AOLIU/article/details/150844502)。

**写入环境变量（重要）**

```bash
echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

**验证安装**

```bash
rosversion -d          # 应输出 noetic
echo $ROS_DISTRO       # 应输出 noetic
```

**Smoke test：启动 roscore**

终端 1：

```bash
roscore
```

看到 `started core service [/rosout]` 且无报错即成功。`Ctrl+C` 结束。

#### 常见错误排查

| 现象 | 原因 | 处理 |
|------|------|------|
| `rosrun: command not found` | 未 source | `source /opt/ros/noetic/setup.bash` |
| WSL 无图形 | 默认无 X | Win11 用 WSLg，或配置 X11 |
| 虚拟机卡顿 | 资源不足 | 开启 VT-x，增加内存/CPU |

#### 小结

安装成功的标志：`rosversion -d` → `noetic`，`roscore` 能稳定启动。

---

## 5. 附录：命令速查

| 命令 | 说明 |
|------|------|
| `wsl --install -d Ubuntu-20.04` | 安装 WSL + Ubuntu |
| `wsl --list --verbose` | 查看 WSL 发行版 |
| `rosversion -d` | 查看 ROS 版本 |
| `echo $ROS_DISTRO` | 查看当前 ROS 发行版名 |
| `roscore` | 启动 ROS Master |
| `source /opt/ros/noetic/setup.bash` | 加载 ROS 系统环境 |

---

## 系列导航

- **上一章** ← [系列索引](ros-tutorial-index.md)
- **下一章** → [02 工作空间](ros-02-workspace.md)

---
