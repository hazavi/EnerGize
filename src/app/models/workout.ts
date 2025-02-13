import { WorkoutExercise } from "./workoutexercise";

export class Workout {
    workoutId: number = 0;
    workoutName: string = '';
    description: string = '';
    sets?: number;
    reps?: number;
    kg?: number;
    workoutExercises: WorkoutExercise[] = [];
  }