import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.html',
  styleUrl: './app-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppHeader {}
