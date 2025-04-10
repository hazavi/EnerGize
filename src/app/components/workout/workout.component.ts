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
  templates: Template[] = []; // List of templates
  workoutsMap: { [templateId: number]: Workout[] } = {}; // Map template ID to its workouts
  menuOpenMap: { [key: number]: boolean } = {}; // Map template/workout ID to its menu open state
  isLoading: boolean = false;

  isWorkoutModalOpen = false;
  selectedTemplate: Template | null = null;
  selectedWorkout: Workout | null = null;

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  constructor(private genericService: GenericService<any>) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  private loadTemplates(): void {
    this.isLoading = true;
    this.genericService.getAll('templates').subscribe(
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
      .getAll(`workouts?templateId=eq.${templateId}`)
      .subscribe(
        (workouts: Workout[]) => {
          this.workoutsMap[templateId] = workouts;
        },
        (error) => {
          console.error('Error loading workouts:', error);
        }
      );
  }
  toggleMenu(templateId: number): void {
    // Toggle the menu open state for the given template ID
    this.menuOpenMap[templateId] = !this.menuOpenMap[templateId];
  }
  toggleCollapse(template: Template): void {
    this.menuOpenMap[template.id] = !this.menuOpenMap[template.id];
  }

  toggleWorkoutMenu(workoutId: number): void {
    this.menuOpenMap[workoutId] = !this.menuOpenMap[workoutId];
  }

  renameWorkout(workout: Workout): void {
    const newName = prompt('Enter new workout name:', workout.workoutName);
    if (newName) {
      workout.workoutName = newName;
      this.genericService
        .updateById('workouts', workout.workoutId, workout)
        .subscribe(
          () => console.log('Workout renamed successfully'),
          (error) => console.error('Error renaming workout:', error)
        );
    }
  }

  addWorkout(template: Template): void {
    if (this.workoutsMap[template.id].length >= 10) {
      alert('You can only add up to 10 workouts per template.');
      return;
    }

    this.selectedTemplate = template;
    this.selectedWorkout = null; // New workout
    this.isWorkoutModalOpen = true;
  }

  deleteWorkout(template: Template, workoutId: number): void {
    this.genericService.deleteById('workouts', workoutId).subscribe(
      () => {
        this.workoutsMap[template.id] = this.workoutsMap[template.id].filter(
          (w) => w.workoutId !== workoutId
        );
      },
      (error) => {
        console.error('Error deleting workout:', error);
      }
    );
  }

  openWorkoutModal(template: Template, workout?: Workout): void {
    this.selectedTemplate = template;
    this.selectedWorkout = workout || null; // If editing, pass the workout; otherwise, create a new one
    this.isWorkoutModalOpen = true;
  }

  closeWorkoutModal(): void {
    this.isWorkoutModalOpen = false;
    this.selectedWorkout = null;
  }

  saveWorkout(newWorkout: Workout): void {
    if (!this.selectedTemplate) return;

    if (this.selectedWorkout) {
      // Update existing workout
      this.genericService
        .updateById('workouts', newWorkout.workoutId, newWorkout)
        .subscribe(
          (updatedWorkout: Workout) => {
            const workouts = this.workoutsMap[this.selectedTemplate!.id];
            const index = workouts.findIndex(
              (w) => w.workoutId === updatedWorkout.workoutId
            );
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
      this.genericService.create('workouts', newWorkout).subscribe(
        (workout: Workout) => {
          this.workoutsMap[this.selectedTemplate!.id].push(workout);
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

    const newTemplate: Template = {
      id: Date.now(),
      name: 'New Template',
      description: 'Template description',
      workoutId: 0, // Default workoutId
    };

    this.isLoading = true;
    this.genericService.create('templates', newTemplate).subscribe(
      (template: Template) => {
        this.templates.push(template);
        this.workoutsMap[template.id] = [];
        this.menuOpenMap[template.id] = false;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error creating template:', error);
        this.isLoading = false;
      }
    );
  }

  renameTemplate(template: Template): void {
    const newName = prompt('Enter new template name:', template.name);
    if (newName) {
      template.name = newName;
      this.genericService
        .updateById('templates', template.id, template)
        .subscribe();
    }
  }

  deleteTemplate(templateId: number): void {
    this.genericService.deleteById('templates', templateId).subscribe(
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

  @HostListener('document:click', ['$event'])
  closeAllMenus(event?: Event): void {
    Object.keys(this.menuOpenMap).forEach((key) => {
      this.menuOpenMap[+key] = false;
    });
  }
}
