import * as vscode from 'vscode';

import {
  createConversionCompletionItem,
  findConversionMatch,
  parseSelectedConversion,
  toRemText,
} from './prem';

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
        const settings = getSettings();
        const match = findConversionMatch(document, position);
        if (!match) {
          return undefined;
        }

        return [createConversionCompletionItem(match, settings.pixelsPerRem)];
      },
    },
    'm',
  );

  const convertSelectionCommand = vscode.commands.registerTextEditorCommand(
    'prem.convertSelectionToRem',
    async (editor) => {
      const settings = getSettings();
      const selections = editor.selections.filter((selection) => !selection.isEmpty);

      if (selections.length === 0) {
        void vscode.window.showInformationMessage(
          'PRem: Select one or more values like 32px, 16prem, 16pxrem, or 14.35 first.',
        );
        return;
      }

      const replacements = selections.map((selection) => {
        const selectedText = editor.document.getText(selection);
        const conversion = parseSelectedConversion(selectedText);

        if (!conversion) {
          return {
            error: selectedText,
            selection,
          };
        }

        return {
          selection,
          replacement: toRemText(conversion.pixels, settings.pixelsPerRem),
        };
      });

      const invalidSelection = replacements.find(
        (replacement): replacement is { error: string; selection: vscode.Selection } =>
          'error' in replacement,
      );

      if (invalidSelection) {
        void vscode.window.showErrorMessage(
          `PRem can only convert exact values like 32px, 16prem, 16pxrem, or 14.35. Invalid selection: "${invalidSelection.error}".`,
        );
        return;
      }

      const validReplacements = replacements.filter(
        (
          replacement,
        ): replacement is { replacement: string; selection: vscode.Selection } =>
          'replacement' in replacement,
      );

      await editor.edit((editBuilder) => {
        for (const replacement of validReplacements) {
          editBuilder.replace(replacement.selection, replacement.replacement);
        }
      });
    },
  );

  context.subscriptions.push(provider, convertSelectionCommand);
}

interface PremSettings {
  pixelsPerRem: number;
}

function getSettings(): PremSettings {
  const configuration = vscode.workspace.getConfiguration('prem');
  const configuredValue = configuration.get<number>('pixelsPerRem', 16);

  return {
    pixelsPerRem: !configuredValue || configuredValue <= 0 ? 16 : configuredValue,
  };
}

export function deactivate(): void {}
