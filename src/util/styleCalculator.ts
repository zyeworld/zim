import * as vscode from 'vscode';

export type CssObject = { [key: string]: string | number }

export class StyleCalculator {
    /**
     * Calculate line height
     * @param lineHeight VSCode 'editor.lineHeight' configuration
     * @param fontSize VSCode 'editor.fontSize' configuration
     * @returns Line height in pixels
     */
    public static calculateLineHeight(lineHeight: number, fontSize: number): number {
        const fontSizeToPixels = Math.ceil(fontSize * 3 / 2 - 0.00001);
        if (lineHeight === 0) {
            return fontSizeToPixels;
        } else if (lineHeight < 8) {
            return fontSizeToPixels * lineHeight;
        } else {
            return lineHeight;
        }
    }

    public static cssToString(cssObject: CssObject) {
        return Object.keys(cssObject)
            .map(property => `${property}: ${cssObject[property]};`)
            .join(' ');
    }
}