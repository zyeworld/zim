import * as vscode from 'vscode';

import { ModeManager } from './util/modeManager.js';
import { CursorMover } from './cursor/cursorMover.js';

let modeManager: ModeManager = new ModeManager;
let cursorMover: CursorMover = new CursorMover;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "zim" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('zim.enterNormalMode', () => {
		modeManager.enterNormalMode();
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('zim.enterInsertMode', () => {
		modeManager.enterInsertMode();
	}));

	context.subscriptions.push(vscode.commands.registerCommand('zim.moveCursorUp', () => {
		cursorMover.moveUp(1);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('zim.moveCursorDown', () => {
		cursorMover.moveDown(1);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('zim.moveCursorLeft', () => {
		cursorMover.moveLeft(1);
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('zim.moveCursorRight', () => {
		cursorMover.moveRight(1);
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
