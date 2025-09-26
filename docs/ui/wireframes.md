原型与页面清单（W1-5  v1.0）
版本: W1-5 v1.0
作者: 张嘉祺
日期: 2025-09-12

概述

目标：通过低保真线框明确信息架构、字段清单与操作流，支撑最小可演示路径（MVP）。
最小可演示路径：登录 → 设备列表/详情 → 事件列表/详情 → 告警列表/详情 → 工单列表/详情 → 统计仪表盘。

全局导航与信息架构

顶部导航
标识：RAP（Roadside Alert Platform）
全局搜索：支持前缀 dev:, evt:, alt:, tkt:, rule:
用户菜单：头像、用户名、角色、退出
侧边导航
概览（Dashboard）
设备（Devices）
事件（Events）
告警（Alerts）
工单（Tickets）
规则（Rules）
通知（Notifications）
报表与统计（Analytics）
审计（Audit）
系统设置（Settings）
全局元素
租户选择器（Tenant）
时间范围选择器（最近15分钟/1小时/24小时/自定义）
通知中心（站内消息、最新告警 WebSocket 订阅）
登录页（Login）
字段
username/email（必填）
password（必填）
tenant（可选，默认上次选择）
操作
登录（成功获取 JWT，跳转 Dashboard）
忘记密码（跳转外部或显示指引）
校验与反馈
错误：账户不存在、密码错误、租户无权限
安全：登录失败超过 5 次锁定 10 分钟（后端策略）
概览仪表盘（Dashboard）
卡片与图表
今日事件数、今日告警数、未处理工单数（可点击跳转）
在线设备数/总设备数，在线率趋势（过去24小时）
端到端处理延迟 P95（接收→规则→告警），HTTP 错误率（近15分钟）
最新 5 条告警（状态、规则、设备、时间）
操作
时间范围筛选、刷新频率（5s/15s/关闭）
卡片跳转到相应列表页并保留时间过滤
设备列表（Devices List）
列表字段
deviceSn、model、status（ONLINE/OFFLINE/INACTIVE）、lastHeartbeatAt
eventsToday、alertsToday、rulesBound、location（lat/lon 短显）
过滤与排序
status、model、关键词（sn）、在线率（过去24h）、时间范围
批量操作
启用/停用、批量打标签、导出 CSV
行内操作
查看详情、最近事件、编辑元数据
空态
引导注册设备与示例数据填充
设备详情（Device Detail）
基本信息卡
deviceSn、model、状态、激活时间、lastHeartbeatAt、平均心跳间隔
位置（lat/lon）、标签、备注
通道健康卡
平均时延、丢包估计、最近 N 次心跳时间线
最近事件列表（TOP N）
eventId、eventType、occurredAt、qualityScore
最近告警列表（TOP N）
alertId、status、ruleName、occurCount、lastSeenAt
操作
编辑元数据、启用/禁用、跳转到事件/告警列表（携带 deviceSn 过滤）
事件列表（Events List）
列表字段
eventId、eventType、deviceSn、occurredAt、receivedAt、qualityScore、source、dedupKey
过滤与排序
时间范围、deviceSn、eventType、质量阈值、是否重复（幂等命中）
批量
导出 CSV、基于筛选创建规则草稿
行内
查看详情、复制 eventId/dedupKey
性能
时间+ID 游标分页，虚拟滚动
事件详情（Event Detail）
基本信息
eventId、tenantId、deviceId/deviceSn、eventType、occurredAt、receivedAt、source
数据视图
payload JSON（折叠/展开、复制）、qualityReport、geo（坐标或围栏命中）
操作
基于此事件创建规则（预填条件），查看关联告警列表
诊断
traceId 链路：Ingestion → MQ → Rule → Notifier（展示 span 概要）
告警列表（Alerts List）
列表字段
alertId、status（OPEN/ACKED/RESOLVED/CLOSED）、ruleId/ruleName、deviceSn、eventType
priority、occurCount、firstSeenAt、lastSeenAt、notifyStatus（最近一次）
过滤与排序
status、ruleId、deviceSn、priority、时间范围、是否在合并窗口
批量操作
批量 ACK、批量关闭（必填原因/备注、可加标签）
行内操作
查看详情、快速 ACK、快速关闭
指标小图
打开告警数分布（按规则/设备）
告警详情（Alert Detail）
Header
标题：Alert {alertId} [状态徽标] [ACK] [关闭] [建单]
基本信息卡
alertId、ruleId/ruleName、deviceSn、eventType、priority
firstSeenAt、lastSeenAt、occurCount、mergeKey、attributes（JSON）
关联事件卡
触发相关事件列表（eventId、发生时间、评分），点击跳转
通知记录卡
最近通知尝试：channel、状态、耗时、错误原因（如有）、重发按钮
右侧操作栏
ACK（备注/标签）、关闭（原因）、一键建单（未建时可用）
审计
展示最近的操作记录与操作者
工单列表（Tickets List）
列表字段
ticketId、title、status（NEW/ASSIGNED/IN_PROGRESS/RESOLVED/CLOSED）
alertId、priority、assignee、createdAt、updatedAt、tags
过滤与排序
status、assignee、priority、时间范围、是否逾期（超 SLA）
批量操作
批量指派、批量打标签
行内操作
查看详情、变更状态、添加备注
工单详情（Ticket Detail）
Header
Ticket {ticketId} [状态机控件] [指派] [添加备注] [关闭/重开]
基本信息卡
alertId、创建人、指派人、优先级、SLA 到期时间、标签
时间线卡
ticket_log（时间、操作者、动作、备注）
附件与备注卡
支持上传与文本 Markdown
关联
快速预览关联告警与事件
规则列表（Rules List）
列表字段
ruleId、name、enabled、priority、mode（ENFORCE/DRY_RUN）
mergeWindowSec、通知渠道数、最近发布人/时间
过滤与排序
enabled、priority、mode、关键词
行内
查看详情、启停、克隆、删除（二次确认，写审计）
规则详情/编辑（Rule Detail/Edit）
基本信息
name、priority、enabled、mode、mergeWindowSec
条件与围栏
condition.type（EXPR/THRESHOLD/STATE_MACHINE）
condition.expr（编辑器，支持语法校验与安全白名单）
fence（Circle/Rect，参数可视化输入）
通知
绑定 NotificationConfig（多选），显示每个渠道启用状态
操作
保存草稿、用历史事件回放测试、发布生效（写审计）
权限
编辑与发布权限分离；发布需二次确认
通知配置（Notifications）
列表字段
id、type（WEB/WEBHOOK/EMAIL/SMS/MQ）、endpoint/url、enabled、retryPolicy
操作
新增、编辑、停用、测试发送（Webhook 附带签名示例）
安全
敏感字段密文显示与复制受控（审计）
审计日志（Audit）
列表字段
auditId、subjectType、subjectId、action、actor、createdAt、detail（JSON 片段）
过滤
subjectType、actor、时间范围、关键字
操作
导出、按 traceId 关联查看
报表与统计（Analytics）
组件
事件趋势（按类型/设备）
告警趋势与通知成功率
工单流转效率（新建→关闭 P50/P95）
在线率与心跳延迟趋势
操作
维度选择（租户/设备/规则）、时间范围、导出 CSV/PNG
线框示例（最终版本）

列表示例（告警列表）
顶部：筛选栏 | 时间范围 | 搜索框
表头：
| status | priority | rule | device | occurCount | lastSeen |
示例行：
| OPEN | High | R-12 | RSU-01 | 5 | 12:01:32 |
底部批量操作：
[批量 ACK] [批量关闭] [导出]
详情示例（告警详情）
Header: Alert A-20250101120001 [OPEN] [ACK] [关闭] [建单]
主体区域：
基本信息 卡片 | 关联事件 卡片 | 通知记录 卡片 | 右侧操作栏
数据与接口对齐（已落实）

所见字段均从以下 API 获取，已在后端原型接口对齐：
Device: GET /api/devices, GET /api/devices/{sn}
Event: GET /api/events, GET /api/events/{id}
Alert: GET /api/alerts, GET /api/alerts/{id}
Ticket: GET /api/tickets, GET /api/tickets/{id}
Rule: GET /api/rules, GET /api/rules/{id}
Notifications: GET/POST /api/notifications
写操作与动作
Alerts: POST /api/alerts/{id}/ack, POST /api/alerts/{id}/close, POST /api/alerts/{id}/ticket
Tickets: POST /api/tickets, PATCH /api/tickets/{id}
Rules: POST /api/rules, PATCH /api/rules/{id}, POST /api/rules/{id}:publish
Notifications: POST /api/notifications/test
Auth: POST /api/auth/login（JWT），GET /api/auth/me
权限映射（RBAC）
Viewer: 只读
Analyst: 规则草稿/回放测试
Ops: 告警 ACK/关闭、建单、工单处理
Admin: 全权限与系统设置
可观测性与性能指引（与 NFR 对齐）

列表页分页与虚拟滚动，P95 首屏渲染 < 500ms（后端缓存+游标）
实时告警采用 WebSocket 推送，降级为轮询 5–15s
表格列宽可调、显隐可配，用户偏好本地持久化

交互规范

搜索框前缀
dev:RSU-01 → 设备详情
evt:123 → 事件详情
alt:A-20250101120001 → 告警详情
tkt:T-20250101123000 → 工单详情
rule:R-12 → 规则详情
状态颜色
设备：绿色 ONLINE、灰色 OFFLINE、黄色 INACTIVE
告警：红色 OPEN、蓝色 ACKED、绿色 RESOLVED、灰色 CLOSED
时间与时区
默认 UTC，支持用户本地时区显示；时间范围在路由参数中保留
错误与空态
清晰错误与恢复动作；提供“加载示例数据”按钮（演示环境）
开放问题与决议（已裁剪为可实施范围）

事件 payload 模板化：MVP 暂不提供可视化模板编辑，仅提供 JSON 查看与复制；在规则编辑中以字段路径提示替代。
地图能力：MVP 不引入地图组件；位置字段以文本显示，后续版本再评估可视化需求。
多租户样式与行级权限：MVP 采用租户隔离 + 角色级权限，不做行级权限；后续按需求评审。
Webhook 重发：在告警详情提供“重发”按钮并写审计；批量重发留待后续版本。
验收标准（UI 侧）

页面清单覆盖需求列表与最小可演示路径全链路可操作。
所有字段均可从对应 API 成功读取，写操作返回有确认反馈与错误处理。
关键性能指标满足：首屏 < 500ms、交互反馈 < 200ms（不含网络抖动）。
变更日志

W1-5 v1.0（2025-09-12）：发布稳定版线框与页面清单；字段与接口已对齐