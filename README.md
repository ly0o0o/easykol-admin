src/
├── components/
│   ├── membership/
│   │   ├── MembershipForm.tsx        # 主组件
│   │   ├── MemberCard.tsx            # 会员信息卡片组件
│   │   ├── MembershipManagement.tsx  # 会员配额管理表单
│   │   ├── MembersList.tsx           # 用户配额信息列表
│   │   └── QuotaQuery.tsx            # 配额查询组件
├── hooks/
│   └── membership/
│       └── useMembershipData.ts      # 相关状态和方法的自定义Hook
└── utils/
    └── excel.ts                      # Excel导出相关功能