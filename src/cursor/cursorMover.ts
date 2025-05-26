import * as vscode from 'vscode';

// State for Space Travel: space-based movement when space is pressed
type Box = {
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
}

type SpaceTravelState = {
    active: boolean,
    charWidth: number,
    charHeight: number,
    currentSpace: Box,
    previousSpace: Box,
    spaceStyle: vscode.TextEditorDecorationType | null
}

export class CursorMover {
    public static moveUp(units: number = 1) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "up",
            "value": units
        });
    }

    public static moveDown(units: number = 1) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "down",
            "value": units
        });
    }

    public static moveLeft(units: number = 1) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "left",
            "value": units
        });
    }

    public static moveRight(units: number = 1) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "right",
            "value": units
        });
    }

    private spaceTravelState: SpaceTravelState = {
        active: false,
        charWidth: 1,
        charHeight: 14,
        currentSpace: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
        previousSpace: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
        spaceStyle: null
    };

    private spaceTravel(editor: vscode.TextEditor, newSpace: Box) {
        // Update space
        // 1. Update spaceTravelState
        this.spaceTravelState.active = true;
        this.spaceTravelState.previousSpace = this.spaceTravelState.currentSpace;
        this.spaceTravelState.currentSpace = newSpace;

        // 2. Calculate x, y positions again
        // let minY = newSpace.minY;
        // let maxY = newSpace.maxY;
        // let minX = 1000;
        // let maxX = 0;
        // const lineStart = editor.visibleRanges[0].start.line;
        // for (let i = lineStart + newSpace.minY; i <= lineStart + newSpace.maxY; i++) {
        //     minX = Math.min(minX, editor.document.lineAt(i).firstNonWhitespaceCharacterIndex)
        //     maxX = Math.max(maxX, editor.document.lineAt(i).range.end.character)
        // }

        // 3. Move cursor
        const currentCursor = editor.selection.active;
        let newCursorX = currentCursor.character;
        let newCursorY = currentCursor.line;

        newCursorX = Math.min(newCursorX, newSpace.maxX); // move left
        newCursorX = Math.max(newCursorX, newSpace.minX); // move right
        const lineStart = editor.visibleRanges[0].start.line;
        newCursorY = Math.min(newCursorY, newSpace.maxY + lineStart); // move up
        newCursorY = Math.max(newCursorY, newSpace.minY + lineStart); // move down
        
        const newCursorPosition = new vscode.Position(newCursorY, newCursorX);
        const newSelection = new vscode.Selection(newCursorPosition, newCursorPosition);
        editor.selections = [newSelection];

        // 4. Visually remove previous box
        if (this.spaceTravelState.spaceStyle) {
            editor.setDecorations(this.spaceTravelState.spaceStyle, []);
        }

        // 5. Visually create new box
        const newStyle = {
            left: (this.spaceTravelState.charWidth * newSpace.minX).toString() + 'ch',
            width: (this.spaceTravelState.charWidth * (newSpace.maxX - newSpace.minX)).toString() + 'ch',
            top: (this.spaceTravelState.charHeight * newSpace.minY).toString() + 'pt',
            height: (this.spaceTravelState.charHeight * (newSpace.maxY - newSpace.minY + 1)).toString() + 'pt'
        }
        this.spaceTravelState.spaceStyle = vscode.window.createTextEditorDecorationType(<vscode.DecorationRenderOptions>{
            before: {
                contentText: '',
                textDecoration: `none; position: absolute; display: inline-block; z-index: 1; pointer-events: none; left: ${newStyle.left}; width: ${newStyle.width}; top: ${newStyle.top}; height: ${newStyle.height}; background-color: #CCCCCC22; border: 1px solid black; border-radius: 1ch;`
            }
        });
        const viewportStart = editor.visibleRanges[0];
        editor.setDecorations(this.spaceTravelState.spaceStyle, [viewportStart]);
    }

    // Stop the current space travel
    private stopSpaceTravel(editor: vscode.TextEditor) {
        this.spaceTravelState.active = false;
        if (this.spaceTravelState.spaceStyle) {
            editor.setDecorations(this.spaceTravelState.spaceStyle, []);
        }
        this.spaceTravelState.spaceStyle = null;
        return;
    }

    // Start a new space travel
    private newSpaceTravel(editor: vscode.TextEditor) {
        const lineStart = editor.visibleRanges[0].start.line;
        const lineEnd = editor.visibleRanges[0].end.line;

        // Compute minimum and maximum possible x values
        let minX = 1000;
        let maxX = 0;
        for (let i = lineStart; i <= lineEnd; i++) {
            minX = Math.min(minX, editor.document.lineAt(i).firstNonWhitespaceCharacterIndex);
            maxX = Math.max(maxX, editor.document.lineAt(i).range.end.character);
        }

        const newSpace: Box = { minX, maxX, minY: 0, maxY: lineEnd - lineStart };
        this.spaceTravel(editor, newSpace);
    }

    public activate(context: vscode.ExtensionContext) {
        const lineHeight: number = vscode.workspace.getConfiguration('editor').get('lineHeight') ?? 0;
        const fontSize: number = vscode.workspace.getConfiguration('editor').get('fontSize') ?? 14;
        console.log('CONFIG', lineHeight, fontSize);

        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorUp', (editor: vscode.TextEditor) => {
            if (this.spaceTravelState.active) {
                let midY = Math.floor((this.spaceTravelState.currentSpace.minY + this.spaceTravelState.currentSpace.maxY) / 2);
                this.spaceTravel(editor, { ...this.spaceTravelState.currentSpace, maxY: midY })
            } else {
                CursorMover.moveUp();
            }
        }));
    
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorDown', (editor: vscode.TextEditor) => {
            if (this.spaceTravelState.active) {
                let midY = Math.floor((this.spaceTravelState.currentSpace.minY + this.spaceTravelState.currentSpace.maxY) / 2);
                this.spaceTravel(editor, { ...this.spaceTravelState.currentSpace, minY: midY + 1 })
            } else {
                CursorMover.moveDown();
            }
        }));
    
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorLeft', (editor: vscode.TextEditor) => {
            if (this.spaceTravelState.active) {
                let midX = Math.floor((this.spaceTravelState.currentSpace.minX + this.spaceTravelState.currentSpace.maxX) / 2);
                this.spaceTravel(editor, { ...this.spaceTravelState.currentSpace, maxX: midX })
            } else {
                CursorMover.moveLeft();
            }
        }));
        
        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.moveCursorRight', (editor: vscode.TextEditor) => {
            if (this.spaceTravelState.active) {
                let midX = Math.floor((this.spaceTravelState.currentSpace.minX + this.spaceTravelState.currentSpace.maxX) / 2);
                this.spaceTravel(editor, { ...this.spaceTravelState.currentSpace, minX: midX })
            } else {
                CursorMover.moveRight();
            }
        }));

        context.subscriptions.push(vscode.commands.registerTextEditorCommand('zim.space', (editor: vscode.TextEditor) => {
            if (this.spaceTravelState.active) {
                // Stop space travel
                this.stopSpaceTravel(editor);
            } else {
                // Start new space travel
                this.newSpaceTravel(editor);
            }

            // const cursorPosition = editor.selection.active;
            // const newRange = new vscode.Range(
            //     cursorPosition.with(cursorPosition.line, cursorPosition.character),
            //     // Value can't be negative
            //     cursorPosition.with(cursorPosition.line, Math.max(0, cursorPosition.character))
            // );

            // vscode.window.showInformationMessage("tab time start");
            // const timer = setTimeout(() => {
            //     vscode.window.showInformationMessage("tab time end");
            // }, 2000);
            // const full_range = [new vscode.Range(new vscode.Position(0, 0), new vscode.Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER))];
        }));
    }
}