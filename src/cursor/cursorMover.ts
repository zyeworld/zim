import * as vscode from 'vscode';

export class CursorMover {
    public moveUp(units: number) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "up",
            "value": units
        });
    }

    public moveDown(units: number) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "down",
            "value": units
        });
    }

    public moveLeft(units: number) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "left",
            "value": units
        });
    }

    public moveRight(units: number) {
        vscode.commands.executeCommand('cursorMove', {
            "to": "right",
            "value": units
        });
    }
}