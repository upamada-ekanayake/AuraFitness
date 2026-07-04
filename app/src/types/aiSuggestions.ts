export type AISuggestionType =
  | 'exercise'
  | 'overload'
  | 'rest'
  | 'calorie'
  | 'streak'
  | 'motivation'
  | 'water'
  | 'fasting'
  | 'weight'
  | 'routine';

export type AISuggestionPriority = 'low' | 'medium' | 'high';

export interface AISuggestion {
  id: string;
  type: AISuggestionType;
  priority: AISuggestionPriority;
  title: string;
  message: string;
  confidence: number;
  reasonCodes: string[];
  createdAt: string;
  actionLabel?: string;
  route?: string;
}
