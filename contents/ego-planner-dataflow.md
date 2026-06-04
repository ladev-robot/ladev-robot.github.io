---
title: EGO-Planner 完整数据流梳理
description: 从传感器输入到 MAVROS 执行，系统梳理 ego-planner-swarm 的规划链路、核心节点与源码索引。
excerpt: 传感器 → 占据栅格 → A* 绕障 → B 样条初始化 → 优化器 → 轨迹话题 → 控制器，一文读懂 EGO-Planner 数据流。
datetime: 2026-06-04T10:00:00.000Z
slug: ego-planner-dataflow
featured: true
category: Robotics
tags:
  - ego-planner
  - ros
  - uav
  - tutorial
author: Ao
language: Chinese
toc: true
coverImage: /blog/ego-planner.webp
coverImageAlt: EGO-Planner 无人机轨迹规划数据流示意图
coverImageWidth: "1200"
coverImageHeight: "700"
ogImage: /blog/ego-planner.webp
ogImageAlt: EGO-Planner 完整数据流梳理
---
源码索引与话题速查见文末 [附录：源码索引与话题速查](#7-附录源码索引与话题速查)。

## 0. 总览与架构

> 更新：2026-06-04
> 代码仓库：`ego-planner-swarm`（本文以 `drone_0` 单机仿真为例）

---

### 你在学什么

EGO-Planner 是一套 **ROS 局部轨迹规划框架**，典型用途是：无人机在未知/半已知环境中，根据 onboard 感知实时建图、避障、生成平滑且满足动力学约束的轨迹，并下发给底层控制器执行。

整条链路可以概括为七个环节：

```
传感器输入 → 占据栅格地图 → A* 绕障 → B 样条初始化 → 优化器 → 轨迹话题 → 控制器 / MAVROS
```

---

### 核心节点（只有两个）

| 节点 | 包 | 职责 |
| --- | --- | --- |
| `ego_planner_node` | `plan_manage` | 建图 + FSM 状态机 + 轨迹规划（全在一个进程） |
| `traj_server` | `plan_manage` | 订阅 B 样条，100Hz 采样并发布 `PositionCommand` |

仿真还会启动 `pcl_render_node`（模拟传感器）、`random_forest`（生成地图）、`poscmd_2_odom`（完美跟踪闭环）等辅助节点。

---

### 数据流全景图

```
┌─────────────────────────────────────────────────────────────────┐
│                        感知层（仿真 / 真机）                      │
│  点云 PointCloud2 / 深度图 Image + 里程计 Odometry              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│              GridMap（plan_env）占据栅格建图                      │
│  射线投射 → log-odds 融合 → 膨胀 → getInflateOccupancy()        │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│         ego_planner_node（FSM + EGOPlannerManager）              │
│  ① 多项式初始路径（min-snap）                                    │
│  ② Uniform B-spline 参数化                                     │
│  ③ initControlPoints：碰撞检测 + 3D A* 绕障                     │
│  ④ BsplineOptimizeTrajRebound（L-BFGS）                          │
│  ⑤ refine：时间重分配 + BsplineOptimizeTrajRefine               │
└────────────────────────────┬────────────────────────────────────┘
                             ▼  /drone_0_planning/bspline
┌─────────────────────────────────────────────────────────────────┐
│              traj_server → PositionCommand（100Hz）              │
└────────────────────────────┬────────────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  仿真：poscmd_2_odom / so3_control                               │
│  真机：几何控制器 → MAVROS → PX4（本仓库未内置 MAVROS）           │
└─────────────────────────────────────────────────────────────────┘
```

> **重要澄清**：代码里 `dyn_a_star` 实现的是 **3D 几何栅格 A\***，不是严格意义上的 Kinodynamic A*（不在状态空间扩展速度/加速度）。动力学约束由 **B-spline 优化器的 feasibility 代价** 负责。这是 EGO-Planner 的设计分工：A* 找拓扑可行路径，优化器满足动力学并平滑。

---

### Launch 入口

单机仿真推荐从以下文件入手：

```bash
# 路径（仓库内）
src/planner/plan_manage/launch/single_run_in_sim.launch
src/planner/plan_manage/launch/run_in_sim.launch
src/planner/plan_manage/launch/advanced_param.xml   # 话题 remap + 全部参数
```

`advanced_param.xml` 中定义了 planner 订阅的所有传感器话题与规划参数，是理解数据流的第一站。

---

---

## 1. 传感器输入

> 更新：2026-06-04

---

### 仿真默认话题（drone_0）

#### 场景

你在 `single_run_in_sim.launch` 里启动单机仿真，需要知道「规划器从哪里读感知数据」。

#### 话题对照表

| 数据 | 话题 | 消息类型 | 来源节点 |
| --- | --- | --- | --- |
| 全局地图 | `/map_generator/global_cloud` | `sensor_msgs/PointCloud2` | `random_forest` |
| 局部感知点云 | `/drone_0_pcl_render_node/cloud` | `PointCloud2` | `pcl_render_node` |
| 深度图（可选） | `/drone_0_pcl_render_node/depth` | `sensor_msgs/Image` | `pcl_render_node` |
| 相机位姿（可选） | `/drone_0_pcl_render_node/camera_pose` | `geometry_msgs/PoseStamped` | `pcl_render_node` |
| 里程计 | `/drone_0_visual_slam/odom` | `nav_msgs/Odometry` | `poscmd_2_odom`（仿真） |

#### 仿真感知链路

```
random_forest 发布 global_cloud
        ↓
pcl_render_node 根据 odom 位姿裁剪视野内点云
        ↓
发布 /drone_0_pcl_render_node/cloud → GridMap 订阅
```

`pcl_render_node` 的作用：根据无人机当前位姿，从全局地图中「裁剪」传感器视野范围内的点云，模拟 onboard LiDAR / 深度相机感知。

#### 真机替换

真实飞行时，在 `advanced_param.xml` 中修改以下 remap 即可：

```xml
<arg name="odometry_topic" value="你的 VIO/LIO 里程计话题"/>
<arg name="cloud_topic" value="你的点云话题"/>
<!-- 若用深度相机而非点云，则配置 depth_topic + camera_pose_topic -->
<arg name="depth_topic" value="..."/>
<arg name="camera_pose_topic" value="..."/>
```

> **二选一**：点云模式（`cloud_topic`）与深度图模式（`depth` + `pose`）不要同时作为主输入，launch 注释里已有说明。

#### 小结

| 要点 | 说明 |
| --- | --- |
| 默认走点云 | `cloud_topic` → `grid_map/cloud` |
| 里程计必须 | FSM 和 GridMap 都依赖 `odom_world` |
| 仿真闭环 | `poscmd_2_odom` 把控制指令直接变成 odom |

---

---

## 2. 占据栅格地图（GridMap）

> 更新：2026-06-04

---

### 模块位置

- **包**：`plan_env`
- **源码**：`src/planner/plan_env/src/grid_map.cpp`
- **头文件**：`src/planner/plan_env/include/plan_env/grid_map.h`
- **初始化**：`EGOPlannerManager::initPlanModules()` 中 `grid_map_->initMap(nh)`

GridMap 与规划器运行在 **同一个 `ego_planner_node` 进程** 内，通过 C++ 对象直接调用，不走 ROS 话题传递地图数据。

---

### 订阅的话题

经 launch remap 后，GridMap 实际订阅：

```
grid_map/odom   ← 无人机位姿（独立回调 + 可与 depth 同步）
grid_map/cloud  ← 点云（本仓库默认）
grid_map/depth  ← 深度图（可选，与 odom 时间同步）
grid_map/pose   ← 相机位姿（深度模式用）
```

---

### 建图流程

#### 场景

每一帧点云/深度图到达后，GridMap 如何更新局部占据信息？

#### 处理步骤

```
点云 / 深度图 + 位姿
    ↓
射线投射（raycast）：从传感器原点到每个测量点
    ↓
log-odds 概率更新：p_hit（命中）/ p_miss（穿过自由空间）
    ↓
occupancy > p_occ 阈值 → 标记占据
    ↓
obstacles_inflation 膨胀 → occupancy_buffer_inflate_
    ↓
定时器 20Hz（updateOccupancyCallback）批量融合
```

#### 关键参数（advanced_param.xml）

| 参数 | 默认值 | 含义 |
| --- | --- | --- |
| `grid_map/resolution` | `0.1` | 体素分辨率（米） |
| `grid_map/local_update_range_x/y/z` | `5.5 / 5.5 / 4.5` | 局部更新范围 |
| `grid_map/obstacles_inflation` | `0.099` | 障碍物膨胀半径 |
| `grid_map/p_occ` | `0.80` | 占据判定阈值 |
| `grid_map/max_ray_length` | `4.5` | 最大射线长度 |

#### 对外接口

规划器和 A* 通过以下 API 查询地图（函数调用，非 ROS）：

```cpp
grid_map_->getInflateOccupancy(pos);  // A* 与碰撞检测均用膨胀地图
```

可视化发布（可选，供 RViz 查看）：

```
grid_map/occupancy          → sensor_msgs/PointCloud2
grid_map/occupancy_inflate  → sensor_msgs/PointCloud2
```

#### 小结

| 命令/接口 | 作用 |
| --- | --- |
| `getInflateOccupancy(pos)` | 查询某点是否在膨胀障碍物内 |
| `occupancy_buffer_inflate_` | 膨胀后的占据栅格，A* 搜索依据 |
| 20Hz 定时器 | 批量更新局部地图 |

---

---

## 3. A* 绕障（dyn_a_star）

> 更新：2026-06-04

---

### 名称澄清：不是 Kinodynamic A*

#### 你在做什么

论文和教程里常把 EGO 的整体方案称为「考虑动力学的规划」，但 **本仓库的 A* 模块是 3D 几何栅格搜索**，不在状态空间中扩展 `(x, y, z, vx, vy, vz, ...)`。

| 模块 | 实际能力 |
| --- | --- |
| `path_searching/dyn_a_star.cpp` | 3D 几何 A*，26 邻域，对角线启发函数 |
| `bspline_optimizer` 的 `calcFeasibilityCost` | 速度 / 加速度 / jerk 约束 |

**分工**：A* 负责快速找 **拓扑可行** 的绕障路径；B-spline 优化负责 **动力学可行 + 平滑**。

---

### 模块位置

- **包**：`path_searching`
- **类**：`AStar`（头文件 `dyn_a_star.h`）
- **初始化**：`planner_manager.cpp` 中 `bspline_optimizer_->a_star_->initGridMap(grid_map_, ...)`
- **调用位置**：`bspline_optimizer.cpp` → `initControlPoints()`

---

### 何时触发 A*

#### 场景

初始 B-spline 控制点组成的折线穿过了障碍物，需要局部绕障。

#### 流程

```
initControlPoints(ctrl_pts)
    ↓
沿初始控制点折线采样，检测碰撞段 [in_id, out_id]
    ↓
对每个碰撞段：AstarSearch(0.1, in, out)
    ↓
得到 a_star_pathes → 设置 rebound 弹性方向
    ↓
供后续 L-BFGS 优化器推开控制点
```

核心代码逻辑（`bspline_optimizer.cpp`）：

```cpp
// 对每个碰撞段调用 A*
if (a_star_->AstarSearch(0.1, in, out)) {
  a_star_pathes.push_back(a_star_->getPath());
}
// 用 A* 路径与初始折线的交点，设置控制点的 rebound 方向
```

A* 搜索使用 `grid_map_->getInflateOccupancy(pos)` 判断节点是否可通行。

#### 小结

| 要点 | 说明 |
| --- | --- |
| 输入 | 碰撞段入口 `in`、出口 `out`（3D 坐标） |
| 输出 | 无碰撞几何路径点序列 |
| 步长 | `0.1` m（硬编码在调用处） |
| 失败 | 返回空，整个 replan 失败，FSM 重试 |

---

---

## 4. B 样条初始化

> 更新：2026-06-04

---

### 入口函数

**`EGOPlannerManager::reboundReplan()`** — `src/planner/plan_manage/src/planner_manager.cpp`

一次完整 replan 分三步：`INIT` → `OPT` → `REFINE`。B 样条初始化发生在 **STEP 1: INIT**。

---

### 场景一：首次规划（多项式初始路径）

#### 场景

无人机刚收到目标点，还没有历史轨迹，需要从零生成初始路径。

#### 流程

```
起点/终点/速度/加速度（来自 odom + 全局路径）
    ↓
PolynomialTraj::one_segment_traj_gen()   // 单段多项式
或 PolynomialTraj::minSnapTraj()        // 多段 min-snap
    ↓
按 ctrl_pt_dist 采样 point_set（至少 7 个点）
    ↓
UniformBspline::parameterizeToBspline(ts, point_set, derivatives, ctrl_pts)
    ↓
initControlPoints(ctrl_pts)   // 碰撞检测 + A* 绕障
```

`ts`（时间间隔）由控制点间距与最大速度估算：

```cpp
double ts = pp_.ctrl_pt_dist / pp_.max_vel_ * 1.5;  // 典型计算方式
```

---

### 场景二：重规划（沿当前轨迹延伸）

#### 场景

FSM 进入 `REPLAN_TRAJ`，无人机正在执行上一段 B-spline，需要在当前轨迹上「往前接」一段到局部目标。

#### 流程

```
从 t_cur = now - start_time 起，沿当前 position_traj_ 采样
    ↓
末端用多项式延伸到 local_target_pt
    ↓
按弧长重新采样 → point_set
    ↓
parameterizeToBspline → initControlPoints
```

若初始路径过长（超过 `planning_horizen` 的 3 倍控制点距离），会强制回退到多项式初始化。

---

### 相关源码

| 文件 | 内容 |
| --- | --- |
| `bspline_opt/uniform_bspline.cpp` | B-spline 求值、求导、参数化 |
| `traj_utils/polynomial_traj.cpp` | min-snap / one_segment 多项式 |
| `planner_manager.cpp` L71–L222 | INIT 阶段完整逻辑 |

#### 小结

| 步骤 | 函数 |
| --- | --- |
| 采样点集 | 多项式求值 / 当前轨迹采样 |
| 转控制点 | `UniformBspline::parameterizeToBspline` |
| 绕障准备 | `initControlPoints` |

---

---

## 5. 优化器（Rebound + Refine）

> 更新：2026-06-04

---

### 模块位置

- **包**：`bspline_opt`
- **源码**：`src/planner/bspline_opt/src/bspline_optimizer.cpp`
- **求解器**：L-BFGS（`lbfgs.hpp`）

---

### STEP 2：Rebound 优化

#### 场景

初始控制点已设好 rebound 方向，需要优化成无碰撞、平滑、满足速度加速度约束的轨迹。

#### 入口

```cpp
bspline_optimizer_->BsplineOptimizeTrajRebound(ctrl_pts, ts);
// 若开启 use_distinctive_trajs，会并行优化多条候选轨迹，取代价最小者
```

内部调用 `rebound_optimize()`，以 L-BFGS 迭代控制点坐标。

#### 代价函数（combineCostRebound）

| 代价项 | 作用 | 参数 |
| --- | --- | --- |
| smoothness | 轨迹平滑（jerk 最小） | `lambda_smooth = 1.0` |
| distance (rebound) | 推离障碍物 | `lambda_collision = 0.5` |
| feasibility | 速度 / 加速度约束 | `lambda_feasibility = 0.1` |
| swarm | 多机避碰 | `swarm_clearance = 0.5` |
| terminal | 终点约束 | — |

优化过程中若仍碰撞，会再次调用 `initControlPoints()` 并增大碰撞惩罚权重（rebound 迭代，最多约 20 次）。

---

### STEP 3：Refine（时间重分配）

#### 场景

Rebound 优化后的 B-spline 经 `checkFeasibility()` 检测，发现速度或加速度超限。

#### 流程

```
pos.checkFeasibility(ratio)  // ratio > 1 表示需要拉长时间
    ↓
reparamBspline：lengthenTime(ratio) 拉长时间轴
    ↓
BsplineOptimizeTrajRefine()  // fitness 代价，保持路径形状
```

Refine 的代价项：`smoothness + fitness + feasibility`（`combineCostRefine`）。

> **集群模式**：`drone_id > 0` 时 Refine 被禁用（`planner_manager.cpp` 中有 `REFINE DISABLED` 日志），仅 `drone_0` 做时间重分配。

#### 小结

| 阶段 | 函数 | 目的 |
| --- | --- | --- |
| Rebound | `BsplineOptimizeTrajRebound` | 避障 + 平滑 + 动力学 |
| Refine | `BsplineOptimizeTrajRefine` | 拉长时间后微调形状 |

---

---

## 6. 轨迹话题与 FSM

> 更新：2026-06-04

---

### FSM 状态机

#### 模块

- **源码**：`src/planner/plan_manage/src/ego_replan_fsm.cpp`
- **频率**：100Hz 定时器 `execFSMCallback`

#### 状态流转

```
INIT → WAIT_TARGET → SEQUENTIAL_START / GEN_NEW_TRAJ → EXEC_TRAJ
                              ↑                              |
                              └──── REPLAN_TRAJ ←────────────┘
                                   （定时重规划 / 安全碰撞检测）
```

| 状态 | 触发条件 | 行为 |
| --- | --- | --- |
| `WAIT_TARGET` | 收到目标点 / trigger | 等待开始 |
| `GEN_NEW_TRAJ` | 首次规划 | `planFromGlobalTraj()` |
| `EXEC_TRAJ` | 规划成功 | 执行轨迹，监控是否需要重规划 |
| `REPLAN_TRAJ` | 距目标变化 / 定时 / 碰撞 | `planFromCurrentTraj()` → `reboundReplan()` |
| `EMERGENCY_STOP` | 安全检测失败 | 发布悬停轨迹 |

重规划阈值（`advanced_param.xml`）：

- `fsm/thresh_replan_time = 1.0` s
- `fsm/thresh_no_replan_meter = 1.0` m
- `fsm/planning_horizon = 7.5` m

---

### 发布的话题

规划成功后，`callReboundReplan()` 打包 `traj_utils/Bspline` 并发布：

| 话题 | 消息类型 | 用途 |
| --- | --- | --- |
| `/drone_0_planning/bspline` | `traj_utils/Bspline` | → traj_server 执行 |
| `/drone_0_planning/swarm_trajs` | `traj_utils/MultiBsplines` | 集群轨迹广播 |
| `/broadcast_bspline` | `traj_utils/Bspline` | 跨机 TCP/UDP 桥接 |

#### Bspline.msg 结构

```
int32   drone_id
int32   order          # 3 阶 B-spline
int64   traj_id
time    start_time     # 轨迹起始 ROS 时间
float64[] knots        # 节点向量
geometry_msgs/Point[] pos_pts   # 控制点
float64[] yaw_pts      # （当前实现中 yaw 由 traj_server 计算）
float64 yaw_dt
```

---

### traj_server：B-spline → PositionCommand

#### 模块

- **源码**：`src/planner/plan_manage/src/traj_server.cpp`
- **频率**：100Hz

#### 流程

```
订阅 planning/bspline
    ↓
解析控制点 + knots → 构造 UniformBspline
    ↓
按 t = now - start_time 采样 pos / vel / acc
    ↓
计算 yaw：朝向前方 time_forward（默认 1.0s）处的路径点
    ↓
发布 quadrotor_msgs/PositionCommand → /drone_0_planning/pos_cmd
```

`PositionCommand` 包含：`position`、`velocity`、`acceleration`、`yaw`、`yaw_dot`。

#### 小结

| 节点 | 订阅 | 发布 |
| --- | --- | --- |
| `ego_planner_node` | odom, cloud/depth, waypoints | bspline, swarm_trajs |
| `traj_server` | bspline | PositionCommand |

---

---

## 7. 控制器与 MAVROS

> 更新：2026-06-04

---

### 本仓库的仿真闭环

**重要**：`ego-planner-swarm` **没有内置 MAVROS 节点**。

默认仿真链路（`simulator.xml`）：

```
traj_server
  → /drone_0_planning/pos_cmd  (PositionCommand)
  → poscmd_2_odom              (完美跟踪：指令直接变 odom)
  → /drone_0_visual_slam/odom  (反馈给 planner)
```

`poscmd_2_odom` 源码：`src/uav_simulator/fake_drone/src/poscmd_2_odom.cpp` — 不做真实动力学，仅把位置指令原样写入 odometry，形成理想闭环。

---

### 注释掉的 SO3 控制链路

`simulator.xml` 中注释了更接近真实控制的链路：

```
PositionCommand
  → so3_control (SO3ControlNodelet)
  → quadrotor_msgs/SO3Command
  → so3_quadrotor_simulator
  → odom + imu
```

若做高保真仿真，可取消注释 `so3_control` 与 `quadrotor_simulator_so3` 相关节点。

---

### 真机 + MAVROS 典型接法

需自行集成，常见架构：

```
PositionCommand (pos / vel / acc / yaw)
        ↓
  几何控制器 / px4_offboard 节点
        ↓
mavros/setpoint_raw/local  或  setpoint_position/local
        ↓
      PX4 飞控
        ↓
mavros/local_position/odom  →  remap 到 ego_planner 的 odom_world
```

| 环节 | 建议话题 |
| --- | --- |
| 规划器读 odom | `mavros/local_position/odom` 或 VIO 输出 |
| 规划器读点云 | LiDAR / 深度相机实际话题 |
| 控制输出 | 自写节点订阅 `PositionCommand`，转 MAVROS setpoint |

---

---

## 8. 一次完整 Replan 时间线

> 更新：2026-06-04

---

### 场景

从用户下发目标到无人机开始执行，中间发生了什么？

#### 时间线

```
t=0    收到目标点 / traj_start_trigger
       FSM: WAIT_TARGET → GEN_NEW_TRAJ / SEQUENTIAL_START

t=1    reboundReplan() 被调用
       ├─ 读 odom → start_pt / vel / acc
       ├─ getLocalTarget() → 全局路径上的局部目标
       ├─ [INIT] 多项式 → 采样 → B-spline 控制点
       ├─ [INIT] initControlPoints: 碰撞检测 → A* 绕障
       ├─ [OPT]  L-BFGS rebound（约几十 ms）
       └─ [REFINE] 必要时拉长时间再优化

t=2    发布 /drone_0_planning/bspline
       FSM → EXEC_TRAJ

t=3~   traj_server 100Hz 采样轨迹
       发布 PositionCommand → 控制器 / poscmd_2_odom

t=N    定时重规划（默认 1.0s）或 safety 碰撞检测
       FSM → REPLAN_TRAJ → 再次 reboundReplan()
       沿当前轨迹往前「接」一段，而非从零开始
```

#### 小结

| 阶段 | 耗时量级 | 关键输出 |
| --- | --- | --- |
| INIT | ~ms | 初始控制点 + A* 路径 |
| OPT | ~10–50 ms | 优化后 B-spline |
| REFINE | 0 或 ~ms | 时间可行轨迹 |
| 执行 | 100 Hz | PositionCommand |

---

---

## 9. 附录：源码索引与话题速查

> 各章正文侧重理解，此处侧重一页查完。

---

### 推荐阅读顺序

| 顺序 | 文件 | 内容 |
| --- | --- | --- |
| 1 | `plan_manage/launch/run_in_sim.launch` | 整体 launch 拓扑 |
| 2 | `plan_manage/launch/advanced_param.xml` | 话题 remap + 参数 |
| 3 | `plan_env/src/grid_map.cpp` | 占据栅格建图 |
| 4 | `plan_manage/src/ego_replan_fsm.cpp` | FSM 触发逻辑 |
| 5 | `plan_manage/src/planner_manager.cpp` | **核心**：INIT → OPT → REFINE |
| 6 | `bspline_opt/src/bspline_optimizer.cpp` | A* 调用 + 优化器 |
| 7 | `path_searching/src/dyn_a_star.cpp` | 3D A* 搜索 |
| 8 | `plan_manage/src/traj_server.cpp` | B-spline → PositionCommand |
| 9 | `fake_drone/src/poscmd_2_odom.cpp` | 仿真闭环 |

---

### ROS 包职责

| 包 | 职责 |
| --- | --- |
| `plan_manage` | FSM、planner_manager、traj_server、launch |
| `plan_env` | GridMap、raycast、动态障碍预测（可选） |
| `path_searching` | 3D A*（dyn_a_star） |
| `bspline_opt` | Uniform B-spline、L-BFGS 优化器 |
| `traj_utils` | Bspline.msg、可视化、多项式轨迹 |
| `local_sensing_node` | 仿真传感器（pcl_render_node） |
| `map_generator` | 随机森林地图生成 |

---

### 话题速查（drone_0）

#### 输入（规划器订阅）

```bash
/drone_0_visual_slam/odom              # nav_msgs/Odometry
/drone_0_pcl_render_node/cloud         # sensor_msgs/PointCloud2
/drone_0_pcl_render_node/depth         # sensor_msgs/Image（可选）
/move_base_simple/goal                 # 手动目标（flight_type=1）
/traj_start_trigger                    # 预设航点触发（flight_type=2）
```

#### 输出（规划器发布）

```bash
/drone_0_planning/bspline              # traj_utils/Bspline → traj_server
/drone_0_planning/swarm_trajs          # traj_utils/MultiBsplines
/broadcast_bspline                     # 集群广播
```

#### 执行层

```bash
/drone_0_planning/pos_cmd              # quadrotor_msgs/PositionCommand
```

#### 调试可视化

```bash
/drone_0_ego_planner_node/grid_map/occupancy
/drone_0_ego_planner_node/grid_map/occupancy_inflate
# planning_visualization 发布的 Marker：goal_point, a_star_list, optimal_list 等
```

---

### 关键参数速查

| 参数 | 默认 | 含义 |
| --- | --- | --- |
| `manager/max_vel` | `2.0` | 最大速度 m/s |
| `manager/max_acc` | `3.0` | 最大加速度 m/s² |
| `manager/control_points_distance` | `0.4` | 控制点间距 |
| `manager/planning_horizon` | `7.5` | 规划视野（米） |
| `optimization/lambda_collision` | `0.5` | 避障代价权重 |
| `optimization/dist0` | `0.5` | 与障碍物安全距离 |
| `fsm/thresh_replan_time` | `1.0` | 重规划时间阈值（秒） |
| `traj_server/time_forward` | `1.0` | yaw 前瞻时间（秒） |

---

### 常见问题

#### Q1：A* 和 Kinodynamic A* 是一回事吗？

不是。本仓库 A* 仅做 3D 几何绕障；动力学在 B-spline 优化器的 `calcFeasibilityCost` 中处理。

#### Q2：为什么仿真里无人机「完美」跟踪轨迹？

因为默认使用 `poscmd_2_odom`，直接把 `PositionCommand` 写入 odom，没有真实动力学与控制延迟。

#### Q3：如何接真机？

1. 把 `odometry_topic` 换成 VIO / MAVROS odom；
2. 把 `cloud_topic` 或 `depth_topic` 换成真实传感器；
3. 编写或使用现有控制器，订阅 `PositionCommand`，转发到 MAVROS setpoint；
4. 取消 `poscmd_2_odom`，改用真实飞控闭环。

#### Q4：如何验证数据流？

```bash
# 查看计算图
rqt_graph

# 监听关键话题
rostopic echo /drone_0_planning/bspline
rostopic echo /drone_0_planning/pos_cmd
rostopic hz /drone_0_planning/pos_cmd    # 应约 100Hz
```

---

### Replan 三阶段对照

| 阶段 | 函数 | 输入 | 输出 |
| --- | --- | --- | --- |
| INIT | `reboundReplan` STEP 1 | 起终点状态 | 初始 ctrl_pts + A* segments |
| OPT | `BsplineOptimizeTrajRebound` | ctrl_pts, ts | 优化后 ctrl_pts |
| REFINE | `BsplineOptimizeTrajRefine` | 拉长时间后的 ctrl_pts | 最终 UniformBspline |
| 发布 | `callReboundReplan` | local_data_ | `traj_utils/Bspline` |

---
