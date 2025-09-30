import React, { useRef, useEffect, useState, useCallback } from "react";
import type { MonacoEditorProps } from "../types/monaco";
import { useLynxLanguage } from "../hooks/useLynxLanguage";
import { useMonacoLoader } from "../hooks/useMonacoLoader";
import { getDefaultEditorOptions } from "../config/editor";
import EditorError from "./EditorError";
import EditorLoading from "./EditorLoading";

const MonacoEditor: React.FC<MonacoEditorProps> = ({
    value = "",
    onChange,
    language = "lynx",
    theme = "vs-dark",
    height = "400px",
    width = "100%",
    readOnly = false,
    options = {},
}) => {
    const editorRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isEditorReady, setIsEditorReady] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const { registerLynxLanguage } = useLynxLanguage();

    const initializeEditor = useCallback(() => {
        if (!containerRef.current || editorRef.current || !window.monaco)
            return;

        try {
            registerLynxLanguage();

            const initialOptions = getDefaultEditorOptions(
                value,
                language,
                theme,
                readOnly,
                options,
            );

            editorRef.current = window.monaco.editor.create(
                containerRef.current,
                initialOptions,
            );

            editorRef.current.onDidChangeModelContent(() => {
                if (onChange && editorRef.current) {
                    onChange(editorRef.current.getValue());
                }
            });

            editorRef.current.addCommand(
                window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.Slash,
                () => {
                    editorRef.current.trigger(
                        "keyboard",
                        "editor.action.commentLine",
                        null,
                    );
                },
            );

            setTimeout(() => editorRef.current?.focus(), 100);
            setIsEditorReady(true);
        } catch (err: any) {
            console.error("Error initializing Monaco Editor:", err);
            setError(err?.message || String(err));
        }
    }, [
        value,
        language,
        theme,
        readOnly,
        options,
        onChange,
        registerLynxLanguage,
    ]);

    const { error: loaderError } = useMonacoLoader(initializeEditor);

    useEffect(() => {
        if (editorRef.current && isEditorReady) {
            const currentValue = editorRef.current.getValue();
            if (currentValue !== value) {
                editorRef.current.setValue(value);
            }
        }
    }, [value, isEditorReady]);

    useEffect(() => {
        if (window.monaco && isEditorReady) {
            try {
                window.monaco.editor.setTheme(theme);
            } catch (e) {
                console.warn("Failed to set theme:", e);
            }
        }
    }, [theme, isEditorReady]);

    useEffect(() => {
        if (window.monaco && isEditorReady && editorRef.current) {
            try {
                const model = editorRef.current.getModel();
                if (model) {
                    window.monaco.editor.setModelLanguage(model, language);
                }
            } catch (e) {
                console.warn("Failed to set language:", e);
            }
        }
    }, [language, isEditorReady]);

    useEffect(() => {
        if (editorRef.current && isEditorReady) {
            try {
                editorRef.current.updateOptions({ readOnly, ...options });
            } catch (e) {
                console.warn("Failed to update editor options", e);
            }
        }
    }, [options, readOnly, isEditorReady]);

    useEffect(() => {
        return () => {
            if (editorRef.current) {
                try {
                    editorRef.current.dispose();
                } catch (e) {
                    // ignore
                }
                editorRef.current = null;
            }
        };
    }, []);

    const handleContainerClick = useCallback(() => {
        if (editorRef.current && isEditorReady) {
            editorRef.current.focus();
        }
    }, [isEditorReady]);

    const finalError = error || loaderError;

    if (finalError) {
        return <EditorError error={finalError} height={height} width={width} />;
    }

    return (
        <div
            style={{ height, width }}
            className="relative border border-gray-300"
        >
            <EditorLoading isVisible={!isEditorReady} />
            <div
                ref={containerRef}
                onClick={handleContainerClick}
                style={{ height: "100%", width: "100%" }}
                className={`${!isEditorReady ? "invisible" : "visible"} cursor-text p-1`}
            />
        </div>
    );
};

export default MonacoEditor;
