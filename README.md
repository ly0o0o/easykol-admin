
```markdown
# EasyKol Admin

EasyKol Admin 是一个基于 React + TypeScript + Ant Design Pro 的后台管理系统，主要用于管理企业会员配额和权限。

## 项目特点

- 🚀 使用最新的 React 18 + TypeScript 技术栈
- 📦 基于 Ant Design Pro 的现代化 UI 设计
- 🔐 集成 Supabase 身份认证
- 🐳 Docker 容器化部署，支持多平台构建
- 📊 完善的数据统计和分析功能

## 主要功能

### 1. 企业管理
- 企业信息的增删改查
- 企业成员管理（添加/移除成员，设置管理员）
- 企业配额管理
- 企业状态管理（激活/暂停/过期）

### 2. 会员管理
- 会员信息查看
- 会员配额管理
- 会员有效期管理
- 批量会员操作

### 3. 用户配额详情管理
- 配额使用明细查询
- 每日配额统计
- 配额使用趋势分析
- 配额预警管理

### 4. 数据统计
- 企业配额使用统计
- 会员使用情况统计
- 系统整体使用趋势

## 技术架构

### 前端技术栈
- React 18
- TypeScript
- Ant Design Pro
- Dayjs
- XLSX

### 后端集成
- Supabase 身份认证
- RESTful API

### 部署方案
- Docker 容器化
- Nginx 反向代理

## 项目结构

```
src/
  ├── components/       # 组件目录
  │   └── membership/   # 会员管理相关组件
  │       ├── MembershipForm.tsx        # 主容器组件
  │       ├── QuotaManagement.tsx       # 配额管理组件
  │       ├── MemberList.tsx            # 会员列表组件
  │       ├── QuotaQuery.tsx            # 配额查询组件
  │       ├── EnterpriseManagement.tsx  # 企业管理组件
  │       ├── MemberCard.tsx            # 会员卡片组件
  │       └── utils.ts                  # 工具函数
  ├── services/        # API 服务
  ├── types/           # TypeScript 类型定义
  ├── conf/           # 配置文件
  └── App.tsx         # 主应用组件

```

