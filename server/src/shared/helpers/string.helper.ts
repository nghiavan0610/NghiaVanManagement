import * as Crypto from 'crypto';

export class StringHelper {
    public static generateRandomString(length: number): string {
        let result = '';
        const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
            counter += 1;
        }

        return result;
    }

    public static getFirstLetters(str: string): string {
        const firstLetters = str
            .split(' ')
            .map((word) => word.charAt(0))
            .join('');

        return firstLetters;
    }

    public static md5(object: any) {
        return Crypto.createHash('md5').update(JSON.stringify(object)).digest('hex');
    }

    public static toNonAccent(str: string) {
        str = String(str)
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim()
            .replace(/[^A-Za-z0-9 -]/g, '');

        return str.replace(/\s+/g, ' '); // remove consecutive space
    }

    // Originated from https://byby.dev/js-slugify-string
    public static textToSlug(str: string, noHyphens?: boolean) {
        str = String(str)
            .normalize('NFKD') // split accented characters into their base characters and diacritical marks
            .replace(/[\u0300-\u036f]/g, '') // remove all the accents, which happen to be all in the \u03xx UNICODE block.
            .trim() // trim leading or trailing whitespace
            .toLowerCase() // convert to lowercase
            .replace(/[^a-z0-9 -]/g, ''); // remove non-alphanumeric characters

        if (noHyphens) {
            return str.replace(/\s+/g, ' '); // remove consecutive space
        }

        return str
            .replace(/\s+/g, '-') // replace spaces with hyphens
            .replace(/-+/g, '-'); // remove consecutive hyphens
    }

    public static convertDateToFormattedString(date: Date): string {
        const _date = new Date(date);
        _date.setHours(_date.getHours() + 7);

        const year = _date.getFullYear();
        const month = (_date.getMonth() + 1).toString().padStart(2, '0');
        const day = _date.getDate().toString().padStart(2, '0');
        const hours = _date.getHours().toString().padStart(2, '0');
        const minutes = _date.getMinutes().toString().padStart(2, '0');
        const seconds = _date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
