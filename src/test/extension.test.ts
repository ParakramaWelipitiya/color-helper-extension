import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Color Provider Tests', () => {

    test('Detect RGB color', async () => {

        const doc = await vscode.workspace.openTextDocument({
            content: '(255, 0, 0)',
            language: 'python'
        });

        const colors = await vscode.commands.executeCommand<vscode.ColorInformation[]>(
            'vscode.executeDocumentColorProvider',
            doc.uri
        );

        assert.ok(colors);
        assert.strictEqual(colors!.length, 1);
    });

    test('Detect HEX color', async () => {

        const doc = await vscode.workspace.openTextDocument({
            content: '#ff0000',
            language: 'python'
        });

        const colors = await vscode.commands.executeCommand<vscode.ColorInformation[]>(
            'vscode.executeDocumentColorProvider',
            doc.uri
        );

        assert.ok(colors);
        assert.strictEqual(colors!.length, 1);
    });

});