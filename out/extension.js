"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const vscode_textmate_languageservice_1 = require("vscode-textmate-languageservice");
let diagnosticCollection;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Activating");
        const selector = "cl";
        const textmateService = new vscode_textmate_languageservice_1.default(selector, context);
        const textmateTokenService = yield textmateService.initTokenService();
        diagnosticCollection = vscode.languages.createDiagnosticCollection("cl");
        context.subscriptions.push(diagnosticCollection);
        vscode.workspace.textDocuments.forEach((textDocument) => __awaiter(this, void 0, void 0, function* () {
            if (textDocument.languageId === "cl") {
                const tokens = yield textmateTokenService.fetch(textDocument);
                checkVariableDeclarations(tokens, textDocument);
            }
        }));
        vscode.workspace.onDidChangeTextDocument((event) => __awaiter(this, void 0, void 0, function* () {
            const textDocument = event.document;
            if (textDocument.languageId === "cl") {
                const tokens = yield textmateTokenService.fetch(textDocument);
                checkVariableDeclarations(tokens, textDocument);
            }
        }));
        vscode.workspace.onDidOpenTextDocument((textDocument) => __awaiter(this, void 0, void 0, function* () {
            if (textDocument.languageId === "cl") {
                const tokens = yield textmateTokenService.fetch(textDocument);
                checkVariableDeclarations(tokens, textDocument);
            }
        }));
        vscode.workspace.onDidCloseTextDocument((textDocument) => __awaiter(this, void 0, void 0, function* () {
            if (textDocument.languageId === "cl") {
                diagnosticCollection.set(textDocument.uri, undefined);
            }
        }));
    });
}
exports.activate = activate;
function checkVariableDeclarations(tokens, textDocument) {
    const declaredVariables = [];
    const diagnostics = [];
    diagnosticCollection.set(textDocument.uri, undefined);
    for (const token of tokens) {
        const scopes = token.scopes;
        let diagnosticMap = new Map();
        // Check if the token represents a variable declaration
        if (scopes.includes("variable.other.cl") ||
            scopes.includes("variable.declaration.cl")) {
            const variableName = token.text;
            // Check if the variable has already been declared
            if (scopes.includes("variable.declaration.cl") &&
                !declaredVariables.includes(variableName)) {
                declaredVariables.push(variableName);
                console.log(`Variable '${variableName}' is being declared.`);
            }
            else if (!declaredVariables.includes(variableName)) {
                // Raise a lint error
                console.error(`Variable '${variableName}' has not been declared.`);
                const range = new vscode.Range(new vscode.Position(token.line, token.startIndex), new vscode.Position(token.line, token.endIndex));
                const diagnostic = new vscode.Diagnostic(range, `Undeclared variable or constant '${variableName}'.`, vscode.DiagnosticSeverity.Error);
                const fileURI = textDocument.uri;
                console.log(fileURI);
                diagnostics.push(diagnostic);
                diagnosticMap.set(fileURI.fsPath, diagnostics);
                diagnosticCollection.set(fileURI, diagnostics);
            }
        }
    }
}
//# sourceMappingURL=extension.js.map