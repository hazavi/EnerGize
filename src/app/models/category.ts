import { Exercise } from "./exercise";

export interface Category {
  categoryId: number;
  categoryName: string;
  exercises: Exercise[];
}
