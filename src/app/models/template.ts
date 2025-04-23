export interface Template {
  id: number;
  name: string;
  description: string;
  workout_id: number | null;
  user_uid: string;
}
