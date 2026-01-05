export type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  isPremium?: boolean;
};

export type BotStatus = 'online' | 'offline' | 'starting' | 'stopping' | 'error' | 'maintenance';

export type DeploymentSource = {
  type: 'github' | 'upload';
  url?: string; // For GitHub
  fileName?: string; // For Upload
};

export type BotSlot = {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  status: BotStatus;
  
  // Resources
  cpuUsage: number; // Percentage 0-100
  ramUsage: number; // MB
  maxRam: number; // MB (based on plan)
  uptime: number; // seconds (0 if offline)
  
  // Deployment
  source?: DeploymentSource;
  lastDeploymentId?: string;
  
  createdAt: Date;
  updatedAt: Date;
};

export type DeploymentLog = {
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'success';
  message: string;
};

export type Deployment = {
  id: string;
  slotId: string;
  status: 'queued' | 'building' | 'deploying' | 'completed' | 'failed';
  logs: DeploymentLog[];
  startedAt: Date;
  completedAt?: Date;
  
  // Metadata
  commitMessage?: string;
  commitHash?: string;
};
