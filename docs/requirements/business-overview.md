Roadside Alert Platform — Business Overview
版本: W1-1
作者: <张嘉祺>
日期: <9/12/2025>
状态: 草案

背景与问题陈述
城市路侧设备（摄像头/雷达/RSU）与上报协议（HTTP/MQTT/Kafka/V2X）异构，缺少统一接入与标准化，导致数据孤岛、质量不稳与联动困难。
现状中告警噪声与重复较多、处置链路分散，难以形成闭环且缺少可观测与审计。
本项目定位为教学/演示级平台（RAP）：统一接入→标准化→规则/模型→告警→通知/工单→统计/可观测性，强调“最小可演示闭环”。

目标与价值（MVP 范围）
接入与标准化
主路径：HTTP 接入，提供签名校验、时间窗/nonce 校验、幂等去重与标准化；基础质量评估（字段完整性/类型/范围）。
适配器占位：MQTT、Kafka、V2X/RSU（CAM/DENM/RSI）接口规范与模块占位，后续增强。
通道健康监测
记录设备心跳与在线率、基础时延（server 接收时间 - 事件时间），仪表盘可视化。
规则与模型
规则引擎基于 SpEL，提供地理围栏（圆/矩形），支持优先级与去抖合并；“模型推理代理（REST/gRPC）”保留接口占位。
告警与处置
告警生成、去重/合并、确认/备注/关闭；订阅管理配置通知目标；通知通道支持 Web 与 Webhook（短信/邮件先以 Mock/占位实现）。
工单闭环
告警自动或手动建单；状态机 NEW→ASSIGNED→IN_PROGRESS→RESOLVED→CLOSED，支持 REOPEN；记录 ticket_log。
开放订阅
REST 查询、WebSocket 前端订阅 OPEN 告警；Webhook 推送；MQ 发布（RabbitMQ/Kafka）为占位能力。
权限与审计
多租户 JWT 登录与 RBAC；关键操作全量审计；健康检查与 Prometheus 指标。
可演示路径
设备注册/激活→HTTP 事件上报→标准化→规则命中→告警→通知（Web/Webhook）→建单→流转→统计与健康监测。

非目标（本阶段不做）
高精度计算机视觉与实时视频处理；V2X 全栈实现。
大规模流处理（Flink/Kafka 集群）、复杂 CEP/编排。
生产级 HA/容灾、企业级安全审计与合规。
短信/邮件真实通道、ES 全文检索、重型地图/回放与对象存储证据链（先占位）。

干系人与角色
干系人：校方评审、指导老师、我（开发/运维）、模拟的城市交警/运维。
角色
TENANT_ADMIN（管理员）：用户/角色与系统密钥配置、设备/规则全权限、全量查看、工单管理、审计查看。
OPS（运维工程师）：设备管理、通道健康、规则维护（新建/编辑/启停/dry-run）、告警处置与工单流转、审计查看。
ANALYST（数据分析员）：查询与报表/KPI、导出。
VIEWER（只读）：看板与查询只读。
调度员（DISPATCHER，可并入 OPS 权限以简化 MVP）：告警确认与关闭、备注/标签、事件检索与回放。
第三方应用（集成方）：通过 REST/Webhook/MQ 订阅数据与事件。

业务范围与核心流程
接口层：Web 控制台（React/AntD/简版地图可选）、API 网关（Spring MVC/WebFlux 可选其一，MVP 用 MVC）、WebSocket 推送。
接入层（Ingestion）：HTTP/MQTT 适配器、Kafka 连接器、V2X/RSU 适配器（MVP 实做 HTTP，其他保留接口）。
处理层（Processing）：标准化与质量评估、时空对齐（简化版/占位）、规则引擎、模型推理代理（占位）、事件去重与优先级。
告警与集成：订阅管理、通知通道（Web/Webhook，短信/邮件 Mock）、Webhook 分发器、MQ 发布器（占位）。
存储与基础设施：PostgreSQL（事件/设备/RBAC）、消息中间件（RabbitMQ），对象存储（证据片段占位）、可观测性（Prometheus + 日志管道占位）。
运维与安全：认证与权限（Spring Security, JWT/OAuth2 占位）、配置管理（占位）、审计日志服务、健康检查与指标。

关键业务规则
签名与幂等
头部：X-Device-SN、X-Timestamp、X-Nonce、X-Signature；时间窗 ±300s；nonce 60s 防复放。
signature=hex(sha256(deviceSn + timestamp + nonce + body + secretKey))；secretKey 仅展示一次，服务端存 hash。
幂等：若有 dedupKey→tenantId+dedupKey 唯一；否则 hash(body,deviceSn,timestampBucket)。

地理围栏与规则
围栏：圆（中心+半径）、矩形（经纬度边界）；表达式变量：event、device、ctx(inFence:boolean, now:Instant)；白名单方法与执行超时限制。
去抖合并与优先级
合并键：sha256(tenantId + ruleId + deviceId + eventType + fenceId)；窗口默认 300s；优先级由规则配置。
通道健康
在线判断基于心跳阈值；记录在线率与基础时延；离线告警（可选占位）。
开放订阅与重试
Webhook 推送失败保留原因并重试≤3；REST 提供分页与时间过滤；WebSocket 面向前端的 OPEN 告警订阅。

交付与成功标准（W2 截止）
文档：本概述、用户故事（覆盖 UC1–UC12）、NFR、OpenAPI 契约草案。
环境：Docker Compose 启动 Postgres、RabbitMQ、Prometheus、Grafana；后端健康检查通过。
数据库：Flyway V1 初始化脚本执行成功（含审计、心跳、订阅配置等表）。
演示：模拟器在围栏内持续上报“逆行”事件→规则命中→产生且合并为 1 个 OPEN 告警（occur_count 递增）→触发 Web/Webhook 通知→一键建单→工单流转→仪表盘聚合与通道健康可见。
CI：GitHub Actions 运行单测与静态检查通过。
假设与约束
事件量教学级（≤100 EPS）；单节点 RabbitMQ；可拉取镜像。
坐标与距离计算采用简化近似，标注为演示性质。
前端仅需简版页面，Swagger UI 可替代部分管理界面。

风险与缓解
表达式滥用与抖动 → 白名单方法、表达式长度与执行时间限制；异常计数与降级。
外部通知不稳定 → Webhook 重试与死信表；短信/邮件以 Mock 降低耦合。
时空对齐与地图精度 → 使用简化算法并在文档中标注非生产级。
依赖的消息/数据库单点 → 演示环境接受单点，文档注明非生产拓扑。

路线图
MVP（W1–W3）：身份与设备、HTTP 接入、规则→告警、通知与工单闭环、统计、通道健康、审计与指标。
增强（W4+）：MQTT/Kafka/V2X 接入、模型推理代理、地图可视化、对象存储证据链、MQ 发布/订阅、Loki/ELK、PostGIS/Redis 优化。