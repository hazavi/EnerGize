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
  @Input() selectedWorkout: Workout | null = null;

  name: string = '';
  description: string = '';

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
            id: 0, // Placeholder
            workoutexercise_id: 0, // Placeholder
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
      id: 0, // Placeholder
      workoutexercise_id: 0, // Placeholder
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

    if (!this.selectedWorkout) {
      alert('No workout selected.');
      return;
    }

    this.isLoading = true;

    // Step 1: Insert the workout into the database
    const workoutPayload = {
      template_id: this.selectedWorkout.template_id,
      name: this.name,
      description: this.description || '',
      created_at: new Date(),
    };

    this.genericService.create('workout', workoutPayload).subscribe(
      (createdWorkout) => {
        console.log('Workout created successfully:', createdWorkout);

        // Step 2: Fetch the most recently created workout for the current template_id
        this.genericService
          .getAll(
            `workout?template_id=eq.${
              this.selectedWorkout?.template_id || ''
            }&order=created_at.desc&limit=1`
          )
          .subscribe(
            (workouts: Workout[]) => {
              if (workouts.length === 0) {
                console.error('Failed to fetch the created workout.');
                alert('Failed to retrieve the workout ID.');
                this.isLoading = false;
                return;
              }

              const workoutId = workouts[0].id;
              console.log('Fetched workout ID:', workoutId);

              // Step 3: Insert workout exercises into the database
              const workoutExercisesPayload = this.workoutExercises.map(
                (item) => ({
                  workout_id: workoutId,
                  exercise_id: item.workoutExercise.exercise_id,
                })
              );

              console.log(
                'Workout Exercises Payload:',
                JSON.stringify(workoutExercisesPayload, null, 2)
              );

              this.genericService
                .create('workoutexercise', workoutExercisesPayload)
                .subscribe(
                  async (createdWorkoutExercises: WorkoutExercise[]) => {
                    if (
                      !createdWorkoutExercises ||
                      createdWorkoutExercises.length === 0
                    ) {
                      console.error(
                        'Workout exercises creation failed: Invalid response',
                        createdWorkoutExercises
                      );
                      alert(
                        'Failed to create workout exercises. Please check the console for more details.'
                      );
                      this.isLoading = false;
                      return;
                    }

                    console.log(
                      'Workout exercises created successfully:',
                      createdWorkoutExercises
                    );

                    try {
                      await this.createAllSets(createdWorkoutExercises);
                      console.log('All sets created successfully.');
                      this.isLoading = false;
                      this.close.emit(); // Close the modal
                    } catch (error) {
                      console.error('Error creating sets:', error);
                      alert(
                        'Failed to create sets. Please check the console for more details.'
                      );
                      this.isLoading = false;
                    }
                  },
                  (error) => {
                    console.error('Error creating workout exercises:', error);
                    alert(
                      'Failed to add exercises to workout. Please check the console for more details.'
                    );
                    this.isLoading = false;
                  }
                );
            },
            (error) => {
              console.error('Error fetching workout ID:', error);
              alert(
                'Failed to retrieve the workout ID. Please check the console for more details.'
              );
              this.isLoading = false;
            }
          );
      },
      (error) => {
        console.error('Error creating workout:', error);
        alert(
          'Failed to create workout. Please check the console for more details.'
        );
        this.isLoading = false;

        // Debugging: Log the payload and error
        console.error('Workout Payload:', JSON.stringify(workoutPayload));
      }
    );
  }

  // Step 4: Insert sets into the database sequentially
  createSetsForWorkoutExercise(
    workoutExerciseId: number,
    sets: Set[]
  ): Promise<Set[]> {
    return new Promise((resolve, reject) => {
      const setsPayload = sets.map((set) => ({
        ...set,
        workoutexercise_id: workoutExerciseId, // Ensure the correct ID is used
      }));

      console.log(
        `Creating sets for WorkoutExercise ID ${workoutExerciseId}:`,
        setsPayload
      );

      this.genericService.create('set', setsPayload).subscribe(
        (createdSets: Set[]) => {
          if (!createdSets || createdSets.length === 0) {
            console.error(
              'Sets creation failed for WorkoutExercise ID:',
              workoutExerciseId
            );
            reject(new Error('Failed to create sets.'));
          } else {
            console.log(
              `Sets created successfully for WorkoutExercise ID ${workoutExerciseId}:`,
              createdSets
            );
            resolve(createdSets);
          }
        },
        (error) => {
          console.error(
            'Error creating sets for WorkoutExercise ID:',
            workoutExerciseId,
            error
          );
          reject(error);
        }
      );
    });
  }

  async createAllSets(
    createdWorkoutExercises: WorkoutExercise[]
  ): Promise<void> {
    for (let index = 0; index < createdWorkoutExercises.length; index++) {
      const createdWorkoutExercise = createdWorkoutExercises[index];
      const sets = this.setsMap[index] || [];

      if (sets.length === 0) {
        console.warn(`No sets found for exercise index ${index}. Skipping.`);
        continue;
      }

      // Update workoutexercise_id in sets before creating them
      const updatedSets = sets.map((set) => ({
        ...set,
        workoutexercise_id: createdWorkoutExercise.id, // Link to the correct WorkoutExercise ID
      }));

      try {
        const createdSets = await this.createSetsForWorkoutExercise(
          createdWorkoutExercise.id,
          updatedSets
        );

        // Update the set_id field in the workout exercise
        if (createdSets && createdSets.length > 0) {
          const setId = createdSets[0].id; // Assuming the first set ID is sufficient
          await this.updateWorkoutExerciseSetId(
            createdWorkoutExercise.id,
            setId
          );
        }
      } catch (error) {
        console.error(
          `Failed to create sets for WorkoutExercise ID ${createdWorkoutExercise.id}:`,
          error
        );
        throw error; // Stop further execution if any set creation fails
      }
    }
  }

  updateWorkoutExerciseSetId(
    workoutExerciseId: number,
    setId: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const payload = { set_id: setId };

      this.genericService
        .updateById('workoutexercise', workoutExerciseId, payload) // Use updateById instead of update
        .subscribe(
          () => {
            console.log(
              `Updated WorkoutExercise ID ${workoutExerciseId} with Set ID ${setId}`
            );
            resolve();
          },
          (error: any) => {
            // Explicitly type the error parameter
            console.error(
              `Failed to update WorkoutExercise ID ${workoutExerciseId} with Set ID ${setId}:`,
              error
            );
            reject(error);
          }
        );
    });
  }
}
