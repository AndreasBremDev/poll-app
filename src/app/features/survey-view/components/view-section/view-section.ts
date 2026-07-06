import { Component, inject, signal, model, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Supabase } from '../../../../shared/services/supabase';
import { Poll } from '../../../../shared/interfaces/interface';
import { IndexToLetterPipe } from '../../../../shared/pipes/index-to-letter.pipe';

@Component({
  selector: 'app-view-section',
  imports: [
    IndexToLetterPipe
  ],
  templateUrl: './view-section.html',
  styleUrl: './view-section.scss',
})
export class ViewSection {

  currentPollView = model<Poll | undefined>();
  selectedRadioOptions = signal<Record<number, number>>({});

  updateSignal(event: Event, optionId: number, questionId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.currentPollView()) return;
    const oldOptionId = this.selectedRadioOptions()[questionId]; /* read: selectedRadioOptions-signal() */
    this.currentPollView.update(oldPoll => oldPoll ? this.updateVoteChanges(oldPoll, questionId, optionId, oldOptionId, isChecked) : oldPoll);
    this.updateRadioMemory(questionId, optionId);
    console.log('selectedRadioOptions()',this.selectedRadioOptions());
  }

  private updateVoteChanges(oldPoll: Poll, questionId: number, optId: number, oldOptId: number | undefined, isChecked: boolean): Poll {
    const updatedPoll = structuredClone(oldPoll);
    const targetQuestion = updatedPoll.poll_question.find(pq => pq.question.id === questionId);
    if (!targetQuestion) return updatedPoll;
    if (!targetQuestion.question.multiple && oldOptId !== undefined) { /* here: check if oldOption exists, if yes, substract oldOption.vote */
      const oldOption = targetQuestion.question.options.find(opt => opt.id === oldOptId);
      if (oldOption) oldOption.vote--;
    }
    const targetOption = targetQuestion.question.options.find(opt => opt.id === optId);
    if (targetOption) {
      isChecked ? targetOption.vote++ : targetOption.vote--;
    }
    return updatedPoll;
  }

  private updateRadioMemory(questionId: number, optionId: number) {
    const poll = this.currentPollView();
    const isMultiple = poll?.poll_question.find(pq => pq.question.id === questionId)?.question.multiple;
    if (isMultiple === false) {
      this.selectedRadioOptions.update(memory => ({
        ...memory,
        [questionId]: optionId
      }));
    }
  }

  checkIfEachQuestionAnswered(){

  }

  isPollValid = computed(() => {
    const poll = this.currentPollView();
    if (!poll) return false;
    for (let i = 0; i < poll().length; i++) {
      const element = array[i];
      
    }
  })

}
