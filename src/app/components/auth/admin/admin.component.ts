import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Template } from '../../../models/template';
import { Workout } from '../../../models/workout';
import { GenericService } from '../../../service/generic.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-admin',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxPaginationModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  templates: Template[] = [];
  workouts: Workout[] = [];
  newTemplate: Template = { id: 0, name: '', description: '', workoutId: 0 };
  currentView: string = 'templates'; // Default view
  isModalOpen: boolean = false; // Modal state
  templatesPage: number = 1; // Pagination for templates

  constructor(
    private genericService: GenericService<any>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTemplates();
    this.loadWorkouts();
  }

  // Load all templates
  loadTemplates(): void {
    this.genericService.getAll('templates').subscribe(
      (data) => {
        this.templates = data;
      },
      (error) => {
        console.error('Error loading templates:', error);
        this.snackBar.open('Failed to load templates.', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['danger-snackbar'],
        });
      }
    );
  }

  // Load all workouts
  loadWorkouts(): void {
    this.genericService.getAll('workouts').subscribe(
      (data) => {
        this.workouts = data;
      },
      (error) => {
        console.error('Error loading workouts:', error);
        this.snackBar.open('Failed to load workouts.', 'Close', {
          duration: 1500,
          verticalPosition: 'top',
          horizontalPosition: 'center',
          panelClass: ['danger-snackbar'],
        });
      }
    );
  }

  // Get workout name by ID
  getWorkoutName(workoutId: number): string {
    const workout = this.workouts.find((w) => w.workoutId === workoutId);
    return workout ? workout.workoutName : 'Unknown';
  }

  // Open modal for adding or editing
  openModal(view: string): void {
    this.currentView = view;
    this.isModalOpen = true;
  }

  // Close modal
  closeModal(): void {
    this.isModalOpen = false;
  }

  // Add or update a template
  addOrUpdateTemplate(): void {
    if (!this.newTemplate.name.trim()) {
      this.snackBar.open('Template name is required.', 'Close', {
        duration: 1500,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['danger-snackbar'],
      });
      return;
    }

    if (!this.newTemplate.workoutId) {
      this.snackBar.open('Please select a workout for the template.', 'Close', {
        duration: 1500,
        verticalPosition: 'top',
        horizontalPosition: 'center',
        panelClass: ['danger-snackbar'],
      });
      return;
    }

    if (this.newTemplate.id === 0) {
      // Create a new template
      this.genericService.create('templates', this.newTemplate).subscribe(
        () => {
          this.loadTemplates();
          this.resetTemplateForm();
          this.snackBar.open('Template created successfully!', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          });
        },
        (error) => {
          console.error('Error creating template:', error);
          this.snackBar.open('Failed to create template.', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['danger-snackbar'],
          });
        }
      );
    } else {
      // Update an existing template
      this.genericService
        .updateById('templates', this.newTemplate.id, this.newTemplate)
        .subscribe(
          () => {
            this.loadTemplates();
            this.resetTemplateForm();
            this.snackBar.open('Template updated successfully!', 'Close', {
              duration: 1500,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['success-snackbar'],
            });
          },
          (error) => {
            console.error('Error updating template:', error);
            this.snackBar.open('Failed to update template.', 'Close', {
              duration: 1500,
              verticalPosition: 'top',
              horizontalPosition: 'center',
              panelClass: ['danger-snackbar'],
            });
          }
        );
    }
  }

  // Delete a template
  deleteTemplate(templateId: number): void {
    if (confirm('Are you sure you want to delete this template?')) {
      this.genericService.deleteById('templates', templateId).subscribe(
        () => {
          this.loadTemplates();
          this.snackBar.open('Template deleted successfully!', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['success-snackbar'],
          });
        },
        (error) => {
          console.error('Error deleting template:', error);
          this.snackBar.open('Failed to delete template.', 'Close', {
            duration: 1500,
            verticalPosition: 'top',
            horizontalPosition: 'center',
            panelClass: ['danger-snackbar'],
          });
        }
      );
    }
  }

  // Edit a template
  editTemplate(template: Template): void {
    this.newTemplate = { ...template };
    this.openModal('template');
  }

  // Reset the template form
  resetTemplateForm(): void {
    this.newTemplate = { id: 0, name: '', description: '', workoutId: 0 };
  }
}
