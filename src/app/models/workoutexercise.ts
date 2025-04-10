import { Set } from './set';
export interface WorkoutExercise {
  id: number;
  workoutId: number;
  exerciseId: number;
  sets: Set[];
}
