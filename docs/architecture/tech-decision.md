# 技术选型与版本冻结（W2-1）

本文档用于冻结本项目在 W2 阶段的语言/框架、核心中间件与可观测性栈版本，并记录关键取舍理由，确保环境一致性与可重复性。所有镜像与依赖避免使用 latest 标签。

## 1. 语言与后端框架

- 语言与运行时
  - Java 17（LTS）
- 后端框架
  - Spring Boot 3.3.3
  - Spring Web, Spring Security, Spring Validation
  - Spring Data JPA
  - Flyway（数据库迁移）
  - springdoc-openapi-starter-webmvc-ui 2.5.0（OpenAPI/Swagger UI）

选择理由
- Java 17 为 LTS，生态成熟，兼容性与性能平衡较好。
- Spring Boot 3.x 基于 Jakarta EE 10，维持现代化栈；与 Actuator、Spring Security 集成完善。
- JPA 便于快速起步与演示；后续如需复杂查询可结合原生 SQL 或 QueryDSL。
- Flyway 管理 DDL，方便团队协作与回溯。
- springdoc 提供自动化 API 文档，降低对前端依赖，便于演示与对外对接。

约束与约定
- Java 源/目标版本统一为 17。
- Spring Boot 依赖版本由 spring-boot-dependencies BOM 统一管理（避免手动漂移）。
- OpenAPI 文档通过 /v3/api-docs 导出到 backend/openapi.json（CI 可选生成）。

## 2. 数据库与存储

- 关系型数据库
  - PostgreSQL 14.12（镜像：postgres:14.12）
- 可选组件
  - PostGIS（如需地理围栏服务端判断）
  - MinIO（对象存储，镜像：minio/minio:RELEASE.2024-07-26T20-44-27Z，后续可选）
  - Redis（去抖计数/缓存，镜像：redis:7.2.5，后续可选）

选择理由
- PostgreSQL 14 稳定可靠，功能丰富；14.12 为近期稳定小版本。
- 初期用内置几何计算或应用层近似；若需要更精准地理围栏，再引入 PostGIS。
- MinIO 和 Redis 作为增强选项，非 MVP 必须。

约束与约定
- 所有数据库迁移由 Flyway 管理，禁用 Hibernate 自动建表（ddl-auto=validate）。
- 统一时区 UTC；时间字段使用 timestamptz。

## 3. 消息与异步：RabbitMQ

- 版本与镜像
  - RabbitMQ 3.13.3（镜像：rabbitmq:3.13.3-management）

选择 RabbitMQ 而非 Kafka 的理由
- 目标场景偏命令/事件通知与工作队列，强调可靠投递与简易路由，RabbitMQ 更贴合。
- 运维与本地演示门槛低，管理界面开箱可用（management 插件）。
- MVP 阶段吞吐要求（100–300 EPS）在 RabbitMQ 上轻松满足。
- Kafka 更适合超大吞吐、可重放与大数据生态，本项目可在后续演进引入（见“演进路线”）。

设计约束
- 采用基于 Topic 的交换机，路由键按租户前缀：tenant.{id}.events / tenant.{id}.alerts。
- 消费端并发与手动 ack；失败重试与死信队列（DLX）预留。
- 连接参数通过环境变量配置，避免写死。

## 4. 可观测性

- 指标与健康检查
  - Spring Boot Actuator（/actuator/health, /actuator/metrics, /actuator/prometheus）
- 指标聚合与可视化
  - Prometheus v2.54.1（镜像：prom/prometheus:v2.54.1）
  - Grafana 10.4.5（镜像：grafana/grafana:10.4.5）

选择理由
- Actuator 与 Micrometer 集成良好；Prometheus+Grafana 是事实标准组合。
- 本地与 CI 演示均可快速拉起，学习曲线低。

约束与约定
- 统一使用 /actuator/prometheus 暴露指标；Prometheus 抓取周期默认 15s。
- Grafana 预置数据源与 Dashboard（在 ops/compose 中通过 volume 挂载 json）。

## 5. 容器与编排

- Docker Compose v2
- 固定镜像标签（禁止 latest）
  - postgres:14.12
  - rabbitmq:3.13.3-management
  - prom/prometheus:v2.54.1
  - grafana/grafana:10.4.5
  - （可选）minio/minio:RELEASE.2024-07-26T20-44-27Z
  - （可选）redis:7.2.5

约束与约定
- 版本集中管理：ops/compose/.env 保存各组件版本号，compose 使用 ${VAR} 引用。
- 所有端口映射、卷与网络统一命名（网络 rap-net，卷 pgdata）。

## 6. 安全与鉴权

- 鉴权方式：JWT（Spring Security）
- 多租户传递：JWT 中携带 tenantId 与 roles
- Webhook/外部订阅：签名头预留（HMAC-SHA256）

选择理由
- JWT 简洁高效，便于前后端分离与多租户声明透传。
- 与后续 RBAC、审计、主题前缀（tenant.{id}.*）一体化设计。

## 7. 版本冻结清单（一览）

- Runtime
  - Java: 17
- Backend
  - Spring Boot: 3.3.3
  - springdoc-openapi: 2.5.0
  - Flyway: 与 Spring Boot BOM 对齐
- Datastore
  - PostgreSQL: 14.12
  - （可选）Redis: 7.2.5
  - （可选）MinIO: RELEASE.2024-07-26T20-44-27Z
- Messaging
  - RabbitMQ: 3.13.3-management
- Observability
  - Prometheus: v2.54.1
  - Grafana: 10.4.5
- Orchestration
  - Docker Compose: v2（本地环境）

## 8. 落地与后续动作

- 在 ops/compose/.env 写入上述版本号；docker-compose.yml 使用变量引用。
- 在 .github/workflows/ci.yml 固定 JDK 17；后续增加构建镜像时固定标签（如 ghcr.io/<org>/rap-backend:0.1.0）。
- 新增 ADR：docs/decisions/ADRs/0002-choose-rabbitmq.md，记录 RabbitMQ vs Kafka 的取舍（本文件为其依据之一）。
- W3 初始化 backend 时，pom.xml 采用 Spring Boot 3.3.3 与 Java 17，禁用 ddl-auto 自建表，启用 Flyway。

## 9. 演进路线（非本阶段范围）

- 如需更高吞吐与可回放：引入 Kafka（Confluent/Redpanda），Flow：Ingest→Kafka→FlinkCEP→规则/告警存储。
- 地理围栏精度：引入 PostGIS 并采用 ST_Contains / ST_DWithin。
- 对象存储：MinIO 正式启用用于事件附件与告警截图归档。