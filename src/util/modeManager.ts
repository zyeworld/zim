import * as vscode from 'vscode';

export enum Mode {
    NORMAL = 'normal',
    INSERT = 'insert'
}

export class ModeManager {
    private mode: Mode;
    private statusBar: vscode.StatusBarItem;

    public constructor() {
        this.mode = Mode.INSERT;
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBar.show();
    }

    public getMode (): Mode {
        return this.mode;
    }

    public enterNormalMode() {
        // set cursor to 'block'
        if (vscode.window.activeTextEditor === undefined) {
            return;
        }
        vscode.window.activeTextEditor.options = {
            cursorStyle: vscode.TextEditorCursorStyle.Block
        };

        // notify current mode 
        vscode.window.showInformationMessage('CURRENT MODE: NORMAL');

        // set status bar
        this.statusBar.text = "-- NORMAL --";

        // set when clause context
        vscode.commands.executeCommand('setContext', 'zim.currEditMode', 'normal')

        // set editor's editmode
        this.mode = Mode.NORMAL;
    }
    
    public enterInsertMode() {
        // set cursor to 'line'
        if (vscode.window.activeTextEditor === undefined) {
            return;
        }
        vscode.window.activeTextEditor.options = {
            cursorStyle: vscode.TextEditorCursorStyle.Line
        };

        // notify current mode 
        vscode.window.showInformationMessage('CURRENT MODE: INSERT');

        // set status bar
        this.statusBar.text = "-- INSERT --";

        // set when clause context
        vscode.commands.executeCommand('setContext', 'zim.currEditMode', 'insert');

        // set editor's editmode
        this.mode = Mode.INSERT;
    }
}