---
title: ROS 工作空间与 catkin 编译
description: 创建 catkin 工作空间、功能包，编写 C++/Python 节点，编译并运行。
excerpt: 本章解决「代码放哪、怎么编、怎么跑」——catkin_make、source devel/setup.bash、rosrun 完整流程。
datetime: 2026-06-04T10:10:00.000Z
slug: ros-workspace-catkin
featured: false
category: Robotics
tags:
  - ros
  - tutorial
  - catkin
  - workspace
author: Ao
language: Chinese
toc: true
coverImage: /blog/ros.webp
coverImageAlt: ROS 工作空间
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ros.webp
ogImageAlt: ROS 工作空间与 catkin
---
本章命令速查见文末 [附录：命令速查](#6-附录命令速查)。

## 0. 本章你要学什么

> 更新：2026-06-04

---

**本章解决什么问题**：ROS 代码必须放在工作空间里，用 catkin 编译后才能 `rosrun`。

**学完能做什么**：创建工作空间、新建功能包、写 Hello World 节点、编译并运行。

**对应仓库**：`src/` 下各功能包（如 `topic/`、`services/`）均在此结构内。

### 核心概念

```
工作空间/
├── src/      # 源码与功能包
├── build/    # 编译中间文件（自动生成）
└── devel/    # 可执行文件与环境脚本（自动生成）
```

```mermaid
flowchart LR
  A[mkdir + catkin_make] --> B[catkin_create_pkg]
  B --> C[写源码 + CMakeLists]
  C --> D[catkin_make]
  D --> E[source devel/setup.bash]
  E --> F[rosrun]
```

---

## 1. 场景一：创建并初始化工作空间

#### 场景

第一次在本机搭建 ROS 开发目录。

#### 实操

```bash
mkdir -p ~/ros/src
cd ~/ros
catkin_make
```

成功后目录结构：

```
ros/
├── build/
├── devel/
└── src/
```

#### 小结

`catkin_make` 必须在工作空间**根目录**执行，它会扫描 `src/` 下所有功能包。

---

## 2. 场景二：创建功能包

#### 场景

在工作空间里新增一个可编译、可运行的包。

#### 实操

```bash
cd ~/ros/src
catkin_create_pkg my_package roscpp rospy std_msgs
```

参数说明：

| 参数 | 含义 |
|------|------|
| `my_package` | 包名（小写、数字、下划线） |
| `roscpp` / `rospy` | C++ / Python 客户端库 |
| `std_msgs` | 标准消息类型 |

生成结构：

```
my_package/
├── CMakeLists.txt
├── package.xml
├── include/
└── src/
```

#### 小结

包名需唯一，勿与系统已安装包重名。

---

## 3. 场景三：编写并配置 Hello World 节点

#### 场景

在功能包内添加第一个 C++ 或 Python 节点。

#### 实操

**C++**（`src/hello.cpp`）：

```cpp
#include "ros/ros.h"

int main(int argc, char *argv[])
{
    ros::init(argc, argv, "hello_node");
    ros::NodeHandle nh;
    ROS_INFO("Hello World from ROS!");
    return 0;
}
```

**Python**（`scripts/hello.py`）：

```bash
mkdir -p my_package/scripts
chmod +x my_package/scripts/hello.py
```

```python
#!/usr/bin/env python
# -*- coding: utf-8 -*-

import rospy

if __name__ == "__main__":
    rospy.init_node("hello_node")
    rospy.loginfo("Hello World from ROS!")
```

在**功能包**的 `CMakeLists.txt` 中添加：

```cmake
add_executable(hello src/hello.cpp)
add_dependencies(hello ${${PROJECT_NAME}_EXPORTED_TARGETS} ${catkin_EXPORTED_TARGETS})
target_link_libraries(hello ${catkin_LIBRARIES})

catkin_install_python(
  PROGRAMS scripts/hello.py
  DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)
```

> 注意：编辑的是**功能包内**的 `CMakeLists.txt`，不是工作空间根目录的。

#### 小结

C++ 需 `add_executable` + 链接；Python 需可执行权限 + `catkin_install_python`。

---

## 4. 场景四：编译工作空间

#### 场景

修改源码或 CMake 后，需要重新编译。

#### 实操

```bash
cd ~/ros
catkin_make
```

安装缺失依赖：

```bash
rosdep install --from-paths src --ignore-src -r -y
```

#### 常见错误排查

| 现象 | 原因 | 处理 |
|------|------|------|
| `Unable to find package` | 未安装依赖 | `rosdep install ...` |
| `rosrun` 找不到包 | 未 source | `source devel/setup.bash` |
| 修改 CMake 后仍报错 | 缓存问题 | `rm -rf build devel && catkin_make` |
| Python 脚本无法运行 | 无执行权限 | `chmod +x scripts/*.py` |

#### 小结

改 `CMakeLists.txt` 或 `package.xml` 后必须重新 `catkin_make`。

---

## 5. 场景五：运行节点

#### 场景

编译完成，要启动第一个自建节点。

#### 实操

终端 1 — 启动 Master：

```bash
roscore
```

终端 2 — 加载环境并运行：

```bash
cd ~/ros
source devel/setup.bash
rosrun my_package hello        # C++
rosrun my_package hello.py     # Python
```

**自动加载环境（推荐）**：

```bash
echo "source ~/ros/devel/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

#### 小结

流程固定：`roscore` → `source` → `rosrun 包名 可执行文件名`。

---

## 6. 附录：命令速查

| 命令 | 说明 |
|------|------|
| `mkdir -p ~/ros/src` | 创建工作空间源码目录 |
| `catkin_make` | 编译工作空间 |
| `catkin_create_pkg 包名 依赖...` | 创建功能包 |
| `rosdep install --from-paths src --ignore-src -r -y` | 安装依赖 |
| `source devel/setup.bash` | 加载工作空间环境 |
| `rosrun 包名 节点名` | 运行节点 |
| `roscore` | 启动 ROS Master |

---

## 系列导航

- **上一章** ← [01 环境部署](ros-01-environment.md)
- **下一章** → [03 话题通信](ros-03-topic.md)

---
