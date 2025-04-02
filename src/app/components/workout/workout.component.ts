import {
  Component,
  OnInit,
  HostListener,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { WorkoutTemplateService } from '../../service/workouttemplates.service';
import { WorkoutService } from '../../service/workout.service';
import { Workout } from '../../models/workout';
import { WorkoutTemplate } from '../../models/workouttemplate';
import { WorkoutExercise } from '../../models/workoutexercise';
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
    WorkoutModalComponent, // Keep this as WorkoutModal now handles the exercise functionality
  ],
  templateUrl: './workout.component.html',
  styleUrls: ['./workout.component.css'],
})
export class WorkoutComponent implements OnInit {
  workoutTemplates: WorkoutTemplate[] = [];
  isLoading: boolean = false;

  isWorkoutModalOpen = false;
  selectedTemplate: WorkoutTemplate | null = null;

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  constructor(
    private workoutTemplateService: WorkoutTemplateService,
    private workoutService: WorkoutService
  ) {}

  ngOnInit(): void {
    this.loadWorkoutTemplates();
  }

  private loadWorkoutTemplates(): void {
    this.isLoading = true;
    this.workoutTemplateService.getAll().subscribe(
      (templates) => {
        this.workoutTemplates = templates.map((template) => ({
          ...template,
          workouts: template.workouts ?? [],
          menuOpen: false,
        }));
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading workout templates:', error);
        this.isLoading = false;
      }
    );
  }

  openWorkoutModal(template: WorkoutTemplate): void {
    this.selectedTemplate = template;
    this.isWorkoutModalOpen = true;
  }

  closeWorkoutModal(): void {
    this.isWorkoutModalOpen = false;
  }

  saveWorkout(newWorkout: Workout): void {
    if (!this.selectedTemplate) return;

    this.workoutService.create(newWorkout).subscribe((workout) => {
      this.selectedTemplate!.workouts.push({
        ...workout,
        workoutExercises: [],
        menuOpen: false,
      });
      this.isWorkoutModalOpen = false;
    });
  }

  addTemplate(): void {
    if (this.workoutTemplates.length >= 5) {
      alert('You can only create up to 5 workout templates.');
      return;
    }

    const newTemplate: WorkoutTemplate = {
      templateId: Date.now(),
      templateName: 'New Template',
      collapsed: false,
      menuOpen: false,
      workouts: [],
    };

    this.isLoading = true;
    this.workoutTemplateService.create(newTemplate).subscribe(
      (template) => {
        this.workoutTemplates.push({
          ...template,
          workouts: [],
          menuOpen: false,
        });
        this.isLoading = false;
      },
      (error) => {
        console.error('Error creating template:', error);
        this.isLoading = false;
      }
    );
  }

  renameTemplate(template: WorkoutTemplate): void {
    const newName = prompt('Enter new template name:', template.templateName);
    if (newName) {
      template.templateName = newName;
      this.workoutTemplateService
        .update(template.templateId, template)
        .subscribe();
    }
  }

  deleteTemplate(templateId: number): void {
    this.workoutTemplateService.delete(templateId).subscribe(() => {
      this.workoutTemplates = this.workoutTemplates.filter(
        (t) => t.templateId !== templateId
      );
    });
  }

  toggleCollapse(template: WorkoutTemplate): void {
    template.collapsed = !template.collapsed;
  }

  addWorkout(template: WorkoutTemplate): void {
    if (template.workouts.length >= 5) {
      alert('You can only have up to 5 workouts per template.');
      return;
    }

    this.selectedTemplate = template; // Set the selected template before opening the modal
    this.isWorkoutModalOpen = true; // Open the modal
  }

  renameWorkout(workout: Workout): void {
    const newName = prompt('Enter new workout name:', workout.workoutName);
    if (newName) {
      workout.workoutName = newName;
      this.workoutService.update(workout.workoutId, workout).subscribe();
    }
  }

  deleteWorkout(template: WorkoutTemplate, workoutId: number): void {
    this.workoutService.delete(workoutId).subscribe(() => {
      template.workouts = template.workouts.filter(
        (w) => w.workoutId !== workoutId
      );
    });
  }

  toggleTemplateMenu(template: WorkoutTemplate): void {
    this.closeAllMenus();
    template.menuOpen = !template.menuOpen;
  }

  toggleWorkoutMenu(workout: Workout): void {
    this.closeAllMenus();
    workout.menuOpen = !workout.menuOpen;
  }

  @HostListener('document:click', ['$event'])
  closeAllMenus(event?: Event): void {
    this.workoutTemplates.forEach((template) => {
      template.menuOpen = false;
      template.workouts.forEach((workout) => (workout.menuOpen = false));
    });
  }
}
