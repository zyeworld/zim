import * as vscode from 'vscode';
import { StyleCalculator, CssObject } from '../util/styleCalculator';

/**
 * Bounding box used to denote a 'space' in SpaceState
 */
type Box = {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
}

/**
 * State for Space Travel: space-based movement when space is pressed
 */
type SpaceState = {
    active: boolean,
    charWidth: number,
    charHeight: number,
    space: Box,
    previousSpace: Box,
    decoration: vscode.TextEditorDecorationType | null
}

/**
 * Direction used in VSCode's 'cursorMove' command
 */
export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right'
}

export class CursorMover {
    private spaceState: SpaceState = {
        active: false,
        charWidth: 1,
        charHeight: 19,
        space: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
        previousSpace: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
        decoration: null
    };

    /**
     * Move cursor to a certain direction
     * @param direction one of four directions
     * @param units amount to move
     */
    public move(direction: Direction, units: number = 1) {
        vscode.commands.executeCommand('cursorMove', {
            to: direction,
            value: units
        });
    }

    /**
     * Show the spaceState.space Box on screen
     */
    public showSpace(editor: vscode.TextEditor, removePrevious: boolean = true) {
        // 1. If box already exists, remove it
        if (removePrevious && this.spaceState.decoration) {
            editor.setDecorations(this.spaceState.decoration, []);
        }

        // 2. Set CSS for new Box
        const boxCss: CssObject = {
            position: 'absolute',
            display: 'inline-block',
            left: (this.spaceState.charWidth * this.spaceState.space.minX).toString() + 'ch',
            width: (this.spaceState.charWidth * (this.spaceState.space.maxX - this.spaceState.space.minX)).toString() + 'ch',
            top: (this.spaceState.charHeight * this.spaceState.space.minY).toString() + 'px',
            height: (this.spaceState.charHeight * (this.spaceState.space.maxY - this.spaceState.space.minY + 1)).toString() + 'px',
            'z-index': 1,
            'pointer-events': 'none',
            'background-color': '#CCCCCC22',
            border: '1px solid black',
            'border-radius': '1ch'
        };
        this.spaceState.decoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{
            before: {
                contentText: '',
                textDecoration: `none; ${StyleCalculator.cssToString(boxCss)}`
            }
        });

        // 3. Show Box on screen
        const viewportStart = editor.visibleRanges[0];
        editor.setDecorations(this.spaceState.decoration, [viewportStart]);
    }

    /**
     * Start a new space travel (create a new box)
     */ 
    public startSpaceTravel(editor: vscode.TextEditor) {
        this.spaceState.active = true;
        const lineStart = editor.visibleRanges[0].start.line;
        const lineEnd = editor.visibleRanges[0].end.line;

        // Compute minimum and maximum possible x values
        let minX = 1000, maxX = 0;
        for (let i = lineStart; i <= lineEnd; i++) {
            minX = Math.min(minX, editor.document.lineAt(i).firstNonWhitespaceCharacterIndex);
            maxX = Math.max(maxX, editor.document.lineAt(i).range.end.character);
        }

        this.spaceState.space = { minX, maxX, minY: 0, maxY: lineEnd - lineStart };
        this.showSpace(editor);
    }

    /**
     * Stop the current space travel
     */
    public stopSpaceTravel(editor: vscode.TextEditor) {
        this.spaceState.active = false;
        if (this.spaceState.decoration) {
            editor.setDecorations(this.spaceState.decoration, []);
        }
        this.spaceState.decoration = null;
        return;
    }

    /**
     * Halve the box in a certain direction
     */
    public spaceTravel(editor: vscode.TextEditor, direction: Direction) {
        // 1. Update spaceTravelState
        this.spaceState.active = true;
        this.spaceState.previousSpace = this.spaceState.space;

        // 1. Calculate new box
        let midY = Math.floor((this.spaceState.space.minY + this.spaceState.space.maxY) / 2);
        let midX = Math.floor((this.spaceState.space.minX + this.spaceState.space.maxX) / 2);
        switch (direction) {
            case Direction.UP:
                this.spaceState.space = { ...this.spaceState.previousSpace, maxY: midY }
                break;
            case Direction.DOWN:
                this.spaceState.space = { ...this.spaceState.previousSpace, minY: midY + 1 }
                break;
            case Direction.LEFT:
                this.spaceState.space = { ...this.spaceState.previousSpace, maxX: midX }
                break;
            case Direction.RIGHT:
                this.spaceState.space = { ...this.spaceState.previousSpace, minX: midX }
                break;
            default:
                break;
        }

        // 2. Calculate x, y positions again
        // let minY = newSpace.minY;
        // let maxY = newSpace.maxY;
        // let minX = 1000, maxX = 0;
        // const lineStart = editor.visibleRanges[0].start.line;
        // for (let i = lineStart + newSpace.minY; i <= lineStart + newSpace.maxY; i++) {
        //     minX = Math.min(minX, editor.document.lineAt(i).firstNonWhitespaceCharacterIndex)
        //     maxX = Math.max(maxX, editor.document.lineAt(i).range.end.character)
        // }

        // 3. Move cursor
        const currentCursor = editor.selection.active;
        let newCursorX = currentCursor.character;
        let newCursorY = currentCursor.line;

        newCursorX = Math.min(newCursorX, this.spaceState.space.maxX); // move left
        newCursorX = Math.max(newCursorX, this.spaceState.space.minX); // move right
        const lineStart = editor.visibleRanges[0].start.line;
        newCursorY = Math.min(newCursorY, this.spaceState.space.maxY + lineStart); // move up
        newCursorY = Math.max(newCursorY, this.spaceState.space.minY + lineStart); // move down

        const newCursorPosition = new vscode.Position(newCursorY, newCursorX);
        const newSelection = new vscode.Selection(newCursorPosition, newCursorPosition);
        editor.selections = [newSelection];

        // 4. Visually create new box
        this.showSpace(editor);
    }

    public activate(context: vscode.ExtensionContext) {
        // Initializing
        const lineHeight: number = vscode.workspace.getConfiguration('editor').get('lineHeight') ?? 0;
        const fontSize: number = vscode.workspace.getConfiguration('editor').get('fontSize') ?? 14;
        // Determine line height
        this.spaceState.charHeight = StyleCalculator.calculateLineHeight(lineHeight, fontSize);

        // i, j, k, l keybindings
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorUp', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.UP) : this.move(Direction.UP);
        }));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorDown', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.DOWN) : this.move(Direction.DOWN);
        }));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorLeft', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.LEFT) : this.move(Direction.LEFT);
        }));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorRight', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.RIGHT) : this.move(Direction.RIGHT);
        }));

        // Space keybinding
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.space', (editor: vscode.TextEditor) => {
            // Toggle Space Travel
            this.spaceState.active ? this.stopSpaceTravel(editor) : this.startSpaceTravel(editor);
        }));
    }
}