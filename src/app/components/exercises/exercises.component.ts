import { Component } from '@angular/core';
import { Exercise } from '../../models/exercise';
import { GenericService } from '../../service/generic.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BodyPart } from '../../models/bodypart';
import { Category } from '../../models/category';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-exercises',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LoadingComponent],
  templateUrl: './exercises.component.html',
  styleUrl: './exercises.component.css',
})
export class ExercisesComponent {
  exercises: Exercise[] = [];
  bodyParts: BodyPart[] = [];
  categories: Category[] = [];
  isLoading: boolean = false;
  currentPage: number = 1;
  pageSize: number = 12;
  
  constructor(
    private genericService: GenericService<any>,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadExercises();
    this.loadBodyParts();
    this.loadCategories();
  }

  // Fetch exercises from the API
  loadExercises(): void {
    this.isLoading = true;
    this.genericService.getAll('exercises').subscribe(
      (data) => {
        this.exercises = data; // Store the exercises in the exercises array
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching exercises:', error);
        this.isLoading = false;
      }
    );
  }

  loadBodyParts(): void {
    this.isLoading = true;
    this.genericService.getAll('bodyparts').subscribe(
      (data) => {
        this.bodyParts = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching body parts:', error);
        this.isLoading = false;
      }
    );
  }

  loadCategories(): void {
    this.isLoading = true;
    this.genericService.getAll('categories').subscribe(
      (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      }
    );
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/default-thumbnail.jpg'; // Fallback image
    console.warn('Failed to load thumbnail, using default image');
  }

  getBodyPartName(id: number): string {
    const part = this.bodyParts.find((p) => p.bodyPartId === id);
    return part ? part.bodyPartName : 'Loading...';
  }

  getCategoryName(id: number): string {
    const category = this.categories.find((c) => c.categoryId === id);
    return category ? category.categoryName : 'Loading...';
  }
  
  // Get exercises for the current page
  get paginatedExercises(): Exercise[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.exercises.slice(startIndex, endIndex);
  }

  // Total number of pages
  get totalPages(): number {
    return Math.ceil(this.exercises.length / this.pageSize);
  }

  // Change the current page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  changePageAndScroll(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
