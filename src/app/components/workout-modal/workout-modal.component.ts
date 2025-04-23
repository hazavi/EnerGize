import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GenericService } from '../../service/generic.service'; // Import GenericService
import { Workout } from '../../models/workout';
import { WorkoutExercise } from '../../models/workoutexercise';
import { Exercise } from '../../models/exercise';
import { Set } from '../../models/set';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Category } from '../../models/category';
import { BodyPart } from '../../models/bodypart';

@Component({
  selector: 'app-workout-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './workout-modal.component.html',
  styleUrls: ['./workout-modal.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class WorkoutModalComponent {
  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<Workout>();
  @Input() workoutExercises: {
    workoutExercise: WorkoutExercise;
    exercise: Exercise;
  }[] = [];
  @Input() selectedWorkout: Workout | null = null;

  name: string = '';
  description: string = '';
  categories: Category[] = [];
  bodyParts: BodyPart[] = [];

  exercises: Exercise[] = [];
  selectedExercises: Exercise[] = [];
  isExerciseModalOpen = false;
  isLoading = false;

  searchTerm: string = '';

  setsMap: { [exerciseIndex: number]: Set[] } = {};

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
        exercise.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (exercise.id &&
          String(exercise.id)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()))
    );
  }

  loadExercises(): void {
    this.isLoading = true;

    // Fetch exercises using GenericService
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
    this.isLoading = true;
    this.genericService.getAll('bodypart').subscribe(
      (data) => {
        this.bodyParts = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching body parts:', error);
        this.isLoading = false;
      }
    );
  }
  loadCategories(): void {
    this.isLoading = true;
    this.genericService.getAll('category').subscribe(
      (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
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
      this.selectedExercises.splice(index, 1);
    } else {
      if (this.selectedExercises.length < 10) {
        this.selectedExercises.push(exercise);
      } else {
        alert('A workout cannot have more than 10 exercises.');
      }
    }
  }

  confirmExerciseSelection(): void {
    this.workoutExercises = this.selectedExercises.map((exercise) => ({
      workoutExercise: {
        id: 0, // Placeholder, will be updated after workout creation
        workout_id: 0, // Placeholder, will be updated after workout creation
        exercise_id: exercise.id, // Use `exercise_id` as per the interface
      },
      exercise: exercise, // Include the full Exercise object
    }));

    // Initialize setsMap for each exercise
    this.workoutExercises.forEach((_, index) => {
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

  saveWorkout(): void {
    if (!this.name.trim()) {
      alert('Workout name is required.');
      return;
    }

    if (this.workoutExercises.length === 0) {
      alert('Please add at least one exercise to the workout.');
      return;
    }

    if (this.workoutExercises.length > 10) {
      alert('A workout cannot have more than 10 exercises.');
      return;
    }

    this.isLoading = true;

    const workoutPayload = {
      template_id: this.selectedWorkout?.template_id,
      name: this.name,
      description: this.description || '',
      created_at: new Date().toISOString(), // Ensure ISO 8601 format
    };

    console.log(
      'Creating workout with payload:',
      JSON.stringify(workoutPayload, null, 2)
    );

    this.genericService.create('workout', workoutPayload).subscribe(
      (createdWorkout) => {
        console.log('Workout created successfully:', createdWorkout);

        if (!Array.isArray(createdWorkout) || createdWorkout.length === 0) {
          console.error(
            'Server returned invalid response for created workout.'
          );
          alert(
            'Failed to create workout. Please check the console for more details.'
          );
          this.isLoading = false;
          return;
        }

        const workoutId = createdWorkout[0].id;

        this.createWorkoutExercises(workoutId)
          .then(() => {
            console.log('All workout exercises created successfully.');
            this.isLoading = false;
            this.close.emit(); // Close the modal

            // Reload the page after successful creation
            window.location.reload();
          })
          .catch((error) => {
            console.error('Error creating workout exercises:', error);
            alert(
              'Failed to add exercises to workout. Please check the console for more details.'
            );
            this.isLoading = false;
          });
      },
      (error) => {
        console.error('Error creating workout:', error);
        alert(
          'Failed to create workout. Please check the console for more details.'
        );
        this.isLoading = false;
      }
    );
  }

  private async createWorkoutExercises(workoutId: number): Promise<void> {
    for (let index = 0; index < this.workoutExercises.length; index++) {
      const item = this.workoutExercises[index];
      const sets = this.setsMap[index] || [];

      // Ensure sets are properly serialized as a JSON array
      const workoutExercisePayload = {
        workout_id: workoutId,
        exercise_id: item.workoutExercise.exercise_id,
        sets: sets, // Send as JSON array (or use JSON.stringify if needed)
      };

      console.log(
        `Creating workout exercise for exercise ID ${item.workoutExercise.exercise_id}:`,
        JSON.stringify(workoutExercisePayload, null, 2)
      );

      try {
        const createdWorkoutExercise = await this.genericService
          .create('workoutexercise', workoutExercisePayload)
          .toPromise();

        console.log(
          `Workout exercise created successfully for exercise ID ${item.workoutExercise.exercise_id}:`,
          createdWorkoutExercise
        );
      } catch (error) {
        console.error(
          `Error creating workout exercise for exercise ID ${item.workoutExercise.exercise_id}:`,
          error
        );
        if (error instanceof Error && 'error' in error) {
          console.error('Server response:', error.error);
        }
        throw error; // Stop further execution if any creation fails
      }
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
