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

  workoutName: string = '';
  description: string = '';

  exercises: Exercise[] = [];
  selectedExercises: Exercise[] = [];
  isExerciseModalOpen = false;
  isLoading = false;

  searchTerm: string = '';

  constructor(
    private genericService: GenericService<any>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  get filteredExercises(): Exercise[] {
    if (!this.searchTerm) return this.exercises;

    return this.exercises.filter(
      (exercise) =>
        exercise.exerciseName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        (exercise.categoryId &&
          String(exercise.categoryId)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()))
    );
  }

  loadExercises(): void {
    this.isLoading = true;

    // Fetch exercises using GenericService
    this.genericService.getAll('exercises').subscribe(
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

  openExerciseModal(): void {
    this.isExerciseModalOpen = true;
  }

  closeExerciseModal(): void {
    this.isExerciseModalOpen = false;
  }

  toggleExerciseSelection(exercise: Exercise): void {
    const index = this.selectedExercises.findIndex(
      (e) => e.exerciseId === exercise.exerciseId
    );

    if (index !== -1) {
      this.selectedExercises.splice(index, 1);
    } else {
      if (this.selectedExercises.length < 10) {
        this.selectedExercises.push(exercise);
      } else {
        alert('Maximum 10 exercises per workout.');
      }
    }
  }

  confirmExerciseSelection(): void {
    this.workoutExercises = this.selectedExercises.map((exercise) => ({
      workoutExercise: {
        id: 0, // Placeholder, will be updated after workout creation
        workoutId: 0, // Placeholder, will be updated after workout creation
        exerciseId: exercise.exerciseId, // Access exerciseId from Exercise
        sets: [
          {
            id: 0, // Placeholder, will be updated after workout creation
            workoutexerciseId: 0, // Placeholder, will be updated after workout creation
            reps: 10, // Default reps
            weight: 20, // Default weight
            weightUnit: 'kg', // Default weight unit
          },
        ],
      },
      exercise: exercise, // Include the full Exercise object
    }));
    this.closeExerciseModal();
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    this.workoutExercises[exerciseIndex].workoutExercise.sets.splice(
      setIndex,
      1
    );
  }

  addSet(exerciseIndex: number): void {
    this.workoutExercises[exerciseIndex].workoutExercise.sets.push({
      id: 0, // Placeholder
      workoutexerciseId: 0, // Placeholder
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
    imgElement.src = 'assets/default-thumbnail.jpg'; // Fallback image
    console.warn('Failed to load thumbnail, using default image');
  }

  saveWorkout(): void {
    if (!this.workoutName.trim()) {
      alert('Workout name is required.');
      return;
    }

    if (this.workoutExercises.length === 0) {
      alert('Please add at least one exercise to the workout.');
      return;
    }

    if (
      this.workoutExercises.some(
        (item) =>
          item.workoutExercise.sets.length === 0 ||
          item.workoutExercise.sets.some(
            (set) => set.reps <= 0 || set.weight < 0
          )
      )
    ) {
      alert(
        'Each exercise must have at least one valid set (reps > 0, weight >= 0).'
      );
      return;
    }

    this.isLoading = true;

    // Step 1: Insert the workout into the database
    const workoutPayload = {
      workoutName: this.workoutName,
      description: this.description || null,
    };

    this.genericService.create('workouts', workoutPayload).subscribe(
      (workout: Workout) => {
        const workoutId = workout.workoutId;

        // Step 2: Insert workout exercises into the database
        const workoutExercisesPayload = this.workoutExercises.map((item) => ({
          workoutId: workoutId,
          exerciseId: item.workoutExercise.exerciseId,
          sets: item.workoutExercise.sets,
        }));

        this.genericService
          .create('workout_exercises', workoutExercisesPayload)
          .subscribe(
            () => {
              console.log('Workout and exercises created successfully.');
              this.isLoading = false;
              this.close.emit(); // Close the modal
            },
            (error) => {
              console.error('Error creating workout exercises:', error);
              alert('Failed to add exercises to workout.');
              this.isLoading = false;
            }
          );
      },
      (error) => {
        console.error('Error creating workout:', error);
        alert('Failed to create workout.');
        this.isLoading = false;
      }
    );
  }
}
