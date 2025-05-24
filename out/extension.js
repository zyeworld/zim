"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const EditModeManager_js_1 = require("./EditModeManager.js");
let editModeManager = new EditModeManager_js_1.EditModeManager;
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "zim" is now active!');
    const disposable = vscode.commands.registerCommand('zim.toggleZim', () => {
        // The code you place here will be executed every time your command is executed
        vscode.window.showInformationMessage('Toggle zim mode!');
    });
    context.subscriptions.push(vscode.commands.registerCommand('zim.enterNormalMode', () => {
        editModeManager.enterNormalMode();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('zim.enterInsertMode', () => {
        editModeManager.enterInsertMode();
    }));
    context.subscriptions.push(disposable);
    context.subscriptions.push(vscode.commands.registerCommand('zim.escape', () => {
        // NOTE: this is not being awaited to save the 15-20ms block - I think this is fine
        // void VSCodeContext.set('vim.mode', Mode[this.vimState.currentMode]);
        vscode.window.showInformationMessage('ESCAPE PRESSED');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('zim.ctrl+home', () => {
        vscode.window.showInformationMessage('CTRL+HOME PRESSED');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('zim.space', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const line_starts = [];
        for (let i = 0; i < editor.document.lineCount; i++) {
            let textStart = editor.document.lineAt(i).firstNonWhitespaceCharacterIndex;
            line_starts.push(new vscode.Range(new vscode.Position(i, textStart), new vscode.Position(i, textStart + 1)));
        }
        const full_range = [new vscode.Range(new vscode.Position(0, 0), new vscode.Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))];
        const cursorPosition = editor.selection.active;
        const newRange = new vscode.Range(cursorPosition.with(cursorPosition.line, cursorPosition.character), 
        // Value can't be negative
        cursorPosition.with(cursorPosition.line, Math.max(0, cursorPosition.character)));
        const decoration = vscode.window.createTextEditorDecorationType({
            textDecoration: `none; margin-left: 10px;`,
        });
        const decoration2 = vscode.window.createTextEditorDecorationType({
            textDecoration: `none; position: absolute; margin-left: -1ch; top: -1rem; width: 5ch; height: 1rem; display: inline-block; z-index: 1; pointer-events: none;`,
        });
        const decoration3 = vscode.window.createTextEditorDecorationType({
            textDecoration: `none; border-right: 1px solid black;`,
        });
        editor.setDecorations(decoration3, line_starts);
        vscode.window.showInformationMessage('SPACE PRESSED');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('zim.i', () => {
        vscode.window.showInformationMessage('I PRESSED');
    }));
    context.subscriptions.push(vscode.commands.registerCommand('zim.j', () => {
        vscode.window.showInformationMessage('J PRESSED');
    }));
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map