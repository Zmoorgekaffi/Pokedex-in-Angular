import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-move-detail-page',
  imports: [],
  templateUrl: './move-detail-page.html',
  styleUrl: './move-detail-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveDetailPage {
  readonly id = input<string>();
}
