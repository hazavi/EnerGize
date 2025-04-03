  import { WorkoutExercise } from './workoutexercise';

  export interface Workout {
    workoutId: number;
    workoutName: string;
    description: string | null;
    workoutExercises: WorkoutExercise[];
    menuOpen?: boolean;
  }
  