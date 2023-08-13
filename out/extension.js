"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const vscode_textmate_languageservice_1 = require("vscode-textmate-languageservice");
const dl = require("./diagnosticsLibrary");
let diagnosticCollection;
let diagnosticMap = new Map();
const diagnostics = [];
async function activate(context) {
    console.log("Activating");
    const diagnosticFunctions = [];
    const selector = "cl";
    const textmateService = new vscode_textmate_languageservice_1.default(selector, context);
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
exports.activate = activate;
async function updateDiagnostics(textmateTokenService, textDocument, diagnosticFunctions) {
    const tokens = await textmateTokenService.fetch(textDocument);
    const fileURI = textDocument.uri;
    diagnostics.length = 0;
    await Promise.all(diagnosticFunctions.map((fn) => fn(tokens, diagnostics)));
    diagnosticCollection.set(textDocument.uri, undefined);
    diagnosticMap.set(fileURI.fsPath, diagnostics);
    diagnosticCollection.set(fileURI, diagnostics);
}
//# sourceMappingURL=extension.js.map