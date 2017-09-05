import * as moment from 'moment';
import { DateFormat } from './datedef';
import { QuizTypeEnum, QuizTypeEnum2UIString } from './quizconcept';

export class AwardPlan {
    private _id: number;
    get ID(): number {
        return this._id;
    }
    set ID(id: number) {
        this._id = id;
    }

    private _tgtuser: string;
    get TargetUser(): string {
        return this._tgtuser;
    }
    set TargetUser(tusr: string) {
        this._tgtuser = tusr;
    }

    private _crtby: string;
    get CreatedBy(): string {
        return this._crtby;
    }
    set CreatedBy(ctby: string) {
        this._crtby = ctby;
    }

    private _validfrom: moment.Moment;
    get ValidFrom(): moment.Moment {
        return this._validfrom;
    }
    set ValidFrom(vf: moment.Moment) {
        this._validfrom = vf;
    }

    private _validto: moment.Moment;
    get ValidTo(): moment.Moment {
        return this._validto;
    }
    set ValidTo(vt: moment.Moment) {
        this._validto = vt;
    }

    private _qtype: QuizTypeEnum;
    get QuizType(): QuizTypeEnum {
        return this._qtype;
    }
    set QuizType(qt: QuizTypeEnum) {
        this._qtype = qt;
    }

    private _minScore: number;
    get MinQuizScore(): number {
        return this._minScore;
    }
    set MinQuizScore(scr: number) {
        this._minScore = scr;
    }

    private _minAvgTime: number;
    get MinQuizAvgTime(): number {
        return this._minAvgTime;
    }
    set MinQuizAvgTime(qat: number) {
        this._minAvgTime = qat;
    }

    private _award: number;
    get Award(): number {
        return this._award;
    }
    set Award(awd: number) {
        this._award = awd;
    }

    constructor() {
        this.ValidFrom = moment();
        this.ValidTo = this.ValidFrom.day(30);
        // new Date(this.ValidFrom.getTime() + 30 * 24 * 60 * 60 * 1000) ;
        //this.ValidTo = new Date(this.ValidFrom.GetY)
    }

    public getAwardScoreCondition(): string {
        if (Number.isInteger(this._minScore)) {
            return 'Home.AwardPlanScoreConidiotn';
        }
        return '';
    }
    public getAwardScoreConditionParam(): any {
        return {
            score: this._minScore
        };
    }
    public getAwardAvgTimeCondition(): string {
        if (Number.isInteger(this._minAvgTime)) {
            return 'Home.AwardPlanScoreConidiotn';
        }
        return '';
    }
    public getAwardAvgTimeConditionParam(): any {
        return {
            avgtime: this._minAvgTime
        };
    }

    public getQuizTypeUIString(): string {
        return QuizTypeEnum2UIString(this._qtype);
    }

    public parseData(jdata: AwardPlanJson) {
        this._id = jdata.planID;
        this._tgtuser = jdata.targetUser;
        if (jdata.createdBy) {
            this._crtby = jdata.createdBy;
        }
        this._validfrom = moment(jdata.validFrom, DateFormat);
        this._validto = moment(jdata.validTo, DateFormat);
        this._qtype = +jdata.quizType;
        if (jdata.minQuizScore) {
            this._minScore = jdata.minQuizScore;
        }
        if (jdata.minQuizAvgTime) {
            this._minAvgTime = jdata.minQuizAvgTime;
        }
        this._award = jdata.award;
    }

    public prepareData(): AwardPlanJson {
        const rst: AwardPlanJson = {
            planID: this._id,
            targetUser: this._tgtuser,
            createdBy: this._crtby,
            validFrom: this._validfrom.format(DateFormat),
            validTo: this._validto.format(DateFormat),
            quizType: this._qtype,
            minQuizScore: this._minScore,
            minQuizAvgTime: this._minAvgTime,
            award: this._award
        };

        return rst;
    }
}

export interface AwardPlanJson {
    planID: number;
    targetUser: string;
    createdBy?: string;
    validFrom: string;
    validTo: string;
    quizType: number;
    minQuizScore?: number;
    minQuizAvgTime?: number;
    award: number;
}

export interface UserAwardJson {
    awardID: number;
    userID: string;
    awardDate: string;
    award: number;
    awardPlanID?: number;
    quizType?: number;
    quizID?: number;
    usedReason?: string;
}

export class UserAward {
    private _id: number;
    get ID(): number {
        return this._id;
    }
    set ID(id: number) {
        this._id = id;
    }

    private _userid: string;
    get UserID(): string {
        return this._userid;
    }
    set UserID(uid: string) {
        this._userid = uid;
    }

    private _awdDate: moment.Moment;
    get AwardDate(): moment.Moment {
        return this._awdDate;
    }
    set AwardDate(ad: moment.Moment) {
        this._awdDate = ad;
    }

    private _awd: number;
    get Award(): number {
        return this._awd;
    }
    set Award(wd: number) {
        this._awd = wd;
    }

    private _awdpid: number;
    get AwardPlanID(): number {
        return this._awdpid;
    }
    set AwardPlanID(api: number) {
        this._awdpid = api;
    }

    private _quizid: number;
    get QuizID(): number {
        return this._quizid;
    }
    set QuizID(qi: number) {
        this._quizid = qi;
    }

    private _quiztype: QuizTypeEnum;
    get QuizType(): QuizTypeEnum {
        return this._quiztype;
    }
    set QuizType(qt: QuizTypeEnum) {
        this._quiztype = qt;
    }

    private _usdrsn: string;
    get UsedReason(): string {
        return this._usdrsn;
    }
    set UsedReason(ur: string) {
        this._usdrsn = ur;
    }

    public parseData(jdata: UserAwardJson) {
        this._id = +jdata.awardID;
        this._userid = jdata.userID;
        this._awdDate = moment(jdata.awardDate, DateFormat);
        this._awd = jdata.award;
        this._awdpid = jdata.awardPlanID;
        this._quizid = jdata.quizID;
        this._quiztype = +jdata.quizType;
        this._usdrsn = jdata.usedReason;
    }

    public prepareData(): UserAwardJson {
        const data: UserAwardJson = {
            awardID: this._id,
            userID: this._userid,
            awardDate: this._awdDate.format(DateFormat),
            award: this._awd,
            awardPlanID: this._awdpid,
            quizID: this._quizid,
            usedReason: this._usdrsn
        };

        return data;
    }
}
