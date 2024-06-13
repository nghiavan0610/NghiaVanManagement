import { WorkSheet } from 'xlsx';

export class XlsxHelper {
    public static _setCell(worksheet: WorkSheet, row: number, col: number, value: any, style: any): void {
        if (value === null) {
            return;
        }
        if (typeof value === 'number') {
            return worksheet.cell(row, col).number(value).style(style);
        }

        return worksheet.cell(row, col).string(value).style(style);
    }

    public static _setCellFormula(worksheet: WorkSheet, row: number, col: number, value: string, style: any): void {
        return worksheet.cell(row, col).formula(value).style(style);
    }

    public static _setCellInRange(
        worksheet: WorkSheet,
        startRow: number,
        startCol: number,
        endRow: number,
        endCol: number,
        value: any,
        style: any,
    ): void {
        if (value === null) {
            return;
        }
        if (typeof value === 'number') {
            return worksheet.cell(startRow, startCol, endRow, endCol, true).number(value).style(style);
        }

        return worksheet.cell(startRow, startCol, endRow, endCol, true).string(value).style(style);
    }

    public static _borderCell(
        worksheet: WorkSheet,
        startRow: number,
        startCol: number,
        endRow: number,
        endCol: number,
    ): void {
        worksheet.cell(startRow, startCol, endRow, endCol).style({
            border: {
                left: { style: 'thin', color: '#000000' },
                right: { style: 'thin', color: '#000000' },
                top: { style: 'thin', color: '#000000' },
                bottom: { style: 'thin', color: '#000000' },
            },
        });
    }
}
