import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AppHeader } from '../../../layout/app-header/app-header';

@Component({
  selector: 'app-operations-page',
  imports: [AppHeader],
  templateUrl: './operations-page.html',
  styleUrl: './operations-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationsPage {}
