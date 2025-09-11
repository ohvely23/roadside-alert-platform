Contributing
感谢你的贡献！请遵循以下规范以保持仓库一致性。

提交流程
基于最新的 main 创建功能分支：feature/<short-name> 或 fix/<short-name>
提交代码并保证 CI 通过
发起 Pull Request，并在描述中关联 issue（如有）
提交信息规范
格式：type(scope): message
type 取值：
feat: 新功能
fix: 修复缺陷
chore: 杂项维护（构建、依赖、脚手架）
docs: 仅文档变更
style: 代码风格（无逻辑变更）
refactor: 代码重构
test: 测试相关
示例：feat(device): add activation API
分支策略
main：稳定分支，发布与演示使用
develop：集成分支（可选）
feature/*：特性开发
fix/*：缺陷修复
release/*：发布准备（可选）
Code Style
Java: Google Java Style / Sun conventions，建议使用格式化插件
前端: 使用 Prettier 统一
统一编码 UTF-8，行尾 LF（仓库通过 .gitattributes 规范）
代码与提交质量
所有公共方法添加必要注释
避免在 PR 中混入与改动无关的格式化/重命名
若涉及接口变更，请更新 OpenAPI/README
提交前检查
单元测试通过（若已配置）
通过静态检查（Spotless/Checkstyle/ESLint 等）
更新相关文档与示例