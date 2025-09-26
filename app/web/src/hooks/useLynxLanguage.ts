import { useCallback } from "react";
import {
  getLynxTokensProvider,
  getLynxLanguageConfiguration,
} from "../config/lynx";
import { createCompletionProvider } from "../config/completion";

export const useLynxLanguage = () => {
  const registerLynxLanguage = useCallback(() => {
    if (
      !window.monaco ||
      window.monaco.languages.getLanguages().find((l: any) => l.id === "lynx")
    ) {
      return;
    }

    window.monaco.languages.register({ id: "lynx" });

    window.monaco.languages.setMonarchTokensProvider(
      "lynx",
      getLynxTokensProvider(),
    );

    window.monaco.languages.registerCompletionItemProvider(
      "lynx",
      createCompletionProvider(),
    );

    window.monaco.languages.setLanguageConfiguration(
      "lynx",
      getLynxLanguageConfiguration(),
    );

    console.log("Lynx language registered with enhanced features");
  }, []);

  return { registerLynxLanguage };
};
