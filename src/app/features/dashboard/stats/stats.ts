import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StatItem {
  label: string;
  value: number;
  delta?: number;
  color?: string;
}

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  template: `./stats.html`,
  styleUrl: './stats.scss'
})
export class StatsComponent {
  @Input() stats: StatItem[] = [];
}
