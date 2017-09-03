import {
  Component, ViewChild, ElementRef, AfterContentInit, NgZone,
  OnInit, Renderer, HostListener
} from '@angular/core';
import { MdTabChangeEvent } from '@angular/material';
import { Router } from '@angular/router';
import { MdDialog } from '@angular/material';
import {
  RPN, SudouUnit, Sudou, generateValidSudou, SudouSize,
  PrimarySchoolMathQuiz, QuizTypeEnum, PrimarySchoolMathQuizItem,
  Cal24QuizItem, SudouQuizItem, LogLevel, QuizDegreeOfDifficulity, QuizDegreeOfDifficulity2UIString
} from '../model';
import { environment } from '../../environments/environment';
import { DialogService } from '../services/dialog.service';
import { PgSummaryDlgInfo, PgSummaryDlgComponent } from '../pg-summary-dlg';
import { MessageDialogButtonEnum, MessageDialogInfo, MessageDialogComponent } from '../message-dialog';

export interface DegreeOfDifficulityUI {
  value: QuizDegreeOfDifficulity;
  displayas: string;
}

@Component({
  selector: 'app-puzzle-games',
  templateUrl: './puzzle-games.component.html',
  styleUrls: ['./puzzle-games.component.scss']
})
export class PuzzleGamesComponent implements OnInit {

  /**
   * UI part
   */
  indexTab: number;
  listDod: DegreeOfDifficulityUI[];

  /**
   * Cal24 part
   */
  Cal24Input: string = '';
  Cal24items: number[] = [];
  private Cal24NumberRangeBgn: number = 1;
  private Cal24NumberRangeEnd: number = 9;
  Cal24Quiz: PrimarySchoolMathQuiz;
  Cal24SurrendString: string = '';

  /**
   * Sudou part
   */
  sudouQuiz: PrimarySchoolMathQuiz;
  sudouDoD: QuizDegreeOfDifficulity;
  sudouInstance: Sudou;

  /**
   * Typing tour
   */
  typingQuiz: PrimarySchoolMathQuiz;
  typingMaxLength: number;
  typingIncCaptial: boolean;
  typingIncNumber: boolean;
  typingIncSymbols: boolean;
  typingExpected: string;

  constructor(private _dlgsvc: DialogService,
    private _dialog: MdDialog,
    private _zone: NgZone,
    private _router: Router) {
    this.indexTab = 0; // Defaul tab
    this.listDod = [];
    for(let dod in QuizDegreeOfDifficulity) {
      if (Number.isNaN(+dod)) {
      } else {
        let dodui: DegreeOfDifficulityUI = {
          value: +dod,
          displayas: QuizDegreeOfDifficulity2UIString(+dod)
        };
        this.listDod.push(dodui);
      }
    }

    this.Cal24Quiz = new PrimarySchoolMathQuiz();
    this.Cal24Quiz.QuizType = QuizTypeEnum.cal24;

    this.sudouQuiz = new PrimarySchoolMathQuiz();
    this.sudouQuiz.QuizType = QuizTypeEnum.sudou;
    this.sudouDoD = QuizDegreeOfDifficulity.medium;

    this.typingQuiz = new PrimarySchoolMathQuiz();
    this.typingQuiz.QuizType = QuizTypeEnum.typing;
    this.typingMaxLength = 20;
    this.typingIncCaptial = true;
    this.typingIncNumber = true;
    this.typingIncSymbols = true;
    this.typingExpected = '';
  }

  ngOnInit() {
  }

  public onTabSelectChanged(event: MdTabChangeEvent) {
    //console.log(event);
    this.indexTab = event.index;
  }

  public canDeactivate(): boolean {
    if (this.Cal24Quiz.IsStarted || this.sudouQuiz.IsStarted) {
      let dlginfo: MessageDialogInfo = {
        Header: 'Home.Error',
        Content: 'Home.QuizIsOngoing',
        Button: MessageDialogButtonEnum.onlyok
      };
      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo
      }).afterClosed().subscribe(x => {
        // Do nothing!
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC Math Exericse [Debug]: Message Dialog Result ${x}`);
        }
      });
      return false;
    }

    return true;
  }

  /**
   * Cal24 part
   */
  private Cal24(arnum: any[], nlen: number, targetNum: number): boolean {
    const opArr = new Array("+", "-", "*", "/");
    for (let i = 0; i < nlen; i++) {
      for (let j = i + 1; j < nlen; j++) {
        let numij = [arnum[i], arnum[j]];
        arnum[j] = arnum[nlen - 1];
        for (let k: number = 0; k < opArr.length; k++) {
          let k1: number = k % 2;
          let k2: number = 0;
          if (!k1) {
            k2 = 1;
          }
          arnum[i] = '(' + numij[k1] + opArr[k] + numij[k2] + ')';
          if (this.Cal24(arnum, nlen - 1, targetNum)) {
            this.Cal24SurrendString = arnum[0];
            return true;
          }
        }
        arnum[i] = numij[0];
        arnum[j] = numij[1];
      }
    }

    let objRN = new RPN();
    let tmprest = objRN.buildExpress(arnum[0]);
    let result = objRN.WorkoutResult();

    return (nlen === 1) && (result === targetNum);
  }

  public CanCal24Start(): boolean {
    if (this.Cal24Quiz.IsStarted || this.sudouQuiz.IsStarted || this.typingQuiz.IsStarted) {
      return false;
    }

    return true;
  }

  public OnCal24Start(): void {

    this.Cal24Input = ''; // Clear the inputs
    this.Cal24items = [];

    while (this.Cal24items.length < 4) {
      let nNum = Math.floor(Math.random() * (this.Cal24NumberRangeEnd - this.Cal24NumberRangeBgn)) + this.Cal24NumberRangeBgn;
      let nExistIdx = this.Cal24items.findIndex((val) => { return val === nNum; });
      if (nExistIdx === -1) {
        this.Cal24items.push(nNum);
      }
    }

    this.Cal24Quiz.BasicInfo = this.Cal24items.join(',');
    this.Cal24Quiz.Start(1, 0); // Single item and no failor
    this.Cal24Quiz.CurrentRun().SectionStart();
  }

  public CanCal24Submit(): boolean {
    if (!this.Cal24Quiz.IsStarted) {
      return false;
    }
    if (this.Cal24Input.length <= 0) {
      return false;
    }

    for (let ch of this.Cal24Input) {
      if (ch === '('
        || ch === ')'
        || ch === '+'
        || ch === '-'
        || ch === '*'
        || ch === '/'
      ) {
        continue;
      } else {
        let nch = parseInt(ch);
        let nExistIdx = this.Cal24items.findIndex((val) => { return val === nch; });
        if (nExistIdx === -1) {
          return false;
        }
      }
    }

    return true;
  }

  public OnCal24Submit(): void {
    let rst: number = <number>eval(this.Cal24Input);
    if (rst !== 24) {
      let dlginfo: MessageDialogInfo = {
        Header: 'Home.Error',
        Content: this.Cal24Input + ' = ' + rst.toString() + ' != 24',
        Button: MessageDialogButtonEnum.onlyok
      };
      this._dialog.open(MessageDialogComponent, {
        disableClose: false,
        width: '500px',
        data: dlginfo
      }).afterClosed().subscribe(x => {
        // Do nothing!
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC Math Exericse [Debug]: Message Dialog Result ${x}`);
        }
      });
    } else {
      // Success
      this.Cal24Quiz.SubmitCurrentRun();

      let di: PgSummaryDlgInfo = {
        gameWin: true,
        timeSpent: this.Cal24Quiz.ElderRuns()[0].TimeSpent,
        haveARetry: true
      };

      let dialogRef = this._dialog.open(PgSummaryDlgComponent, {
        width: '500px',
        data: di
      });

      dialogRef.afterClosed().subscribe(x => {
        if (di.haveARetry) {
          this.OnCal24Start();
        }
      });
    }
  }

  public OnCal24Surrender(): void {
    let arnums: number[] = [];
    for (let n of this.Cal24items) {
      arnums.push(n);
    }

    let fitem: Cal24QuizItem = new Cal24QuizItem();
    fitem.IsSurrended = true;
    fitem.Items = this.Cal24items;
    let fitems = [];
    fitems.push(fitem);
    this.Cal24Quiz.SubmitCurrentRun(fitems);

    // Prepare the dialog for the correct answer
    let dlginfo: MessageDialogInfo = {
      Header: 'Home.Error',
      Content: '',
      Button: MessageDialogButtonEnum.onlyok
    };
    if (this.Cal24(arnums, arnums.length, 24)) {
      dlginfo.Content = this.Cal24SurrendString + ' = 24';
    } else {
      // No suitable errors      
      dlginfo.Content = 'Home.Cal24NoSolution';
    }

    this._dialog.open(MessageDialogComponent, {
      disableClose: false,
      width: '500px',
      data: dlginfo
    }).afterClosed().subscribe(x => {
      // Do nothing!
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC Math Exericse [Debug]: Message Dialog Result ${x}`);
      }

      let di: PgSummaryDlgInfo = {
        gameWin: false,
        timeSpent: this.Cal24Quiz.ElderRuns()[0].TimeSpent,
        haveARetry: true
      };

      this._dialog.open(PgSummaryDlgComponent, {
        width: '500px',
        data: di
      }).afterClosed().subscribe(x => {
        if (di.haveARetry) {
          this.OnCal24Start();
        }
      });
    });
  }

  /**
   * Sudou part
   */
  public CanSudouStart(): boolean {
    if (this.Cal24Quiz.IsStarted || this.sudouQuiz.IsStarted || this.typingQuiz.IsStarted) {
      return false;
    }

    return true;
  }

  public OnSudouStart(): void {
    this.sudouInstance = generateValidSudou();

    this.sudouQuiz.BasicInfo = this.sudouInstance.print2String().substring(0, 45);
    this.sudouQuiz.Start(1, 0); // Single item and no failor
    this.sudouQuiz.CurrentRun().SectionStart();
  }

  public OnSudouSurrender(): void {
    let fitem: SudouQuizItem = new SudouQuizItem();
    fitem.IsSurrended = true;
    fitem.DetailInfo = this.sudouQuiz.BasicInfo.substring(0, 45);
    let fitems = [];
    fitems.push(fitem);
    this.sudouQuiz.SubmitCurrentRun(fitems);

    let di: PgSummaryDlgInfo = {
      gameWin: false,
      timeSpent: this.sudouQuiz.ElderRuns()[0].TimeSpent,
      haveARetry: true
    };

    this._dialog.open(PgSummaryDlgComponent, {
      width: '500px',
      data: di
    }).afterClosed().subscribe(x => {
      if (di.haveARetry) {
        this.OnSudouStart();
      }
    });
  }

  public OnSudouComplete(): void {
    this.sudouQuiz.SubmitCurrentRun();
    let di: PgSummaryDlgInfo = {
      gameWin: true,
      timeSpent: this.sudouQuiz.ElderRuns()[0].TimeSpent,
      haveARetry: true
    };

    this._dialog.open(PgSummaryDlgComponent, {
      width: '500px',
      data: di
    }).afterClosed().subscribe(x => {
      if (di.haveARetry) {
        this.OnSudouStart();
      }
    });
  }

  /**
   * Typing tour
   */
  private typingGenerateExpectedString() {
    let basic = "abcdefghijklmnopqrstuvwxyz";
    if (this.typingIncCaptial) {
      basic = basic + "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    }
    if (this.typingIncNumber) {
      basic = basic + "0123456789";
    }
    if (this.typingIncSymbols) {
      basic = basic + ",.;'`!@#$%^&*()_+-=[]{}\|<>?:";
    }

    this.typingExpected = '';
    for (let i: number = 0; i < this.typingMaxLength; i++) {
      let word = basic.charAt(Math.floor(Math.random() * basic.length));
      this.typingExpected += word;
    }
  }

  public CanTypingStart(): boolean {
    if (this.Cal24Quiz.IsStarted || this.sudouQuiz.IsStarted || this.typingQuiz.IsStarted) {
      return false;
    }

    return true;
  }

  public OnTypingStart(): void {
    this.typingGenerateExpectedString();

    this.typingQuiz.BasicInfo = this.typingMaxLength.toString() + ';'
      + (this.typingIncCaptial ? '1' : '0') + ';'
      + (this.typingIncNumber ? '1' : '0') + ';'
      + (this.typingIncSymbols ? '1' : '0') + ';';
    this.typingQuiz.Start(1, 0); // Single item and no failor
    this.typingQuiz.CurrentRun().SectionStart();
  }

  public OnTypingSurrender(): void {
    let fitem: SudouQuizItem = new SudouQuizItem();
    fitem.IsSurrended = true;
    fitem.DetailInfo = this.typingQuiz.BasicInfo.substring(0, 45);

    let fitems = [];
    fitems.push(fitem);
    this.typingQuiz.SubmitCurrentRun(fitems);

    let di: PgSummaryDlgInfo = {
      gameWin: false,
      timeSpent: this.typingQuiz.ElderRuns()[0].TimeSpent,
      haveARetry: true
    };

    let dialogRef = this._dialog.open(PgSummaryDlgComponent, {
      width: '500px',
      data: di
    });

    dialogRef.afterClosed().subscribe(x => {
      //console.log(`Dialog result: ${x}, ${di.haveARetry}`); 

      if (di.haveARetry) {
        this.OnTypingStart();
      }
    });
  }

  public OnTypingComplete(): void {

    this.typingQuiz.SubmitCurrentRun();

    let di: PgSummaryDlgInfo = {
      gameWin: true,
      timeSpent: this.typingQuiz.ElderRuns()[0].TimeSpent,
      haveARetry: true
    };

    let dialogRef = this._dialog.open(PgSummaryDlgComponent, {
      width: '500px',
      data: di
    });

    dialogRef.afterClosed().subscribe(x => {
      if (di.haveARetry) {
        this.OnTypingStart();
      }
    });
  }
}
