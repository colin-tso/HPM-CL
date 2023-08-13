"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkCUSTOMSyntax = exports.checkPACKAGESyntax = exports.checkBLOCKSyntax = exports.checkBrackets = exports.checkLabelSyntax = exports.checkContinuationSyntax = exports.checkContinuationSOL = exports.checkLabelDeclareOnContinue = exports.checkLabelDeclarations = exports.checkVariableDeclarations = void 0;
const vscode = require("vscode");
function checkVariableDeclarations(tokens, diagnostics) {
    const declaredVariables = new Set();
    for (const token of tokens) {
        const scopes = token.scopes;
        const isVariable = scopes.some((item) => item.includes("variable.other.cl") || item.includes("variable.declaration.cl"));
        // Check if the token represents a variable
        if (!isVariable) {
            continue;
        }
        const variableName = token.text;
        // Skip token if variable is already declared
        if (declaredVariables.has(variableName)) {
            continue;
        }
        // Check if the variable has already been declared
        if (scopes.includes("variable.declaration.cl")) {
            declaredVariables.add(variableName);
            console.log(`Variable '${variableName}' is being declared.`);
        }
        else {
            // Raise variable declaration error
            console.error(`Variable '${variableName}' has not been declared.`);
            pushDiagnostic(token, `Undeclared variable or constant '${variableName}'.`, diagnostics);
        }
    }
}
exports.checkVariableDeclarations = checkVariableDeclarations;
function checkLabelDeclarations(tokens, diagnostics) {
    let LabelType;
    (function (LabelType) {
        LabelType["GOTO"] = "GOTO";
        LabelType["REPEAT"] = "REPEAT";
    })(LabelType || (LabelType = {}));
    const declaredLabels = {
        [LabelType.GOTO]: new Set(),
        [LabelType.REPEAT]: new Set(),
    };
    const calledLabels = {
        [LabelType.GOTO]: new Set(),
        [LabelType.REPEAT]: new Set(),
    };
    for (const token of tokens) {
        const scopes = token.scopes;
        // Check if the token represents a label
        if (!scopes.some((item) => item.indexOf("label") > -1)) {
            continue;
        }
        const labelName = token.text;
        switch (true) {
            ////////////////////////////
            // Check for GOTO labels //
            ///////////////////////////
            // Check if the GOTO label is being declared
            case scopes.includes("label.start.cl") && !declaredLabels[LabelType.GOTO].has(labelName):
                declaredLabels[LabelType.GOTO].add(labelName);
                console.log(`Label identifier '${labelName}' is being declared for GOTO statement.`);
                break;
            // Check if the GOTO label has already been declared
            case scopes.includes("label.goto.cl"):
                if (!calledLabels[LabelType.GOTO].has(labelName) &&
                    !calledLabels[LabelType.REPEAT].has(labelName)) {
                    calledLabels[LabelType.GOTO].add(labelName);
                    if (!declaredLabels[LabelType.GOTO].has(labelName)) {
                        // Raise error
                        console.error(`Label identifier '${labelName}' has not been declared for GOTO statement.`);
                        pushDiagnostic(token, `Missing label identifier for GOTO statement '${labelName}'.`, diagnostics);
                    }
                }
                else {
                    console.error(`Duplicate label. Label identifier '${labelName}' has already been called for a GOTO statement.`);
                    pushDiagnostic(token, `Duplicate label. Label identifier '${labelName}' has already been called for a GOTO statement.`, diagnostics);
                }
                break;
            // Check if label is a duplicate
            case declaredLabels[LabelType.GOTO].has(labelName) &&
                (scopes.includes("label.start.cl") || scopes.includes("label.loop.cl")):
                console.error(`Duplicate label. Label identifier '${labelName}' has already been declared for a GOTO statement.`);
                pushDiagnostic(token, `Duplicate label. Label identifier '${labelName}' has already been declared for a GOTO statement.`, diagnostics);
                break;
            ////////////////////////////
            // Check for REPEAT labels //
            ///////////////////////////
            // Check if the REPEAT label is being declared
            case scopes.includes("label.loop.cl") && !declaredLabels[LabelType.REPEAT].has(labelName):
                declaredLabels[LabelType.REPEAT].add(labelName);
                console.log(`Label identifier '${labelName}' is being declared for REPEAT statement.`);
                break;
            // Check if the REPEAT label has already been declared
            case scopes.includes("label.repeat.cl"):
                if (!calledLabels[LabelType.REPEAT].has(labelName) &&
                    !calledLabels[LabelType.GOTO].has(labelName)) {
                    calledLabels[LabelType.REPEAT].add(labelName);
                    if (!declaredLabels[LabelType.REPEAT].has(labelName)) {
                        // Raise error
                        console.error(`Label identifier '${labelName}' has not been declared for REPEAT statement.`);
                        pushDiagnostic(token, `Missing label identifier for REPEAT statement '${labelName}'.`, diagnostics);
                    }
                }
                else {
                    console.error(`Duplicate label. Label identifier '${labelName}' has already been called for a REPEAT statement.`);
                    pushDiagnostic(token, `Duplicate label. Label identifier '${labelName}' has already been called for a REPEAT statement.`, diagnostics);
                }
                break;
            // Check if label is a duplicate
            case declaredLabels[LabelType.REPEAT].has(labelName) &&
                (scopes.includes("label.start.cl") || scopes.includes("label.loop.cl")):
                console.error(`Duplicate label. Label identifier '${labelName}' has already been declared for a REPEAT statement.`);
                pushDiagnostic(token, `Duplicate label. Label identifier '${labelName}' has already been declared for a REPEAT statement.`, diagnostics);
                break;
        }
    }
}
exports.checkLabelDeclarations = checkLabelDeclarations;
function checkLabelDeclareOnContinue(tokens, diagnostics) {
    for (const token of tokens) {
        const scopes = token.scopes;
        // Check if the token represents a label
        var isLabel = scopes.filter(function (item) {
            return typeof item === "string" && item.includes("label");
        });
        if (!isLabel) {
            continue;
        }
        // Check if the label is being declared on continuation line
        if (scopes.includes("invalid.illegal.label.continuation")) {
            // Raise a lint error
            console.error(`Invalid label declaration on continuation line.`);
            pushDiagnostic(token, `Invalid label declaration on continuation line.`, diagnostics);
        }
    }
}
exports.checkLabelDeclareOnContinue = checkLabelDeclareOnContinue;
function checkContinuationSOL(tokens, diagnostics) {
    for (const token of tokens) {
        const scopes = token.scopes;
        // Check if the token is an invalid continuation
        if (scopes.includes("invalid.illegal.constant.character.continuation.cl") &&
            !scopes.includes("comment.line.double-dash.cl")) {
            // Raise a lint error
            console.error(`Continuation character must be at the start of the line. [checkContinuationSOL]`);
            pushDiagnostic(token, `Continuation character must be at the start of the line.`, diagnostics);
        }
    }
}
exports.checkContinuationSOL = checkContinuationSOL;
function checkContinuationSyntax(tokens, diagnostics) {
    var lastErrorLine = 0;
    var validLine = 0;
    const openBrackets = ["("];
    const closeBrackets = [")"];
    const bracketStack = [];
    for (const token of tokens) {
        const scopes = token.scopes;
        // Check whether current content is within brackets
        if (openBrackets.some((v) => token.text.includes(v))) {
            bracketStack.push(token);
        }
        else if (closeBrackets.some((v) => token.text.includes(v))) {
            bracketStack.pop();
        }
        // Skip token if not within brackets
        if (bracketStack.length === 0) {
            continue;
        }
        // Skip token if same line as top level opening bracket
        if ((bracketStack[0].line = token.line)) {
            continue;
        }
        // Skip token if line already has a continuation error
        if (lastErrorLine === token.line) {
            continue;
        }
        // Skip token if it is a comment
        if (scopes.includes("comment.line.double-dash.cl")) {
            continue;
        }
        // Skip token if it is a continuation character
        if (scopes.includes("constant.character.continuation.cl")) {
            validLine = token.line;
            continue;
        }
        // Skip token if text is space
        if (token.text == "") {
            continue;
        }
        // Skip token if current line is already deemed valid
        if (validLine) {
            continue;
        }
        // Raise a lint error
        console.error(`Expected continuation character at the start of the line. [checkContinuationSyntax]`);
        lastErrorLine = token.line;
        pushDiagnostic(token, `Expected continuation character at the start of the line.`, diagnostics);
    }
}
exports.checkContinuationSyntax = checkContinuationSyntax;
function checkLabelSyntax(tokens, diagnostics) {
    var lastErrorLine = undefined;
    var validLine = undefined;
    var labelLine = undefined;
    var afterLabel = false;
    for (const token of tokens) {
        const scopes = token.scopes;
        // Check whether current line is a label, then skip other checks
        if (scopes.includes("meta.separator.label.colon.cl")) {
            labelLine = token.line;
            afterLabel = true;
            continue;
        }
        // Skip token if not after label
        if (!afterLabel) {
            continue;
        }
        // Skip if current line is already valid
        if (validLine === token.line) {
            continue;
        }
        // Skip if current line is already an error
        if (lastErrorLine === token.line) {
            continue;
        }
        // Skip current line if it is a continuation character
        if (scopes.includes("constant.character.continuation.cl")) {
            validLine = token.line;
            afterLabel = false;
            continue;
        }
        if (token.line > labelLine) {
            // Raise a lint error
            console.error(`Expected continuation character at the start of the line after label. [checkLabelSyntax]`);
            lastErrorLine = token.line;
            afterLabel = false;
            pushDiagnostic(token, `Expected continuation character at the start of the line after label.`, diagnostics);
        }
    }
}
exports.checkLabelSyntax = checkLabelSyntax;
function checkBrackets(tokens, diagnostics) {
    const stack = [];
    const openBrackets = ["("];
    const closeBrackets = [")"];
    const diagnosticMessages = ["Missing closing bracket.", "Missing opening bracket."];
    for (const token of tokens) {
        const scopes = token.scopes;
        if (scopes.includes("comment.line.double-dash.cl")) {
            continue;
        }
        if (openBrackets.some((v) => token.text.includes(v))) {
            stack.push(token);
        }
        else if (closeBrackets.some((v) => token.text.includes(v))) {
            if (stack.length === 0) {
                pushDiagnostic(token, diagnosticMessages[1], diagnostics);
            }
            else {
                stack.pop();
            }
        }
    }
    while (stack.length > 0) {
        const token = stack.pop();
        if (token) {
            pushDiagnostic(token, diagnosticMessages[0], diagnostics);
        }
    }
}
exports.checkBrackets = checkBrackets;
function checkBLOCKSyntax(tokens, diagnostics) {
    const blockDeclarations = new Set();
    const blockENDs = new Set();
    for (const token of tokens) {
        const scopes = token.scopes;
        if (scopes.includes("comment.line.double-dash.cl")) {
            continue;
        }
        if (!scopes.includes("entity.name.function.block.begin.cl") &&
            !scopes.includes("entity.name.function.subroutine.begin.cl") &&
            !scopes.includes("entity.name.function.end.cl")) {
            continue;
        }
        if (scopes.includes("entity.name.function.block.begin.cl") ||
            scopes.includes("entity.name.function.subroutine.begin.cl")) {
            if (!setContainsTokenText(token, blockDeclarations)) {
                blockDeclarations.add(token);
            }
            else {
                pushDiagnostic(token, `Duplicate BLOCK or SUBROUTINE identifier '${token.text}'.`, diagnostics);
            }
        }
        if (scopes.includes("entity.name.function.end.cl")) {
            if (setContainsTokenText(token, blockENDs)) {
                pushDiagnostic(token, `Duplicate BLOCK or SUBROUTINE identifier in END statement '${token.text}'.`, diagnostics);
            }
            else if (!setContainsTokenText(token, blockDeclarations)) {
                pushDiagnostic(token, `BLOCK or SUBROUTINE identifier '${token.text}' has not been declared.`, diagnostics);
            }
            else if (!setContainsTokenText(token, blockENDs)) {
                blockENDs.add(token);
            }
            else {
                pushDiagnostic(token, `Duplicate BLOCK or SUBROUTINE identifier '${token.text}'.`, diagnostics);
            }
        }
    }
    for (const blockDeclaration of blockDeclarations) {
        if (!setContainsTokenText(blockDeclaration, blockENDs)) {
            pushDiagnostic(blockDeclaration, `Missing END statement for BLOCK or SUBROUTINE identifier '${blockDeclaration.text}'.`, diagnostics);
        }
    }
}
exports.checkBLOCKSyntax = checkBLOCKSyntax;
function checkPACKAGESyntax(tokens, diagnostics) {
    var inPackage = false;
    var afterEND = false;
    const stack = [];
    for (const token of tokens) {
        const scopes = token.scopes;
        if (token.text == " ") {
            continue;
        }
        if (!scopes.includes("keyword.control.PACKAGE.cl") &&
            !scopes.includes("keyword.control.package.cl") &&
            !scopes.includes("keyword.control.END.cl") &&
            !scopes.includes("keyword.control.end.cl")) {
            afterEND = false;
            continue;
        }
        if (scopes.includes("keyword.control.END.cl") || scopes.includes("keyword.control.end.cl")) {
            afterEND = true;
            continue;
        }
        if (scopes.includes("keyword.control.PACKAGE.cl") ||
            scopes.includes("keyword.control.package.cl")) {
            if (!afterEND) {
                if (!inPackage) {
                    inPackage = true;
                    stack.push(token);
                    continue;
                }
                else {
                    pushDiagnostic(token, `Cannot nest PACKAGE inside another PACKAGE.`, diagnostics);
                    continue;
                }
            }
            else {
                afterEND = false;
                inPackage = false;
                stack.pop();
            }
        }
    }
    while (stack.length > 0) {
        const token = stack.pop();
        if (token) {
            pushDiagnostic(token, `Missing END PACKAGE statement.`, diagnostics);
        }
    }
}
exports.checkPACKAGESyntax = checkPACKAGESyntax;
function checkCUSTOMSyntax(tokens, diagnostics) {
    var inCUSTOM = false;
    var afterEND = false;
    const stack = [];
    for (const token of tokens) {
        const scopes = token.scopes;
        if (token.text == " ") {
            continue;
        }
        if (!scopes.includes("keyword.control.function.cl") &&
            !(token.text.toUpperCase() === "CUSTOM") &&
            !scopes.includes("keyword.control.END.cl") &&
            !scopes.includes("keyword.control.end.cl")) {
            afterEND = false;
            continue;
        }
        if (scopes.includes("keyword.control.END.cl") || scopes.includes("keyword.control.end.cl")) {
            afterEND = true;
            continue;
        }
        if (scopes.includes("keyword.control.function.cl") && token.text.toUpperCase() === "CUSTOM") {
            if (!afterEND) {
                if (!inCUSTOM) {
                    inCUSTOM = true;
                    stack.push(token);
                    continue;
                }
                else {
                    pushDiagnostic(token, `Cannot nest CUSTOM inside another CUSTOM.`, diagnostics);
                    continue;
                }
            }
            else {
                afterEND = false;
                inCUSTOM = false;
                stack.pop();
            }
        }
    }
    while (stack.length > 0) {
        const token = stack.pop();
        if (token) {
            pushDiagnostic(token, `Missing END CUSTOM statement.`, diagnostics);
        }
    }
}
exports.checkCUSTOMSyntax = checkCUSTOMSyntax;
function pushDiagnostic(token, errorMessage, diagnostics) {
    const range = new vscode.Range(new vscode.Position(token.line, token.startIndex), new vscode.Position(token.line, token.endIndex));
    const diagnostic = new vscode.Diagnostic(range, errorMessage, vscode.DiagnosticSeverity.Error);
    diagnostics.push(diagnostic);
}
function setContainsTokenText(tokenKey, tokenSet) {
    for (const token of tokenSet) {
        if (token.text === tokenKey.text) {
            return true;
        }
    }
    return false;
}
function setDeleteToken(tokenKey, tokenSet) {
    for (const token of tokenSet) {
        if (token.text === tokenKey.text) {
            tokenSet.delete(token);
            return true;
        }
    }
    return false;
}
//# sourceMappingURL=diagnosticsLibrary.js.map