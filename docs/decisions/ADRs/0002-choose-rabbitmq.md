# ADR 0002: 选择 RabbitMQ 作为消息与异步组件

- 状态: Accepted
- 日期: 2025-09-15
- 关联: docs/architecture/tech-decision.md（技术选型与版本冻结）

## 背景

平台需要一个可靠的消息/异步组件作为事件处理流水线的枢纽，用于：
- 事件入队（ingest -> queue）
- 规则引擎消费与处理结果回传
- 告警通知触发与重试
- 多租户隔离的路由

候选方案：RabbitMQ、Kafka（含兼容发行版）、SQS 等。

## 决策

在 MVP 与 W2-W3 阶段，选择 RabbitMQ（版本 3.13.3，镜像标签 `rabbitmq:3.13.3-management`）。
- 交换机类型：Topic
- 路由键：`tenant.{id}.events`、`tenant.{id}.alerts`
- 消费模式：手动 ack，失败重试与死信（DLX）预留

## 依据

- 吞吐需求：MVP 目标 100–300 EPS，RabbitMQ 轻松满足。
- 易用性：管理控制台开箱可用，学习曲线低，适合课堂/演示环境。
- 路由模型：Topic 交换机实现租户前缀+类别的灵活路由。
- 运维成本：Compose 一键拉起，资源占用较低。
- 兼容性：与 Spring AMQP/Spring Cloud Stream 集成成熟。

## 备选方案

- Kafka：适用于高吞吐、可回放、流式处理生态（Flink/KSQL），但本阶段演示价值有限、运维复杂度较高。可在后续演进中引入。
- 无队列（同步）：降低复杂度，但丧失削峰与异步能力，不利于稳定性与扩展性。

## 影响

- 应用侧需要封装统一的消息发布/消费抽象（支持租户路由键）。
- 监控需纳入队列深度、消费滞后与失败重试指标。
- 若未来切换 Kafka，需要适配发布/订阅层（可通过端口适配器模式降低改造成本）。

## 版本与运维

- 固定镜像：`rabbitmq:3.13.3-management`（禁用 `latest`）
- 配置通过环境变量注入：默认用户、密码、并发/预取
- Compose 端口：5672（AMQP）、15672（管理）
- 健康检查：`rabbitmq-diagnostics ping`

## 迁移与演进

- 如需更高吞吐与可回放能力：引入 Kafka（或 Redpanda），事件主链改为 Kafka，RabbitMQ 作为告警/通知的工作队列（可并存一段时间）。
- 通过抽象发布/消费接口与租户路由策略，控制切换改动面。