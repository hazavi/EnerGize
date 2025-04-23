import {
  Component,
  OnInit,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { GenericService } from '../../service/generic.service'; // Generic Supabase service
import { Workout } from '../../models/workout';
import { Template } from '../../models/template'; // Template interface
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { WorkoutModalComponent } from '../workout-modal/workout-modal.component';
import { WorkoutExercise } from '../../models/workoutexercise';
import { Set } from '../../models/set';
import { LoginResponse } from '../../models/loginresponse';
import { Router } from '@angular/router';

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
  templates: Template[] = []; // List of templates
  workoutsMap: { [templateId: number]: Workout[] } = {}; // Map template ID to its workouts
  menuOpenMap: { [key: number]: boolean } = {}; // Map template/workout ID to its menu open state
  isLoading: boolean = false;

  isWorkoutModalOpen = false;
  selectedTemplate: Template | null = null;
  selectedWorkout: Workout | null = null;
  workoutExercises: any[] = [];
  setsMap: { [exerciseIndex: number]: Set[] } = {};

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  menuPositions: { [key: number]: { top: number; left: number } } = {};

  isRenameModalOpen: boolean = false; // Tracks if the rename modal is open
  renameTemplateName: string = ''; // Holds the new name for the template
  templateToRename: Template | null = null; // Tracks the template being renamed

  constructor(
    private genericService: GenericService<any>,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('loginResponse');
    if (user) {
      this.user = JSON.parse(user) as LoginResponse; // Parse and store the login response
    }

    if (!this.user) {
      console.error('User is not logged in.');
      return;
    }

    this.loadTemplates(); // Load templates after ensuring the user is set
  }

  private loadTemplates(): void {
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
          this.templates = templates;
          this.templates.forEach((template) => {
            this.workoutsMap[template.id] = []; // Initialize workouts for each template
            this.menuOpenMap[template.id] = false; // Initialize menu state for each template
          });
          this.isLoading = false;
        },
        (error) => {
          console.error('Error loading templates:', error);
          this.isLoading = false;
        }
      );
  }

  loadWorkouts(templateId: number): void {
    this.genericService
      .getAll(`workout?template_id=eq.${templateId}`)
      .subscribe(
        (workouts: Workout[]) => {
          this.workoutsMap[templateId] = workouts || []; // Ensure it's an empty array if no workouts are returned
        },
        (error) => {
          console.error('Error loading workouts:', error);
          this.workoutsMap[templateId] = []; // Initialize as an empty array if there's an error
        }
      );
  }
  toggleMenu(templateId: number, event: MouseEvent): void {
    // Prevent the event from propagating
    event.stopPropagation();

    // Toggle the menu state
    this.menuOpenMap[templateId] = !this.menuOpenMap[templateId];

    // Calculate and store the menu position if the menu is being opened
    if (this.menuOpenMap[templateId]) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.menuPositions[templateId] = {
        top: rect.bottom + window.scrollY, // Account for scrolling
        left: rect.left + window.scrollX,
      };
    } else {
      // Remove the position if the menu is being closed
      delete this.menuPositions[templateId];
    }
  }
  private readonly TEMPLATE_PREFIX = 'template_';

  toggleCollapse(template: Template): void {
    const key = this.getTemplateKey(template.id);
    this.menuOpenMap[key] = !this.menuOpenMap[key];

    // Load workouts when expanding a template
    if (this.menuOpenMap[key]) {
      this.loadWorkouts(template.id);
    }
  }

  isTemplateExpanded(templateId: number): boolean {
    return !!this.menuOpenMap[this.getTemplateKey(templateId)];
  }

  private getTemplateKey(templateId: number): number {
    // Using a simple math operation to create a distinct key space
    return templateId + 1000000; // This ensures we don't conflict with other IDs
  }

  toggleWorkoutMenu(workoutId: number, event: MouseEvent): void {
    // Prevent the event from propagating
    event.stopPropagation();

    // Toggle the menu state
    this.menuOpenMap[workoutId] = !this.menuOpenMap[workoutId];

    // Calculate and store the menu position if the menu is being opened
    if (this.menuOpenMap[workoutId]) {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      this.menuPositions[workoutId] = {
        top: rect.bottom + window.scrollY, // Account for scrolling
        left: rect.left + window.scrollX,
      };
    } else {
      // Remove the position if the menu is being closed
      delete this.menuPositions[workoutId];
    }
  }

  renameWorkout(workout: Workout): void {
    const newName = prompt('Enter new workout name:', workout.name);
    if (newName) {
      workout.name = newName;
      this.genericService.updateById('workout', workout.id, workout).subscribe(
        () => console.log('Workout renamed successfully'),
        (error) => console.error('Error renaming workout:', error)
      );
    }
  }

  addWorkout(template: Template): void {
    if (this.workoutsMap[template.id]?.length >= 10) {
      alert('You can only add up to 10 workouts per template.');
      return;
    }

    this.selectedTemplate = template;
    this.selectedWorkout = {
      id: 0, // Placeholder, will be set by the backend
      template_id: template.id, // Set the correct template ID
      name: '',
      description: '',
      created_at: new Date(), // Optional, remove if not required by the database schema
      exercises: [], // Initialize with an empty array
    };

    this.isWorkoutModalOpen = true;
  }

  deleteWorkout(template: Template, workoutId: number): void {
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

  openWorkoutModal(template: Template, workout?: Workout): void {
    this.selectedTemplate = template;
    this.selectedWorkout = workout || {
      id: 0,
      template_id: template.id,
      name: '',
      description: '',
      created_at: new Date(),
      exercises: [],
    };

    this.isWorkoutModalOpen = true;
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
      return;
    }

    if (this.selectedWorkout) {
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

  addTemplate(): void {
    if (this.templates.length >= 5) {
      alert('You can only create up to 5 templates.');
      return;
    }

    if (!this.user) {
      console.error('User is not logged in.');
      alert('Please log in to create a template.');
      window.location.href = '/login';
      return;
    }

    const newTemplate: Omit<Template, 'id'> = {
      name: 'New Template',
      description: 'Template description',
      workout_id: null, // Explicitly set to null
      user_uid: this.user.userId, // Use the logged-in user's ID
    };

    this.isLoading = true;
    this.genericService.create('template', newTemplate).subscribe(
      (template: Template) => {
        if (template && template.id) {
          // Add the new template to the list
          this.templates.push(template);

          // Initialize workoutsMap and menuOpenMap for the new template
          this.workoutsMap[template.id] = [];
          this.menuOpenMap[template.id] = false;
        } else {
          console.warn(
            'Template created but missing ID. Reloading templates...'
          );
          // Reload templates from the backend as a fallback
          this.loadTemplates();
        }

        this.isLoading = false;
      },
      (error) => {
        console.error('Error creating template:', error);
        alert('Failed to create template. Please try again.');
        this.isLoading = false;
      }
    );
  }

  addWorkoutToTemplate(template: Template): void {
    if (!template) {
      console.error('Template is null or undefined.');
      alert('Please select a valid template.');
      return;
    }

    if (this.workoutsMap[template.id]?.length >= 10) {
      alert('You can only add up to 10 workouts per template.');
      return;
    }

    // Create a new workout object with default values
    const newWorkout: Workout = {
      id: 0, // Set to null since it will be generated by the backend
      template_id: template.id, // Assign the template ID
      name: '', // Empty name to be filled in the modal
      description: '',
      created_at: new Date(),
      exercises: [], // Initialize with an empty array
    };

    // Set the selected template and workout, then open the modal
    this.selectedTemplate = template;
    this.selectedWorkout = newWorkout;
    this.isWorkoutModalOpen = true;
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
      id: Date.now(), // Temporary ID
      workout_id: workout.id,
      exercise_id: +exerciseId,
    };

    this.genericService.create('workoutexercise', newWorkoutExercise).subscribe(
      (workoutExercise: WorkoutExercise) => {
        if (!workout.exercises) workout.exercises = [];
        workout.exercises.push(workoutExercise);

        // Initialize sets for the new workout exercise
        const exerciseIndex = workout.exercises.length - 1;
        this.setsMap[exerciseIndex] = [
          {
            reps: 10, // Default reps
            weight: 20, // Default weight
            weightUnit: 'kg', // Default weight unit
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

  openRenameModal(template: Template): void {
    this.templateToRename = template;
    this.renameTemplateName = template.name; // Pre-fill the current name
    this.isRenameModalOpen = true;
  }

  closeRenameModal(): void {
    this.isRenameModalOpen = false;
    this.renameTemplateName = '';
    this.templateToRename = null;
  }

  saveRenameTemplate(): void {
    if (this.templateToRename && this.renameTemplateName.trim()) {
      const updatedTemplate = {
        name: this.renameTemplateName.trim(), // Only include the fields you want to update
        description: this.templateToRename.description, // Include other updatable fields if necessary
      };

      this.genericService
        .updateById('template', this.templateToRename.id, updatedTemplate)
        .subscribe(
          () => {
            console.log('Template renamed successfully');
            const templateToUpdate = this.templates.find(
              (t) => t.id === this.templateToRename?.id
            );
            if (templateToUpdate) {
              templateToUpdate.name = this.renameTemplateName.trim();
            }
            this.closeRenameModal(); // Close the modal after saving
          },
          (error) => {
            console.error('Error renaming template:', error);
            alert('Failed to rename template. Please try again.');
          }
        );
    }
  }

  renameTemplate(template: Template): void {
    this.openRenameModal(template); // Open the modal instead of using prompt
  }

  deleteTemplate(templateId: number): void {
    this.genericService.deleteById('template', templateId).subscribe(
      () => {
        this.templates = this.templates.filter((t) => t.id !== templateId);
        delete this.workoutsMap[templateId];
        delete this.menuOpenMap[templateId];
      },
      (error) => {
        console.error('Error deleting template:', error);
      }
    );
  }

  @HostListener('document:click')
  closeAllMenus(): void {
    Object.keys(this.menuOpenMap).forEach((key) => {
      this.menuOpenMap[parseInt(key)] = false;
    });
  }

  private ensureTemplateSelected(): boolean {
    if (!this.selectedTemplate) {
      console.error('No template selected.');
      alert('Please select a template first.');
      return false;
    }
    return true;
  }
}
