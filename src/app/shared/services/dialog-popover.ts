import { ElementRef, Injectable, signal, viewChild } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DialogPopover {

  isCreateSurveyModalOpen = signal<boolean>(false);

  openCreateSurveyModal() {
    this.isCreateSurveyModalOpen.set(true);
  }

  closeCreateSurveyModal() {
    this.isCreateSurveyModalOpen.set(false);
  }

  // openPopover(): void {
  //   const elem = this.popover()?.nativeElement;
  //   if (elem) {
  //     if (typeof elem.showPopover === 'function') {
  //       elem.showPopover();
  //       setTimeout(() => this.closePopover(), 1500);
  //     } else {
  //       elem.classList.add('is-open');
  //       setTimeout(() => {
  //         elem.classList.remove('is-open');
  //       }, 1500);
  //     }
  //   }
  // }

  openPopover(popoverElem: HTMLElement): void {
    if (!popoverElem) return;

    if (typeof popoverElem.showPopover === 'function') {
      popoverElem.showPopover();
      setTimeout(() => this.closePopover(popoverElem), 1500);
    } else {
      popoverElem.classList.add('is-open');
      setTimeout(() => this.closePopover(popoverElem), 1500);
    }
  }

  // closePopover(): void {
  //   const elem = this.popover()?.nativeElement;
  //   if (elem) {
  //     if (typeof elem.hidePopover === 'function') {
  //       elem.hidePopover();
  //     } else {
  //       elem.classList.remove('is-open');
  //     }
  //   }
  // }

  closePopover(popoverElem: HTMLElement): void {
    if (!popoverElem) return;

    if (typeof popoverElem.hidePopover === 'function') {
      popoverElem.hidePopover();
    } else {
      popoverElem.classList.remove('is-open');
    }
  }

  openPublishedPopover(anchor: HTMLElement, popover: HTMLElement) {
    popover.showPopover(); /* 1. Briefly display the popover for the dimensions. */
    let { leftPosition, padding, popoverWidth, viewportWidth, topPosition } = this.defineProperties(anchor, popover);
    /*  2. Get button position and popover dimensions, 3. Calculate height, 
        4a. Calculate width with edge clearance (Safe Guard, 10px minimum distance from the screen edge), 
        4b. Calculate the ideal left value (right-aligned with the button) */
    leftPosition = this.recalculatePopoverPosition(leftPosition, padding, popoverWidth, viewportWidth);
    popover.style.top = `${topPosition}px`; /* 5. assign styles */
    popover.style.left = `${leftPosition}px`;
    setTimeout(() => this.closePopover(popover), 1500);
  }


  private defineProperties(anchor: HTMLElement, popover: HTMLElement) {
    const rect = anchor.getBoundingClientRect();
    const popoverWidth = popover.offsetWidth;
    const popoverHeight = popover.offsetHeight;
    const viewportWidth = window.innerWidth; /* total width of the screen */
    const gap = 15;
    const topPosition = rect.top - popoverHeight - gap;
    const padding = 10;
    let leftPosition = rect.right - popoverWidth;
    return { leftPosition, padding, popoverWidth, viewportWidth, topPosition };
  }

  private recalculatePopoverPosition(leftPosition: number, padding: number, popoverWidth: number, viewportWidth: number) {
    /* Left-side overflow protection: Prevents the popover from extending off the left edge of the screen. */
    if (leftPosition < padding) {
      leftPosition = padding;
    }
    /* Right-side overflow protection: Prevents it from extending beyond the right edge (if the button is positioned very far to the right). */
    if (leftPosition + popoverWidth > viewportWidth - padding) {
      leftPosition = viewportWidth - popoverWidth - padding;
    }
    return leftPosition;
  }
}
