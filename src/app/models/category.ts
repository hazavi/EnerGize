import { Exercise } from "./exercise";

export interface Category {
  id: number;
  name: string;
  exercises: Exercise[];
}
