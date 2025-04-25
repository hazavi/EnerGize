import { Set } from './set';

export interface TemplateExercise {
  id: number;
  template_id: number;
  exercise_id: number;
  sets?: Set[];
  order?: number;
}
