import * as vscode from 'vscode';

import { findShortcut, toRemText, type ShortcutValue } from './convert';

export interface ConversionMatch extends ShortcutValue {
  range: vscode.Range;
}

export function findConversionMatch(
  document: vscode.TextDocument,
  position: vscode.Position,
): ConversionMatch | undefined {
  if (position.character === 0) {
    return undefined;
  }

  const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
  const shortcut = findShortcut(linePrefix);
  if (!shortcut) {
    return undefined;
  }

  return {
    ...shortcut,
    range: new vscode.Range(position.translate(0, -shortcut.rawValue.length), position),
  };
}

export function createConversionCompletionItem(
  match: ConversionMatch,
  pixelsPerRem: number,
): vscode.CompletionItem {
  const remText = toRemText(match.pixels, pixelsPerRem);
  const completionItem = new vscode.CompletionItem(
    remText,
    vscode.CompletionItemKind.Value,
  );

  completionItem.detail = `Convert shortcut ${match.rawValue} to ${remText}`;
  completionItem.documentation = new vscode.MarkdownString(
    [
      `Converts \`${match.rawValue}\` to \`${remText}\`.`,
      '',
      `Uses \`prem.pixelsPerRem = ${pixelsPerRem}\`.`,
    ].join('\n'),
  );
  completionItem.filterText = match.rawValue;
  completionItem.insertText = remText;
  completionItem.range = match.range;
  completionItem.preselect = true;
  completionItem.sortText = '\u0000';

  return completionItem;
}
