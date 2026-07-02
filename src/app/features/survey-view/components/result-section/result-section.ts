import { Component, input } from '@angular/core';
import { Poll } from '../../../../shared/interfaces/interface';
import { IndexToLetterPipe } from '../../../../shared/pipes/index-to-letter.pipe';

@Component({
  selector: 'app-result-section',
  imports: [
    IndexToLetterPipe
],
  templateUrl: './result-section.html',
  styleUrl: './result-section.scss',
})
export class ResultSection {

  currentPollResult = input<Poll | undefined>()

}
