export interface CreateWorkoutDto {
  workoutName: string;
  description?: string;
  workoutExercises: CreateWorkoutExerciseDto[];
}

export interface CreateWorkoutExerciseDto {
  exerciseId: number; 
  sets: { reps: number; kg: number }[]; 
}
  