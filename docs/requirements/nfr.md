非功能需求与 SLA（W1-4 第一版）
版本: W1-4
作者: <张嘉祺>
日期: <9/12/2025>
状态: 草案

概述

本文定义平台在性能、安全、可靠性、可运维与备份方面的非功能性需求与目标（NFR），并给出相应的度量与验证方式，确保可观测、可度量、可验收。
性能与容量规划
吞吐目标
接入与标准化（Ingestion）：事件 100 EPS（平均），峰值 300 EPS（5 分钟峰）
规则评估与告警：能实时跟随 100 EPS 输入，峰值条件下延迟不超过 SLA
通知发送：瞬时并发 50 RPS，可排队重试
延迟目标（P95）
接口接收→持久化 Event：P95 ≤ 150 ms；P99 ≤ 300 ms
Event 入库→进入规则引擎：P95 ≤ 200 ms
规则评估→产生/更新 Alert：P95 ≤ 150 ms
Alert→Webhook 通知发送完成：P95 ≤ 500 ms（不含对方处理）
心跳上报→在线状态更新：P95 ≤ 200 ms
资源基线（参考，非强约束）
单实例 API 节点：4 vCPU / 8 GB，可支撑 150–200 RPS（短连接，GZIP/JSON）
PostgreSQL：8 vCPU / 32 GB，事件表分区（日/周）；心跳表短留存
MQ（RabbitMQ/Kafka）：单集群 3 节点，吞吐裕量 ≥ 峰值 2 倍
验证与压测
工具：k6 / JMeter（HTTP），Locust（Webhook 回调模拟）
数据集：事件 Payload 1–3 KB，幂等键命中 5–10%
验收标准：持续 1 小时 100 EPS，P95 延迟满足上述阈值；错误率 < 0.1%
可靠性与投递语义
处理语义
Ingestion：至少一次处理（at-least-once）；通过事件幂等键去重
MQ：开启持久化与确认（publisher confirm，手动 ack）；消费失败重试 + 死信
通知：Webhook 至少一次投递，接收方需幂等；失败重试 3 次，指数退避
幂等与去重
Event.dedupKey 在 tenant 内唯一；若无则使用事件哈希（字段子集）生成
Alert 合并窗口：mergeKey + 窗口（默认 300s）去抖；occurCount 递增
故障与重试
DB 写失败：指数退避（初始 100ms，最大 5s），重试 ≤ 3 次；最终写入失败记录到错误队列
MQ 不可用：落本地待重试表或缓冲队列；对设备返回 202 Accepted
规则执行异常：捕获并写入 rule_exec_error，进入死信/告警运维
可用性与恢复
目标可用性：99.9%（月停机 ≤ 43.2 分钟）
恢复时间目标 RTO：15 分钟（核心 API 与规则流）
恢复点目标 RPO：≤ 5 分钟（数据库 WAL/备份频率配合）
安全与合规
身份与访问控制
身份凭证：JWT（RS256），有效期 1h，支持 Refresh Token
RBAC：角色-权限映射到领域能力与 API 端点；敏感操作强制审计
多租户隔离：tenantId 强校验；跨租户数据访问拒绝
设备接入安全
请求签名：X-Device-SN、X-Timestamp、X-Nonce、X-Signature（HMAC-SHA256）
时间窗：请求时间偏移 ≤ ±300s；Nonce 去重窗口 15 分钟
速率限制：设备级与 IP 级限流（例如 60 rpm 基线，突发令牌桶）
数据保护
传输加密：全站 HTTPS/TLS1.2+；Webhook 建议双向 TLS（可选）
存储加密：秘钥 hash 存储（Argon2/Bcrypt）；敏感配置加密（KMS）
日志脱敏：账号、签名、密钥、电话号码、邮箱进行掩码或不落盘
合规与审计
审计日志：登录、规则变更、工单流转、手工通知重发
数据保留：遵循数据最小化原则；根据租户协议配置保留周期
可观测性与运维
指标（Prometheus）
HTTP
http_requests_total{method,route,code}
http_request_duration_seconds_bucket{route}（P50/P95/P99）
http_request_errors_total{route,code}
Ingestion/事件
events_ingested_total{tenant,eventType,source}
events_idempotent_hits_total{tenant}
ingestion_latency_seconds_bucket
mq_publish_total{topic}、mq_publish_failures_total{topic}
规则与告警
rules_evaluated_total{tenant,ruleId}
rule_eval_errors_total{ruleId}
alerts_open_gauge{tenant,severity}
alert_merge_events_total{ruleId}
notification_send_total{channel,status}
notification_latency_seconds_bucket{channel}
设备与心跳
device_heartbeats_total{tenant,deviceId}
device_online_gauge{tenant,status}
heartbeat_latency_seconds_bucket
DB 与资源
db_connections{role}、db_write_failures_total
query_duration_seconds_bucket{table,op}
process_cpu_seconds_total、go/java_memory_bytes、gc_pause_seconds
日志要求（结构化 JSON）
统一字段：ts, level, traceId, spanId, tenantId, userId/deviceSn, route, status, latencyMs
业务字段：eventId, ruleId, alertId, ticketId, dedupKey, mergeKey
错误字段：error.code, error.message, stack（限制长度），retry.count
采样：INFO 级别抽样 10–30%；ERROR 始终保留；Webhook 响应体不落盘或截断
Tracing（可选但推荐）
OpenTelemetry：API → Ingestion → MQ → Rule/Alert → Notifier 全链路
关键 span：入库、发布消息、规则评估、通知发送
仪表盘与告警
仪表盘：延迟 P95、错误率、队列堆积、规则错误、通知成功率、在线率
告警规则：
5 分钟内 http 5xx 比例 > 1% 触发
mq_publish_failures_total 增速异常触发
rules_eval_errors_total 突增触发
notification_send_total{status="FAILED"} 连续 5 分钟升高触发
device_online_gauge{status="offline"} 比例超过阈值触发
数据保留与备份策略
明细留存
event：90 天（分区 + 冷归档到对象存储，查询走外表/Presto 可选）
device_heartbeat：14–30 天（高频数据，短留存）
alert：180 天；ticket 与 ticket_log：≥ 1 年
audit_log：≥ 1 年（合规要求）
备份（生产）
数据库：每日全量备份 + 5 分钟增量/WAL；跨可用区存储；保留 7–30 天
配置与密钥：KMS/密管；版本化；禁止明文备份
恢复演练：季度演练一次，验证 RTO/RPO 指标
开发与测试环境
允许弱化备份要求，但需开启最小监控与日志采样
涉敏脱敏与最小化采集仍然生效
容错与扩展性
扩展策略
API/Rule/Notifier 水平扩展（无状态），共享 MQ 与数据库
读写分离（只读报表库/OLAP 可选）
分区与索引：event 基于 occurredAt/tenantId 分区；alert 按 firstSeenAt 索引
限流与降级
入站限流：按租户与设备双维度；超限返回 429 或 202（排队）
非核心功能降级：回放/统计延迟计算可后台异步；通知失败自动重试
保护阈值：DB 连接池使用率 > 90% 时，暂停低优先级任务
热点与大租户
规则评估缓存：规则列表/围栏在本地缓存 30–60s
大租户单独队列与消费组隔离，避免“吵闹邻居”
合同化 SLA（对内/对外）
可用性：99.9%
事件处理链路端到端延迟（P95）：≤ 1 秒（接收→规则→告警生成，不含外部 Webhook）
告警通知成功率：≥ 99%（平台侧已成功发送并获得 2xx 的比例；不含对方系统失败）
工单创建时延（P95）：≤ 500 ms（从告警触发到工单记录入库）
数据一致性：幂等与合并策略下无重复告警/工单（抽检重复率 < 0.1%）
验证与验收方法
监控面板对齐
列出与 NFR 对应的仪表盘指标：延迟 P95、错误率、队列堆积、规则错误、通知成功率、在线率
演练与回归
故障演练：MQ 不可用、DB 写失败、规则执行异常、Webhook 超时
安全回归：签名校验绕过、Nonce 重放、RBAC 越权、JWT 失效处理
验收判定
在准生产环境按 100 EPS 压测 1 小时，所有 P95 指标满足阈值
故障注入下达到“至少一次处理”与“最终一致”目标，且无不可恢复数据丢失
安全回归无高危问题；审计覆盖关键操作并可检索到完整链路
变更日志

W1-4：首次定义性能、可靠性、安全、可观测性与备份的目标与度量。