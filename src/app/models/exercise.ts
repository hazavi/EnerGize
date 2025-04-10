import { WorkoutExercise } from './workoutexercise';

export interface Exercise {
  exerciseId: number;
  exerciseName: string;
  instructions: string;
  bodyPartId: number;
  categoryId: number;
  workoutExercises: WorkoutExercise[];
  thumbnail: Uint8Array;
}
