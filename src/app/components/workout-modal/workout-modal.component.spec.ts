import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutModalComponent } from './workout-modal.component';
import { Exercise } from '../../models/exercise';

describe('WorkoutModalComponent', () => {
  let component: WorkoutModalComponent;
  let fixture: ComponentFixture<WorkoutModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkoutModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
describe('WorkoutModalComponent - confirmExerciseSelection', () => {
  let component: WorkoutModalComponent;
  let fixture: ComponentFixture<WorkoutModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WorkoutModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should map selectedExercises to workoutExercises with correct structure', () => {
    component.selectedExercises = [
      { id: 1, name: 'Exercise 1' } as Exercise,
      { id: 2, name: 'Exercise 2' } as Exercise,
    ];

    component.confirmExerciseSelection();

    expect(component.workoutExercises).toEqual([
      {
        workoutExercise: {
          id: 0,
          workout_id: 0,
          exercise_id: 1,
        },
          exercise: { 
            id: 1, 
            name: 'Exercise 1', 
            bodypart_id: 0, 
            category_id: 0, 
            workoutExercises: [], 
            thumbnail: '', 
            instructions: '' 
          },
        },
        {
          workoutExercise: {
            id: 0,
            workout_id: 0,
            exercise_id: 2,
          },
          exercise: { 
            id: 2, 
            name: 'Exercise 2', 
            bodypart_id: 0, 
            category_id: 0, 
            workoutExercises: [], 
            thumbnail: '', 
            instructions: '' 
          },
      },
      {
        workoutExercise: {
          id: 0,
          workout_id: 0,
          exercise_id: 2,
        },
        exercise: { 
          id: 2, 
          name: 'Exercise 2', 
          bodypart_id: 0, 
          category_id: 0, 
          workoutExercises: [], 
          thumbnail: '', 
          instructions: '' 
        },
      },
    ]);
  });

  it('should initialize setsMap for each exercise with default values', () => {
    component.selectedExercises = [
      { id: 1, name: 'Exercise 1' } as Exercise,
      { id: 2, name: 'Exercise 2' } as Exercise,
    ];

    component.confirmExerciseSelection();

    expect(component.setsMap).toEqual({
      0: [
        {

          reps: 10,
          weight: 20,
          weightUnit: 'kg',
        },
      ],
      1: [
        {
          reps: 10,
          weight: 20,
          weightUnit: 'kg',
        },
      ],
    });
  });

  it('should close the exercise modal after confirming selection', () => {
    component.isExerciseModalOpen = true;

    component.confirmExerciseSelection();

    expect(component.isExerciseModalOpen).toBeFalse();
  });

  it('should handle empty selectedExercises gracefully', () => {
    component.selectedExercises = [];

    component.confirmExerciseSelection();

    expect(component.workoutExercises).toEqual([]);
    expect(component.setsMap).toEqual({});
  });

  it('should handle multiple selectedExercises correctly', () => {
    component.selectedExercises = [
      { id: 1, name: 'Exercise 1' } as Exercise,
      { id: 2, name: 'Exercise 2' } as Exercise,
      { id: 3, name: 'Exercise 3' } as Exercise,
    ];

    component.confirmExerciseSelection();

    expect(component.workoutExercises.length).toBe(3);
    expect(Object.keys(component.setsMap).length).toBe(3);
  });
});
