import { Task, Vulnerability, SystemStats, TaskStatus, Severity } from '../types';

// --- 配置管理 ---
const CONFIG_KEY = 'xunfeng_api_config';
const DEFAULT_API_URL = 'http://127.0.0.1:8000'; // Go-Xunfeng 默认端口

export const getBaseUrl = () => {
  const stored = localStorage.getItem(CONFIG_KEY);
  if (stored) return stored.replace(/\/$/, '');
  return DEFAULT_API_URL;
};

export const setBaseUrl = (url: string) => {
  localStorage.setItem(CONFIG_KEY, url);
  window.location.reload();
};

// 强制 Mock 开关：生产环境应设为 false
const FORCE_MOCK = false;

// --- Mock Data (模拟数据) ---
const MOCK_TASKS: Task[] = [
  { id: 't1', target: 'http://example.com', status: TaskStatus.COMPLETED, progress: 100, startTime: '2023-10-26 10:00:00', endTime: '2023-10-26 10:05:00', vulnCount: 3 },
  { id: 't2', target: 'http://test.local', status: TaskStatus.RUNNING, progress: 45, startTime: '2023-10-27 14:00:00', vulnCount: 1 },
  { id: 't3', target: 'http://vulnerable-app.com', status: TaskStatus.WAITING, progress: 0, startTime: '2023-10-27 15:30:00', vulnCount: 0 },
];

const MOCK_VULNS: Vulnerability[] = [
  { id: 'v1', taskId: 't1', url: 'http://example.com/admin', title: 'SQL Injection in Login', severity: Severity.HIGH, plugin: 'sql_inject', detail: 'Parameter id is vulnerable', foundAt: '2023-10-26 10:02:00' },
  { id: 'v2', taskId: 't1', url: 'http://example.com/search', title: 'Reflected XSS', severity: Severity.MEDIUM, plugin: 'xss', detail: 'Search query reflected', foundAt: '2023-10-26 10:03:00' },
  { id: 'v3', taskId: 't1', url: 'http://example.com/robots.txt', title: 'Sensitive Information Disclosure', severity: Severity.LOW, plugin: 'dir_scan', detail: 'Found sensitive paths', foundAt: '2023-10-26 10:01:00' },
];

const MOCK_STATS: SystemStats = {
  totalTasks: 124,
  runningTasks: 2,
  totalVulns: 450,
  highVulns: 23,
  mediumVulns: 89,
  lowVulns: 338,
};

// --- API 响应处理 ---

interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
  // 兼容不同分页格式
  total?: number; 
  list?: T;
  tasks?: T;
  vulns?: T;
}

// 辅助函数：智能映射严重程度
const mapSeverity = (val: any): Severity => {
  // 处理数字映射 (Go-Xunfeng 常见: 3=High, 2=Med, 1=Low, 0=Info)
  if (typeof val === 'number') {
    if (val >= 3) return Severity.HIGH;
    if (val === 2) return Severity.MEDIUM;
    if (val === 1) return Severity.LOW;
    return Severity.INFO;
  }
  // 处理字符串
  if (typeof val === 'string') {
    const lower = val.toLowerCase();
    if (lower.includes('high') || lower === '3') return Severity.HIGH;
    if (lower.includes('med') || lower === 'middle' || lower === '2') return Severity.MEDIUM;
    if (lower.includes('low') || lower === '1') return Severity.LOW;
  }
  return Severity.INFO;
};

// 辅助函数：映射 Task
const mapTask = (raw: any): Task => ({
  id: raw.id || raw.task_id || raw._id || '',
  target: raw.target || raw.addr || raw.url || 'Unknown Target',
  status: (raw.status as TaskStatus) || TaskStatus.WAITING,
  progress: raw.progress ?? raw.percent ?? 0, // 兼容 percent 字段
  startTime: raw.start_time || raw.create_time || raw.time || '',
  endTime: raw.end_time || raw.finish_time,
  vulnCount: raw.vuln_count ?? raw.vul_num ?? 0, // 兼容 vul_num 字段
});

// 辅助函数：映射 Vulnerability
const mapVuln = (raw: any): Vulnerability => ({
  id: raw.id || raw._id || '',
  taskId: raw.task_id || raw.taskid || '',
  url: raw.url || '',
  title: raw.title || raw.plugin_name || raw.vuln_name || 'Unknown Vulnerability',
  severity: mapSeverity(raw.severity || raw.layer || raw.level), // 兼容 layer/level 字段
  plugin: raw.plugin || raw.plugin_type || 'General',
  detail: raw.detail || raw.result || raw.response || 'No details provided',
  foundAt: raw.found_at || raw.create_time || raw.time || '',
  request: raw.request || '',
  response: raw.response || ''
});

// 辅助函数：映射 Stats
const mapStats = (raw: any): SystemStats => ({
  totalTasks: raw.total_tasks ?? raw.task_count ?? 0,
  runningTasks: raw.running_tasks ?? raw.running_count ?? 0,
  totalVulns: raw.total_vulns ?? raw.vuln_count ?? 0,
  highVulns: raw.high_vulns ?? raw.high_count ?? 0,
  mediumVulns: raw.medium_vulns ?? raw.medium_count ?? 0,
  lowVulns: raw.low_vulns ?? raw.low_count ?? 0,
});

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 8000); // 延长超时时间到8秒
  
  const baseUrl = getBaseUrl();
  const API_SUFFIX = '/api/v1';
  
  // 智能拼接：如果 endpoint 已经包含 /api，或者 baseUrl 已经包含 /api，则避免重复
  let url = '';
  if (endpoint.startsWith('http')) {
      url = endpoint;
  } else {
      const baseHasSuffix = baseUrl.includes('/api');
      const endpointHasSuffix = endpoint.startsWith('/api');
      
      if (baseHasSuffix || endpointHasSuffix) {
          // 如果任意一方已经有了 api 前缀，直接拼接
          url = `${baseUrl}${endpoint}`;
      } else {
          // 否则添加默认后缀
          url = `${baseUrl}${API_SUFFIX}${endpoint}`;
      }
  }

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);

    if (!res.ok) {
      console.warn(`API Error [${res.status}] for ${url}`);
      return null;
    }

    const json = await res.json();
    
    // 适配：处理标准包装 { code: 200, data: ... }
    if (json && typeof json === 'object' && 'code' in json) {
       const wrapper = json as ApiResponse<T>;
       if (wrapper.code !== 200 && wrapper.code !== 0) { 
         console.warn(`API Logic Error: ${wrapper.code} - ${wrapper.msg}`);
         return null;
       }
       return wrapper.data;
    }
    
    return json as T;

  } catch (e) {
    console.error(`Network Request failed for ${url}:`, e);
    return null;
  }
}

export const apiService = {
  // 测试连接：返回 true 表示连接成功
  async testConnection(url: string): Promise<boolean> {
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 3000);
        
        // 尝试构建完整的 stats URL
        const API_SUFFIX = '/api/v1';
        let fullUrl = url;
        if (!url.includes('/api')) {
             fullUrl = `${url}${API_SUFFIX}`;
        }
        
        const res = await fetch(`${fullUrl}/stats`, { 
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(id);
        return res.ok;
    } catch (e) {
        return false;
    }
  },

  async getStats(): Promise<SystemStats> {
    if (FORCE_MOCK) return MOCK_STATS;
    
    const data = await fetchApi<any>('/stats');
    if (data) return mapStats(data);
    
    // 如果获取失败，返回 Mock 数据以保持 UI 完整性，但在控制台已记录错误
    console.debug('Using MOCK stats due to connection failure');
    return MOCK_STATS;
  },

  async getTasks(): Promise<Task[]> {
    if (FORCE_MOCK) return MOCK_TASKS;

    const data = await fetchApi<any>('/task/list');
    
    // 处理各种可能的列表返回结构
    if (Array.isArray(data)) return data.map(mapTask);
    if (data && Array.isArray(data.list)) return data.list.map(mapTask);
    if (data && Array.isArray(data.tasks)) return data.tasks.map(mapTask);
    if (data && Array.isArray(data.data)) return data.data.map(mapTask);

    console.debug('Using MOCK tasks due to connection failure');
    return MOCK_TASKS;
  },

  async createTask(target: string): Promise<boolean> {
    if (FORCE_MOCK) {
      MOCK_TASKS.unshift({
        id: `t${Date.now()}`,
        target,
        status: TaskStatus.RUNNING,
        progress: 0,
        startTime: new Date().toISOString(),
        vulnCount: 0
      });
      return true;
    }

    const res = await fetchApi<any>('/task/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: target }) // Go-Xunfeng 通常期望 { "target": "..." }
    });
    return !!res;
  },

  async getVulns(): Promise<Vulnerability[]> {
    if (FORCE_MOCK) return MOCK_VULNS;

    const data = await fetchApi<any>('/vuln/list');
    
    if (Array.isArray(data)) return data.map(mapVuln);
    if (data && Array.isArray(data.list)) return data.list.map(mapVuln);
    if (data && Array.isArray(data.vulns)) return data.vulns.map(mapVuln);
    if (data && Array.isArray(data.data)) return data.data.map(mapVuln);

    console.debug('Using MOCK vulns due to connection failure');
    return MOCK_VULNS;
  }
};