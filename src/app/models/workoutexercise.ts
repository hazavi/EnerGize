import { Exercise } from './exercise';
import { Set } from './set';

export interface WorkoutExercise {
  workoutId: number;
  exerciseId: number;
  sets: Set[];
  exercise?: Exercise;
}
