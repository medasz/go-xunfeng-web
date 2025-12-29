import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'zh';

export const translations = {
  en: {
    // Sidebar
    dashboard: 'DASHBOARD',
    tasks: 'TASKS',
    vulns: 'VULNERABILITIES',
    settings: 'SETTINGS',
    scanner_system: 'Scanner System',
    system_status: 'System Status',
    online: 'ONLINE',
    offline_mock: 'OFFLINE (MOCK)',
    checking: 'CHECKING...',
    // Dashboard
    init_metrics: 'Initializing System Metrics...',
    security_overview: 'SECURITY_OVERVIEW',
    live_feed: 'LIVE DATA FEED',
    total_vulns: 'Total Vulns',
    critical: 'Critical',
    active_tasks: 'Active Tasks',
    completed: 'Completed',
    vuln_dist: 'Vulnerability Distribution',
    detect_velocity: 'Detection Velocity',
    // Tasks
    task_manager: 'TASK_MANAGER',
    new_task: 'NEW_TASK',
    target: 'Target',
    status: 'Status',
    progress: 'Progress',
    started: 'Started',
    vuln_count: 'Vulns',
    action: 'Action',
    no_active_tasks: '[NO_ACTIVE_TASKS]',
    initiate_scan: 'INITIATE_SCAN',
    target_url: 'Target_URL',
    cancel: 'CANCEL',
    execute: 'EXECUTE',
    status_running: 'RUNNING',
    status_done: 'DONE',
    status_queued: 'QUEUED',
    status_fail: 'FAIL',
    status_halt: 'HALT',
    // Vulns
    vuln_db: 'VULN_DATABASE',
    search_db: 'SEARCH_DB...',
    no_data: '[NO_DATA_FOUND]',
    severity: 'Severity',
    vuln_title: 'Vulnerability Title',
    plugin: 'Plugin',
    time: 'Time',
    tech_payload: 'Technical_Payload',
    gemini_assistant: 'GEMINI_AI_ASSISTANT',
    execute_analysis: 'EXECUTE_ANALYSIS',
    processing: 'PROCESSING_DATA...',
    awaiting_command: '[Awaiting Command to Analyze Vulnerability Data]',
    id: 'ID',
    // Settings
    system_config: 'SYSTEM_CONFIG',
    config_desc: 'Configure backend connection parameters',
    conn_settings: 'Connection_Settings',
    api_endpoint: 'API_ENDPOINT',
    test_ping: 'TEST_PING',
    conn_hint: '> Ensure local backend service is active on port 8000.\n> CORS headers must be enabled for browser access.',
    conn_established: 'CONNECTION_ESTABLISHED',
    conn_refused: 'CONNECTION_REFUSED :: CHECK_SERVICE',
    handshake: 'INITIATING_HANDSHAKE...',
    save_config: 'SAVE_CONFIG',
    advanced_policy: 'Advanced_Scan_Policy',
    feature_locked: '[FEATURE_LOCKED] :: Thread count, timeout, and plugin whitelist configurations pending update.',
    conn_guide_title: 'Connection Guide',
    conn_step_1: '1. Start Backend: Run the Go-Xunfeng binary on your machine (e.g., ./xunfeng).',
    conn_step_2: '2. Check Port: Default is port 8000. Ensure http://127.0.0.1:8000/stats is accessible.',
    conn_step_3: '3. CORS Issue: If the connection fails despite the server running, it is likely a CORS block. Please enable CORS on the backend or use a browser plugin to bypass it.',
    // Common
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
    info: 'INFO'
  },
  zh: {
    // Sidebar
    dashboard: '仪表盘',
    tasks: '任务管理',
    vulns: '漏洞列表',
    settings: '系统设置',
    scanner_system: '扫描系统',
    system_status: '系统状态',
    online: '在线',
    offline_mock: '离线 (演示模式)',
    checking: '检测中...',
    // Dashboard
    init_metrics: '正在初始化系统指标...',
    security_overview: '安全概览',
    live_feed: '实时数据流',
    total_vulns: '漏洞总数',
    critical: '严重漏洞',
    active_tasks: '进行中任务',
    completed: '已完成',
    vuln_dist: '漏洞分布',
    detect_velocity: '检测趋势',
    // Tasks
    task_manager: '任务管理器',
    new_task: '新建任务',
    target: '目标',
    status: '状态',
    progress: '进度',
    started: '开始时间',
    vuln_count: '漏洞数',
    action: '操作',
    no_active_tasks: '[无活动任务]',
    initiate_scan: '发起扫描',
    target_url: '目标 URL',
    cancel: '取消',
    execute: '执行',
    status_running: '运行中',
    status_done: '完成',
    status_queued: '排队中',
    status_fail: '失败',
    status_halt: '停止',
    // Vulns
    vuln_db: '漏洞数据库',
    search_db: '搜索数据库...',
    no_data: '[未发现数据]',
    severity: '危害等级',
    vuln_title: '漏洞标题',
    plugin: '插件类型',
    time: '发现时间',
    tech_payload: '技术细节',
    gemini_assistant: 'GEMINI AI 助手',
    execute_analysis: '执行智能分析',
    processing: '数据处理中...',
    awaiting_command: '[等待指令以分析漏洞数据]',
    id: '编号',
    // Settings
    system_config: '系统配置',
    config_desc: '配置后端连接参数',
    conn_settings: '连接设置',
    api_endpoint: 'API 端点',
    test_ping: '测试连接',
    conn_hint: '> 确保本地后端服务在端口 8000 上处于活动状态。\n> 必须启用 CORS 标头以进行浏览器访问。',
    conn_established: '连接已建立',
    conn_refused: '连接被拒绝 :: 请检查服务',
    handshake: '正在握手...',
    save_config: '保存配置',
    advanced_policy: '高级扫描策略',
    feature_locked: '[功能锁定] :: 线程数、超时及插件白名单配置即将上线。',
    conn_guide_title: '本地对接指南',
    conn_step_1: '1. 启动后端：在本地运行 Go-Xunfeng 二进制文件 (如 ./xunfeng)。',
    conn_step_2: '2. 确认端口：默认端口通常为 8000。请尝试在浏览器访问 http://127.0.0.1:8000/stats 确认服务正常。',
    conn_step_3: '3. 解决跨域：如果服务已启动但连接失败，通常是 CORS 跨域拦截导致。请修改后端代码允许跨域，或在浏览器安装 Allow CORS 插件进行开发调试。',
    // Common
    high: '高危',
    medium: '中危',
    low: '低危',
    info: '信息'
  }
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh'); // 默认中文

  useEffect(() => {
    const saved = localStorage.getItem('xunfeng_lang') as Language;
    if (saved && (saved === 'en' || saved === 'zh')) {
      setLanguage(saved);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('xunfeng_lang', lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};