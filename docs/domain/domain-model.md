Roadside Alert Platform — 领域模型（W1-3 第一版）
版本: W1-3
作者: <张嘉祺>
日期: <9/12/2025>
状态: 草案

概述

本文旨在确定平台的核心领域对象、聚合边界与关系，支撑“设备→事件→规则/告警→通知→工单→统计”的主链路。领域模型与用例图（UC1–UC12）、模块图以及顺序图保持一致。
领域边界与聚合根

聚合根
User（身份与权限）
Device（路侧设备/RSU）
Event（标准化后的原始事件）
Rule（规则配置）
Alert（告警）
Ticket（工单）
支撑性上下文与横切
Identity（用户/角色/租户/审计）
Ingestion（接入/标准化/质量评估/幂等）
Rule/Alert（规则评估/去抖合并/通知）
Ticket（工单闭环）
Analytics（聚合与指标）
Device（注册/激活/心跳/通道健康）
聚合与实体/值对象详述

User 聚合（Identity 上下文）
目的：提供认证授权与租户隔离，支撑审计。
实体
User（聚合根）
id, tenantId, username, email, status, roles: RoleId[]
passwordHash（仅内部存储，不可回读）
createdAt, updatedAt
Role
id, tenantId, name（TENANT_ADMIN/OPS/ANALYST/VIEWER/...）
permissions: string[]（端点或领域能力）
AuditLog
id, tenantId, subjectType, subjectId, action, actorId, detail(json), createdAt
值对象
JwtToken（access/refresh、过期时间）
不变式
User 必须属于单一租户；权限由角色集合求并；敏感字段写审计。
领域服务
AuthService：登录/签发 JWT；密码校验；权限校验策略。
Device 聚合（Device 上下文）
目的：统一管理设备注册、激活与健康状态。
实体
Device（聚合根）
id, tenantId, sn, model, status(REGISTERED/ACTIVE/OFFLINE/INACTIVE)
secretKeyHash, lastHeartbeatAt, lastSeenLatencyMs
location(lat, lon 可选), meta(jsonb)
createdAt, updatedAt
DeviceHeartbeat
id, deviceId, heartbeatTs, receivedAt, intervalSec, metrics(jsonb), createdAt
值对象
ActivationKey（一次性显示）
不变式
secretKey 仅以 Hash 存储；心跳用于更新在线状态；sn 在同租户唯一。
领域服务
DeviceHealthService：在线率/离线判定与阈值策略。
Event 聚合（Ingestion 上下文）
目的：承载标准化后的事件，作为规则评估输入。
实体
Event（聚合根）
id, tenantId, deviceId, eventType, occurredAt, receivedAt
payload(jsonb), qualityScore, dedupKey, source("HTTP"|"MQTT"|"Kafka"|"V2X")
geo(lat, lon 可选), traceId
值对象
EventIdempotencyKey（tenantId + dedupKey 或 hash(event)）
QualityReport（字段完整性/范围/必填项）
不变式
同一租户下 dedupKey 唯一；若缺失则使用 hash 幂等。
领域服务
Standardizer：字段映射与单位规范化
QualityAssessor：质量评分与拒收标准
IngestionGuard：签名/时间窗/nonce 校验
Rule 聚合（Rule/Alert 上下文）
目的：配置事件匹配条件与上下文（地理/时空），产生告警策略。
实体
Rule（聚合根）
id, tenantId, name, enabled, priority
condition: RuleCondition
fence: GeoFence?（可选）
mode: "ENFORCE"|"DRY_RUN"
mergeWindowSec（默认 300）
notifyRefs: NotificationRef[]
createdAt, updatedAt
RuleCondition（实体/值对象）
type: "EXPR"（SpEL）| "THRESHOLD" | "STATE_MACHINE"
expr: string（白名单方法）
GeoFence（值对象）
type: "CIRCLE"|"RECT"
circle: {centerLat, centerLon, radiusMeters}?
rect: {minLat, minLon, maxLat, maxLon}?
值对象
NotificationRef（指向订阅配置的引用）
不变式
规则启用需通过语法校验与安全审查；优先级为整数并参与冲突决策。
领域服务
RuleEvaluator：根据 event/device/ctx 计算命中与 inFence
ContextBuilder：加载设备、围栏与时间上下文
Alert 聚合（Rule/Alert 上下文）
目的：承载规则命中产生的告警并进行去抖合并与通知。
实体
Alert（聚合根）
id, tenantId, ruleId, deviceId, eventType
status: "OPEN"|"ACKED"|"RESOLVED"|"CLOSED"
firstSeenAt, lastSeenAt, occurCount, priority
mergeKey（sha256(tenantId+ruleId+deviceId+eventType+fenceId)）
attributes(jsonb), evidence(objectRef 可选)
NotificationConfig（实体）
id, tenantId, type: "WEB"|"WEBHOOK"|"EMAIL"|"SMS"|"MQ"
endpoint/url/template/secret（email/sms 在 MVP 可占位）
enabled, retryPolicy
NotificationRecord（实体）
id, alertId, channel, status("PENDING"|"SENT"|"FAILED"), error, retried
值对象
RetryPolicy（maxAttempts, backoffMs）
不变式
同一 mergeKey 在窗口期内只能有一个 OPEN 告警；通知失败需记录可追溯。
领域服务
AlertDeduplicator：合并窗口与计数维护
Notifier：按订阅发送并重试（Webhook/Web 为主）
Ticket 聚合（Ticket 上下文）
目的：对告警进行处置闭环跟踪。
实体
Ticket（聚合根）
id, tenantId, alertId?, title, status("NEW"|"ASSIGNED"|"IN_PROGRESS"|"RESOLVED"|"CLOSED")
assigneeId?, createdBy, createdAt, updatedAt, tags[]
slaDueAt?, priority
TicketLog（实体）
id, ticketId, action, actorId, fromStatus, toStatus, note, createdAt
值对象
Assignee（userId + name 快照）
不变式
CLOSED 后不可继续流转，除非显式 REOPEN；流转需权限校验与审计。
领域服务
TicketWorkflow：状态机与权限检查
上下文关系与数据流（简述）

Identity
输入：管理员配置与登录请求
输出：JWT、用户/角色、审计日志
Device
输入：设备注册/激活、心跳
输出：设备资料、在线状态（供 Ingestion/Rule/Analytics 使用）
Ingestion
输入：设备上报事件（HTTP/MQTT/Kafka/V2X）
输出：标准化 Event（持久化 + 发布消息）
Rule/Alert
输入：Event 流、设备/围栏上下文
输出：Alert（去抖后），通知消息，必要时自动建单请求
Ticket
输入：来自 Alert 的建单指令、人工操作
输出：Ticket 状态与日志
Analytics
输入：Event、Alert、Ticket（订阅这三者）
输出：聚合指标、报表/KPI、仪表盘视图
领域约束与跨上下文契约

事件与设备的租户一致性：Event.tenantId 必须等于 Device.tenantId。
规则安全：RuleCondition.expr 仅允许白名单函数，执行设超时。
幂等：Event 在租户内 dedupKey 唯一；Alert 按 mergeKey+窗口去抖。
审计：对用户、设备激活、规则变更、告警/工单流转记录审计条目。
通知可用性：Webhook 失败重试≤3，保留失败原因并可人工补发。
补充：建议的数据库表（摘要）

user, role, user_role, audit_log
device, device_heartbeat
event
rule, rule_condition, geo_fence
alert, notification_config, notification_record
ticket, ticket_log
附：领域服务交互（简要顺序）

IngestionGuard → Standardizer → QualityAssessor → Persist Event → Publish EventMsg
RuleEvaluator → AlertDeduplicator → Persist/Update Alert → Notifier → (Auto)Create Ticket
Analytics 定时订阅 Event/Alert/Ticket，产出聚合
变更日志

W1-3：首次定义聚合边界、实体与值对象、上下文关系。