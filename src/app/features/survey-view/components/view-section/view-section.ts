import { Component, inject, signal, model, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  supabase = inject(Supabase);
  private router = inject(Router);

  currentPollView = model<Poll | undefined>();
  selectedOptions = signal<Record<number, number[]>>({});

  updateSignal(event: Event, optionId: number, questionId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.currentPollView()) return;
    const oldOptionIds = this.selectedOptions()[questionId]; /* read: selectedOptions-signal() */
    this.currentPollView.update(oldPoll => oldPoll ? this.updateVoteChanges(oldPoll, questionId, optionId, oldOptionIds, isChecked) : oldPoll);
    this.updateSelectionMemory(questionId, optionId, isChecked);
  }

  private updateVoteChanges(oldPoll: Poll, questionId: number, optId: number, oldOptIds: number[] | undefined, isChecked: boolean): Poll {
    const updatedPoll = structuredClone(oldPoll);
    const targetQuestion = updatedPoll.poll_question.find(pq => pq.question.id === questionId);
    if (!targetQuestion) return updatedPoll;
    if (!targetQuestion.question.multiple && oldOptIds !== undefined) { /* here: check if oldOption exists, if yes, substract oldOption.vote */
      const oldOption = targetQuestion.question.options.find(opt => opt.id === oldOptIds[0]);
      if (oldOption) oldOption.vote--;
    }
    const targetOption = targetQuestion.question.options.find(opt => opt.id === optId);
    if (targetOption) {
      isChecked ? targetOption.vote++ : targetOption.vote--;
    }
    return updatedPoll;
  }

  private updateSelectionMemory(questionId: number, optionId: number, isChecked: boolean) {
    const poll = this.currentPollView();
    const isMultiple = poll?.poll_question.find(pq => pq.question.id === questionId)?.question.multiple;
    if (isMultiple === false) {
      this.updateRadioOptionsInSelectedOptions(questionId, optionId);
    } else {
      this.updateCheckboxOptionsInSelectedOptions(questionId, isChecked, optionId);
    }
  }

  private updateCheckboxOptionsInSelectedOptions(questionId: number, isChecked: boolean, optionId: number) {
    this.selectedOptions.update(memory => {
      const currentIds = memory[questionId] || [];
      let newIds: number[];
      if (isChecked) {
        newIds = [...currentIds, optionId];
      } else {
        newIds = currentIds.filter(id => id !== optionId); /* filters out the clicked && !isChecked option from existing array */
      }
      return {
        ...memory,
        [questionId]: newIds
      };
    });
  }

  private updateRadioOptionsInSelectedOptions(questionId: number, optionId: number) {
    this.selectedOptions.update(memory => ({
      ...memory,
      [questionId]: [optionId]
    }));
  }

  isPollValid = computed(() => {
    const poll = this.currentPollView();
    const memory = this.selectedOptions();
    if (!poll) return false;
    return poll.poll_question.every(pq => {
      const questionId = pq.question.id;
      return memory[questionId] !== undefined && memory[questionId].length > 0
    })
  });

  async uploadPollVotes() {
    if (this.isPollValid()) {
      const poll = this.currentPollView();
      if (!poll) return;
      const optionsToUpload: { id: number; vote: number }[] = [];
      this.createOptIdAndOptVoteArray(poll, optionsToUpload);
      await this.sendOptionsToUploadViaSupabase(optionsToUpload);
    }
  }

  private async sendOptionsToUploadViaSupabase(optionsToUpload: { id: number; vote: number; }[]) {
    try {
      await this.supabase.putData(optionsToUpload);
      this.router.navigate(['']);
    } catch (err) {
      console.error('Upload war NICHT erfolgreich - etwas ist schiefgegangen: ', err);
    }
  }

  private createOptIdAndOptVoteArray(poll: Poll, optionsToUpload: { id: number; vote: number; }[]) {
    for (const pq of poll.poll_question) {
      for (const opt of pq.question.options) {
        console.log(opt);
        optionsToUpload.push({
          id: opt.id,
          vote: opt.vote
        });
      }
    }
  }



  
}
