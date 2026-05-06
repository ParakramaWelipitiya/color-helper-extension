import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

    console.log("🔥 Color Extension Activated");

    const provider: vscode.DocumentColorProvider = {

        provideDocumentColors(document) {

            console.log("📄 Scanning document for colors...");

            const colors: vscode.ColorInformation[] = [];
            const text = document.getText();

            // 🔴 RGB: (255, 100, 50)
            const rgbRegex = /\((\d+),\s*(\d+),\s*(\d+)\)/g;

            // 🟣 HEX: #ff6633 or #fff
            const hexRegex = /#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g;

            let match;

            // ---- RGB parsing ----
            while ((match = rgbRegex.exec(text))) {

                console.log(`🎯 RGB found: (${match[1]}, ${match[2]}, ${match[3]})`);

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

            // ---- HEX parsing ----
            while ((match = hexRegex.exec(text))) {

                console.log(`🎯 HEX found: #${match[1]}`);

                let hex = match[1];

                // expand short hex (#fff → #ffffff)
                if (hex.length === 3) {
                    hex = hex.split('').map(c => c + c).join('');
                }

                const r = parseInt(hex.substring(0, 2), 16) / 255;
                const g = parseInt(hex.substring(2, 4), 16) / 255;
                const b = parseInt(hex.substring(4, 6), 16) / 255;

                const start = document.positionAt(match.index);
                const end = document.positionAt(match.index + match[0].length);

                colors.push(
                    new vscode.ColorInformation(
                        new vscode.Range(start, end),
                        new vscode.Color(r, g, b, 1)
                    )
                );
            }

            console.log(`✅ Total colors detected: ${colors.length}`);

            return colors;
        },

        provideColorPresentations(color: vscode.Color) {

            console.log("🎨 Providing color presentations...");

            const r = Math.round(color.red * 255);
            const g = Math.round(color.green * 255);
            const b = Math.round(color.blue * 255);

            const toHex = (v: number) =>
                v.toString(16).padStart(2, '0');

            const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

            console.log(`🔁 Converted color → RGB(${r},${g},${b}) HEX(${hex})`);

            return [
                new vscode.ColorPresentation(`(${r}, ${g}, ${b})`),
                new vscode.ColorPresentation(hex)
            ];
        }
    };

    const disposable = vscode.languages.registerColorProvider('*', provider);

    context.subscriptions.push(disposable);

    console.log("🚀 Color Provider Registered");
}

export function deactivate() {
    console.log("❌ Color Extension Deactivated");
}