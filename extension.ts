import * as vscode from "vscode";
import TextmateLanguageService from "vscode-textmate-languageservice";
import { TokenizerService } from "vscode-textmate-languageservice/dist/types/src/services/tokenizer";
import * as dl from "./diagnosticsLibrary";

let diagnosticCollection: vscode.DiagnosticCollection;
let diagnosticMap: Map<string, vscode.Diagnostic[]> = new Map();
const diagnostics: vscode.Diagnostic[] = [];

export async function activate(context: vscode.ExtensionContext) {
  console.log("Activating");
  const diagnosticFunctions: Function[] = [];
  const selector: vscode.DocumentSelector = "cl";
  const textmateService = new TextmateLanguageService(selector, context);
  const textmateTokenService = await textmateService.initTokenService();

  diagnosticCollection = vscode.languages.createDiagnosticCollection("cl");
  context.subscriptions.push(diagnosticCollection);

  Object.values(dl).forEach((fn) => diagnosticFunctions.push(fn));

  vscode.workspace.textDocuments.forEach(async (textDocument) => {
    if (textDocument.languageId === "cl") {
      await updateDiagnostics(textmateTokenService, textDocument, diagnosticFunctions);
    }
  });

  vscode.workspace.onDidChangeTextDocument(async (event) => {
    const textDocument = event.document;
    if (textDocument.languageId === "cl") {
      await updateDiagnostics(textmateTokenService, textDocument, diagnosticFunctions);
    }
  });

  vscode.workspace.onDidOpenTextDocument(async (textDocument) => {
    if (textDocument.languageId === "cl") {
      await updateDiagnostics(textmateTokenService, textDocument, diagnosticFunctions);
    }
  });

  vscode.workspace.onDidCloseTextDocument(async (textDocument) => {
    if (textDocument.languageId === "cl") {
      diagnosticCollection.set(textDocument.uri, undefined);
      diagnosticMap.delete(textDocument.uri.fsPath);
    }
  });
}

async function updateDiagnostics(
  textmateTokenService: TokenizerService,
  textDocument: vscode.TextDocument,
  diagnosticFunctions: Function[]
): Promise<void> {
  const tokens = await textmateTokenService.fetch(textDocument);
  const fileURI = textDocument.uri;
  diagnostics.length = 0;

  await Promise.all(diagnosticFunctions.map((fn) => fn(tokens, diagnostics)));

  diagnosticCollection.set(textDocument.uri, undefined);
  diagnosticMap.set(fileURI.fsPath, diagnostics);
  diagnosticCollection.set(fileURI, diagnostics);
}
