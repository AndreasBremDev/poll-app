import { Pipe, PipeTransform } from '@angular/core';
import { Option } from '../interfaces/interface';

@Pipe({
  name: 'votePercentage',
})
export class VotePercentagePipe implements PipeTransform {
  transform(vote: number, allOptions: Option[]): number {
    const questionVoteSum = allOptions.reduce((sum, opt) => sum + opt.vote, 0);
    if (questionVoteSum === 0) return 0;

    return Math.round((vote / questionVoteSum) * 100);
  }
}
