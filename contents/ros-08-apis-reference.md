---
title: ROS C++ API 参考
description: ros::init、latch、spin/spinOnce、Time/Duration/Rate/Timer 进阶查阅。
excerpt: 进阶查阅章：何时用 spin 还是 spinOnce、latch 锁存、时间 API，示例在 src/manage/。
datetime: 2026-06-04T10:40:00.000Z
slug: ros-cpp-apis-reference
featured: false
category: Robotics
tags:
  - ros
  - tutorial
  - cpp
  - api
author: Ao
language: Chinese
toc: true
coverImage: /blog/ros.webp
coverImageAlt: ROS C++ API 参考
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ros.webp
ogImageAlt: ROS C++ API 参考
---
本章为查阅手册，建议学完 [03 话题](ros-03-topic.md) 后再用。spin 与 launch 配合见 [06 Launch](ros-06-launch-manage.md)。

## 0. 本章你要学什么

> 更新：2026-06-04

---

**本章解决什么问题**：写 C++ 节点时，init 选项、消息锁存、回调驱动、时间控制怎么选。

**学完能做什么**：根据场景选用正确 API，避免「回调从不执行」等常见坑。

**对应仓库**：`src/manage/src/`（`advertiser.cpp`、`subscriber.cpp`、`apis_example.cpp`）

### API 速览

| API | 何时用 |
|-----|--------|
| `ros::init()` | 每个节点入口，必须调用 |
| `latch=true` | 新订阅者需要收到「最后一条」历史消息 |
| `ros::spin()` | 纯订阅/纯服务，无主循环 |
| `ros::spinOnce()` | 主循环里还要 publish 或做其他事 |
| `ros::Time/Duration/Rate/Timer` | 时刻、休眠、定频、定时回调 |

---

## 1. ros::init — 节点初始化

#### 何时用

每个 C++ 节点的 `main()` 第一行。

#### 最小示例

```cpp
ros::init(argc, argv, "my_node");
```

#### init_options

```cpp
ros::init(argc, argv, "pub_demo", ros::init_options::AnonymousName);
```

| 选项 | 说明 |
|------|------|
| `AnonymousName` | 节点名加随机后缀，允许多实例 |
| `NoSigintHandler` | 不处理 Ctrl+C，需自行退出 |
| `NoRosout` | 日志不发送到 `/rosout` |

组合：`AnonymousName \| NoRosout`

#### 注意点

- 节点名在同一 Master 下应唯一（或用 AnonymousName）
- `argc/argv` 用于接收 launch 中的 remap 参数

---

## 2. latch — 消息锁存

#### 何时用

地图、配置、状态等「不频繁更新、但新订阅者需要立即拿到最新值」的场景。

#### 最小示例

```cpp
ros::Publisher pub = nh.advertise<std_msgs::String>("map", 10, true);
//                                                          队列  latch
```

| latch | 行为 | 适用 |
|-------|------|------|
| `false`（默认） | 只收到订阅**之后**的消息 | 传感器流、速度指令 |
| `true` | 保存最后一条，新订阅者立即收到 | 地图、状态、配置 |

#### 注意点

```
时间线：  0s     发布地图    3s  订阅者启动
latch=false → 订阅者收不到 0s 的地图
latch=true  → 订阅者 3s 连接后立即收到
```

---

## 3. spin 与 spinOnce — 回调处理

#### 何时用

节点有 Subscriber、Service 或 Timer 时，**必须**调用 spin 系列，否则回调永不执行。

#### ros::spin() — 阻塞

```cpp
ros::Subscriber sub = nh.subscribe("test", 10, callback);
ros::spin();  // 阻塞，直到节点关闭
```

**适合**：纯订阅者、纯服务端（见 `subscriber.cpp`）。

#### ros::spinOnce() — 非阻塞

```cpp
ros::Rate rate(10);
while (ros::ok()) {
    pub.publish(msg);
    ros::spinOnce();  // 处理一次待处理回调
    rate.sleep();
}
```

**适合**：发布者主循环中还要处理订阅回调（见 `advertiser.cpp`）。

#### 对比

| 函数 | 阻塞 | 场景 |
|------|------|------|
| `spin()` | 是 | 纯订阅/服务 |
| `spinOnce()` | 否 | 发布 + 订阅共存 |

> 有回调却不 spin = 回调永远不执行。与 [07 Demo](ros-07-turtlesim-demo.md) 中 `sub_pose` 的 `spin()` 对应。

---

## 4. 时间相关 API

#### 何时用

定频发布、定时任务、时间戳计算。

#### ros::Time — 时刻

```cpp
ros::Time now = ros::Time::now();
ros::Time t1(100, 500000000);  // 100.5 秒
ROS_INFO("%.2f", now.toSec());
```

#### ros::Duration — 持续时间

```cpp
ros::Duration du(2.5);
du.sleep();  // 休眠 2.5 秒
```

#### 时间运算

```cpp
ros::Time later = now + du;           // Time ± Duration = Time
ros::Duration diff = t2 - t1;         // Time - Time = Duration
// Time + Time 不允许！
```

#### ros::Rate — 频率控制

```cpp
ros::Rate rate(10);  // 10 Hz
while (ros::ok()) {
    // ...
    rate.sleep();
}
```

#### ros::Timer — 定时器

```cpp
void timerCallback(const ros::TimerEvent& event) {
    ROS_INFO("Timer triggered!");
}
ros::Timer timer = nh.createTimer(
    ros::Duration(0.5), timerCallback, false);  // false=重复
ros::spin();  // Timer 回调也需要 spin
```

#### 注意点

必须先 `ros::NodeHandle nh`，时间系统才初始化。

---

## 5. 运行示例

#### 实操

```bash
cd ~/ros && catkin_make && source devel/setup.bash
roscore

# 终端1：发布者（latch + spinOnce）
rosrun manage advertiser

# 终端2：订阅者（spin）— 可延迟启动测试 latch
rosrun manage subscriber

# 终端3：时间 API
rosrun manage apis_example
```

#### 小结

先启动 `advertiser` 再启动 `subscriber`，对比 `latch=true` 时订阅者能否收到历史消息。

---

## 6. 附录：API 对照表

| API | 用途 | 关键点 |
|-----|------|--------|
| `ros::init()` | 初始化节点 | `init_options` 控制匿名、信号 |
| `advertise(..., latch)` | 发布 | `true` 锁存最后一条 |
| `ros::spin()` | 阻塞回调 | 纯订阅/服务 |
| `ros::spinOnce()` | 非阻塞回调 | 主循环有其他任务 |
| `ros::Time` | 时刻 | `now()`、`toSec()` |
| `ros::Duration` | 时间段 | `sleep()` |
| `ros::Rate` | 定频循环 | `rate.sleep()` |
| `ros::Timer` | 定时回调 | 需配合 `spin` |

---

## 系列导航

- **上一章** ← [07 turtlesim Demo](ros-07-turtlesim-demo.md)
- **系列索引** → [ROS 教程索引](ros-tutorial-index.md)

---
