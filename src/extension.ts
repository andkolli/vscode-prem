import * as vscode from 'vscode';

import { normalizePixelsPerRem, parseSelection, toRemText } from './convert';
import { createConversionCompletionItem, findConversionMatch } from './prem';

const DOCUMENT_SELECTOR: vscode.DocumentSelector = [
  { language: 'css' },
  { language: 'scss' },
  { language: 'sass' },
  { language: 'less' },
  { language: 'postcss' },
  { language: 'html' },
  { language: 'vue' },
  { language: 'svelte' },
  { language: 'astro' },
];

export function activate(context: vscode.ExtensionContext): void {
  const provider = vscode.languages.registerCompletionItemProvider(
    DOCUMENT_SELECTOR,
    {
      provideCompletionItems(document, position) {
        const match = findConversionMatch(document, position);
        if (!match) {
          return undefined;
        }

        return [createConversionCompletionItem(match, getPixelsPerRem(document))];
      },
    },
    'm',
    'M',
  );

  const convertSelectionCommand = vscode.commands.registerTextEditorCommand(
    'prem.convertSelectionToRem',
    async (editor) => {
      const pixelsPerRem = getPixelsPerRem(editor.document);
      const selections = editor.selections.filter((selection) => !selection.isEmpty);

      if (selections.length === 0) {
        void vscode.window.showInformationMessage(
          'PRem: Select one or more values like 32px, 16prem, 16pxrem, or 14.35 first.',
        );
        return;
      }

      const replacements: { selection: vscode.Selection; text: string }[] = [];
      for (const selection of selections) {
        const selectedText = editor.document.getText(selection);
        const conversion = parseSelection(selectedText);

        if (!conversion) {
          void vscode.window.showErrorMessage(
            `PRem can only convert exact values like 32px, 16prem, 16pxrem, or 14.35. Invalid selection: "${selectedText}".`,
          );
          return;
        }

        const [leading] = selectedText.match(/^\s*/)!;
        const [trailing] = selectedText.match(/\s*$/)!;
        replacements.push({
          selection,
          text: `${leading}${toRemText(conversion.pixels, pixelsPerRem)}${trailing}`,
        });
      }

      await editor.edit((editBuilder) => {
        for (const { selection, text } of replacements) {
          editBuilder.replace(selection, text);
        }
      });
    },
  );

  context.subscriptions.push(provider, convertSelectionCommand);
}

function getPixelsPerRem(document: vscode.TextDocument): number {
  return normalizePixelsPerRem(
    vscode.workspace.getConfiguration('prem', document).get('pixelsPerRem'),
  );
}

export function deactivate(): void {}
