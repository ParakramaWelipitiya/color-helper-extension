import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log("🔥 Color Extension Activated");

    const provider: vscode.DocumentColorProvider = {

        provideDocumentColors(document) {

            console.log("📄 Scanning document for colors...");

            const colors: vscode.ColorInformation[] = [];
            const text = document.getText();

            // 🔴 RGB/RGBA Tuples or Lists: (255, 100, 50) or [255, 100, 50] or (255, 100, 50, 255)
            const tupleRegex = /([\[\(])\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d{1,3}|\d*\.\d+))?\s*([\]\)])/g;

            // 🟢 CSS RGB/RGBA: rgb(255, 100, 50) or rgba(255, 100, 50, 0.5)
            const cssRgbRegex = /rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.\d+|\d+))?\s*\)/g;

            // 🟣 HEX: #ff6633, #fff, #ff6633ff, #ffff, 0xff6633
            const hexRegex = /(?:#|0x)([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})\b/g;

            let match;

            // ---- Tuple / List parsing ----
            while ((match = tupleRegex.exec(text))) {
                const openBracket = match[1];
                const closeBracket = match[6];

                if ((openBracket === '(' && closeBracket !== ')') || (openBracket === '[' && closeBracket !== ']')) {
                    continue;
                }

                const r = Math.min(255, Number(match[2])) / 255;
                const g = Math.min(255, Number(match[3])) / 255;
                const b = Math.min(255, Number(match[4])) / 255;

                let a = 1;
                if (match[5] !== undefined) {
                    const alphaVal = Number(match[5]);
                    if (match[5].includes('.')) {
                        a = Math.min(1, Math.max(0, alphaVal));
                    } else {
                        a = Math.min(255, alphaVal) / 255;
                    }
                }

                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);

                colors.push(
                    new vscode.ColorInformation(
                        new vscode.Range(start, end),
                        new vscode.Color(r, g, b, a)
                    )
                );
            }

            // ---- CSS RGB/RGBA parsing ----
            while ((match = cssRgbRegex.exec(text))) {
                const r = Math.min(255, Number(match[1])) / 255;
                const g = Math.min(255, Number(match[2])) / 255;
                const b = Math.min(255, Number(match[3])) / 255;

                let a = 1;
                if (match[4] !== undefined) {
                    const alphaVal = Number(match[4]);
                    if (match[4].includes('.')) {
                        a = Math.min(1, Math.max(0, alphaVal));
                    } else {
                        a = Math.min(255, alphaVal) / 255;
                    }
                }

                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);

                colors.push(
                    new vscode.ColorInformation(
                        new vscode.Range(start, end),
                        new vscode.Color(r, g, b, a)
                    )
                );
            }

            // ---- HEX parsing ----
            while ((match = hexRegex.exec(text))) {
                let hex = match[1];

                if (hex.length === 3 || hex.length === 4) {
                    hex = hex.split('').map(c => c + c).join('');
                }

                const r = parseInt(hex.substring(0, 2), 16) / 255;
                const g = parseInt(hex.substring(2, 4), 16) / 255;
                const b = parseInt(hex.substring(4, 6), 16) / 255;
                const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;

                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);

                colors.push(
                    new vscode.ColorInformation(
                        new vscode.Range(start, end),
                        new vscode.Color(r, g, b, a)
                    )
                );
            }

            console.log(`✅ Total colors detected: ${colors.length}`);
            return colors;
        },

        provideColorPresentations(color: vscode.Color, context: { document: vscode.TextDocument, range: vscode.Range }) {

            console.log("🎨 Providing color presentations...");

            const text = context.document.getText(context.range);
            const r = Math.round(color.red * 255);
            const g = Math.round(color.green * 255);
            const b = Math.round(color.blue * 255);
            const aNum = Math.round(color.alpha * 255);
            const aFloat = Number(color.alpha.toFixed(2));

            const toHex = (v: number) => v.toString(16).padStart(2, '0');

            const isHex = text.startsWith('#');
            const is0xHex = text.toLowerCase().startsWith('0x');
            const isBracket = text.startsWith('[');
            const isParen = text.startsWith('(');
            const isCssRgb = text.startsWith('rgb');
            
            const hasAlphaMatch = text.split(',').length === 4 || (isHex && (text.length === 9 || text.length === 5)) || (is0xHex && (text.length === 10 || text.length === 6)) || text.startsWith('rgba');
            const shouldIncludeAlpha = color.alpha < 1 || hasAlphaMatch;

            const presentations: vscode.ColorPresentation[] = [];

            if (isHex || is0xHex) {
                const prefix = is0xHex ? '0x' : '#';
                let hex = `${prefix}${toHex(r)}${toHex(g)}${toHex(b)}`;
                if (shouldIncludeAlpha) {
                    hex += toHex(aNum);
                }
                presentations.push(new vscode.ColorPresentation(hex));
                
                if (shouldIncludeAlpha) {
                    presentations.push(new vscode.ColorPresentation(`(${r}, ${g}, ${b}, ${aNum})`));
                } else {
                    presentations.push(new vscode.ColorPresentation(`(${r}, ${g}, ${b})`));
                }
            } else if (isBracket || isParen) {
                const open = isBracket ? '[' : '(';
                const close = isBracket ? ']' : ')';
                
                let tupleStr = `${open}${r}, ${g}, ${b}${close}`;
                if (shouldIncludeAlpha) {
                    const parts = text.split(',');
                    const lastPart = parts.length === 4 ? parts[3] : undefined;
                    if (lastPart && lastPart.includes('.')) {
                        tupleStr = `${open}${r}, ${g}, ${b}, ${aFloat}${close}`;
                    } else {
                        tupleStr = `${open}${r}, ${g}, ${b}, ${aNum}${close}`;
                    }
                }
                
                presentations.push(new vscode.ColorPresentation(tupleStr));
                
                let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                if (shouldIncludeAlpha) {
                    hex += toHex(aNum);
                }
                presentations.push(new vscode.ColorPresentation(hex));
            } else if (isCssRgb) {
                if (shouldIncludeAlpha) {
                    presentations.push(new vscode.ColorPresentation(`rgba(${r}, ${g}, ${b}, ${aFloat})`));
                } else {
                    presentations.push(new vscode.ColorPresentation(`rgb(${r}, ${g}, ${b})`));
                }
                let hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
                if (shouldIncludeAlpha) {
                    hex += toHex(aNum);
                }
                presentations.push(new vscode.ColorPresentation(hex));
            } else {
                // Fallback
                presentations.push(new vscode.ColorPresentation(`(${r}, ${g}, ${b})`));
                presentations.push(new vscode.ColorPresentation(`#${toHex(r)}${toHex(g)}${toHex(b)}`));
            }

            return presentations;
        }
    };

    const disposable = vscode.languages.registerColorProvider('*', provider);

    const insertCommand = vscode.commands.registerCommand('python-color-helper.insertColor', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            await editor.edit(editBuilder => {
                editor.selections.forEach(selection => {
                    editBuilder.replace(selection, '#ffffff');
                });
            });
            // Give the editor a moment to update and the color provider to recognize the new color
            setTimeout(() => {
                vscode.commands.executeCommand('editor.action.showHover');
            }, 150);
        }
    });

    context.subscriptions.push(disposable, insertCommand);

    console.log("🚀 Color Provider & Command Registered");
}

export function deactivate() {
    console.log("❌ Color Extension Deactivated");
}