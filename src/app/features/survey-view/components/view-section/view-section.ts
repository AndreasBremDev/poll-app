import { Component, inject, signal, model, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { Supabase } from '../../../../shared/services/supabase';
import { Poll } from '../../../../shared/interfaces/interface';
import { IndexToLetterPipe } from '../../../../shared/pipes/index-to-letter.pipe';
import { SinglePollVotes, PollVotesStorage } from '../../../../shared/interfaces/interface';
import { DialogPopover } from '../../../../shared/services/dialog-popover';

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
  router = inject(Router);
  dialogPopover = inject(DialogPopover)

  currentPollView = model<Poll | undefined>();
  selectedOptions = signal<SinglePollVotes>({});
  pollVotesStorage = signal<PollVotesStorage>(this.getInitialStorage());

  hasVotedCurrentPoll = computed(() => {
    const currentPollId = this.currentPollView()?.id;
    if (!currentPollId) return false;
    return !!this.pollVotesStorage()[currentPollId];
  });

  questionAnswersStatus = computed(() => {
    const poll = this.currentPollView();
    const memory = this.selectedOptions();
    if (!poll || poll.questions.length === 0) {
      return { count: 0, answeredCount: 0, hasMultiple: false, isAllAnswered: false, isSomeAnswered: false }
    }
    const answeredCount = poll.questions.filter(pq => {
      const selected = memory[pq.id];
      return selected !== undefined && selected.length > 0;
    }).length
    return { count: poll.questions.length, answeredCount, hasMultiple: poll.questions.length > 1, isAllAnswered: answeredCount === poll.questions.length, isSomeAnswered: answeredCount > 0 }
  })

  readonly isPollStartedButNotCompleted = computed(() => {
    const status = this.questionAnswersStatus();
    return status.hasMultiple && status.isSomeAnswered && !status.isAllAnswered;
  });

  // 3. Bestehendes Signal: Wiederverwendung ohne Code-Duplizierung
  readonly isPollValid = computed(() => {
    const status = this.questionAnswersStatus();
    return status.isAllAnswered && !this.hasVotedCurrentPoll();
  });

  // isPollValid = computed(() => {
  //   const poll = this.currentPollView();
  //   const memory = this.selectedOptions();
  //   if (!poll) return false;
  //   const allQuestionsAnswered = poll.questions.every(pq => {
  //     const questionId = pq.id;
  //     return memory[questionId] !== undefined && memory[questionId].length > 0
  //   })
  //   return allQuestionsAnswered && !this.hasVotedCurrentPoll();
  // });

  isPollDisabled = computed(() => {
    if (this.hasVotedCurrentPoll()) return true;
    const poll = this.currentPollView();
    if (poll && poll.daysLeft != null && poll.daysLeft < 0) {
      return true
    };
    return false;
  })

  constructor() {
    effect(() => {
      const currentPollId = this.currentPollView()?.id;
      if (!currentPollId) return;
      const storage = this.pollVotesStorage();
      const savedVotes = storage[currentPollId];
      if (savedVotes) {
        this.selectedOptions.set(savedVotes)
      }
    })
  }

  isOptionSelected(questionId: number, optionId: number): boolean {
    const selectedForQuestion = this.selectedOptions()[questionId];
    return selectedForQuestion ? selectedForQuestion.includes(optionId) : false;
  }

  updateSignal(event: Event, optionId: number, questionId: number) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (!this.currentPollView()) return;
    const oldOptionIds = this.selectedOptions()[questionId]; /* read: selectedOptions-signal() */
    this.currentPollView.update(oldPoll => oldPoll ? this.updateVoteChanges(oldPoll, questionId, optionId, oldOptionIds, isChecked) : oldPoll);
    this.updateSelectionMemory(questionId, optionId, isChecked);
  }

  private updateVoteChanges(oldPoll: Poll, questionId: number, optId: number, oldOptIds: number[] | undefined, isChecked: boolean): Poll {
    const updatedPoll = structuredClone(oldPoll);
    const targetQuestion = updatedPoll.questions.find(q => q.id === questionId);
    if (!targetQuestion) return updatedPoll;
    if (!targetQuestion.multiple && oldOptIds !== undefined) { /* here: check if oldOption exists, if yes, substract oldOption.vote */
      const oldOption = targetQuestion.options.find(opt => opt.id === oldOptIds[0]);
      if (oldOption) oldOption.vote--;
    }
    const targetOption = targetQuestion.options.find(opt => opt.id === optId);
    if (targetOption) {
      isChecked ? targetOption.vote++ : targetOption.vote--;
    }
    return updatedPoll;
  }

  private updateSelectionMemory(questionId: number, optionId: number, isChecked: boolean) {
    const poll = this.currentPollView();
    const isMultiple = poll?.questions.find(q => q.id === questionId)?.multiple;
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

  async uploadPollVotes(anchorBtn: HTMLElement, popoverRef: HTMLElement) {
    if (this.isPollValid()) {
      const poll = this.currentPollView();
      if (!poll) return;
      const optionsToUpload: { id: number; vote: number }[] = [];
      this.createOptIdAndOptVoteArray_uploadPollVotes(poll, optionsToUpload);
      await this.sendOptionsToDatabaseSupabase_uploadPollVotes(optionsToUpload);
      this.saveToLocalStorage();
      this.dialogPopover.openPopover(anchorBtn, popoverRef);
      setTimeout(() => this.router.navigate(['']), 1500);
    }
  }

  private async sendOptionsToDatabaseSupabase_uploadPollVotes(optionsToUpload: { id: number; vote: number; }[]) {
    try {
      await this.supabase.upsertVoteData(optionsToUpload);
    } catch (err) {
      console.error('Upload war NICHT erfolgreich - etwas ist schiefgegangen: ', err);
    }
  }

  private createOptIdAndOptVoteArray_uploadPollVotes(poll: Poll, optionsToUpload: { id: number; vote: number; }[]) {
    for (const q of poll.questions) {
      for (const opt of q.options) {
        optionsToUpload.push({
          id: opt.id,
          vote: opt.vote
        });
      }
    }
  }

  saveToLocalStorage() {
    const currentPollId = this.currentPollView()?.id;
    if (!currentPollId) return;
    const rawData = localStorage.getItem('pollVotesStorage');                 /* 1: current state from LS */
    const currentStorage: PollVotesStorage = rawData ? JSON.parse(rawData) : {};
    currentStorage[currentPollId] = this.selectedOptions();                   /* 2: save current Options (SinglePollVotes) under poll-id */
    localStorage.setItem('pollVotesStorage', JSON.stringify(currentStorage)); /* 3: save in LS */
    this.pollVotesStorage.set(currentStorage);                                /* 4: update signal */
  }

  getInitialStorage(): PollVotesStorage {
    const rawData = localStorage.getItem('pollVotesStorage');
    return rawData ? JSON.parse(rawData) : {}
  }

}
