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
    mainDecoration: vscode.TextEditorDecorationType | null,
    horizontalLineDecoration: vscode.TextEditorDecorationType | null,
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
        mainDecoration: null,
        horizontalLineDecoration: null
    };

    /**
     * Move cursor to a certain direction
     * @param direction one of four directions
     * @param units amount to move
     */
    public move(direction: Direction, select: boolean = false, units: number = 1) {
        vscode.commands.executeCommand('cursorMove', {
            to: direction,
            value: units
        });
    }

    /**
     * Move cursor to a certain direction until start/end of word
     */
    public moveWord(editor: vscode.TextEditor, direction: Direction, select: boolean = false) {
        console.log('Move word,', direction);
        const currentCursor = editor.selection.active;
        let newCursorX = currentCursor.character;

        // TODO
    }

    /**
     * Show the spaceState.space Box on screen
     */
    public showSpace(editor: vscode.TextEditor, removePrevious: boolean = true) {
        // 1. If box already exists, remove it
        if (removePrevious) {
            if (this.spaceState.mainDecoration) {
                editor.setDecorations(this.spaceState.mainDecoration, []);
            }
            if (this.spaceState.horizontalLineDecoration) {
                editor.setDecorations(this.spaceState.horizontalLineDecoration, []);
            }
        }

        // 2. Show box and vertical dividing line
        // This style is applied to the first character of the first line on the viewport
        // 2-1. Set CSS for new Box
        const countX = this.spaceState.space.maxX - this.spaceState.space.minX + 1;
        const countY = this.spaceState.space.maxY - this.spaceState.space.minY + 1;
        const boxCss: CssObject = {
            position: 'fixed',
            display: 'inline-block',
            left: (this.spaceState.charWidth * this.spaceState.space.minX - 0.05).toString() + 'ch',
            width: (this.spaceState.charWidth * countX).toString() + 'ch',
            top: (this.spaceState.charHeight * this.spaceState.space.minY).toString() + 'px',
            height: (this.spaceState.charHeight * countY).toString() + 'px',
            'z-index': 1,
            'pointer-events': 'none',
            'background-color': '#CCCCCC22',
            border: '1px solid black',
            'border-radius': '1ch'
        };

        // 2-2. Set CSS for vertical dividing line
        const midX = Math.floor((this.spaceState.space.maxX + this.spaceState.space.minX + 1) / 2);
        const verticalLineCss: CssObject = {
            position: 'fixed',
            display: 'inline-block',
            left: (this.spaceState.charWidth * midX - 0.05).toString() + 'ch',
            width: '0',
            top: (this.spaceState.charHeight * this.spaceState.space.minY).toString() + 'px',
            height: (this.spaceState.charHeight * countY).toString() + 'px',
            'z-index': 2,
            'pointer-events': 'none',
            'border-left': '1px solid white',
            'border-right': '1px solid black'
        };

        // 2-3. Add style to screen
        // boxCSS and verticalLineCSS are added to the 'before' and 'after' of the first character.
        if (countX > 1) {
            this.spaceState.mainDecoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{
                before: {
                    contentText: '',
                    textDecoration: `none; ${StyleCalculator.cssToString(boxCss)}`
                },
                after: {
                    contentText: '',
                    textDecoration: `none; ${StyleCalculator.cssToString(verticalLineCss)}`
                }
            });
        } else {
            this.spaceState.mainDecoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{
                before: {
                    contentText: '',
                    textDecoration: `none; ${StyleCalculator.cssToString(boxCss)}`
                }
            });
        }
        const viewportStart = editor.visibleRanges[0];
        editor.setDecorations(this.spaceState.mainDecoration, [viewportStart]);

        // 3. Show horizontal dividing line (if there are more than two lines)
        // This style is applied to the first character of the second line on the viewport
        if (countY > 1) {
            // 3-1. Set CSS for horizontal dividing line
            // This is saved to spaceState.horizontalLineDecoration
            const midY = Math.floor((this.spaceState.space.maxY + this.spaceState.space.minY + 1) / 2);
            const horizontalLineCss: CssObject = {
                position: 'absolute',
                display: 'inline-block',
                left: (this.spaceState.charWidth * this.spaceState.space.minX - 0.05).toString() + 'ch',
                width: (this.spaceState.charWidth * countX).toString() + 'ch',
                top: (this.spaceState.charHeight * (midY - 1) - 1).toString() + 'px', // midY - 1 because this style will be applied to a character in the second line
                height: '0',
                'z-index': 2,
                'pointer-events': 'none',
                'border-top': '1px solid white',
                'border-bottom': '1px solid black'
            };

            // 3-2. Add style to screen
            this.spaceState.horizontalLineDecoration = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{
                before: {
                    contentText: '',
                    textDecoration: `none; ${StyleCalculator.cssToString(horizontalLineCss)}`
                }
            });
            
            const viewportSecondLinePos = viewportStart.start.with(viewportStart.start.line + 1);
            const viewportSecondLine = new vscode.Range(viewportSecondLinePos, viewportSecondLinePos);
            editor.setDecorations(this.spaceState.horizontalLineDecoration, [viewportSecondLine]);
        }
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
        console.log('X coords', minX, maxX);

        this.spaceState.space = { minX, maxX, minY: 0, maxY: lineEnd - lineStart };
        this.showSpace(editor);
    }

    /**
     * Stop the current space travel
     */
    public stopSpaceTravel(editor: vscode.TextEditor) {
        this.spaceState.active = false;
        if (this.spaceState.mainDecoration) {
            editor.setDecorations(this.spaceState.mainDecoration, []);
        }
        if (this.spaceState.horizontalLineDecoration) {
            editor.setDecorations(this.spaceState.horizontalLineDecoration, []);
        }
        this.spaceState.mainDecoration = null;
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
        const countX = this.spaceState.space.maxX - this.spaceState.space.minX + 1;
        const countY = this.spaceState.space.maxY - this.spaceState.space.minY + 1;
        let midY = Math.floor((this.spaceState.space.minY + this.spaceState.space.maxY + 1) / 2);
        let midX = Math.floor((this.spaceState.space.minX + this.spaceState.space.maxX + 1) / 2);
        switch (direction) {
            case Direction.UP:
                if (countY <= 1) { return; }
                this.spaceState.space = { ...this.spaceState.previousSpace, maxY: midY - 1 };
                break;
            case Direction.DOWN:
                if (countY <= 1) { return; }
                this.spaceState.space = { ...this.spaceState.previousSpace, minY: midY };
                break;
            case Direction.LEFT:
                if (countX <= 1) { return; }
                this.spaceState.space = { ...this.spaceState.previousSpace, maxX: midX - 1 };
                break;
            case Direction.RIGHT:
                if (countX <= 1) { return; }
                this.spaceState.space = { ...this.spaceState.previousSpace, minX: midX };
                break;
            default:
                return;
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
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveUp', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.UP) : this.move(Direction.UP);
        }));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveDown', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.DOWN) : this.move(Direction.DOWN);
        }));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveLeft', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.LEFT) : this.move(Direction.LEFT);
        }));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveRight', (editor: vscode.TextEditor) => {
            this.spaceState.active ? this.spaceTravel(editor, Direction.RIGHT) : this.move(Direction.RIGHT);
        }));

        // Ctrl+j/l (Windows) or Alt+j/l (Mac) keybindings
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveWordLeft', (editor: vscode.TextEditor) => {
            this.moveWord(editor, Direction.LEFT);
        }));
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveWordRight', (editor: vscode.TextEditor) => {
            this.moveWord(editor, Direction.RIGHT);
        }));


        // Space keybinding
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.space', (editor: vscode.TextEditor) => {
            // Toggle Space Travel
            this.spaceState.active ? this.stopSpaceTravel(editor) : this.startSpaceTravel(editor);
        }));
    }
}