import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GenericService } from '../../service/generic.service';
import { Template } from '../../models/template';
import { Exercise } from '../../models/exercise';
import { Set } from '../../models/set';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { Category } from '../../models/category';
import { BodyPart } from '../../models/bodypart';
import { TemplateExercise } from '../../models/templateexercise';

@Component({
  selector: 'app-exercise-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exercise-modal.component.html',
  styleUrls: ['./exercise-modal.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
    trigger('slideAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms', style({ transform: 'translateY(20px)', opacity: 0 })),
      ]),
    ]),
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms 150ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ExerciseModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<TemplateExercise[]>();
  @Input() selectedTemplate: Template | null = null;
  @Input() templateExercises: {
    templateExercise: TemplateExercise;
    exercise: Exercise;
  }[] = [];

  exercises: Exercise[] = [];
  selectedExercises: Exercise[] = [];
  isExerciseModalOpen = false;
  isLoading = false;

  searchTerm: string = '';

  setsMap: { [exerciseIndex: number]: Set[] } = {};
  categories: Category[] = [];
  bodyParts: BodyPart[] = [];

  isEditing: boolean = false;

  constructor(
    private genericService: GenericService<any>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadExercises();
    this.loadCategories();
    this.loadBodyParts();
  }

  get filteredExercises(): Exercise[] {
    if (!this.searchTerm) return this.exercises;

    return this.exercises.filter(
      (exercise) =>
        exercise.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (exercise.id &&
          String(exercise.id)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()))
    );
  }

  loadExercises(): void {
    this.isLoading = true;

    this.genericService.getAll('exercise').subscribe(
      (data: Exercise[]) => {
        this.exercises = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching exercises:', error);
        this.isLoading = false;
      }
    );
  }

  loadBodyParts(): void {
    this.genericService.getAll('bodypart').subscribe(
      (data) => {
        this.bodyParts = data;
      },
      (error) => {
        console.error('Error fetching body parts:', error);
      }
    );
  }

  loadCategories(): void {
    this.genericService.getAll('category').subscribe(
      (data) => {
        this.categories = data;
      },
      (error) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  openExerciseModal(): void {
    this.isExerciseModalOpen = true;
  }

  closeExerciseModal(): void {
    this.isExerciseModalOpen = false;
  }

  toggleExerciseSelection(exercise: Exercise): void {
    const index = this.selectedExercises.findIndex((e) => e.id === exercise.id);

    if (index !== -1) {
      // If already selected, remove from selection
      this.selectedExercises.splice(index, 1);
    } else {
      // If not selected, add to selection (with a maximum limit)
      if (this.selectedExercises.length < 10) {
        this.selectedExercises.push(exercise);
      } else {
        alert('A template cannot have more than 10 exercises.');
      }
    }
  }

  confirmExerciseSelection(): void {
    this.templateExercises = this.selectedExercises.map((exercise) => ({
      templateExercise: {
        id: 0, // Placeholder ID
        template_id: this.selectedTemplate?.id || 0,
        exercise_id: exercise.id,
      },
      exercise: exercise,
    }));

    // Initialize setsMap for each exercise
    this.templateExercises.forEach((_, index) => {
      if (!this.setsMap[index]) {
        this.setsMap[index] = [
          {
            reps: 10, // Default reps
            weight: 20, // Default weight
            weightUnit: 'kg', // Default weight unit
          },
        ];
      }
    });

    this.closeExerciseModal();
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    if (this.setsMap[exerciseIndex]) {
      this.setsMap[exerciseIndex].splice(setIndex, 1);
    }
  }

  addSet(exerciseIndex: number): void {
    if (!this.setsMap[exerciseIndex]) {
      this.setsMap[exerciseIndex] = [];
    }

    this.setsMap[exerciseIndex].push({
      reps: 10, // Default reps
      weight: 20, // Default weight
      weightUnit: 'kg', // Default weight unit
    });
  }

  toggleWeightUnit(set: Set): void {
    set.weightUnit = set.weightUnit === 'kg' ? 'lbs' : 'kg';
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = './assets/dumbbell.png'; // Fallback to default image
  }

  getThumbnail(thumbnail: string | null): string {
    if (!thumbnail) {
      return './assets/dumbbell.png'; // Fallback to default image
    }

    // Check if the thumbnail already includes the data URL prefix
    if (thumbnail.startsWith('data:image/')) {
      return thumbnail; // Return as-is if it's already a valid data URL
    }

    // Otherwise, prepend the correct MIME type for GIF
    return `data:image/gif;base64,${thumbnail}`;
  }

  saveExercises(): void {
    if (!this.selectedTemplate) {
      alert('No template selected.');
      return;
    }

    if (this.templateExercises.length === 0) {
      alert('Please add at least one exercise to the template.');
      return;
    }

    this.isLoading = true;

    // Prepare template exercise data with sets
    const templateExercisesData: TemplateExercise[] =
      this.templateExercises.map((item, index) => ({
        id: item.templateExercise.id,
        template_id: this.selectedTemplate?.id || 0,
        exercise_id: item.exercise.id,
        sets: this.setsMap[index] || [],
      }));

    // If editing existing exercise
    if (this.isEditing && templateExercisesData[0].id > 0) {
      // Update the existing exercise
      this.genericService
        .updateById(
          'templateexercise',
          templateExercisesData[0].id,
          templateExercisesData[0]
        )
        .subscribe(
          () => {
            this.isLoading = false;
            this.save.emit(templateExercisesData);
            this.close.emit();
            this.isEditing = false;
          },
          (error) => {
            console.error('Error updating template exercise:', error);
            this.isLoading = false;
            alert('Failed to update exercise. Please try again.');
          }
        );
    } else {
      // Create new exercises
      this.save.emit(templateExercisesData);
      this.close.emit();
    }
  }

  getCategoryName(id: number): string {
    const category = this.categories.find((c) => c.id === id);
    return category ? category.name : 'Unknown';
  }

  getBodyPartName(id: number): string {
    const part = this.bodyParts.find((p) => p.id === id);
    return part ? part.name : 'Unknown';
  }
}
