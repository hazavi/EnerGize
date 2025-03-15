import { Component } from '@angular/core';
import { BodyPart } from '../../../models/bodypart';
import { Exercise } from '../../../models/exercise';
import { Category } from '../../../models/category';
import { GenericService } from '../../../service/generic.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent {
  currentView: string = 'bodyparts'; // Default view
  bodyParts: BodyPart[] = [];
  categories: Category[] = [];
  exercises: Exercise[] = [];

  newBodyPart: BodyPart = { bodyPartId: 0, bodyPartName: '' };
  newCategory: Category = { categoryId: 0, categoryName: '', exercises: [] };
  newExercise: Exercise = {
    exerciseId: 0,
    exerciseName: '',
    instructions: '',
    bodyPartId: 0,
    categoryId: 0,
    workoutExercises: [],
  };

  isModalOpen: boolean = false; // Controls modal visibility

  // Pagination variables
  bodyPartsPage: number = 1;
  categoriesPage: number = 1;
  exercisesPage: number = 1;

  fileName: string = '';

  @Input() imagePreview: string | ArrayBuffer | null = null;
  @Output() fileSelected = new EventEmitter<File>();

  constructor(private genericService: GenericService<any>) {}

  ngOnInit(): void {
    this.loadBodyParts();
    this.loadCategories();
    this.loadExercises();
  }
  addOrUpdateEntry(): void {
    if (this.currentView === 'bodyparts') {
      if (this.newBodyPart.bodyPartId) {
        this.addBodyPart();
      } else {
        this.addBodyPart();
      }
    } else if (this.currentView === 'categories') {
      if (this.newCategory.categoryId) {
        this.addCategory();
      } else {
        this.addCategory();
      }
    } else if (this.currentView === 'exercises') {
      if (this.newExercise.exerciseId) {
        this.addExercise();
      } else {
        this.addExercise();
      }
    }
    this.closeModal();
  }
  loadBodyParts(): void {
    this.genericService.getAll('bodyparts').subscribe((data) => {
      this.bodyParts = data;
    });
  }

  addBodyPart(): void {
    if (this.newBodyPart.bodyPartId === 0) {
      this.genericService
        .create('bodyparts', this.newBodyPart)
        .subscribe(() => {
          this.loadBodyParts();
          this.resetForm();
          this.closeModal();
        });
    } else {
      this.genericService
        .updatebyid('bodyparts', this.newBodyPart.bodyPartId, this.newBodyPart)
        .subscribe(() => {
          this.loadBodyParts();
          this.resetForm();
          this.closeModal();
        });
    }
  }

  deleteBodyPart(id: number): void {
    this.genericService.deletebyid('bodyparts', id).subscribe(() => {
      this.loadBodyParts();
    });
  }

  editBodyPart(bodyPart: BodyPart): void {
    this.newBodyPart = { ...bodyPart }; // Clone object to avoid reference issues
    this.openModal();
  }

  resetForm(): void {
    this.newBodyPart = { bodyPartId: 0, bodyPartName: '' };
    this.newCategory = { categoryId: 0, categoryName: '', exercises: [] };
    this.newExercise = {
      exerciseId: 0,
      exerciseName: '',
      instructions: '',
      bodyPartId: 0,
      categoryId: 0,
      workoutExercises: [],
    };
  }

  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  // Similar methods for Categories and Exercises
  loadCategories(): void {
    this.genericService.getAll('categories').subscribe((data) => {
      this.categories = data;
    });
  }

  addCategory(): void {
    if (this.newCategory.categoryId === 0) {
      this.genericService
        .create('categories', this.newCategory)
        .subscribe(() => {
          this.loadCategories();
          this.resetForm();
          this.closeModal();
        });
    } else {
      this.genericService
        .updatebyid('categories', this.newCategory.categoryId, this.newCategory)
        .subscribe(() => {
          this.loadCategories();
          this.resetForm();
          this.closeModal();
        });
    }
  }

  deleteCategory(id: number): void {
    this.genericService.deletebyid('categories', id).subscribe(() => {
      this.loadCategories();
    });
  }

  editCategory(category: Category): void {
    this.newCategory = { ...category };
    this.openModal();
  }

  loadExercises(): void {
    this.genericService.getAll('exercises').subscribe((data) => {
      this.exercises = data;
    });
  }

  addExercise(): void {
    if (this.newExercise.exerciseId === 0) {
      this.genericService
        .create('exercises', this.newExercise)
        .subscribe(() => {
          this.loadExercises();
          this.resetForm();
          this.closeModal();
        });
    } else {
      this.genericService
        .updatebyid('exercises', this.newExercise.exerciseId, this.newExercise)
        .subscribe(() => {
          this.loadExercises();
          this.resetForm();
          this.closeModal();
        });
    }
  }

  deleteExercise(id: number): void {
    this.genericService.deletebyid('exercises', id).subscribe(() => {
      this.loadExercises();
    });
  }

  editExercise(exercise: Exercise): void {
    this.newExercise = { ...exercise };
    this.openModal();
  }

  getBodyPartName(id: number): string {
    const part = this.bodyParts.find((p) => p.bodyPartId === id);
    return part ? part.bodyPartName : 'Unknown';
  }

  getCategoryName(id: number): string {
    const category = this.categories.find((c) => c.categoryId === id);
    return category ? category.categoryName : 'Unknown';
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newExercise.thumbnail = new Uint8Array(e.target.result);
      };
      reader.readAsArrayBuffer(file);
    }
  }
}
