import { Exercise } from "./exercise";
import { Workout } from "./workout";

export class WorkoutExercise {
    workoutExerciseId: number = 0;
    workoutId: number = 0;
    exerciseId: number = 0;
    workout?: Workout;
    exercise?: Exercise;
  }