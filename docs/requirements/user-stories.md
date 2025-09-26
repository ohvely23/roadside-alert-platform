Roadside Alert Platform — User Stories 
版本: W1-1
作者: <张嘉祺>
日期: <9/12/2025>
状态: 草案

概览

Must-have（MVP）
Should-have
Could-have
Won’t-have
Must-have（MVP）

身份、RBAC、密钥与审计（UC1、UC2、UC12）
作为 TENANT_ADMIN，我可以管理用户与角色、配置平台密钥（设备激活/签名），并对关键操作审计。
验收：
登录成功返回 JWT；受保护 API 需 Bearer；基于角色的访问控制返回 403/401 合理。
secretKey 创建时仅显示一次，服务端仅存 hash；审计记录用户/角色变更与密钥操作。

设备注册/管理与通道健康（UC3、UC4）
作为 OPS，我可以注册摄像头/雷达/RSU，生成一次性激活密钥，设备激活后按 60s 心跳；仪表盘显示在线率和基础时延。
验收：
设备 REGISTERED→ACTIVE，心跳写入 device_heartbeat；离线阈值可配置（开发可常量）。
仪表盘计算设备在线率；通道健康页展示通道状态与最近故障。

数据接入与标准化（HTTP 主路径，UC5）
作为 设备/适配器，我通过 HTTP 上报事件，平台进行签名、时间窗/nonce 校验、幂等去重与标准化/质量评估。
验收：
头：X-Device-SN、X-Timestamp、X-Nonce、X-Signature；±300s 窗口；nonce 60s 内不可复用。
幂等：dedupKey（tenantId+dedupKey 唯一）或 hash(body,deviceSn,timestampBucket)；字段完整性/类型/范围校验通过。

规则引擎与时空上下文（UC6）
作为 OPS，我可以创建“圆/矩形围栏 + SpEL 表达式”规则，命中时生成告警。
验收：
可用变量：event、device、ctx(inFence:boolean, now:Instant)；白名单方法与执行超时受限。
边界用例（点在边界）判断正确；命中创建告警 first_seen_at=now，priority 由规则配置。

告警去重/合并与通知（UC6→UC7、UC8）
作为 OPS/调度员，我希望 5 分钟内同一设备/规则/围栏/事件类型合并为单个 OPEN 告警，并触发通知。
验收：
合并键 sha256(tenantId + ruleId + deviceId + eventType + fenceId)，窗口内更新 occur_count 与 last_seen_at。
通知通道支持 Web 与 Webhook；订阅管理可配置目标；状态机：PENDING→SENT|FAILED（失败重试≤3）。

告警确认、关闭与工单闭环（UC7、UC8）
作为 调度员（或 OPS），我可以从告警一键建单并完成流转 NEW→ASSIGNED→IN_PROGRESS→RESOLVED→CLOSED；允许 REOPEN。
验收：
权限：ASSIGN 需 OPS/ADMIN；RESOLVE 需处理人或 ADMIN。
每次变更写入 ticket_log；CLOSED 后禁止继续流转，除非 REOPEN。

事件检索与回放（UC9）
作为 调度员/分析员，我可以按时间窗口与条件检索事件，并查看事件详情（回放先用简化视图或 JSON）。
验收：
支持时间范围、类型、设备过滤；返回分页列表与详情。
回放为占位实现：展示关键字段时间线或样例图/链接（对象存储为占位）。

报表与 KPI（UC10）
作为 数据分析员，我可以查看今日事件、告警、工单通量与当前 OPEN 告警数、设备在线率，支持导出。
验收：
暴露聚合 API；仪表盘展示类型/级别聚合与在线率；支持 CSV 导出或 API 拉取。

开放接口订阅（UC11）
作为 第三方应用，我可以通过 REST 拉取事件/告警，或配置 Webhook 接收告警推送。
验收：
REST 提供分页/排序/时间过滤；Webhook 按订阅推送并具备重试与失败原因记录。
WebSocket 用于前端订阅 OPEN 告警（简版通道）。

可观测性与合规（UC12 关联）
作为 运维，我可以查看健康检查与核心指标，日志具备追踪字段，审计覆盖关键动作。
验收：
/actuator/health、/actuator/prometheus 可访问；核心指标：events_ingested_total、ingest_fail_total、rule_exec_total、rule_exec_error_total、rule_exec_latency_ms、alerts_open、alerts_created_total、alert_merge_total、notifications_sent_total/failed_total、tickets_open、ticket_throughput、device_online_rate。
日志字段：traceId、tenantId、userId/deviceSn、action、result、latencyMs；审计涵盖：用户/角色变更、设备激活、规则变更、告警与工单状态变更、密钥与配置变更。

Should-have

多协议适配与回放增强（UC5、UC9）
启用 MQTT/Kafka/V2X 适配器接入并纳入标准化；前端事件回放支持时间轴与快进/筛选。
验收：适配器连通性检测与错误处理；回放具备时间轴与基本控件。

规则灰度与 dry-run（UC6）
对指定设备/分组灰度启用规则，dry-run 记录命中次数与样本而不生成告警。

地图可视化（简版）
在地图上展示设备/告警点位，支持按类型筛选与状态着色。

Could-have

模型推理代理与异构模型（UC6 扩展）
对接 REST/gRPC 推理服务，将结果馈入规则引擎；支持超时与熔断。
Redis 去抖与 PostGIS
使用 Redis 计数窗口减少 DB 写放大；PostGIS 提升空间计算与索引能力。

MQ 发布与企业集成（UC11 扩展）
将事件/告警发布到 RabbitMQ/Kafka 主题供第三方订阅，支持租户隔离与路由键。

Won’t-have for now（MVP 外）

实时视频处理、复杂 CEP/规则编排、短信/邮件真实通道、ES 全文检索、企业级 HA/容灾与合规。
验收与评审清单

 每条 Must-have 用户故事具备可验证验收标准
 用例图关键用例（UC1–UC12）均有映射
 模块图组件在契约或占位中体现（API 网关、适配器、规则/模型、订阅/通知、审计、可观测性）
 覆盖“设备→接入→标准化→规则/模型→告警→通知→工单→统计/可观测性”的端到端路径
 与 business-overview.md 的目标/范围一致，范围外项明确标注

备注

调度员角色在 MVP 阶段可并入 OPS 以降低复杂度；地图与回放增强留作 W4+。