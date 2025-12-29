export enum Severity {
  HIGH = 'High',
  MEDIUM = 'Medium',
  LOW = 'Low',
  INFO = 'Info'
}

export enum TaskStatus {
  RUNNING = 'Running',
  COMPLETED = 'Completed',
  WAITING = 'Waiting',
  ERROR = 'Error',
  STOPPED = 'Stopped'
}

export interface Task {
  id: string;
  target: string;
  status: TaskStatus;
  progress: number;
  startTime: string;
  endTime?: string;
  vulnCount: number;
}

export interface Vulnerability {
  id: string;
  taskId: string;
  url: string;
  title: string;
  severity: Severity;
  plugin: string;
  detail: string;
  foundAt: string;
  request?: string;
  response?: string;
}

export interface SystemStats {
  totalTasks: number;
  runningTasks: number;
  totalVulns: number;
  highVulns: number;
  mediumVulns: number;
  lowVulns: number;
}

export type ViewState = 'dashboard' | 'tasks' | 'vulns' | 'settings';
