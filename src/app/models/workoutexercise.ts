import { Set } from './set';

export interface WorkoutExercise {
  id: number;
  workout_id: number;
  exercise_id: number;
  sets?: Set[];
}
