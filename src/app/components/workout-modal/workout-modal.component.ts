import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Workout } from '../../models/workout';
import { WorkoutExercise } from '../../models/workoutexercise';
import { Exercise } from '../../models/exercise';
import { GenericService } from '../../service/generic.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { WorkoutService } from '../../service/workout.service';

@Component({
  selector: 'app-workout-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './workout-modal.component.html',
  styleUrl: './workout-modal.component.css',
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
        style({ transform: 'translateY(-50px)', opacity: 0 }),
        animate(
          '300ms ease-out',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition(':leave', [
        animate(
          '300ms ease-in',
          style({ transform: 'translateY(-50px)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('fadeInAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 })),
      ]),
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
      workoutExerciseId: Date.now(),
      workoutId: 0,
      exerciseId: exercise.exerciseId,
      sets: [
        {
          setId: Date.now(),
          workoutId: 0,
          exerciseId: exercise.exerciseId,
          reps: 0,
          kg: 0,
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
    this.workoutExercises[exerciseIndex].sets.push({
      setId: Date.now(),
      reps: 0,
      kg: 0,
      workoutId: 0,
      exerciseId: 0,
    });
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

    // Construct the payload to match the backend's expected structure
    const payload: Workout = {
      workoutId: 0, // Assign a default or appropriate value for workoutId
      workoutName: this.workoutName,
      description: this.description || null,
      workoutExercises: this.workoutExercises.map((we) => ({
        workoutExerciseId: we.workoutExerciseId,
        workoutId: 0, // Ensure workoutId is included in each workoutExercise
        exerciseId: we.exerciseId,
        sets: we.sets.map((set) => ({
          setId: set.setId,
          workoutId: 0, // Ensure workoutId is included in each set
          exerciseId: set.exerciseId,
          reps: set.reps,
          kg: set.kg,
        })),
        exercise: we.exercise, // Include the exercise object if needed
      })),
    };

    console.log('Payload being sent to backend:', payload); // Debugging log

    // Call the backend API to save the workout
    this.workoutService.create('workouts', payload).subscribe(
      (response) => {
        console.log('Workout saved successfully:', response);
        this.close.emit(); // Close the modal
      },
      (error) => {
        console.error('Error saving workout:', error);
        alert('Failed to save workout. Please try again.');
      }
    );
  }
}
