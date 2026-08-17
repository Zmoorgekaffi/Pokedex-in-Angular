import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild
} from '@angular/core';

@Component({
  selector: 'app-load-more-trigger',
  imports: [],
  templateUrl: './load-more-trigger.html',
  styleUrl: './load-more-trigger.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadMoreTrigger {
  readonly disabled = input(false);
  readonly loadMore = output<void>();

  private readonly isIntersecting = signal(false);
  private readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new IntersectionObserver((entries) => {
        this.isIntersecting.set(entries[0]?.isIntersecting ?? false);
      });
      observer.observe(this.sentinel().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });

    // Re-checked whenever `disabled` clears too, not just on intersection crossings —
    // otherwise a load finishing while the sentinel is still visible would never resume.
    effect(() => {
      if (this.isIntersecting() && !this.disabled()) {
        this.loadMore.emit();
      }
    });
  }
}
