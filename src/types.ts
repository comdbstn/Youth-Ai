export interface Goal {
  id: number;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Routine {
  id: number;
  user_id: string;
  name: string;
  count: number;
  created_at: string;
}

export interface JournalEntry {
  id: number;
  user_id: string;
  entry_text: string;
  emotion: string;
  created_at: string;
} 