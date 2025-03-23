import { BodyPart } from './bodypart';
import { Category } from './category';
import { WorkoutExercise } from './workoutexercise';

export class Exercise {
  exerciseId: number = 0;
  thumbnail: Uint8Array = new Uint8Array();
  thumbnailBase64?: string; 
  exerciseName: string = '';
  instructions: string = '';
  bodyPartId: number = 0;
  categoryId: number = 0;
  // For simplicity, representing navigation properties as basic objects or arrays
  workoutExercises: WorkoutExercise[] = [];
  category?: Category;
  bodyPart?: BodyPart;
}
