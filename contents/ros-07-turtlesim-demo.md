---
title: ROS turtlesim 综合 Demo
description: 用 turtlesim 串联 Topic 发布/订阅与 Service 调用，完成第一个完整 ROS 小项目。
excerpt: 本章把 Topic + Service 串起来——控制小海龟运动、读位姿、spawn 新海龟，代码在 src/demo/。
datetime: 2026-06-04T10:35:00.000Z
slug: ros-turtlesim-demo
featured: false
category: Robotics
tags:
  - ros
  - tutorial
  - turtlesim
  - demo
author: Ao
language: Chinese
toc: true
coverImage: /blog/ros.webp
coverImageAlt: ROS turtlesim Demo
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ros.webp
ogImageAlt: ROS turtlesim Demo
---
实操清单见 [场景一](#1-场景一完整实操清单)。

## 0. 本章你要学什么

> 更新：2026-06-04

---

**本章解决什么问题**：前面各章概念分散，需要一个小项目把它们串起来。

**学完能做什么**：用 Topic 控制小海龟、订阅位姿、用 Service 生成新海龟。

**对应仓库**：`src/demo/`

### 核心概念

| 接口 | 类型 | 用途 |
|------|------|------|
| `/turtle1/cmd_vel` | Topic (`geometry_msgs/Twist`) | 发布速度指令 |
| `/turtle1/pose` | Topic (`turtlesim/Pose`) | 订阅位姿 |
| `/spawn` | Service (`turtlesim/Spawn`) | 生成新海龟 |

---

## 1. 场景一：完整实操清单

#### 场景

从零跑通 turtlesim 综合 Demo。

#### 实操

**Step 1 — 编译**

```bash
cd ~/ros && catkin_make && source devel/setup.bash
```

**Step 2 — 启动 roscore**

```bash
roscore
```

**Step 3 — 启动 turtlesim**

```bash
rosrun turtlesim turtlesim_node
```

验证接口：

```bash
rostopic list    # 应有 /turtle1/cmd_vel、/turtle1/pose
rosservice list  # 应有 /spawn
```

**Step 4 — 发布速度（让小海龟转圈）**

```bash
rosrun demo pub_twist.py    # Python
# 或
rosrun demo pub_twist       # C++
```

**Step 5 — 订阅位姿**

```bash
rosrun demo sub_pose
```

**Step 6 — 调用 spawn 生成新海龟**

```bash
rosrun demo client_request.py
```

也可命令行：

```bash
rosservice call /spawn "x: 3.0
y: 4.0
theta: 3.14
name: 'turtle4'"
```

#### 小结

推荐顺序：`roscore` → `turtlesim_node` → 发速度 → 订位姿 → 调 spawn。

---

## 2. 场景二：发布速度指令（Topic）

#### 场景

以 10Hz 发布 `Twist`，让小海龟做圆周运动。

#### 实操

**Python**（`src/demo/scripts/pub_twist.py`）：

```python
#!/usr/bin/env python
"""话题：/turtle1/cmd_vel  类型：geometry_msgs/Twist"""
import rospy
from geometry_msgs.msg import Twist

if __name__ == '__main__':
    rospy.init_node("pub_twist_p")
    pub = rospy.Publisher("/turtle1/cmd_vel", Twist, queue_size=10)
    rate = rospy.Rate(10)
    twist = Twist()
    twist.linear.x = 1.0
    twist.angular.z = 1.0

    while not rospy.is_shutdown():
        pub.publish(twist)
        rate.sleep()
```

**C++**（`src/demo/src/pub_twist.cpp`）要点：

```cpp
ros::Publisher pub = nh.advertise<geometry_msgs::Twist>("turtle1/cmd_vel", 10);
geometry_msgs::Twist twist;
twist.linear.x = 1.0;
twist.angular.z = 1.0;
while (ros::ok()) {
    pub.publish(twist);
    rate.sleep();
    ros::spinOnce();
}
```

#### 小结

`linear.x` 控制前进速度，`angular.z` 控制转角；两者配合产生圆弧轨迹。

---

## 3. 场景三：订阅位姿（Topic）

#### 场景

实时打印小海龟位置和速度。

#### 实操

**C++**（`src/demo/src/sub_pose.cpp`）：

```cpp
void get_pose(const turtlesim::Pose::ConstPtr &pose) {
    ROS_INFO("x=%.2f, y=%.2f, theta=%.2f, lin=%.2f, ang=%.2f",
        pose->x, pose->y, pose->theta,
        pose->linear_velocity, pose->angular_velocity);
}

int main(int argc, char *argv[]) {
    ros::init(argc, argv, "sub_pose");
    ros::NodeHandle nh;
    ros::Subscriber sub = nh.subscribe("/turtle1/pose", 100, get_pose);
    ros::spin();
    return 0;
}
```

与发布节点同时运行，可观察位姿随时间变化。

#### 小结

纯订阅节点用 `ros::spin()` 阻塞等待回调，详见 [08 API 参考](ros-08-apis-reference.md)。

---

## 4. 场景四：生成新海龟（Service）

#### 场景

在指定位置 spawn 第二只海龟。

#### 实操

**Python**（`src/demo/scripts/client_request.py`）：

```python
#!/usr/bin/env python
"""服务：/spawn  类型：turtlesim/Spawn"""
import rospy
from turtlesim.srv import Spawn, SpawnRequest

if __name__ == '__main__':
    rospy.init_node("new_turtle_p")
    client = rospy.ServiceProxy("/spawn", Spawn)

    spawn = SpawnRequest()
    spawn.x = 3.0
    spawn.y = 4.0
    spawn.theta = 3.14
    spawn.name = 'turtle4'

    client.wait_for_service()
    try:
        client.call(spawn)
        rospy.loginfo("Succeed")
    except Exception as e:
        rospy.logerr(e)
```

#### 小结

海龟名称在同一 `turtlesim_node` 中必须唯一；重复名称会导致 spawn 失败。

---

## 5. 场景五：扩展实验

#### 场景

加深理解，自由探索。

#### 实操

- 修改 `Twist` 的线速度、角速度，观察轨迹变化  
- 修改 spawn 的位置和名称，生成多只海龟  
- 同时运行发布、订阅、spawn 三个节点  
- 用 `rqt_graph` 查看节点关系  

#### 小结

turtlesim 是 ROS 官方自带的最小仿真环境，适合反复练手。

---

## 6. 附录：命令速查

| 命令 | 说明 |
|------|------|
| `rosrun turtlesim turtlesim_node` | 启动仿真 |
| `rosrun demo pub_twist.py` | 发布速度 |
| `rosrun demo sub_pose` | 订阅位姿 |
| `rosrun demo client_request.py` | spawn 新海龟 |
| `rostopic echo /turtle1/pose` | 命令行看位姿 |
| `rqt_graph` | 可视化 |

---

## 系列导航

- **上一章** ← [06 Launch 与管理](ros-06-launch-manage.md)
- **下一章** → [08 C++ API 参考](ros-08-apis-reference.md)

---
