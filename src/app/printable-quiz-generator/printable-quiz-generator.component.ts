import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as jsPDF from 'jspdf';
import { AdditionQuizItem, SubtractionQuizItem, MultiplicationQuizItem, DivisionQuizItem,
  QuizTypeEnum, QuizTypeEnum2UIString } from '../model';

@Component({
  selector: 'app-printable-quiz-generator',
  templateUrl: './printable-quiz-generator.component.html',
  styleUrls: ['./printable-quiz-generator.component.scss'],
})
export class PrintableQuizGeneratorComponent implements OnInit {
  private _leftStart: number;
  private _arSubstr: any[];

  amountAddQuiz: number;
  amountSubQuiz: number;
  amountMulQuiz: number;
  amountDivQuiz: number;
  decimalPlaces: number;
  numberBegin: number;
  numberEnd: number;
  fontSize: number;

  constructor(private _tranService: TranslateService) {
    this._leftStart = 15;
    this._arSubstr = [];
    this._arSubstr.push({
      qtype: QuizTypeEnum.add,
      i18n: '',
      display: ''
    }, {
      qtype: QuizTypeEnum.sub,
      i18n: '',
      display: ''
    }, {
      qtype: QuizTypeEnum.multi,
      i18n: '',
      display: ''
    }, {
      qtype: QuizTypeEnum.div,
      i18n: '',
      display: ''
    });
    for (let astr of this._arSubstr) {
      astr.i18n = QuizTypeEnum2UIString(astr.qtype);
    }

    this.amountAddQuiz = 12;
    this.amountSubQuiz = 12;
    this.amountMulQuiz = 12;
    this.amountDivQuiz = 12;
    this.decimalPlaces = 2;
    this.numberBegin = 1;
    this.numberEnd = 100;
    this.fontSize = 10;
  }

  ngOnInit(): void {
    let arstring: string[] = [];
    for (let astr of this._arSubstr) {
      arstring.push(astr.i18n);
    }
    this._tranService.get(arstring).subscribe((x: any) => {
      for (let attr in x) {
        for (let lab of this._arSubstr) {
          if (lab.i18n === attr) {
            lab.display = x[attr];
          }
        }
      }
    });
  }

  onGenerate(): void {
    let arAdd: AdditionQuizItem[] = [];
    let arSub: SubtractionQuizItem[] = [];
    let arMul: MultiplicationQuizItem[] = [];
    let arDiv: DivisionQuizItem[] = [];

    if (this.amountAddQuiz > 0) {
      let idx: number = 0;
      do {
        let qi: AdditionQuizItem = this.generateAddQuizItem(idx);
        arAdd.push(qi);
      } while (idx ++ < this.amountAddQuiz);
    }
    if (this.amountSubQuiz > 0) {
      let idx: number = 0;
      do {
        let qi: SubtractionQuizItem = this.generateSubQuizItem(idx);
        arSub.push(qi);
      } while (idx ++ < this.amountSubQuiz);
    }
    if (this.amountMulQuiz > 0) {
      let idx: number = 0;
      do {
        let qi: MultiplicationQuizItem = this.generateMulQuizItem(idx);
        arMul.push(qi);
      } while (idx ++ < this.amountMulQuiz);
    }
    if (this.amountDivQuiz > 0) {
      let idx: number = 0;
      do {
        let qi: DivisionQuizItem = this.generateDivQuizItem(idx);
        arDiv.push(qi);
      } while (idx ++ < this.amountDivQuiz);
    }
    const itemsPerRow: number = 3;

    // Generate
    const doc: any = new jsPDF();
    // doc.addFont('Roboto');
    doc.setFontSize(this.fontSize);

    // Generate the codes
    let nrow: number = 0;
    let nypos: number = 10;
    if (arAdd.length > 0) {
      // doc.text(this._arSubstr[0].display, 10, nypos);
      doc.text('Addition Exercise', 10, nypos);
      nypos += 10;

      nrow = Math.ceil(this.amountAddQuiz / itemsPerRow);
      for(let idx2 = 0; idx2 < nrow; idx2 ++) {
        let ielem: number = idx2 * itemsPerRow;
        if (ielem < this.amountAddQuiz) {
          doc.text(arAdd[ielem].getQuizFormat(), 10, nypos);
          ielem ++;
        }
        if (ielem < this.amountAddQuiz) {
          doc.text(arAdd[ielem].getQuizFormat(), 70, nypos);
          ielem ++;
        }
        if (ielem < this.amountAddQuiz) {
          doc.text(arAdd[ielem].getQuizFormat(), 130, nypos);
          ielem ++;
        }

        nypos += 10;
        if (nypos > 280) {
          nypos = 10;
          doc.addPage();
        }
      }
    }
    if (arSub.length > 0) {
      doc.text('Subtraction Exercise', 10, nypos);
      // doc.text(this._arSubstr[1].display, 10, nypos);
      nypos += 10;

      nrow = Math.ceil(this.amountSubQuiz / itemsPerRow);
      for(let idx2 = 0; idx2 < nrow; idx2 ++) {
        let ielem: number = idx2 * itemsPerRow;
        if (ielem < this.amountSubQuiz) {
          doc.text(arSub[ielem].getQuizFormat(), 10, nypos);
          ielem ++;
        }
        if (ielem < this.amountSubQuiz) {
          doc.text(arSub[ielem].getQuizFormat(), 70, nypos);
          ielem ++;
        }
        if (ielem < this.amountSubQuiz) {
          doc.text(arSub[ielem].getQuizFormat(), 130, nypos);
          ielem ++;
        }
        nypos += 10;
        if (nypos > 280) {
          nypos = 10;
          doc.addPage();
        }
      }
    }
    if (arMul.length > 0) {
      doc.text('Multiplication Exercise', 10, nypos);
      // doc.text(this._arSubstr[2].display, 10, nypos);
      nypos += 10;

      nrow = Math.ceil(this.amountMulQuiz / itemsPerRow);
      for(let idx2 = 0; idx2 < nrow; idx2 ++) {
        let ielem: number = idx2 * itemsPerRow;
        if (ielem < this.amountMulQuiz) {
          doc.text(arMul[ielem].getQuizFormat(), 10, nypos);
          ielem ++;
        }
        if (ielem < this.amountMulQuiz) {
          doc.text(arMul[ielem].getQuizFormat(), 70, nypos);
          ielem ++;
        }
        if (ielem < this.amountMulQuiz) {
          doc.text(arMul[ielem].getQuizFormat(), 130, nypos);
          ielem ++;
        }
        nypos += 10;
        if (nypos > 280) {
          nypos = 10;
          doc.addPage();
        }
      }
    }
    if (arDiv.length > 0) {
      doc.text('Division Exercise', 10, nypos);
      // doc.text(this._arSubstr[3].display, 10, nypos);
      nypos += 10;

      nrow = Math.ceil(this.amountDivQuiz / itemsPerRow);
      for(let idx2 = 0; idx2 < nrow; idx2 ++) {
        let ielem: number = idx2 * itemsPerRow;
        if (ielem < this.amountDivQuiz) {
          doc.text(arDiv[ielem].getQuizFormat(), 10, nypos);
          ielem ++;
        }
        if (ielem < this.amountDivQuiz) {
          doc.text(arDiv[ielem].getQuizFormat(), 70, nypos);
          ielem ++;
        }
        if (ielem < this.amountDivQuiz) {
          doc.text(arDiv[ielem].getQuizFormat(), 130, nypos);
          ielem ++;
        }
        nypos += 10;
        if (nypos > 280) {
          nypos = 10;
          doc.addPage();
        }
      }
    }

    doc.save('quiz.pdf');
  }

  // Generate add
  private generateAddQuizItem(idx: number): AdditionQuizItem {
    const rnum1 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    const rnum2 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    const qz: AdditionQuizItem = new AdditionQuizItem(rnum1, rnum2, this.decimalPlaces);
    qz.QuizIndex = idx;
    return qz;
  }
  // Generate subtract
  private generateSubQuizItem(idx: number): SubtractionQuizItem {
    const rnum1 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    const rnum2 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    if (rnum1 > rnum2) {
      const qz: SubtractionQuizItem = new SubtractionQuizItem(rnum1, rnum2, this.decimalPlaces);
      qz.QuizIndex = idx;
      return qz;
    } else {
      const qz: SubtractionQuizItem = new SubtractionQuizItem(rnum2, rnum1, this.decimalPlaces);
      qz.QuizIndex = idx;
      return qz;
    }
  }
  // Generate multiply
  private generateMulQuizItem(idx: number): MultiplicationQuizItem {
    const rnum1 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    const rnum2 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    const qz: MultiplicationQuizItem = new MultiplicationQuizItem(
      rnum1, rnum2, this.decimalPlaces
    );
    qz.QuizIndex = idx;
    return qz;
  }
  // Generate div
  private generateDivQuizItem(nIdx: number): DivisionQuizItem {
    const rnum1 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    const rnum2 = Math.random() * (this.numberEnd - this.numberBegin) + this.numberBegin;
    if (rnum1 > rnum2) {
      const dq: DivisionQuizItem = new DivisionQuizItem(rnum1, rnum2, this.decimalPlaces);
      dq.QuizIndex = nIdx;

      return dq;
    } else {
      const dq: DivisionQuizItem = new DivisionQuizItem(rnum2, rnum1, this.decimalPlaces);
      dq.QuizIndex = nIdx;

      return dq;
    }
  }
}
