import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { EdTooltipDirective } from './ed-tooltip.directive';

@Component({
  standalone: true,
  imports: [EdTooltipDirective],
  template: `<button edTooltip="Hello">Hover</button>`
})
class HostComponent {}

describe('EdTooltipDirective', () => {
  it('should create', async () => {
    await TestBed.configureTestingModule({
      imports: [OverlayModule, HostComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });
});