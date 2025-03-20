import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
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
  imports: [
    CommonModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    FormsModule,
    NgxPaginationModule,
  ],
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
    thumbnail: new Uint8Array(), // Thumbnail as Uint8Array
  };

  isModalOpen: boolean = false; // Controls modal visibility

  // Pagination variables
  bodyPartsPage: number = 1;
  categoriesPage: number = 1;
  exercisesPage: number = 1;

  fileName: string = '';
  imagePreview: string | ArrayBuffer | null = null; // For thumbnail preview

  @Output() fileSelected = new EventEmitter<File>();

  constructor(
    private genericService: GenericService<any>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadBodyParts();
    this.loadCategories();
    this.loadExercises();
  }

  // Load data methods
  loadBodyParts(): void {
    this.genericService.getAll('bodyparts').subscribe((data) => {
      this.bodyParts = data;
    });
  }

  loadCategories(): void {
    this.genericService.getAll('categories').subscribe((data) => {
      this.categories = data;
    });
  }

  loadExercises(): void {
    this.genericService.getAll('exercises').subscribe((data) => {
      this.exercises = data;
    });
  }

  // Add or update entry
  addOrUpdateEntry(): void {
    if (this.currentView === 'bodyparts') {
      this.addOrUpdateBodyPart();
    } else if (this.currentView === 'categories') {
      this.addOrUpdateCategory();
    } else if (this.currentView === 'exercises') {
      this.addOrUpdateExercise();
    }
    this.closeModal();
  }

  addOrUpdateBodyPart(): void {
    if (this.newBodyPart.bodyPartId === 0) {
      this.genericService.create('bodyparts', this.newBodyPart).subscribe(
        () => {
          this.loadBodyParts();
          this.resetForm();
          this.snackBar.open('Body Part created successfully!', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          });
        },
        (error) => {
          console.error('Error creating Body Part:', error);
          this.snackBar.open('Failed to create Body Part.', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['danger-snackbar'],
          });
        }
      );
    } else {
      this.genericService
        .updatebyid('bodyparts', this.newBodyPart.bodyPartId, this.newBodyPart)
        .subscribe(
          () => {
            this.loadBodyParts();
            this.resetForm();
            this.snackBar.open('Body Part updated successfully!', 'Close', {
              duration: 3000,
            });
          },
          (error) => {
            console.error('Error updating Body Part:', error);
            this.snackBar.open('Failed to update Body Part.', 'Close', {
              duration: 3000,
            });
          }
        );
    }
  }

  addOrUpdateCategory(): void {
    if (this.newCategory.categoryId === 0) {
      this.genericService.create('categories', this.newCategory).subscribe(
        () => {
          this.loadCategories();
          this.resetForm();
          this.snackBar.open('Category created successfully!', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          });
        },
        (error) => {
          console.error('Error creating Category:', error);
          this.snackBar.open('Failed to create Category.', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['danger-snackbar'],
          });
        }
      );
    } else {
      this.genericService
        .updatebyid('categories', this.newCategory.categoryId, this.newCategory)
        .subscribe(
          () => {
            this.loadCategories();
            this.resetForm();
            this.snackBar.open('Category updated successfully!', 'Close', {
              duration: 1500,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['success-snackbar'],
            });
          },
          (error) => {
            console.error('Error updating Category:', error);
            this.snackBar.open('Failed to update Category.', 'Close', {
              duration: 1500,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['danger-snackbar'],
            });
          }
        );
    }
  }

  addOrUpdateExercise(): void {
    const formData = new FormData();
    formData.append('exerciseId', this.newExercise.exerciseId.toString());
    formData.append('exerciseName', this.newExercise.exerciseName);
    formData.append('instructions', this.newExercise.instructions);
    formData.append('bodyPartId', this.newExercise.bodyPartId.toString());
    formData.append('categoryId', this.newExercise.categoryId.toString());
    if (this.newExercise.thumbnail) {
      formData.append(
        'thumbnail',
        new Blob([this.newExercise.thumbnail], { type: 'image/*' }),
        this.fileName
      );
    }

    if (this.newExercise.exerciseId === 0) {
      this.genericService.createWithFile('exercises', formData).subscribe(
        () => {
          this.loadExercises();
          this.resetForm();
          this.snackBar.open('Exercise created successfully!', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          });
        },
        (error) => {
          console.error('Error creating Exercise:', error);
          this.snackBar.open('Failed to create Exercise.', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['danger-snackbar'],
          });
        }
      );
    } else {
      this.genericService
        .updatebyid('exercises', this.newExercise.exerciseId, formData)
        .subscribe(
          () => {
            this.loadExercises();
            this.resetForm();
            this.snackBar.open('Exercise updated successfully!', 'Close', {
              duration: 1500,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['success-snackbar'],
            });
          },
          (error) => {
            console.error('Error updating Exercise:', error);
            this.snackBar.open('Failed to update Exercise.', 'Close', {
              duration: 1500,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['danger-snackbar'],
            });
          }
        );
    }
  }

  // Delete methods
  deleteBodyPart(id: number): void {
    this.genericService.deletebyid('bodyparts', id).subscribe(
      () => {
        this.loadBodyParts();
        this.snackBar.open('Body Part deleted successfully!', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar'],
        });
      },
      (error) => {
        console.error('Error deleting Body Part:', error);
        this.snackBar.open('Failed to delete Body Part.', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['danger-snackbar'],
        });
      }
    );
  }

  deleteCategory(id: number): void {
    this.genericService.deletebyid('categories', id).subscribe(
      () => {
        this.loadCategories();
        this.snackBar.open('Category deleted successfully!', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar'],
        });
      },
      (error) => {
        console.error('Error deleting Category:', error);
        this.snackBar.open('Failed to delete Category.', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['danger-snackbar'],
        });
      }
    );
  }

  deleteExercise(id: number): void {
    this.genericService.deletebyid('exercises', id).subscribe(
      () => {
        this.loadExercises();
        this.snackBar.open('Exercise deleted successfully!', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['success-snackbar'],
        });
      },
      (error) => {
        console.error('Error deleting Exercise:', error);
        this.snackBar.open('Failed to delete Exercise.', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['danger-snackbar'],
        });
      }
    );
  }

  // Edit methods
  editBodyPart(bodyPart: BodyPart): void {
    this.newBodyPart = { ...bodyPart }; // Clone object to avoid reference issues
    this.openModal();
  }

  editCategory(category: Category): void {
    this.newCategory = { ...category };
    this.openModal();
  }

  editExercise(exercise: Exercise): void {
    this.newExercise = { ...exercise };
    this.openModal();
  }

  // Reset form
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
      thumbnail: new Uint8Array(),
    };
    this.imagePreview = null; // Clear thumbnail preview
  }

  // Modal controls
  openModal(): void {
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  // Get display names for IDs
  getBodyPartName(id: number): string {
    const part = this.bodyParts.find((p) => p.bodyPartId === id);
    return part ? part.bodyPartName : 'Unknown';
  }

  getCategoryName(id: number): string {
    const category = this.categories.find((c) => c.categoryId === id);
    return category ? category.categoryName : 'Unknown';
  }

  // Handle file input for thumbnail
  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, and GIF files are allowed.');
        return;
      }

      // Generate a Base64 preview for the image/GIF
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result; // Set the Base64 preview

        // Convert the file to a Uint8Array
        const arrayBuffer = e.target.result as ArrayBuffer;
        this.newExercise.thumbnail = new Uint8Array(arrayBuffer);
      };
      reader.readAsArrayBuffer(file);

      // Store the file name
      this.fileName = file.name;
    }
  }
}
