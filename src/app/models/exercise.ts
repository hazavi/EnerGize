import { SafeUrl } from '@angular/platform-browser';
import { WorkoutExercise } from './workoutexercise';

export interface Exercise {
  id: number;
  name: string;
  instructions?: string;
  bodypart_id: number;
  category_id: number;
  workoutExercises: WorkoutExercise[];
  thumbnail: string;
  base64Thumbnail?: string;
}
