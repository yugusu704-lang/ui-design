import type { Project } from './types.ts';

export type SaveKind = 'auto' | 'manual' | 'restore';

export interface ProjectEnvelope {
  project: Project;
  saveVersion: number;
  updatedAt: string;
}

export interface DraftRecord {
  draftId: string;
  projectId: string;
  clientId: string;
  baseVersion: number;
  editSeq: number;
  project: Project;
  updatedAt: string;
  archived: boolean;
  savedVersion?: number;
}

export interface SaveReceipt {
  requestId: string;
  clientId: string;
  projectId: string;
  status: 'pending' | 'completed' | 'conflict';
  saveVersion?: number;
  updatedAt?: string;
  project?: Project;
  error?: string;
}

export interface RevisionSummary {
  id: number;
  projectId: string;
  kind: SaveKind;
  label?: string;
  createdAt: string;
  saveVersion: number;
}
