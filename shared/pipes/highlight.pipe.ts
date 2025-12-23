import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight',
  standalone: true
})
export class HighlightPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!search || !value) {
      return value;
    }

    const re = new RegExp(search, 'gi');
    const match = value.match(re);

    if (!match) {
      return value;
    }

    const highlightedValue = value.replace(re, `<mark class="highlight">$&</mark>`);
    return this.sanitizer.bypassSecurityTrustHtml(highlightedValue);
  }
}