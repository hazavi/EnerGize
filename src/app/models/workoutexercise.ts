import { Exercise } from './exercise';
import { Set } from './set';

export interface WorkoutExercise {
  workoutExerciseId: number;
  workoutId: number;
  exerciseId: number;
  sets: Set[]; 
  exercise?: Exercise;
  
}
