export interface WorkoutHistory {
    id?: number;
    user_uid: string;
    day: string;
    date: string;
    duration: number;
    exercises_completed: number;
    total_exercises: number;
    notes?: string;
    created_at?: string;
  }