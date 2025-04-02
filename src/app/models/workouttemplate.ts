import { Workout } from './workout';

export class WorkoutTemplate {
  templateId: number = 0;
  templateName: string = '';
  collapsed: boolean = false;
  menuOpen: boolean = false;
  workouts: Workout[] = [];
}
