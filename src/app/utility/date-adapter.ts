import { DateAdapter } from '@angular/material';
import * as moment from 'moment';

/** The default month names to use if Intl API is not available. */
const DEFAULT_MONTH_NAMES = {
    'long': [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
    ],
    'short': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'narrow': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
};

/** The default date names to use if Intl API is not available. */
const DEFAULT_DATE_NAMES = range(31, i => String(i + 1));


/** The default day of the week names to use if Intl API is not available. */
const DEFAULT_DAY_OF_WEEK_NAMES = {
    'long': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'short': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'narrow': ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};


/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
    const valuesArray = Array(length);
    for (let i = 0; i < length; i++) {
        valuesArray[i] = valueFunction(i);
    }
    return valuesArray;
}

/** Adapts the native JS Date for use with cdk-based components that work with dates. */
export class MomentDateAdapter extends DateAdapter<moment.Moment> {
    getYear(date: moment.Moment): number {
        return date.year();
    }

    getMonth(date: moment.Moment): number {
        return date.month();
    }

    getDate(date: moment.Moment): number {
        return date.date();
    }

    getDayOfWeek(date: moment.Moment): number {
        return date.weekday();
    }

    getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {        
        return DEFAULT_MONTH_NAMES[style];
    }

    getDateNames(): string[] {
        return DEFAULT_DATE_NAMES;
    }

    getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
        return DEFAULT_DAY_OF_WEEK_NAMES[style];
    }

    getYearName(date: moment.Moment): string {
        return String(this.getYear(date));
    }

    getFirstDayOfWeek(): number {        
        // We can't tell using native JS Date what the first day of the week is, we default to Sunday.
        return 0;
    }

    getNumDaysInMonth(date: moment.Moment): number {
        return date.daysInMonth();
    }

    clone(date: moment.Moment): moment.Moment {
        return this.createDate(this.getYear(date), this.getMonth(date), this.getDate(date));
    }

    createDate(year: number, month: number, date: number): moment.Moment {
        // Check for invalid month and date (except upper bound on date which we have to check after
        // creating the Date).
        if (month < 0 || month > 11 || date < 1) {
            return null;
        }

        let result = this._createDateWithOverflow(year, month, date);

        // Check that the date wasn't above the upper bound for the month, causing the month to
        // overflow.
        if (result.getMonth() != month) {
            return null;
        }

        return result;
        // return new moment()
    }

    today(): moment.Moment {
        return new moment();
    }

    parse(value: any): Date | null {
        // We have no way using the native JS Date to set the parse format or locale, so we ignore these
        // parameters.
        let timestamp = typeof value == 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

    format(date: Date, displayFormat: Object): string {
        return this._stripDirectionalityCharacters(date.toDateString());
    }

    addCalendarYears(date: Date, years: number): Date {
        return this.addCalendarMonths(date, years * 12);
    }

    addCalendarMonths(date: Date, months: number): Date {
        let newDate = this._createDateWithOverflow(
            this.getYear(date), this.getMonth(date) + months, this.getDate(date));

        // It's possible to wind up in the wrong month if the original month has more days than the new
        // month. In this case we want to go to the last day of the desired month.
        // Note: the additional + 12 % 12 ensures we end up with a positive number, since JS % doesn't
        // guarantee this.
        if (this.getMonth(newDate) != ((this.getMonth(date) + months) % 12 + 12) % 12) {
            newDate = this._createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
        }

        return newDate;
    }

    addCalendarDays(date: Date, days: number): Date {
        return this._createDateWithOverflow(
            this.getYear(date), this.getMonth(date), this.getDate(date) + days);
    }

    getISODateString(date: Date): string {
        return [
            date.getUTCFullYear(),
            this._2digit(date.getUTCMonth() + 1),
            this._2digit(date.getUTCDate())
        ].join('-');
    }

    /** Creates a date but allows the month and date to overflow. */
    private _createDateWithOverflow(year: number, month: number, date: number) {
        let result = new Date(year, month, date);

        // We need to correct for the fact that JS native Date treats years in range [0, 99] as
        // abbreviations for 19xx.
        if (year >= 0 && year < 100) {
            result.setFullYear(this.getYear(result) - 1900);
        }
        return result;
    }

    /**
     * Pads a number to make it two digits.
     * @param n The number to pad.
     * @returns The padded number.
     */
    private _2digit(n: number) {
        return ('00' + n).slice(-2);
    }

    /**
     * Strip out unicode LTR and RTL characters. Edge and IE insert these into formatted dates while
     * other browsers do not. We remove them to make output consistent and because they interfere with
     * date parsing.
     * @param s The string to strip direction characters from.
     * @returns The stripped string.
     */
    private _stripDirectionalityCharacters(s: string) {
        return s.replace(/[\u200e\u200f]/g, '');
    }
}