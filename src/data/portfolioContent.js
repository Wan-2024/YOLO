export const portfolioProjects = [
  {
    slug: 'aurora-dashboard',
    title: '拾序录小程序',
    summary: "针对校园用户课表与任务分散、提醒链路断裂、成长记录难沉淀的痛点，独立打造面向校园场景的个人效率微信小程序，构建“课程管理- 计划执行 - 习惯养成 - 日记表达”一体化成长闭环",
    cover: '/public/imags/project-shot.png',
    background: '校园用户面临课表与任务分散、提醒链路断裂、成长记录难沉淀等问题，缺乏针对性的效率工具。',
    role: '将AI能力覆盖需求拆解、接口草案、代码初稿、异常分支补全、文档整理全流程；建立「AI生成 + 人工审查 + 真机回归」质量闸门，核心链路人工复核后发布，有效降低复杂边界场景的开发难度项目成果',
    techStack: ['微信小程序', 'JS', 'CloudBase', 'Vibe Coding'],
    results: [
      ' 通过AI辅助编码降低重复开发工作量，代码复用率提升30%，整体开发迭代效率提升45%，仅用1个月完成全功能上线',
      ' 离线场景可用性达100%，消息提醒触达成功率提升至98%，数据同步一致性零差错',
      '推动指标口径统一，减少重复沟通成本'
    ],
    screenshots: ['/public/imags/work/X1.jpg', '/public/imags/work/X2.jpg', '/public/imags/work/X5.jpg', '/public/imags/work/X6.jpg', '/public/imags/work/X4.jpg', '/public/imags/work/X3.jpg'],
    solutionDesigns: ['/public/imags/work/work1.png']
  },
  {
    slug: 'grain-notes',
    title: '低空经济内容运营推广小程序 ',
    summary: '面向低空经济行业客户需求，打造“内容触达-线索收集-后台运营-数据复盘”一体化微信小程序产品，解决行业内容分散、线索难以追踪、运营效率低下的痛点',
    cover: '/public/imags/project-shot1.png',
    background: '为低空经济领域企业打造内容运营一体化小程序，实现用户端内容展示与管理员端内容运营全闭环，支撑品牌宣传、案例展示、客户对接核心业务需求',
    role: '：构建「需求拆解→代码草拟→人工评审→联调回归」AI辅助开发流程，重点解决AI生成代码的平台字段兼容、编辑器时序稳定、云函数版本一致、安全逻辑缺失四类问题，核心逻辑全部经过人工验证项目成果',
    techStack: ['微信小程序', 'Vue Router', 'CSS Variables'],
    results: [
      '完成小程序前后台15个页面开发，覆盖用户端首页、案例、新闻、动态、服务、联系模块与管理员端内容管理、数据看板模块，实现完整业务闭环',
      '沉淀跨端小程序全栈开发规范与AI辅助开发质量管控标准，可直接复用至同类内容运营类小程序项目',
      '实现富文本编辑与图片上传链路（正文图/封面图），补齐上传URL兜底解析、格式与大小校验、错误分级提示'
    ],
    screenshots: ['/public/imags/work/M1.png', '/public/imags/work/M2.png', '/public/imags/work/M3.png', '/public/imags/work/M4.png'],
    solutionDesigns: ['/public/imags/work/work2.png']
  },

]

export const projectThemePalette = [
  { accent: '#3f93c8', soft: 'rgba(63, 147, 200, 0.16)', border: 'rgba(63, 147, 200, 0.34)' },
  { accent: '#7f73d4', soft: 'rgba(127, 115, 212, 0.16)', border: 'rgba(127, 115, 212, 0.34)' },
  { accent: '#3bb77a', soft: 'rgba(59, 183, 122, 0.16)', border: 'rgba(59, 183, 122, 0.34)' },
  { accent: '#e09a46', soft: 'rgba(224, 154, 70, 0.16)', border: 'rgba(224, 154, 70, 0.34)' },
  { accent: '#44a89a', soft: 'rgba(68, 168, 154, 0.16)', border: 'rgba(68, 168, 154, 0.34)' }
]

export function getProjectThemeBySlug(slug) {
  if (!slug) {
    return projectThemePalette[0]
  }

  const hash = Array.from(slug).reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return projectThemePalette[hash % projectThemePalette.length]
}

export function getProjectBySlug(slug) {
  return portfolioProjects.find((project) => project.slug === slug) || null
}
