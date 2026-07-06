import { Component, computed, model } from '@angular/core';
import { Poll } from '../../../../shared/interfaces/interface';
import { IndexToLetterPipe } from '../../../../shared/pipes/index-to-letter.pipe';
import { VotePercentagePipe } from '../../../../shared/pipes/vote-percentage-pipe-pipe';

@Component({
  selector: 'app-result-section',
  imports: [
    IndexToLetterPipe,
    VotePercentagePipe
  ],
  templateUrl: './result-section.html',
  styleUrl: './result-section.scss',
})
export class ResultSection {

  currentPollResult = model<Poll | undefined>()

  pollVoteTotal = computed(() => {
    const poll = this.currentPollResult();
    if (!poll) return 0;
    return poll.poll_question.reduce((grandTotal, pq) => {
      const questionSum = pq.question.options.reduce((sum, opt) => sum + opt.vote, 0);
      return grandTotal + questionSum;
    }, 0);
});

questionVoteSum = 0;



}

