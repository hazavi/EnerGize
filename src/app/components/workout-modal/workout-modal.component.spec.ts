import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutModalComponent } from './workout-modal.component';

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
