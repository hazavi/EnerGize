import {
  Component,
  OnInit,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { GenericService } from '../../service/generic.service';
import { Workout } from '../../models/workout';
import { Template } from '../../models/template';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { WorkoutModalComponent } from '../workout-modal/workout-modal.component';
import { WorkoutExercise } from '../../models/workoutexercise';
import type { Set } from '../../models/set';
import { LoginResponse } from '../../models/loginresponse';
import { Router } from '@angular/router';
import { Exercise } from '../../models/exercise';

@Component({
  selector: 'app-workout',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LoadingComponent,
    WorkoutModalComponent,
  ],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css'],
})
export class WorkoutComponent implements OnInit {
  user: LoginResponse | null = null;
  templates: Template[] = []; // List of templates (one per day)
  workoutsMap: { [templateId: number]: Workout[] } = {}; // Map template ID to its workouts
  menuOpenMap: { [key: number]: boolean } = {}; // Map workout ID to its menu open state
  isLoading: boolean = false;

  // Day templates
  weekDays: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  dayTemplateMap: { [day: string]: Template } = {};

  isWorkoutModalOpen = false;
  selectedTemplate: Template | null = null;
  selectedWorkout: Workout | null = null;
  workoutExercises: any[] = [];
  setsMap: { [exerciseIndex: number]: Set[] } = {};
  exercises: Exercise[] = [];

  menuPositions: { [key: number]: { top: number; left: number } } = {};

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  zoomedDay: string | null = null;

  constructor(
    private genericService: GenericService<any>,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('loginResponse');
    if (user) {
      this.user = JSON.parse(user) as LoginResponse;
    }

    if (!this.user) {
      console.error('User is not logged in.');
      this.router.navigate(['/login']);
      return;
    }

    this.loadDayTemplates();
  }

  private loadDayTemplates(): void {
    if (!this.user) {
      console.error('User is not logged in.');
      return;
    }

    this.isLoading = true;

    // Filter templates by user_uid
    this.genericService
      .getAll(`template?user_uid=eq.${this.user.userId}`)
      .subscribe(
        (templates: Template[]) => {
          // Check if we already have templates for each day
          const existingDays = new Set(templates.map((t) => t.name));

          // Create templates for missing days
          const templatesToCreate = this.weekDays.filter(
            (day) => !existingDays.has(day)
          );

          if (templatesToCreate.length > 0) {
            this.createDayTemplates(templatesToCreate, templates);
          } else {
            this.setupTemplates(templates);
          }
        },
        (error) => {
          console.error('Error loading templates:', error);
          this.isLoading = false;
        }
      );
  }

  private createDayTemplates(
    daysToCreate: string[],
    existingTemplates: Template[]
  ): void {
    // Create all day templates that don't exist yet
    const promises: Promise<Template>[] = daysToCreate.map((day) => {
      return new Promise((resolve, reject) => {
        const newTemplate: Omit<Template, 'id'> = {
          name: day,
          description: `${day} workout plan`,
          workout_id: null,
          user_uid: this.user!.userId,
        };

        this.genericService.create('template', newTemplate).subscribe(
          (template: Template) => resolve(template),
          (error) => reject(error)
        );
      });
    });

    // Wait for all templates to be created
    Promise.all(promises)
      .then((newTemplates) => {
        const allTemplates = [...existingTemplates, ...newTemplates];
        this.setupTemplates(allTemplates);
      })
      .catch((error) => {
        console.error('Error creating day templates:', error);
        this.isLoading = false;
      });
  }

  private setupTemplates(templates: Template[]): void {
    // Setup the templates sorted by day order
    this.templates = [];

    // Map each day to its template
    this.weekDays.forEach((day) => {
      const template = templates.find((t) => t.name === day);
      if (template) {
        this.templates.push(template);
        this.dayTemplateMap[day] = template;
        this.workoutsMap[template.id] = []; // Initialize workouts array
        this.loadWorkouts(template.id); // Load workouts for this day
      }
    });

    this.isLoading = false;
  }

  loadWorkouts(templateId: number): void {
    this.genericService
      .getAll(`workout?template_id=eq.${templateId}`)
      .subscribe(
        (workouts: Workout[]) => {
          this.workoutsMap[templateId] = workouts || [];
        },
        (error) => {
          console.error('Error loading workouts:', error);
          this.workoutsMap[templateId] = [];
        }
      );
  }

  getWorkoutsForDay(day: string): Workout[] {
    const template = this.dayTemplateMap[day];
    return template ? this.workoutsMap[template.id] || [] : [];
  }

  getDayTemplate(day: string): Template {
    return this.dayTemplateMap[day];
  }

  isToday(day: string): boolean {
    const today = new Date().getDay();
    // Convert from JS day (0=Sunday) to our format (0=Monday)
    const dayIndex = (today + 6) % 7;
    return this.weekDays[dayIndex] === day;
  }

  toggleWorkoutMenu(workoutId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpenMap[workoutId] = !this.menuOpenMap[workoutId];

    if (this.menuOpenMap[workoutId]) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.menuPositions[workoutId] = {
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      };
    } else {
      delete this.menuPositions[workoutId];
    }
  }

  renameWorkout(workout: Workout): void {
    const newName = prompt('Enter new workout name:', workout.name);
    if (newName && newName.trim()) {
      workout.name = newName.trim();
      this.genericService.updateById('workout', workout.id, workout).subscribe(
        () => console.log('Workout renamed successfully'),
        (error) => console.error('Error renaming workout:', error)
      );
    }
  }

  addWorkout(template: Template): void {
    if (!template) {
      alert('Template not found.');
      return;
    }

    if (this.workoutsMap[template.id]?.length >= 10) {
      alert('You can only add up to 10 workouts per day.');
      return;
    }

    this.selectedTemplate = template;
    this.selectedWorkout = {
      id: 0,
      template_id: template.id,
      name: '',
      description: '',
      created_at: new Date(),
      exercises: [],
    };

    this.isWorkoutModalOpen = true;
  }

  deleteWorkout(template: Template, workoutId: number): void {
    if (!template) {
      console.error('Template not found.');
      return;
    }

    if (confirm('Are you sure you want to delete this workout?')) {
      this.genericService.deleteById('workout', workoutId).subscribe(
        () => {
          this.workoutsMap[template.id] = this.workoutsMap[template.id].filter(
            (w) => w.id !== workoutId
          );
        },
        (error) => {
          console.error('Error deleting workout:', error);
        }
      );
    }
  }

  closeWorkoutModal(): void {
    this.isWorkoutModalOpen = false;
    this.selectedWorkout = null;
  }

  saveWorkout(newWorkout: Workout): void {
    if (!this.selectedTemplate) {
      console.error('No template selected.');
      alert('Please select a template before saving a workout.');
      return;
    }

    if (!this.user) {
      console.error('User is not logged in.');
      alert('Please log in to save a workout.');
      this.router.navigate(['/login']);
      return;
    }

    if (this.selectedWorkout && this.selectedWorkout.id) {
      // Update existing workout
      this.genericService
        .updateById('workout', newWorkout.id, newWorkout)
        .subscribe(
          (updatedWorkout: Workout) => {
            const workouts = this.selectedTemplate
              ? this.workoutsMap[this.selectedTemplate.id]
              : [];
            const index = workouts.findIndex((w) => w.id === updatedWorkout.id);
            if (index !== -1) {
              workouts[index] = updatedWorkout;
            }
            this.isWorkoutModalOpen = false;
          },
          (error) => {
            console.error('Error updating workout:', error);
            alert('Failed to update workout. Please try again.');
          }
        );
    } else {
      // Create new workout
      this.genericService.create('workout', newWorkout).subscribe(
        (workout: Workout) => {
          if (this.selectedTemplate) {
            this.workoutsMap[this.selectedTemplate.id].push(workout);
          }
          this.isWorkoutModalOpen = false;
        },
        (error) => {
          console.error('Error creating workout:', error);
          alert('Failed to create workout. Please try again.');
        }
      );
    }
  }

  addExerciseToWorkout(workout: Workout): void {
    if (!workout) return;

    if (workout.exercises && workout.exercises.length >= 10) {
      alert('You can only add up to 10 exercises per workout.');
      return;
    }

    const exerciseId = prompt('Enter exercise ID:');
    if (!exerciseId) return;

    const newWorkoutExercise: WorkoutExercise = {
      id: Date.now(),
      workout_id: workout.id,
      exercise_id: +exerciseId,
    };

    this.genericService.create('workoutexercise', newWorkoutExercise).subscribe(
      (workoutExercise: WorkoutExercise) => {
        if (!workout.exercises) workout.exercises = [];
        workout.exercises.push(workoutExercise);

        const exerciseIndex = workout.exercises.length - 1;
        this.setsMap[exerciseIndex] = [
          {
            reps: 10,
            weight: 20,
            weightUnit: 'kg',
          },
        ];

        console.log('Exercise added successfully:', workoutExercise);
      },
      (error) => {
        console.error('Error adding exercise:', error);
        alert('Failed to add exercise. Please try again.');
      }
    );
  }

  openDayZoom(day: string): void {
    this.zoomedDay = day;
    // Prevent body scrolling when zoom is open
    document.body.style.overflow = 'hidden';
  }

  closeDayZoom(): void {
    this.zoomedDay = null;
    // Re-enable body scrolling
    document.body.style.overflow = 'auto';
  }

  @HostListener('document:click')
  closeAllMenus(): void {
    Object.keys(this.menuOpenMap).forEach((key) => {
      this.menuOpenMap[parseInt(key)] = false;
    });
  }

  // Add this helper method to your component class
  getExerciseName(id: number): string {
    const exercise = this.exercises.find((p) => p.id === id);
    return exercise ? exercise.name : 'Unknown';
  }
}
