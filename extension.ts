import vscode = require("vscode");
import TextmateLanguageService from "vscode-textmate-languageservice";
let diagnosticCollection: vscode.DiagnosticCollection;

export async function activate(context: vscode.ExtensionContext) {
  console.log("Activating");
  const selector: vscode.DocumentSelector = "cl";
  const textmateService = new TextmateLanguageService(selector, context);
  const textmateTokenService = await textmateService.initTokenService();

  diagnosticCollection = vscode.languages.createDiagnosticCollection("cl");
  context.subscriptions.push(diagnosticCollection);

  vscode.workspace.textDocuments.forEach(async (textDocument) => {
    if (textDocument.languageId === "cl") {
      const tokens = await textmateTokenService.fetch(textDocument);
      checkVariableDeclarations(tokens, textDocument);
    }
  });

  vscode.workspace.onDidChangeTextDocument(async (event) => {
    const textDocument = event.document;
    if (textDocument.languageId === "cl") {
      const tokens = await textmateTokenService.fetch(textDocument);
      checkVariableDeclarations(tokens, textDocument);
    }
  });

  vscode.workspace.onDidOpenTextDocument(async (textDocument) => {
    if (textDocument.languageId === "cl") {
      const tokens = await textmateTokenService.fetch(textDocument);
      checkVariableDeclarations(tokens, textDocument);
    }
  });

  vscode.workspace.onDidCloseTextDocument(async (textDocument) => {
    if (textDocument.languageId === "cl") {
      diagnosticCollection.set(textDocument.uri, undefined);
    }
  });
}

function checkVariableDeclarations(tokens, textDocument: vscode.TextDocument) {
  const declaredVariables: string[] = [];
  const diagnostics: vscode.Diagnostic[] = [];
  diagnosticCollection.set(textDocument.uri, undefined);

  for (const token of tokens) {
    const scopes = token.scopes;
    let diagnosticMap: Map<string, vscode.Diagnostic[]> = new Map();
    // Check if the token represents a variable declaration
    if (
      scopes.includes("variable.other.cl") ||
      scopes.includes("variable.declaration.cl")
    ) {
      const variableName = token.text;

      // Check if the variable has already been declared
      if (
        scopes.includes("variable.declaration.cl") &&
        !declaredVariables.includes(variableName)
      ) {
        declaredVariables.push(variableName);
        console.log(`Variable '${variableName}' is being declared.`);
      } else if (!declaredVariables.includes(variableName)) {
        // Raise a lint error
        console.error(`Variable '${variableName}' has not been declared.`);
        const range = new vscode.Range(
          new vscode.Position(token.line, token.startIndex),
          new vscode.Position(token.line, token.endIndex)
        );
        const diagnostic = new vscode.Diagnostic(
          range,
          `Undeclared variable or constant '${variableName}'.`,
          vscode.DiagnosticSeverity.Error
        );
        const fileURI = textDocument.uri;
        console.log(fileURI);
        diagnostics.push(diagnostic);
        diagnosticMap.set(fileURI.fsPath, diagnostics);
        diagnosticCollection.set(fileURI, diagnostics);
      }
    }
  }
}
