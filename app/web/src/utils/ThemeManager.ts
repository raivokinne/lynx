import type { CustomTheme } from "../types/types";

export class ThemeManager {
  private monaco: any;
  private registeredThemes: Set<string> = new Set();

  constructor(monaco: any) {
    this.monaco = monaco;
  }

  /**
   * Register a custom theme with Monaco Editor
   */
  registerCustomTheme(theme: CustomTheme): void {
    if (!this.monaco) {
      console.error("Monaco editor not initialized");
      return;
    }

    const monacoTheme = this.convertToMonacoTheme(theme);

    try {
      this.monaco.editor.defineTheme(theme.id, monacoTheme);
      this.registeredThemes.add(theme.id);

      // Inject custom CSS if provided
      if (theme.css) {
        this.injectCustomCSS(theme.id, theme.css);
      }
    } catch (error) {
      console.error("Failed to register theme:", error);
    }
  }

  /**
   * Convert CustomTheme to Monaco theme format
   */
  private convertToMonacoTheme(theme: CustomTheme): any {
    return {
      base: "vs-dark", // You can make this configurable
      inherit: true,
      rules: this.convertTokenColors(theme.tokenColors),
      colors: {
        "editor.background": theme.colors.background || "#1e1e1e",
        "editor.foreground": theme.colors.foreground || "#d4d4d4",
        "editor.selectionBackground": theme.colors.selection || "#264f78",
        "editor.lineHighlightBackground":
          theme.colors.lineHighlight || "#2d2d30",
        "editorCursor.foreground": theme.colors.cursor || "#ffffff",
        "editorWhitespace.foreground": theme.colors.whitespace || "#404040",
        ...theme.colors,
      },
    };
  }

  /**
   * Convert token colors to Monaco rules
   */
  private convertTokenColors(tokenColors: CustomTheme["tokenColors"]): any[] {
    const rules: any[] = [];

    Object.entries(tokenColors).forEach(([tokenType, style]) => {
      if (style && typeof style === "object") {
        rules.push({
          token: tokenType,
          foreground: style.foreground?.replace("#", "") || "",
          background: style.background?.replace("#", "") || "",
          fontStyle: style.fontStyle || "",
        });
      }
    });

    return rules;
  }

  /**
   * Inject custom CSS for additional styling
   */
  private injectCustomCSS(themeId: string, css: string): void {
    // Remove existing style tag for this theme
    const existingStyle = document.getElementById(`custom-theme-${themeId}`);
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style tag
    const style = document.createElement("style");
    style.id = `custom-theme-${themeId}`;
    style.textContent = css;
    document.head.appendChild(style);
  }

  /**
   * Apply a theme to the Monaco editor
   */
  applyTheme(themeId: string): void {
    if (!this.monaco) {
      console.error("Monaco editor not initialized");
      return;
    }

    try {
      this.monaco.editor.setTheme(themeId);
    } catch (error) {
      console.error("Failed to apply theme:", error);
    }
  }

  /**
   * Generate a theme template for users
   */
  generateThemeTemplate(): CustomTheme {
    return {
      id: `custom-theme-${Date.now()}`,
      name: "My Custom Theme",
      css: `
/* Custom CSS for your theme */
.monaco-editor {
    /* Editor background */
    background-color: #1e1e1e !important;
}

.monaco-editor .margin {
    /* Line number background */
    background-color: #252526 !important;
}

.monaco-editor .scroll-decoration {
    /* Scrollbar track */
    background-color: #2d2d30 !important;
}
            `.trim(),
      colors: {
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        selection: "#264f78",
        lineHighlight: "#2d2d30",
        cursor: "#ffffff",
      },
      tokenColors: {
        comment: { foreground: "#6A9955", fontStyle: "italic" },
        string: { foreground: "#CE9178" },
        keyword: { foreground: "#C586C0" },
        variable: { foreground: "#9CDCFE" },
        number: { foreground: "#B5CEA8" },
        operator: { foreground: "#D4D4D4" },
      },
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Remove a custom theme
   */
  removeTheme(themeId: string): void {
    // Remove CSS
    const style = document.getElementById(`custom-theme-${themeId}`);
    if (style) {
      style.remove();
    }

    this.registeredThemes.delete(themeId);
  }
}
