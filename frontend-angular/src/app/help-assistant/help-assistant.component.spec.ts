import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpAssistantComponent } from './help-assistant.component';

describe('HelpAssistantComponent', () => {
  let component: HelpAssistantComponent;
  let fixture: ComponentFixture<HelpAssistantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpAssistantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpAssistantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
