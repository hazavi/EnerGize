import { WorkoutExercise } from './workoutexercise';

export interface Workout {
  id: number;
  template_id: number;
  name: string;
  description: string;
  created_at: Date;
  exercises?: WorkoutExercise[];
}
