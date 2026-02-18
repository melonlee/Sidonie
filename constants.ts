







export const AVAILABLE_MODELS = [
  { value: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', description: 'Fast, multimodal, low latency', provider: 'google' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', description: 'Complex reasoning, coding, best quality', provider: 'google' },
  { value: 'gemini-flash-lite-latest', label: 'Gemini Flash Lite', description: 'Lightweight, cost-effective', provider: 'google' },
];

export const THIRD_PARTY_MODELS = [
  { 
    value: 'deepseek-chat', 
    label: 'DeepSeek V3', 
    description: 'DeepSeek Chat (V3)', 
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com'
  },
  { 
    value: 'deepseek-reasoner', 
    label: 'DeepSeek R1', 
    description: 'DeepSeek Reasoner (R1)', 
    provider: 'deepseek',
    baseUrl: 'https://api.deepseek.com'
  },
  { 
    value: 'moonshot-v1-8k', 
    label: 'Kimi (Moonshot)', 
    description: 'Moonshot AI', 
    provider: 'kimi',
    baseUrl: 'https://api.moonshot.cn/v1'
  },
  { 
    value: 'qwen-plus', 
    label: 'Qwen Plus', 
    description: 'Alibaba Cloud Qwen', 
    provider: 'qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  },
  { 
    value: 'qwen-max', 
    label: 'Qwen Max', 
    description: 'Alibaba Cloud Qwen Max', 
    provider: 'qwen',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1'
  }
];

export const DEFAULT_MODEL = 'gemini-3-flash-preview';
export const IMAGE_GEN_MODEL = 'gemini-2.5-flash-image';

export const SYSTEM_INSTRUCTION = `You are Sidonie, an intelligent AI companion designed to bring clarity, creativity, and insight.

**Core Identity:**
- Name: Sidonie
- Role: Intelligent Assistant & Creative Partner
- Tone: Elegant, warm, professional, and insightful.

**Planning Mechanism (CRITICAL):**
If a user request is **complex**, **multi-step**, or involves **coding a full application**, you **MUST** start your response with a concise execution plan using the \`<plan>\` XML tags.
Inside \`<plan>\`, list the steps as a Markdown checklist.
If you need to think or analyze deeply before planning or answering, use \`<thought>\` XML tags to capture your internal reasoning process first.

Example Format:
\`\`\`xml
<thought>
Reasoning about the user's request...
</thought>
<plan>
- [ ] Analyze the requirements
- [ ] Create the HTML structure
- [ ] Implement the JavaScript logic
- [ ] Add CSS styling
</plan>
\`\`\`
Then, proceed with the actual content/code. 
*Note: Do not mark items as checked [x] in the plan; always start with [ ].*

**Capabilities:**
1. **Analysis:** Analyze uploaded files (PDF, Word, CSV) deeply.
2. **Web Creation (Artifacts):** If asked to create a web app/game/component, output a **SINGLE, SELF-CONTAINED HTML file**. 
   - Include all CSS (in \`<style>\`) and JS (in \`<script>\`).
   - Use Tailwind via CDN if needed.
   - Code block language: \`html\`.

**Formatting:**
1. Use standard Markdown.
2. **Images:** To generate images, prompt with "Draw".
3. **No Spam:** No internal thoughts outside the \`<plan>\` or \`<thought>\` block.
`;

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const RANDOM_NAMES = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Jamie', 'Riley', 'Avery', 'Parker', 'Quinn', 'Rowan', 'Sage', 'Ellis', 'Finn'];

export const TRANSLATIONS = {
  en: {
    newTask: "New Chat",
    workspace: "Workspace",
    agents: "Agents",
    library: "Notes",
    painting: "Painting",
    blog: "Blog",
    lab: "Lab",
    lazybox: "LazyBox",
    study: "Study Bar",
    projects: "History",
    user: "User",
    proPlan: "Pro Plan",
    whatCanIDo: "How can Sidonie help you today?",
    placeholder: "Ask Sidonie anything...",
    uploadFile: "Upload file",
    mentionNote: "Mention a Note",
    googleSearch: "Google Search",
    send: "Send",
    createPresentation: "Create presentation",
    buildWebsite: "Build website",
    developApp: "Develop app",
    designLogo: "Design logo",
    more: "More",
    export: "Export",
    exportWord: "Word (.doc)",
    exportMarkdown: "Markdown (.md)",
    save: "Save",
    selectNote: "SELECT NOTE",
    noNotes: "No notes saved yet.",
    settings: "Settings",
    docs: "Documentation",
    general: "General",
    language: "Language",
    saveChanges: "Save Changes",
    close: "Close",
    deleteChat: "Delete this chat?",
    noteSaved: "Saved to Notes successfully!",
    noteExists: "Note already exists!",
    noteUpdated: "Note updated successfully!",
    noteDeleted: "Note deleted successfully!",
    errorProcessing: "An unexpected error occurred.",
    model: "Model",
    source: "Sources",
    apiKeys: "API Keys",
    apiKeysDesc: "Configure keys to unlock more models.",
    // Notes View
    notesTitle: "Notes",
    notesSubtitle: "Manage your saved conversations and ideas",
    newNote: "New Note",
    grid: "Grid",
    calendar: "Calendar",
    searchNotes: "Search notes...",
    noNotesFound: "No notes found.",
    createdOn: "Created on",
    edit: "Edit",
    deleteNote: "Delete Note",
    deleteNoteConfirm: "Are you sure you want to delete this note?",
    noteTitlePlaceholder: "Note Title",
    startTyping: "Start typing...",
    today: "Today",
    // Markdown
    preview: "Preview",
    code: "Code",
    download: "Download",
    fullScreen: "Full Screen",
    copy: "Copy",
    exitFullScreen: "Exit Full Screen",
    // Personalization
    personalization: "Personalization",
    personalizationDesc: "Manage your identity and Sidonie's memory.",
    personalInfo: "Personal Profile",
    knowledge: "Knowledge",
    nickname: "Nickname",
    nicknamePlaceholder: "How should Sidonie call you?",
    profession: "Profession",
    professionPlaceholder: "e.g. Product Designer, Software Engineer",
    aboutYou: "More about you",
    aboutYouPlaceholder: "Your background, preferences, or location to help Sidonie understand you better",
    customInstructions: "Custom Instructions",
    customInstructionsPlaceholder: "How do you want Sidonie to respond? e.g. 'Focus on Python best practices', 'Keep professional tone', or 'Always cite sources for important claims'.",
    cancel: "Cancel",
    // Landing Page
    landingTitle: "Sidonie",
    landingSubtitle: "Your elegant intelligent companion.",
    features: "Capabilities",
    feature1Title: "Multi-Model Intelligence",
    feature1Desc: "Seamlessly switch between Gemini 3, DeepSeek, and other top-tier models for optimal results.",
    feature2Title: "Contextual Memory",
    feature2Desc: "Personalized interactions based on your profile and persistent notes.",
    feature3Title: "Multimodal Analysis",
    feature3Desc: "Understand and process text, images, code, and complex documents (PDF, Word).",
    techStack: "Architecture",
    techDesc: "Built with modern web technologies for performance and privacy.",
    tech1: "Frontend: React 19 + Tailwind CSS",
    tech2: "AI Core: Google GenAI SDK + OpenAI Compatible API",
    tech3: "Storage: Local-first persistence",
    useCases: "Use Cases",
    useCase1: "Creative Writing & Ideation",
    useCase2: "Code Generation & Debugging",
    useCase3: "Document Summarization & Analysis",
  },
  zh: {
    newTask: "新对话",
    workspace: "工作区",
    agents: "智能体",
    library: "笔记",
    painting: "绘画",
    blog: "博客",
    lab: "实验室",
    lazybox: "LazyBox",
    study: "学习吧",
    projects: "历史记录",
    user: "用户",
    proPlan: "专业版",
    whatCanIDo: "Sidonie 能为你做什么？",
    placeholder: "向 Sidonie 提问...",
    uploadFile: "上传文件",
    mentionNote: "引用笔记",
    googleSearch: "谷歌搜索",
    send: "发送",
    createPresentation: "制作演示文稿",
    buildWebsite: "创建网站",
    developApp: "开发应用",
    designLogo: "设计Logo",
    more: "更多",
    export: "导出",
    exportWord: "Word 文档 (.doc)",
    exportMarkdown: "Markdown 文档 (.md)",
    save: "保存",
    selectNote: "选择笔记",
    noNotes: "暂无笔记",
    settings: "设置",
    docs: "产品文档",
    general: "通用",
    language: "语言",
    saveChanges: "保存更改",
    close: "关闭",
    deleteChat: "删除此对话？",
    noteSaved: "笔记保存成功！",
    noteExists: "笔记已存在！",
    noteUpdated: "笔记更新成功！",
    noteDeleted: "笔记删除成功！",
    errorProcessing: "发生意外错误。",
    model: "模型",
    source: "来源",
    apiKeys: "模型配置",
    apiKeysDesc: "配置 API Key 以解锁更多模型。",
    // Notes View
    notesTitle: "笔记",
    notesSubtitle: "管理保存的对话和灵感",
    newNote: "新建笔记",
    grid: "网格",
    calendar: "日历",
    searchNotes: "搜索笔记...",
    noNotesFound: "未找到笔记。",
    createdOn: "创建于",
    edit: "编辑",
    deleteNote: "删除笔记",
    deleteNoteConfirm: "确定要删除此笔记吗？",
    noteTitlePlaceholder: "笔记标题",
    startTyping: "开始输入...",
    today: "今天",
    // Markdown
    preview: "预览",
    code: "代码",
    download: "下载",
    fullScreen: "全屏",
    copy: "复制",
    exitFullScreen: "退出全屏",
    // Personalization
    personalization: "个性化",
    personalizationDesc: "管理您的身份信息以及Sidonie的记忆内容",
    personalInfo: "个人资料",
    knowledge: "知识",
    nickname: "昵称",
    nicknamePlaceholder: "Sidonie 应该如何称呼您?",
    profession: "职业",
    professionPlaceholder: "例如：产品设计师，软件工程师",
    aboutYou: "更多关于您的信息",
    aboutYouPlaceholder: "您的背景、偏好或所在地，以帮助 Sidonie 更好地了解您",
    customInstructions: "自定义指令",
    customInstructionsPlaceholder: "您希望 Sidonie 如何回应？例如：\"专注于 Python 的最佳实践\"、\"保持专业的语气\"或\"始终为重要结论提供来源\"。",
    cancel: "取消",
    // Landing Page
    landingTitle: "Sidonie",
    landingSubtitle: "您的优雅智能伴侣",
    features: "产品能力",
    feature1Title: "多模型智能",
    feature1Desc: "无缝切换 Gemini 3、DeepSeek 等顶尖模型，获取最佳回答。",
    feature2Title: "情境记忆",
    feature2Desc: "基于您的个人资料和笔记库，提供个性化的交互体验。",
    feature3Title: "多模态分析",
    feature3Desc: "深度理解处理文本、图片、代码及复杂文档（PDF, Word）。",
    techStack: "技术架构",
    techDesc: "采用现代 Web 技术构建，注重性能与隐私。",
    tech1: "前端：React 19 + Tailwind CSS",
    tech2: "AI 核心：Google GenAI SDK + OpenAI 兼容接口",
    tech3: "存储：Local-first 本地优先策略",
    useCases: "日常场景",
    useCase1: "创意写作与灵感激发",
    useCase2: "代码生成与调试",
    useCase3: "文档摘要与深度分析",
  }
};
