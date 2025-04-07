export interface CreateWorkoutExercisePayload {
  workoutId: number;
  exerciseId: number;
  sets: { reps: number; kg: number }[];
}
