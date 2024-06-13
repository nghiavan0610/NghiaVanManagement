import * as momentTz from 'moment-timezone';
import moment from 'moment';

export class DateTimeHelper {
    public static subtractDay(date: string, subtract: number): string {
        return moment(date).subtract(subtract, 'days').format();
    }

    public static getDateTimeInTz(tz: string, date?: Date): string {
        if (!date) {
            date = new Date();
        }
        return momentTz.tz(date, tz).format();
    }

    public static getFirstDayOfMonth(month: string): string {
        return moment(month, 'MM').startOf('month').format();
    }

    public static getLastDayOfMonth(month: string): string {
        return moment(month, 'MM').endOf('month').format();
    }

    public static getStartOfDate(date: Date): string {
        return moment(date).startOf('date').format();
    }

    public static getEndOfDate(date: Date): string {
        return moment(date).endOf('date').format();
    }
}
