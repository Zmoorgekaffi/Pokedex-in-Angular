import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GlobalSearchBar } from '../global-search-bar/global-search-bar';

@Component({
  selector: 'app-header',
  imports: [RouterLink, GlobalSearchBar],
  templateUrl: './app-header.html',
  styleUrl: './app-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppHeader {}
