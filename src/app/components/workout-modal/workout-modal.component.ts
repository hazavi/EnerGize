import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Workout } from '../../models/workout';
import { WorkoutExercise } from '../../models/workoutexercise';
import { Exercise } from '../../models/exercise';
import { GenericService } from '../../service/generic.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-workout-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './workout-modal.component.html',
  styleUrl: './workout-modal.component.css',
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

  constructor(private exerciseService: GenericService<Exercise>) {}

  ngOnInit(): void {
    this.loadExercises();
  }

  loadExercises(): void {
    this.isLoading = true;
    this.exerciseService.getAll('exercises').subscribe(
      (data) => {
        this.exercises = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading exercises:', error);
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
      sets: [{ reps: 0, kg: 0 }], // Each exercise starts with 1 empty set
      exercise: exercise,
    }));

    this.closeExerciseModal();
  }

  addSet(exerciseIndex: number): void {
    this.workoutExercises[exerciseIndex].sets.push({ reps: 0, kg: 0 });
  }

  removeSet(exerciseIndex: number, setIndex: number): void {
    this.workoutExercises[exerciseIndex].sets.splice(setIndex, 1);
  }

  onSave(): void {
    if (!this.workoutName.trim()) {
      alert('Workout name is required.');
      return;
    }

    const newWorkout: Workout = {
      workoutId: Date.now(),
      workoutName: this.workoutName,
      description: this.description,
      workoutExercises: this.workoutExercises,
      menuOpen: false, // Default value for menuOpen
    };

    this.save.emit(newWorkout);
    this.onClose();
  }

  onClose(): void {
    this.workoutName = '';
    this.description = '';
    this.workoutExercises = [];
    this.close.emit();
  }
}
