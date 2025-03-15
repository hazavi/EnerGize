import { Exercise } from './exercise';

export class Category {
  categoryId: number = 0;
  categoryName: string = '';
  exercises: Exercise[] = [];
}
