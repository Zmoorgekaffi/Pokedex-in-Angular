import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
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

  private readonly sentinel = viewChild.required<ElementRef<HTMLElement>>('sentinel');

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting && !this.disabled()) {
          this.loadMore.emit();
        }
      });
      observer.observe(this.sentinel().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
