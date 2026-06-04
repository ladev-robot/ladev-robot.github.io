---
title: ROS 参数服务器（Param）
description: 键值对配置、全局/私有命名空间、ros::param 与 NodeHandle API。
excerpt: 本章解决「全局配置如何共享」——Param 键值存储，示例在 src/params/，非消息传递通道。
datetime: 2026-06-04T10:25:00.000Z
slug: ros-parameter-server
featured: false
category: Robotics
tags:
  - ros
  - tutorial
  - parameter
author: Ao
language: Chinese
toc: true
coverImage: /blog/ros.webp
coverImageAlt: ROS 参数服务器
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ros.webp
ogImageAlt: ROS 参数服务器
---
本章命令速查见文末 [附录：命令速查](#5-附录命令速查)。

## 0. 本章你要学什么

> 更新：2026-06-04

---

**本章解决什么问题**：多个节点需要共享**配置类、不频繁变化**的数据（PID、话题名、标定值）。

**学完能做什么**：用 C++ / 命令行读写参数，理解全局 / 相对 / 私有命名空间。

**对应仓库**：`src/params/`（`param_set`、`param_get`、`param_del`）

### 核心概念

参数服务器 = ROS Master 内的**键值字典**，全局可见（受命名空间影响）。

| 机制 | 用途 |
|------|------|
| Topic | 连续数据流 |
| Service | 一次请求-响应 |
| **Param** | **静态配置、键值对** |

> 不要用 Param 做高频读写或大块数据传输。

---

## 1. 场景一：参数命名空间

#### 场景

多节点部署时避免参数名冲突。

#### 实操

| 写法 | 含义 | 示例 |
|------|------|------|
| `/name` | 全局参数 | `/global_param_int` |
| `name` | 相对当前命名空间 | `relative_param_int` |
| `~name` | 节点私有参数 | `~private_param_int` |

```cpp
ros::param::set("/global_param_int", 20000);
ros::param::set("relative_param_int", 20000);
ros::param::set("~private_param_int", 20000);

ros::NodeHandle nh_private("~");
nh_private.setParam("private_param_int_v2", 20000);
```

#### 小结

launch 中 `<node>` 内的 `<param>` 通常是该节点的私有参数。

---

## 2. 场景二：设置与修改参数

#### 场景

启动前或运行时写入配置。

#### 实操

两套等价 API：`ros::NodeHandle` 成员函数 或 `ros::param` 静态函数。

```cpp
// NodeHandle 方式
nh.setParam("nh_int", 10);
nh.setParam("nh_int", 10000);  // 同键再次 set = 修改

// ros::param 方式
ros::param::set("param_int", 20);
ros::param::set("param_double", 3.14);
ros::param::set("param_bool", false);
ros::param::set("param_string", "hello");
```

支持类型：整型、浮点、布尔、字符串、向量、字典等。

运行示例：

```bash
roscore
rosrun params param_set
```

#### 小结

新增与修改用同一 API；键已存在则覆盖。

---

## 3. 场景三：查询与删除参数

#### 场景

读取配置或清理无用参数。

#### 实操

**查询**：

```cpp
int val;
if (nh.getParam("nh_int", val)) {
    ROS_INFO("nh_int=%d", val);
}
int def = nh.param("missing_key", 999);  // 不存在则返回默认值

std::vector<std::string> names;
ros::param::getParamNames(names);
```

**删除**：

```cpp
ros::param::del("param_double");       // 成功 true，不存在 false
nh.deleteParam("nh_int");
```

运行：

```bash
rosrun params param_get
rosrun params param_del
rosparam list
rosparam get nh_int
```

#### 小结

`getParamCached` 适合反复读同一参数；`hasParam` / `searchParam` 用于存在性检查。

---

## 4. 场景四：命令行管理参数

#### 场景

不改代码，快速查看或临时改参。

#### 实操

```bash
rosparam list
rosparam get /global_param_int
rosparam set /test_param 42
rosparam delete /test_param
rosparam dump params.yaml    # 导出
rosparam load params.yaml    # 导入
```

launch 中批量加载：

```xml
<rosparam file="$(find pkg)/config/params.yaml" command="load" />
```

#### 小结

Param 适合 launch 一次性加载 YAML；运行时调试可用 `rosparam`。

---

## 5. 附录：命令速查

| 命令 / API | 说明 |
|------------|------|
| `rosparam list` | 列出所有参数 |
| `rosparam get/set/delete` | 读 / 写 / 删 |
| `nh.setParam / getParam` | C++ NodeHandle 方式 |
| `ros::param::set / get / del` | C++ 全局函数方式 |
| `rosparam dump/load` | 导出 / 导入 YAML |

---

## 系列导航

- **上一章** ← [04 服务通信](ros-04-service.md)
- **下一章** → [06 Launch 与管理](ros-06-launch-manage.md)

---
