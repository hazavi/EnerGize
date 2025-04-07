import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Workout } from '../../models/workout';
import { WorkoutExercise } from '../../models/workoutexercise';
import { Exercise } from '../../models/exercise';
import { GenericService } from '../../service/generic.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CreateWorkoutExercisePayload } from '../../models/workoutexercisepayload';

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

  workoutName: string = '';
  description: string = '';
  workoutExercises: WorkoutExercise[] = [];

  exercises: Exercise[] = [];
  selectedExercises: Exercise[] = [];
  isExerciseModalOpen = false;
  isLoading = false;

  searchTerm: string = '';

  constructor(
    private exerciseService: GenericService<Exercise>,
    private workoutService: GenericService<Workout>,
    private workoutExerciseService: GenericService<CreateWorkoutExercisePayload>,
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
        (exercise.category &&
          String(exercise.category)
            .toLowerCase()
            .includes(this.searchTerm.toLowerCase()))
    );
  }

  loadExercises(): void {
    this.isLoading = true;
    this.exerciseService.getAll('exercises').subscribe(
      (data) => {
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
      workoutId: 0, // Placeholder, will be updated after workout creation
      exerciseId: exercise.exerciseId,
      sets: [
        {
          setId: Date.now(), // Unique identifier for the set
          reps: 0, // Default value
          kg: 0, // Default value
        },
      ],
      exercise: exercise, // Ensure the exercise object is assigned here
    }));
    this.closeExerciseModal();
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    this.workoutExercises[exerciseIndex].sets.splice(setIndex, 1);
  }

  addSet(exerciseIndex: number): void {
    this.workoutExercises[exerciseIndex].sets.push({ reps: 0, kg: 0 });
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
        (we) =>
          we.sets.length === 0 ||
          we.sets.some((set) => set.reps <= 0 || set.kg < 0)
      )
    ) {
      alert(
        'Each exercise must have at least one valid set (reps > 0, kg >= 0).'
      );
      return;
    }

    this.isLoading = true;

    // Step 1: Create the workout
    const workoutPayload = {
      workoutName: this.workoutName,
      description: this.description || null,
      workoutExercises: this.workoutExercises.map((we) => ({
        exerciseId: we.exerciseId,
        sets: we.sets.map((set) => ({
          reps: set.reps,
          kg: set.kg,
        })),
      })),
    };

    console.log('Creating workout with exercises:', workoutPayload);

    this.workoutService
      .create2<typeof workoutPayload, Workout>('workouts', workoutPayload)
      .subscribe(
        (workoutResponse) => {
          console.log('Workout created successfully:', workoutResponse);

          // Step 2: Emit the saved workout and close the modal
          this.isLoading = false;
          this.close.emit();
        },
        (error) => {
          this.isLoading = false;
          console.error('Error creating workout:', error);
          alert(
            `Failed to create workout. Error: ${
              error.message || 'Unknown error'
            }`
          );
        }
      );
  }
}
