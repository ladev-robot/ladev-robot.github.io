---
title: ROS 从入门到实战（系列索引）
description: ROS 教程系列总目录：环境部署、工作空间、Topic/Service/Param、launch 管理与 API 参考。
excerpt: 按章学习 ROS 1 Noetic：从安装到 turtlesim 综合 Demo，附通信机制对比与命令速查。
datetime: 2026-06-04T10:00:00.000Z
slug: ros-tutorial-index
featured: true
category: Robotics
tags:
  - ros
  - tutorial
  - noetic
author: Ao
language: Chinese
toc: true
coverImage: /blog/ros.webp
coverImageAlt: ROS 机器人操作系统教程系列
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ros.webp
ogImageAlt: ROS 从入门到实战
---
各章命令速查见文末 [附录：全系列命令速查](#8-附录全系列命令速查)。

## 0. ROS 是什么

> 更新：2026-06-04

---

**ROS（Robot Operating System）** 不是传统意义上的操作系统，而是一套 **机器人软件开发框架**，运行在 Linux（常见 Ubuntu）上。它帮你解决：

- 传感器、执行器如何接入（驱动与硬件抽象）
- 多个程序（节点）之间如何通信（Topic / Service / Param）
- 代码如何组织、编译、复用（工作空间与功能包）

**一句话**：ROS = 让多个程序像搭积木一样协作，完成感知、决策、控制。

本系列基于 **ROS 1 Noetic + Ubuntu 20.04**，示例代码在教程仓库的 `src/` 目录。

---

## 1. 学习路线

```mermaid
flowchart LR
  ch01[01_环境部署] --> ch02[02_工作空间]
  ch02 --> ch03[03_话题]
  ch03 --> ch04[04_服务]
  ch04 --> ch05[05_参数]
  ch05 --> ch06[06_launch管理]
  ch06 --> ch07[07_Demo]
  ch07 --> ch08[08_API参考]
```

| 顺序 | 文章 | 学完能做什么 |
|------|------|--------------|
| 1 | [环境部署](ros-01-environment.md) | 装好 Ubuntu + ROS Noetic，能跑 `roscore` |
| 2 | [工作空间](ros-02-workspace.md) | 创建 catkin 工作空间，编译并运行自己的节点 |
| 3 | [话题通信](ros-03-topic.md) | 写 Publisher / Subscriber，传连续数据 |
| 4 | [服务通信](ros-04-service.md) | 写 Server / Client，做请求-响应 |
| 5 | [参数服务器](ros-05-params.md) | 读写全局配置参数 |
| 6 | [Launch 与管理](ros-06-launch-manage.md) | 用 launch 批量启动，处理重名与多机 |
| 7 | [turtlesim Demo](ros-07-turtlesim-demo.md) | 综合练习 Topic + Service |
| 8 | [C++ API 参考](ros-08-apis-reference.md) | 查阅 spin、latch、时间 API（进阶） |

建议 **按顺序阅读**；第 8 章可在写 C++ 节点时当手册查。

---

## 2. 仓库结构

```
ros/                    # 工作空间根目录
├── docs/               # 原始教程文档（本系列改写来源，不在博客中修改）
├── src/                # 功能包源码
│   ├── topic/          # 话题示例
│   ├── services/       # 服务示例
│   ├── params/         # 参数示例
│   ├── manage/         # launch、API 示例
│   ├── demo/           # turtlesim 综合 Demo
│   └── ...
├── build/              # 编译中间文件（自动生成）
└── devel/              # 编译产物与环境脚本（自动生成）
```

每次新开终端开发前，记得：

```bash
source ~/ros/devel/setup.bash   # 路径按你的工作空间调整
```

---

## 3. 三种通信机制对比

ROS 节点之间常用三种方式交换数据，**不要混用场景**：

| 机制 | 模式 | 数据特点 | 典型用途 | 示例代码 |
|------|------|----------|----------|----------|
| **Topic** | 发布-订阅，异步 | 连续、单向流 | 雷达点云、速度指令、图像 | `src/topic/` |
| **Service** | 请求-响应，同步 | 一次一问一答 | 计算、查询、触发动作 | `src/services/` |
| **Param** | 键值对 | 静态配置，不频繁改 | PID 参数、话题名、标定值 | `src/params/` |

**怎么选？**

- 传感器 **一直发数据** → Topic  
- **问一次、答一次** → Service  
- **配置文件式** 的全局常量 → Param  

---

## 4. ROS 系统层次（建立全局观）

```
多台主机
  └── 工作空间 (workspace)
        └── 功能包 (package)
              └── 节点 (node)
                    └── 话题 / 服务 / 参数
```

- **roscore**：必须先启动，相当于「电话总机」（ROS Master）
- **rosrun**：启动单个节点
- **roslaunch**：按 launch 文件批量启动节点并设参数

---

## 5. 新手推荐环境

| 项目 | 推荐 |
|------|------|
| 系统 | Ubuntu 20.04（WSL2 或虚拟机均可） |
| ROS 版本 | **ROS Noetic** |
| 安装方式 | [fishros 一键脚本](http://fishros.com/) 或官方/博客教程 |
| 验证 | `rosversion -d` 输出 `noetic`，`roscore` 能正常启动 |

---

## 6. 常见问题（系列级）

| 问题 | 原因 | 处理 |
|------|------|------|
| `rosrun` 找不到包 | 未 source 工作空间 | `source devel/setup.bash` |
| 节点启动了但没数据 | 话题名不一致 | `rostopic list` 核对 |
| 编译找不到依赖 | 缺系统包 | `rosdep install --from-paths src --ignore-src -r -y` |

---

## 7. 系列导航

- **下一章** → [01 环境部署](ros-01-environment.md)

---

## 8. 附录：全系列命令速查

| 命令 | 说明 |
|------|------|
| `roscore` | 启动 ROS Master |
| `rosrun 包名 节点名` | 运行单个节点 |
| `roslaunch 包名 xxx.launch` | 按 launch 批量启动 |
| `rosnode list` | 查看节点 |
| `rostopic list` / `echo` / `pub` | 查看 / 监听 / 发布话题 |
| `rosservice list` / `call` | 查看 / 调用服务 |
| `rosparam list` / `get` / `set` | 查看 / 读 / 写参数 |
| `catkin_make` | 编译工作空间 |
| `source devel/setup.bash` | 加载工作空间环境 |
| `rqt_graph` | 可视化节点与话题关系 |

---
