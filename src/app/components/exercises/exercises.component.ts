import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { GenericService } from '../../service/generic.service';
import { Exercise } from '../../models/exercise';
import { BodyPart } from '../../models/bodypart';
import { Category } from '../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoadingComponent } from '../loading/loading.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-exercises',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './exercises.component.html',
  styleUrls: ['./exercises.component.css'],
})
export class ExercisesComponent implements OnInit {
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
    this.loadBodyParts();
    this.loadCategories();
    this.loadExercises();
  }

  loadExercises(): void {
    this.isLoading = true;
    this.genericService.getAll('exercise').subscribe({
      next: (exercises) => {
        // Process exercises
        let processedExercises = exercises.map((exercise) => ({
          ...exercise,
          base64Thumbnail: exercise.thumbnail || './asset/dumbbell.png', // Fallback to default image if thumbnail is missing
        }));

        // Sort by a random seed value to maintain consistent random order
        processedExercises.sort(() => Math.random() - 0.5);

        this.exercises = processedExercises;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading exercises:', err);
        this.isLoading = false;
      },
    });
  }

  loadBodyParts(): void {
    this.isLoading = true;
    this.genericService.getAll('bodypart').subscribe(
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
    this.genericService.getAll('category').subscribe(
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
    const img = event.target as HTMLImageElement;
    img.src = './assets/dumbbell.png';
  }

  getBodyPartName(id: number): string {
    const part = this.bodyParts.find((p) => p.id === id);
    return part ? part.name : 'Unknown';
  }

  getCategoryName(id: number): string {
    const category = this.categories.find((c) => c.id === id);
    return category ? category.name : 'Unknown';
  }

  get paginatedExercises(): Exercise[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.exercises.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.exercises.length / this.pageSize);
  }

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
