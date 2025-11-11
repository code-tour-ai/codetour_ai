// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

export class AnalysisLogger {
    private logPath: string;
    private logs: string[] = [];

    constructor(workspaceRoot: string) {
        this.logPath = path.join(workspaceRoot, '.codetour-analysis.log');
        this.clear();
        this.log('='.repeat(80));
        this.log('CodeTour AI - TreeSitter AST Analysis Log');
        this.log(`Timestamp: ${new Date().toISOString()}`);
        this.log('='.repeat(80));
    }

    log(message: string) {
        const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
        const logLine = `[${timestamp}] ${message}`;
        this.logs.push(logLine);
        console.log(message);
    }

    logTreeSitterInit(languages: string[]) {
        this.log('');
        this.log('🌳 TREESITTER AST PARSER INITIALIZED');
        this.log(`   Supported Languages: ${languages.join(', ')}`);
        this.log(`   Parser Type: web-tree-sitter (WASM)`);
        this.log(`   Analysis Method: Real Abstract Syntax Tree parsing`);
        this.log('');
    }

    logFileAnalysis(file: string, method: 'treesitter' | 'regex', stats: {
        astNodeType?: string;
        astNodeCount?: number;
        classes: number;
        functions: number;
        methods: number;
        imports: number;
        exports: number;
    }) {
        this.log(`📄 ${file}`);
        if (method === 'treesitter') {
            this.log(`   ✅ Method: TreeSitter AST`);
            if (stats.astNodeType) {
                this.log(`   └─ AST Root Node: ${stats.astNodeType}`);
            }
            if (stats.astNodeCount) {
                this.log(`   └─ AST Node Count: ${stats.astNodeCount}`);
            }
        } else {
            this.log(`   ⚠️  Method: Regex Fallback`);
        }
        this.log(`   └─ Found: ${stats.classes} classes, ${stats.functions} functions, ${stats.methods} methods`);
        this.log(`   └─ Imports: ${stats.imports}, Exports: ${stats.exports}`);
        this.log('');
    }

    logSummary(totalFiles: number, treesitterCount: number, regexCount: number) {
        this.log('='.repeat(80));
        this.log('ANALYSIS SUMMARY');
        this.log(`   Total Files Analyzed: ${totalFiles}`);
        this.log(`   TreeSitter AST: ${treesitterCount} files (${Math.round(treesitterCount / totalFiles * 100)}%)`);
        this.log(`   Regex Fallback: ${regexCount} files (${Math.round(regexCount / totalFiles * 100)}%)`);
        this.log('='.repeat(80));
        this.log('');
        this.log('✅ TreeSitter AST analysis complete!');
        this.log(`📝 Full log saved to: ${this.logPath}`);
    }

    async save() {
        try {
            await fs.promises.writeFile(this.logPath, this.logs.join('\n'), 'utf-8');
            vscode.window.showInformationMessage(
                `TreeSitter analysis log saved: ${path.basename(this.logPath)}`,
                'Open Log'
            ).then(action => {
                if (action === 'Open Log') {
                    vscode.workspace.openTextDocument(this.logPath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });
        } catch (error) {
            console.error('Failed to save analysis log:', error);
        }
    }

    private clear() {
        this.logs = [];
        try {
            if (fs.existsSync(this.logPath)) {
                fs.unlinkSync(this.logPath);
            }
        } catch (error) {
            // Ignore
        }
    }
}

