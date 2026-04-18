import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    const provider: vscode.DocumentColorProvider = {

        provideDocumentColors(document) {

            const colors: vscode.ColorInformation[] = [];

            const regex = /\((\d+),\s*(\d+),\s*(\d+)\)/g;

            const text = document.getText();

            let match;

            while ((match = regex.exec(text))) {

                const r = Number(match[1]) / 255;
                const g = Number(match[2]) / 255;
                const b = Number(match[3]) / 255;

                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);

                colors.push(
                    new vscode.ColorInformation(
                        new vscode.Range(start, end),
                        new vscode.Color(r, g, b, 1)
                    )
                );
            }

            return colors;
        },

        provideColorPresentations(color) {

            return [
                new vscode.ColorPresentation(
                    `(${Math.round(color.red * 255)}, ${Math.round(color.green * 255)}, ${Math.round(color.blue * 255)})`
                )
            ];
        }
    };

    vscode.languages.registerColorProvider('python', provider);
}