---
title: ROS Launch 与系统管理
description: launch 文件、元功能包、重名处理、工作空间覆盖与多机分布式通信。
excerpt: 本章解决「如何批量启动节点、避免重名、多机协作」——launch、命名空间与 remap。
datetime: 2026-06-04T10:30:00.000Z
slug: ros-launch-and-manage
featured: false
category: Robotics
tags:
  - ros
  - tutorial
  - launch
  - roslaunch
author: Ao
language: Chinese
toc: true
coverImage: /blog/ros.webp
coverImageAlt: ROS Launch 与系统管理
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ros.webp
ogImageAlt: ROS Launch 与系统管理
---
本章命令速查见文末 [附录：命令速查](#6-附录命令速查)。

## 0. 本章你要学什么

> 更新：2026-06-04

---

**本章解决什么问题**：节点多了以后，如何一键启动、避免重名、管理参数、跨主机通信。

**学完能做什么**：写 launch 文件、用命名空间/remap 解决冲突、配置多机 ROS。

**对应仓库**：`src/manage/`、`src/meta_package/`

### 核心概念

```
多台主机 → 工作空间 → 功能包 → 节点 → 话题/服务/参数
```

大型系统中常见问题：节点太多难启动、名称冲突、多机通信——本章逐一解决。

---

## 1. 场景一：元功能包（Metapackage）

#### 场景

项目有 `topic`、`params`、`services` 多个包，希望一次依赖全部引入。

#### 实操

```bash
cd ~/ros/src
catkin_create_pkg meta_package
```

**package.xml** 关键配置：

```xml
<exec_depend>topic</exec_depend>
<exec_depend>params</exec_depend>
<exec_depend>services</exec_depend>
<export>
  <meta_package />
</export>
```

**CMakeLists.txt**：

```cmake
cmake_minimum_required(VERSION 3.0.2)
project(meta_package)
find_package(catkin REQUIRED)
catkin_metapackage()
```

其他包只需 `<exec_depend>meta_package</exec_depend>` 即可依赖全部子包。

#### 小结

元功能包不含源码，只做依赖聚合，方便打包分发。

---

## 2. 场景二：launch 文件最小示例

#### 场景

一次启动 roscore 依赖的多个节点并设参数。

#### 实操

最小 launch（`sample.launch`）：

```xml
<launch>
  <node pkg="manage" type="sample_node" name="sample" output="screen" />
</launch>
```

逐步扩展——加参数：

```xml
<launch>
  <param name="global_param" value="100" />
  <node pkg="manage" type="sample_node" name="sample" output="screen">
    <param name="private_param" value="200" />
  </node>
</launch>
```

加 remap：

```xml
<node pkg="topic" type="subscriber" name="subscriber_node">
  <remap from="chat_relative" to="test_ns/chat_relative" />
</node>
```

常用 `<node>` 属性：

| 属性 | 说明 |
|------|------|
| `pkg` / `type` | 包名 / 可执行文件名 |
| `name` | 节点在 ROS 图中的名称 |
| `output="screen"` | 日志输出到终端 |
| `respawn="true"` | 崩溃后自动重启 |
| `ns="robot1"` | 命名空间 |
| `args` | 命令行参数 |

运行：

```bash
roslaunch manage sample.launch
```

> `roslaunch` 不保证按文件中顺序启动节点（多进程并发）。

#### 小结

`<node>` 内 `<param>` 为私有参数；顶层 `<param>` 为全局参数。

---

## 3. 场景三：重名处理

#### 场景

两台机器人各有一个 `listener` 节点，或话题名相同导致串线。

#### 实操

**节点重名**——用命名空间：

```xml
<group ns="robot1">
  <node pkg="topic" type="subscriber" name="listener" />
</group>
<group ns="robot2">
  <node pkg="topic" type="subscriber" name="listener" />
</group>
```

实际节点名：`/robot1/listener`、`/robot2/listener`。

命令行等价：`rosrun manage subscriber __ns:=/robot1`

**话题重名**——用 remap：

```xml
<remap from="chat_relative" to="test_ns/chat_relative" />
```

或：`rosrun manage subscriber /chat_relative:=/subscriber_node/chat_relative`

**参数重名**——用 `/` 全局、`~` 私有、`/ns1/` 自定义命名空间。

| 对象 | 冲突表现 | 解决 |
|------|----------|------|
| 节点 | 后启动顶掉先启动 | `ns` 或不同 `name` |
| 话题 | 订阅错数据源 | `remap` 或 `ns` |
| 参数 | 读到错误配置 | 全局/私有/命名空间 |

#### 小结

源码用相对话题名，launch 里用 `ns` + `remap` 组合出最终结构。

---

## 4. 场景四：工作空间覆盖（Overlay）

#### 场景

同时 source 系统 ROS 和自研工作空间。

#### 实操

```bash
source /opt/ros/noetic/setup.bash   # 底层
source ~/ros/devel/setup.bash       # 上层，优先
```

**后 source 的覆盖先 source 的**。同名包/可执行文件以顶层为准。

排查实际加载：

```bash
rospack find topic
which rosrun
```

#### 小结

开发时明确分层：底层依赖 vs 当前项目，避免版本混乱。

---

## 5. 场景五：分布式多机通信

#### 场景

嵌入式板跑控制，PC 跑可视化和算法。

#### 实操

1. 各主机网络互通（`ping`），在 `/etc/hosts` 互加 IP 与主机名  
2. 所有主机设置相同环境变量（`~/.bashrc`）：

```bash
export ROS_MASTER_URI=http://主控机IP:11311
export ROS_HOSTNAME=本机IP
```

3. 主控机运行 `roscore`，其他机器正常 `rosrun` / `roslaunch`

调试：

```bash
env | grep ROS_
rosnode list
rostopic list
rqt_graph
```

#### 小结

`ROS_MASTER_URI` 必须指向运行 roscore 的那台机器；`ROS_HOSTNAME` 为本机可被访问的 IP。

---

## 6. 附录：命令速查

| 命令 | 说明 |
|------|------|
| `roslaunch 包名 xxx.launch` | 批量启动 |
| `rosnode list` / `kill` | 查看 / 终止节点 |
| `rospack find 包名` | 查找包路径（确认 overlay） |
| `rqt_graph` | 可视化节点拓扑 |
| `env \| grep ROS_` | 检查多机环境变量 |

---

## 系列导航

- **上一章** ← [05 参数服务器](ros-05-params.md)
- **下一章** → [07 turtlesim Demo](ros-07-turtlesim-demo.md)
- **相关** → [08 API 参考](ros-08-apis-reference.md)（spin / spinOnce 与 launch 配合）

---
