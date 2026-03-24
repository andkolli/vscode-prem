import * as vscode from 'vscode';

const SHORTCUT_PATTERN = /(-?(?:\d+|\d*\.\d+))(prem|pxrem)$/;
const VALUE_PATTERN = /(-?(?:\d+|\d*\.\d+))(prem|pxrem|px)$/;
const NUMBER_ONLY_PATTERN = /^-?(?:\d+|\d*\.\d+)$/;
const INVALID_PREFIX_PATTERN = /[A-Za-z_]$/;
const MAX_FRACTION_DIGITS = 5;

export interface ConversionMatch {
  pixels: number;
  rawValue: string;
  range: vscode.Range;
  kind: 'prem' | 'pxrem' | 'px';
}

export interface ConversionValue {
  pixels: number;
  rawValue: string;
  kind: 'prem' | 'pxrem' | 'px';
}

export interface SelectedConversionValue {
  pixels: number;
  rawValue: string;
}

export function findConversionMatch(
  document: vscode.TextDocument,
  position: vscode.Position,
): ConversionMatch | undefined {
  if (position.character === 0) {
    return undefined;
  }

  const linePrefix = document.lineAt(position.line).text.slice(0, position.character);
  const match = linePrefix.match(SHORTCUT_PATTERN);

  if (!match) {
    return undefined;
  }

  const rawValue = match[0];
  const numericValue = match[1];
  const kind = match[2] as ConversionMatch['kind'];
  const matchStart = position.character - rawValue.length;
  const previousCharacter = matchStart > 0 ? linePrefix[matchStart - 1] : '';

  if (INVALID_PREFIX_PATTERN.test(previousCharacter)) {
    return undefined;
  }

  const conversion = parseConversionValue(rawValue);
  if (!conversion) {
    return undefined;
  }

  return {
    ...conversion,
    range: new vscode.Range(position.translate(0, -rawValue.length), position),
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

  completionItem.detail = getDetail(match, remText);
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

  if (match.kind !== 'px') {
    completionItem.preselect = true;
    completionItem.sortText = '\u0000';
  }

  return completionItem;
}

export function parseSelectedConversion(
  value: string,
): SelectedConversionValue | undefined {
  const conversion = parseConversionValue(value);

  if (conversion) {
    return conversion;
  }

  if (!NUMBER_ONLY_PATTERN.test(value)) {
    return undefined;
  }

  const pixels = Number.parseFloat(value);
  if (!Number.isFinite(pixels)) {
    return undefined;
  }

  return {
    pixels,
    rawValue: value,
  };
}

export function toRemText(pixels: number, pixelsPerRem: number): string {
  return `${formatRemValue(pixels / pixelsPerRem)}rem`;
}

function formatRemValue(value: number): string {
  const roundedValue =
    Math.round((value + Number.EPSILON) * 10 ** MAX_FRACTION_DIGITS) /
    10 ** MAX_FRACTION_DIGITS;

  return roundedValue.toString();
}

function getDetail(match: ConversionMatch, remText: string): string {
  if (match.kind !== 'px') {
    return `Convert shortcut ${match.rawValue} to ${remText}`;
  }

  return `Convert ${match.rawValue} to ${remText}`;
}

function parseConversionValue(
  rawValue: string,
): ConversionValue | undefined {
  const match = rawValue.match(VALUE_PATTERN);
  if (!match) {
    return undefined;
  }

  const numericValue = match[1];
  const kind = match[2] as ConversionValue['kind'];

  const pixels = Number.parseFloat(numericValue);
  if (!Number.isFinite(pixels)) {
    return undefined;
  }

  return {
    kind,
    pixels,
    rawValue,
  };
}
