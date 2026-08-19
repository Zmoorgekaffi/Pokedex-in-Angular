import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-component-title',
  imports: [],
  templateUrl: './component-title.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ComponentTitle {
  readonly title = input.required<string>();
}
