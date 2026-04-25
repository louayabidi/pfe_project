// reverse.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'reverse' })
export class ReversePipe implements PipeTransform {
  transform<T>(arr: T[]): T[] { return [...arr].reverse(); }
}