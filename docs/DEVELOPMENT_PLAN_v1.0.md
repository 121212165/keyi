# 可意AI心理医生 - v1.0 开发计划

> 版本: v1.0 | 状态: 待审核 | 日期: 2024-02-14
> 遵循: TDD开发流程 (DEVELOPMENT_SETUP.md) | 对齐: v3工作流程图

---

## 1. 概述

### 1.1 目标
完成端到端工作流：**用户发送消息 → Edge Function危机检测 → 前端危机弹窗显示资源**

### 1.2 当前状态
| 模块 | 状态 | 说明 |
|------|------|------|
| Edge Function危机检测 | ✅ 已实现 | 支持query参数和JSON Body双格式 |
| 前端ChatPage | ✅ 已有 | 包含危机弹窗逻辑 |
| API调用 | ✅ 已适配 | 前端用query参数，Edge Function已兼容 |
| 部署 | ❌ 未完成 | 未推送到云端 |

### 1.3 参考文档
- [x] AI心理医生MVP需求规格文档.md (P0/P1/P2优先级)
- [x] DEVELOPMENT_SETUP.md (TDD开发流程)
- [x] 流程图验证报告_v3.md (v3工作流程)
- [x] 对话交互流程_v3.puml (对话流程)
- [x] 预警触发与处理流程_v3.puml (预警流程)

---

## 2. 功能需求

### 2.1 核心功能
- [ ] 用户发送消息到Edge Function
- [ ] Edge Function检测危机关键词（critical/high/medium）
- [ ] 前端接收alert_level
- [ ] 危机等级> = high时显示弹窗
- [ ] 弹窗显示心理援助热线

### 2.2 危机等级定义
| 等级 | 关键词示例 | 弹窗 | 热线 |
|------|-----------|------|------|
| critical | 自杀、想死、自残 | ✅ 强提示 | ✅ 显示 |
| high | 绝望、活不下去 | ✅ 提示 | ✅ 显示 |
| medium | 崩溃、痛苦 | ⚪ 可选 | ⚪ 可选 |

---

## 3. 技术方案

### 3.1 TDD开发流程
遵循 DEVELOPMENT_SETUP.md 中的TDD流程：

```bash
# 步骤 1: 编写测试用例 (tests/)
# 步骤 2: 运行测试（应该失败）
pytest tests/test_crisis_detection.py -v
# 步骤 3: 实现功能代码 (supabase/functions/chat/)
# 步骤 4: 运行测试（应该通过）
pytest tests/test_crisis_detection.py -v
# 步骤 5: 提交代码
git commit -m "feat: implement crisis detection"
```

### 3.2 架构图
```
用户 → 前端(Vercel) → Edge Function(Supabase) → 危机检测 → 返回alert_level
                                                              ↓
                                                        前端弹窗(危机提示)
```

### 3.3 API格式

**前端发送请求格式**:
```http
POST /chat?session_id=xxx
Content-Type: application/json

{ "message": "我想自杀" }
```

**Edge Function返回格式**:
```json
{
  "response": "我听到你了...",
  "alert_level": "critical",
  "detected_keyword": "自杀",
  "timestamp": "2024-02-14T..."
}
```

### 3.4 Edge Function支持格式
- [x] `POST /chat { message: "xxx" }` - JSON Body
- [x] `POST /chat?session_id=xxx` - Query参数（兼容前端）
- [x] `POST /chat?action=create` - 创建会话
- [x] `GET /chat?session_id=xxx&action=history` - 获取历史
- [x] `GET /chat?action=health` - 健康检查

### 3.5 危机检测规则 (对齐v3预警流程)
| 等级 | 关键词 | 响应 | 弹窗 |
|------|--------|------|------|
| critical | 自杀、想死、自残、结束生命 | 强关怀+热线 | ✅ 强提示 |
| high | 绝望、活不下去、活着没意义 | 关怀+热线 | ✅ 提示 |
| medium | 崩溃、痛苦 | 关怀 | ⚪ 可选 |

---

## 4. 开发任务

### 阶段1: TDD测试驱动 (1-2天)

#### Task 1.1: 编写危机检测测试用例
**TDD步骤**: 编写测试 → 运行(预期失败) → 实现 → 运行(通过)

**测试文件**: `tests/test_crisis_detection.ts`
```typescript
describe('危机检测', () => {
  it('检测到自杀关键词应返回critical', async () => {
    const result = await crisisCheck('我想自杀');
    expect(result.alert_level).toBe('critical');
  });

  it('检测到绝望关键词应返回high', async () => {
    const result = await crisisCheck('感觉绝望');
    expect(result.alert_level).toBe('high');
  });

  it('正常消息应返回none', async () => {
    const result = await crisisCheck('今天天气不错');
    expect(result.alert_level).toBe('none');
  });
});
```

**状态**: ⏳ 待开始

#### Task 1.2: 运行测试验证失败
```bash
# 运行测试，预期失败
node test-function.js
# 预期: 测试失败，alert_level未正确返回
```

**状态**: ⏳ 待开始

---

### 阶段2: 功能实现 (1-2天)

#### Task 2.1: Edge Function实现 (已完成)
- [x] 支持query参数格式
- [x] 支持JSON Body格式
- [x] 危机检测关键词匹配
- [x] 返回alert_level和detected_keyword

**状态**: ✅ 已完成

#### Task 2.2: 运行测试验证通过
```bash
# 运行测试，预期通过
node test-function.js
# 预期: 所有测试通过
```

**状态**: ⏳ 待开始

---

### 阶段3: 前端集成 (1天)

#### Task 3.1: 配置前端API地址
**文件**: `frontend/src/api.ts`

```typescript
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://zrzwpucermocngirynkn.functions.supabase.co'  // 云端
  : 'http://127.0.0.1:54321/functions/v1';  // 本地
```

**状态**: ⏳ 待开始

#### Task 3.2: 集成危机弹窗
**文件**: `frontend/src/pages/ChatPage.tsx`

```typescript
// 对齐v3预警流程
useEffect(() => {
  if (data.alert_level && ['critical', 'high'].includes(data.alert_level)) {
    setAlertVisible(true);  // 显示危机弹窗
  }
}, [data]);
```

**状态**: ⏳ 待开始

---

### 阶段4: 端到端测试 (1天)

#### Task 4.1: 本地集成测试
```bash
# 1. 启动Supabase本地
supabase start

# 2. 启动前端
npm run dev

# 3. 执行测试用例
# - 发送危机消息，验证弹窗显示
# - 发送正常消息，验证正常对话
```

**状态**: ⏳ 待开始

#### Task 4.2: 验证v3流程完整性
| 流程 | 验证项 | 状态 |
|------|--------|------|
| 对话交互流程 | 用户→前端→Edge Function→危机检测→弹窗 | ⏳ |
| 预警触发流程 | 检测到危机→返回alert_level→前端弹窗 | ⏳ |

---

### 阶段5: 部署上线 (1天)

#### Task 5.1: 部署Edge Function
```bash
# 推送到Supabase云端
supabase functions deploy chat --project-ref zrzwpucermocngirynkn
```

**状态**: ⏳ 待开始

#### Task 5.2: 部署前端到Vercel
```bash
# 部署前端
cd frontend
vercel --prod
```

**状态**: ⏳ 待开始

#### Task 5.3: 云端验证
| 验证项 | 预期结果 | 状态 |
|--------|----------|------|
| 健康检查 | 返回status: ok | ⏳ |
| 危机检测 | 返回alert_level | ⏳ |
| 前端集成 | 弹窗正常显示 | ⏳ |

---

## 5. 测试用例

### 5.1 危机检测测试 (TDD模式)
| 测试ID | 输入 | 期望alert_level | 检测关键词 | 状态 |
|--------|------|----------------|-----------|------|
| TC01 | "我想自杀" | critical | 自杀 | ⏳ |
| TC02 | "不想活了" | critical | 不想活了 | ⏳ |
| TC03 | "自残" | critical | 自残 | ⏳ |
| TC04 | "结束生命" | critical | 结束生命 | ⏳ |
| TC05 | "感觉绝望" | high | 绝望 | ⏳ |
| TC06 | "活不下去" | high | 活不下去 | ⏳ |
| TC07 | "活着没意义" | high | 活着没意义 | ⏳ |
| TC08 | "活着没意思" | high | 活着没意思 | ⏳ |
| TC09 | "崩溃" | medium | 崩溃 | ⏳ |
| TC10 | "今天心情不好" | none | - | ⏳ |
| TC11 | "你好" | none | - | ⏳ |

### 5.2 API端点测试
| 测试ID | 端点 | 方法 | 期望结果 | 状态 |
|--------|------|------|---------|------|
| API01 | `/chat?action=create` | POST | 返回session_id | ⏳ |
| API02 | `/chat?session_id=xxx` | POST | 返回对话响应 | ⏳ |
| API03 | `/chat?session_id=xxx&action=history` | GET | 返回历史消息 | ⏳ |
| API04 | `/chat?action=health` | GET | 返回status: ok | ⏳ |

### 5.3 前端集成测试
| 测试ID | 场景 | 期望结果 | 状态 |
|--------|------|---------|------|
| UI01 | 发送危机消息 | 弹窗显示 | ⏳ |
| UI02 | 点击热线链接 | 跳转拨号 | ⏳ |
| UI03 | 发送正常消息 | 正常回复 | ⏳ |
| UI04 | 网络异常 | 错误提示 | ⏳ |

### 5.4 测试覆盖率要求
- 单元测试覆盖率: ≥ 80%
- 集成测试覆盖率: ≥ 60%
- 端到端测试: 核心流程100%覆盖

---

## 6. 依赖项

### 6.1 环境
| 依赖 | 版本 | 用途 | 状态 |
|------|------|------|------|
| Supabase CLI | latest | Edge Function开发 | ✅ 已安装 |
| Docker | latest | 运行Supabase本地 | ✅ 已安装 |
| Node.js | 18+ | 前端开发 | ✅ 已有 |
| Vercel CLI | latest | 前端部署 | ⏳ 待安装 |

### 6.2 配置
| 配置项 | 值 | 状态 |
|--------|-----|------|
| Supabase项目ID | `zrzwpucermocngirynkn` | ✅ 已配置 |
| Vercel项目配置 | `frontend/vercel.json` | ⏳ 待配置 |
| 本地API地址 | `http://127.0.0.1:54321/functions/v1` | ✅ 已配置 |
| 云端API地址 | `https://zrzwpucermocngirynkn.functions.supabase.co` | ⏳ 待验证 |

### 6.3 第三方服务
| 服务 | 用途 | 状态 |
|------|------|------|
| Supabase | Edge Function托管 | ⏳ 待部署 |
| Vercel | 前端托管 | ⏳ 待部署 |

---

## 7. 风险与对策

### 7.1 技术风险
| 风险 | 影响 | 概率 | 对策 |
|------|------|------|------|
| API格式不匹配 | 前端无法通信 | 低 | Edge Function同时支持query和body |
| 云端部署失败 | 无法公网访问 | 中 | 先本地测试完整再部署 |
| 危机漏检 | 用户安全风险 | 低 | 多关键词覆盖 + 定期更新关键词库 |
| Edge Function超时 | 响应延迟 | 中 | 设置合理的超时时间 |
| 数据库连接失败 | 数据丢失 | 低 | 启用本地日志记录 |

### 7.2 安全风险
| 风险 | 影响 | 对策 |
|------|------|------|
| 用户隐私泄露 | 信任危机 | 数据加密存储 |
| 恶意输入 | 系统攻击 | 输入验证过滤 |
| 热线信息泄露 | 服务滥用 | 访问控制 |

### 7.3 运营风险
| 风险 | 影响 | 对策 |
|------|------|------|
| 第三方API不可用 | 功能失效 | 降级处理 |
| 高并发访问 | 系统崩溃 | 限流熔断 |

---

## 8. 后端TDD实践

### 8.1 后端测试文件结构
```
tests/
├── test_crisis_detection.ts    # 危机检测测试
├── test_api_endpoints.ts       # API端点测试
├── test_health_check.ts        # 健康检查测试
└── utils/
    └── mock_supabase.ts       # Mock Supabase
```

### 8.2 危机检测测试示例 (后端)
```typescript
// tests/test_crisis_detection.ts
import { detectCrisis, CrisisResult } from '../src/crisisDetection';

describe('危机检测 - TDD测试', () => {

  // TC01: 自杀关键词检测
  test('检测到"自杀"应返回critical', () => {
    const result: CrisisResult = detectCrisis('我想自杀');
    expect(result.isCrisis).toBe(true);
    expect(result.level).toBe('critical');
    expect(result.keyword).toBe('自杀');
  });

  // TC05: 绝望关键词检测
  test('检测到"绝望"应返回high', () => {
    const result: CrisisResult = detectCrisis('感觉绝望');
    expect(result.isCrisis).toBe(true);
    expect(result.level).toBe('high');
    expect(result.keyword).toBe('绝望');
  });

  // TC10: 正常消息检测
  test('正常消息应返回none', () => {
    const result: CrisisResult = detectCrisis('今天心情不错');
    expect(result.isCrisis).toBe(false);
    expect(result.level).toBe('none');
  });
});
```

### 8.3 运行测试命令
```bash
# 运行所有测试
npm test

# 运行单个测试文件
npm test -- test_crisis_detection.ts

# 运行测试并生成覆盖率报告
npm test -- --coverage
```

---

## 9. 下一版本(v1.1)规划

### 9.1 功能规划
| 功能 | 优先级 | 说明 |
|------|--------|------|
| AI对话生成 | P0 | 接入OpenAI/豆包 |
| 用户登录认证 | P0 | JWT认证 |
| 对话历史存储 | P1 | MongoDB存储 |
| 情绪追踪图表 | P1 | 情绪趋势可视化 |
| 心理评估量表 | P2 | PHQ-9/GAD-7 |

### 9.2 技术规划
| 改进项 | 说明 |
|--------|------|
| 引入AI模型 | OpenAI/豆包API集成 |
| 数据库设计 | PostgreSQL + MongoDB |
| 缓存策略 | Redis会话缓存 |
| 监控告警 | Sentry集成 |

---

## 9. 审核清单

### 9.1 技术审核
- [ ] 技术方案已审核
- [ ] TDD流程已理解
- [ ] API格式已确认
- [ ] 危机检测逻辑已验证

### 9.2 任务审核
- [ ] 任务拆分合理
- [ ] 优先级明确
- [ ] 依赖关系清晰
- [ ] 时间估算合理

### 9.3 测试审核
- [ ] 测试用例完整
- [ ] 测试覆盖率达标准
- [ ] 测试数据已准备

### 9.4 风险审核
- [ ] 风险已识别
- [ ] 对策已制定
- [ ] 应急方案已准备

### 9.5 交付审核
- [ ] 文档已完整
- [ ] 配置已就绪
- [ ] 环境已准备
- [ ] 权限已获取

---

**审核人**: ________________

**审核日期**: ________________

**审核结果**: ☐ 通过 ☐ 需修改 ☐ 驳回

---

**文档版本**: v1.0
**最后更新**: 2024-02-14
**维护者**: 开发团队
