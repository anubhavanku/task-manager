export interface WebSocketMessage {
  type: 'TASK_CREATED' | 'TASK_MOVED' | 'TASK_UPDATED' | 'TASK_DELETED' | 'COMMENT_ADDED';
  payload: any;
  actor: string;
  projectId: number;
}