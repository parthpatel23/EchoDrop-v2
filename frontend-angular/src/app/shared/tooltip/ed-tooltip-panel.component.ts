import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ed-tooltip-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ed-tooltip-panel" role="tooltip">
      {{ text }}
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EdTooltipPanelComponent {
  @Input() text = '';
}