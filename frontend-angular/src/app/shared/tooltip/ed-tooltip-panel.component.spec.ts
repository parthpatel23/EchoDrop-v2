import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EdTooltipPanelComponent } from './ed-tooltip-panel.component';

describe('EdTooltipPanelComponent', () => {
  let component: EdTooltipPanelComponent;
  let fixture: ComponentFixture<EdTooltipPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EdTooltipPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EdTooltipPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
