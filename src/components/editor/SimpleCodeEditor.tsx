import { useEffect, useRef, useState, useCallback } from 'react'
import { createTypeScriptSandbox } from '@typescript/sandbox'
import type { Sandbox } from '@typescript/sandbox'

declare const window: {
    require: any
    ts: any
    monaco: any
}

export function TypeScriptEditor({ initialCode = 'const hello: string = "world"' }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const sandboxRef = useRef<Sandbox | null>(null)
    const [output, setOutput] = useState('')
    const [errors, setErrors] = useState<string[]>([])
    const [isReady, setIsReady] = useState(false)
    const [error, setError] = useState<string>('')

    useEffect(() => {
        let mounted = true

        const initMonaco = async () => {
            try {
                // Wait for TypeScript
                while (!window.ts || !window.ts.ScriptTarget) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }

                // Wait for require
                while (!window.require) {
                    await new Promise(resolve => setTimeout(resolve, 100))
                }

                // Load Monaco with TypeScript language support
                await new Promise<void>((resolve, reject) => {
                    window.require(['vs/editor/editor.main', 'vs/language/typescript/tsMode'], (main: any, tsMode: any) => {
                        if (window.monaco && window.monaco.languages.typescript) {
                            resolve()
                        } else {
                            reject(new Error('Monaco TypeScript support failed to load'))
                        }
                    }, (err: any) => {
                        reject(err)
                    })
                })

                // Ensure TypeScript defaults are configured
                if (window.monaco?.languages?.typescript) {
                    window.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                        target: window.monaco.languages.typescript.ScriptTarget.ESNext,
                        allowNonTsExtensions: true,
                        moduleResolution: window.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                        module: window.monaco.languages.typescript.ModuleKind.CommonJS,
                    })
                }

                // Extra delay to ensure everything is stable
                await new Promise(resolve => setTimeout(resolve, 300))

                if (mounted) {
                    setIsReady(true)
                }
            } catch (err) {
                console.error('Init failed:', err)
                if (mounted) {
                    setError(`Failed to initialize: ${err}`)
                }
            }
        }

        initMonaco()

        return () => {
            mounted = false
        }
    }, [])

    useEffect(() => {
        if (!containerRef.current || !isReady) return

        try {
            const sandbox = createTypeScriptSandbox(
                {
                    text: initialCode,
                    compilerOptions: {
                        target: window.ts.ScriptTarget.ESNext,
                    },
                    domID: 'monaco-editor-container',
                },
                window.require,
                window.ts
            )

            sandboxRef.current = sandbox

            sandbox.editor.onDidChangeModelContent(() => {
                sandbox.getWorkerProcess().then(async (worker) => {
                    const model = sandbox.getModel()
                    const diagnostics = await worker.getSemanticDiagnostics(model.uri.toString())

                    setErrors(
                        diagnostics.map((d) =>
                            `Line ${d.start}: ${window.ts.flattenDiagnosticMessageText(d.messageText, '\n')}`
                        )
                    )
                })
            })

            return () => {
                sandbox.editor.dispose()
            }
        } catch (err) {
            console.error('Failed to create sandbox:', err)
            setError(`Failed to create editor: ${err}`)
        }
    }, [isReady, initialCode])

    const runCode = useCallback(() => {
        if (!sandboxRef.current) return

        try {
            const js = sandboxRef.current.getRunnableJS()
            const result = eval(js)
            setOutput(String(result))
        } catch (err) {
            setOutput(`Error: ${err}`)
        }
    }, [])

    if (error) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-red-400 text-sm font-mono p-4">{error}</div>
            </div>
        )
    }

    if (!isReady) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-gray-400 text-sm">Loading TypeScript editor...</div>
            </div>
        )
    }

    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-3">
                <span className="text-sm font-mono text-gray-400">TypeScript Sandbox</span>
                <button
                    onClick={runCode}
                    className="ml-auto px-3 py-1 text-sm bg-green-600 hover:bg-green-700 rounded transition"
                >
                    Run
                </button>
            </div>

            <div id="monaco-editor-container" ref={containerRef} className="flex-1" />

            {errors.length > 0 && (
                <div className="bg-red-900/20 border-t border-red-700 p-3 max-h-32 overflow-y-auto">
                    {errors.map((err, i) => (
                        <div key={i} className="text-red-300 text-xs font-mono">
                            {err}
                        </div>
                    ))}
                </div>
            )}

            {output && (
                <div className="bg-gray-800 border-t border-gray-700 p-3">
                    <div className="text-xs text-gray-400 mb-1">Output:</div>
                    <div className="text-sm font-mono text-green-400">{output}</div>
                </div>
            )}
        </div>
    )
}