import {
  Directive, ElementRef, HostListener, Input, OnDestroy
} from '@angular/core';

import {
  Overlay, OverlayRef, OverlayPositionBuilder, ConnectedPosition
} from '@angular/cdk/overlay';

import { ComponentPortal } from '@angular/cdk/portal';
import { EdTooltipPanelComponent } from './ed-tooltip-panel.component';

type TooltipPos = 'top' | 'bottom' | 'left' | 'right';

@Directive({
  selector: '[edTooltip]',
  standalone: true,
})
export class EdTooltipDirective implements OnDestroy {
  @Input('edTooltip') text = '';
  @Input() edTooltipPosition: TooltipPos = 'top';
  @Input() edTooltipDelay = 200;

  private overlayRef?: OverlayRef;
  private showTimer: any;

  constructor(
    private el: ElementRef<HTMLElement>,
    private overlay: Overlay,
    private positionBuilder: OverlayPositionBuilder
  ) {}

  @HostListener('mouseenter') onMouseEnter() { this.scheduleShow(); }
  @HostListener('mouseleave') onMouseLeave() { this.hide(); }
  @HostListener('focusin') onFocusIn() { this.scheduleShow(); }
  @HostListener('focusout') onFocusOut() { this.hide(); }
  @HostListener('keydown.escape') onEsc() { this.hide(); }

  private scheduleShow() {
    if (!this.text?.trim()) return;
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.show(), this.edTooltipDelay);
  }

  private show() {
    if (!this.text?.trim()) return;

    if (!this.overlayRef) {
      const positions: ConnectedPosition[] = this.getPositions(this.edTooltipPosition);

      const positionStrategy = this.positionBuilder
        .flexibleConnectedTo(this.el)
        .withPositions(positions)
        .withFlexibleDimensions(false)
        .withPush(true);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        panelClass: ['ed-tooltip-overlay'],
        hasBackdrop: false,
      });
    }

    if (this.overlayRef.hasAttached()) return;

    const portal = new ComponentPortal<EdTooltipPanelComponent>(EdTooltipPanelComponent);
    const ref = this.overlayRef.attach(portal);

    ref.instance.text = this.text;
  }

  private hide() {
    clearTimeout(this.showTimer);
    if (this.overlayRef?.hasAttached()) this.overlayRef.detach();
  }

  private getPositions(pos: TooltipPos): ConnectedPosition[] {
    switch (pos) {
      case 'bottom':
        return [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top', offsetY: 8 }];
      case 'left':
        return [{ originX: 'start', originY: 'center', overlayX: 'end', overlayY: 'center', offsetX: -8 }];
      case 'right':
        return [{ originX: 'end', originY: 'center', overlayX: 'start', overlayY: 'center', offsetX: 8 }];
      case 'top':
      default:
        return [{ originX: 'center', originY: 'top', overlayX: 'center', overlayY: 'bottom', offsetY: -8 }];
    }
  }

  ngOnDestroy() {
    clearTimeout(this.showTimer);
    this.overlayRef?.dispose();
  }
}