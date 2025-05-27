import * as vscode from 'vscode';

import { Mode, ModeManager } from './util/modeManager.js';
import { CursorMover } from './cursor/cursorMover.js';

let modeManager: ModeManager = new ModeManager;
let cursorMover: CursorMover = new CursorMover;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "zim" is now active!');

	context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.enterNormalMode', (editor: vscode.TextEditor) => {
		cursorMover.stopSpaceTravel(editor);
		modeManager.enterNormalMode();
	}));
	
	context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.enterInsertMode', (editor: vscode.TextEditor) => {
		modeManager.enterInsertMode();
	}));

	// Cursor related functions
	cursorMover.activate(context);

	// Overriding 'type' command - 'onCommand:type' activation event in package.json
	// Typing with system keys such as 'ctrl+c' and 'Home' cannot be overridden with this.
	context.subscriptions.push(vscode.commands.registerCommand('type', (args) => {

		// Do default action when not in normal mode
		if (modeManager.getMode() !== Mode.NORMAL) {
			return vscode.commands.executeCommand('default:type', args);
		}
		// Do nothing if a text editor isn't active
		if (!vscode.window.activeTextEditor) { return; }

		// Do default action when in debug input
		if (
			vscode.window.activeTextEditor.document &&
			vscode.window.activeTextEditor.document.uri.toString() === 'debug:input'
		) {
			return vscode.commands.executeCommand('default:type', args);
		}

		// ******************************************
		// Code to execute when typing in normal mode
		// ******************************************
		// example: if 'a' is pressed, then args = {text: 'a'}.
		// args = {text: 'A'} if Caps Lock is pressed.
		// No way to distinguish between Caps Lock and Shift.
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
