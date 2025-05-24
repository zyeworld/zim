import * as vscode from 'vscode';

export enum EditMode {
    NORMAL = 'normal',
    INSERT = 'insert'
}

export class EditModeManager {
    private editMode: EditMode;

    public constructor() {
        this.editMode = EditMode.INSERT;
    }

    public getEditMode (): EditMode {
        return this.editMode;
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

        // set when clause context
        vscode.commands.executeCommand('setContext', 'zim.currEditMode', 'normal')

        // set editor's editmode
        this.editMode = EditMode.NORMAL;
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

        // set when clause context
        vscode.commands.executeCommand('setContext', 'zim.currEditMode', 'insert');

        // set editor's editmode
        this.editMode = EditMode.INSERT;
    }
}