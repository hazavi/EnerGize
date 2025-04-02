import { WorkoutExercise } from './workoutexercise';

export class Workout {
  workoutId: number = 0;
  workoutName: string = '';
  description?: string = '';
  workoutExercises: WorkoutExercise[] = [];
  menuOpen: boolean = false;
}
