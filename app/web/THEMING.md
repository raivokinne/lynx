# Custom Theme System

This document explains how to use the custom theme system in the Lynx code editor.

## Overview

The Lynx editor now supports custom themes that users can create, edit, and share. The theming system allows you to:

- Create custom color schemes for syntax highlighting
- Write custom CSS for advanced styling
- Export/import themes as JSON files
- Switch between built-in and custom themes
- Real-time preview of theme changes

## Getting Started

### Accessing the Theme Editor

1. Click the **Settings** button in the sidebar
2. Navigate to the **Themes** tab
3. Click **Create Theme** to open the theme editor

### Theme Editor Interface

The theme editor has three main tabs:

#### 1. Visual Editor
- **Theme Information**: Set your theme name and basic info
- **Editor Colors**: Configure background, text, selection, and cursor colors using color pickers
- **Syntax Highlighting**: Set colors for different code elements (keywords, strings, comments, etc.)

#### 2. Custom CSS
Write custom CSS to style advanced elements of the editor:

```css
/* Example custom CSS */
.monaco-editor {
    background-color: #1a1a2e !important;
    border-radius: 8px;
}

.monaco-editor .margin {
    background-color: #16213e !important;
}

/* Custom scrollbar */
.monaco-editor .scrollbar {
    background-color: #0f3460 !important;
}
```

#### 3. Preview
See your theme applied to sample code in real-time.

## Theme Structure

Themes are stored as JSON objects with this structure:

```json
{
  "id": "custom-theme-1640995200000",
  "name": "My Dark Theme",
  "css": "/* custom styles */",
  "colors": {
    "background": "#1e1e1e",
    "foreground": "#d4d4d4",
    "selection": "#264f78",
    "lineHighlight": "#2d2d30",
    "cursor": "#ffffff"
  },
  "tokenColors": {
    "comment": {
      "foreground": "#6A9955",
      "fontStyle": "italic"
    },
    "string": {
      "foreground": "#CE9178"
    },
    "keyword": {
      "foreground": "#C586C0"
    }
  },
  "createdAt": "2023-12-01T10:00:00.000Z"
}
```

## Available Token Types

You can customize colors for these syntax elements:

- `comment` - Code comments
- `string` - String literals
- `keyword` - Language keywords (if, else, function, etc.)
- `variable` - Variable names
- `number` - Numeric values
- `operator` - Mathematical and logical operators

## Available Colors

### Editor Colors
- `background` - Main editor background
- `foreground` - Default text color
- `selection` - Selected text background
- `lineHighlight` - Current line highlight
- `cursor` - Cursor color
- `whitespace` - Whitespace character color

### Font Styles
- `normal` - Regular text
- `bold` - Bold text
- `italic` - Italic text
- `bold italic` - Bold and italic text

## Examples

### Dark Theme Example
```json
{
  "name": "Midnight Blue",
  "colors": {
    "background": "#0a0e27",
    "foreground": "#ffffff",
    "selection": "#1e3a8a",
    "lineHighlight": "#1e1b4b"
  },
  "tokenColors": {
    "keyword": { "foreground": "#60a5fa", "fontStyle": "bold" },
    "string": { "foreground": "#34d399" },
    "comment": { "foreground": "#6b7280", "fontStyle": "italic" }
  }
}
```

### Light Theme Example
```json
{
  "name": "Sunrise",
  "colors": {
    "background": "#fefce8",
    "foreground": "#1f2937",
    "selection": "#fde68a",
    "lineHighlight": "#fef3c7"
  },
  "tokenColors": {
    "keyword": { "foreground": "#dc2626", "fontStyle": "bold" },
    "string": { "foreground": "#059669" },
    "comment": { "foreground": "#6b7280", "fontStyle": "italic" }
  }
}
```

## Best Practices

### Color Accessibility
- Ensure sufficient contrast between text and background colors
- Test your theme with different types of code
- Consider colorblind users when choosing colors

### CSS Guidelines
- Use `!important` sparingly, only when necessary to override Monaco defaults
- Target specific Monaco classes to avoid affecting other UI elements
- Test your CSS changes in the preview tab

### Theme Naming
- Use descriptive names that reflect the theme's appearance
- Avoid generic names like "Theme 1" or "My Theme"
- Consider the mood or inspiration (e.g., "Ocean Breeze", "Cyber Punk")

## Sharing Themes

### Export Theme
1. Open the theme in the editor
2. Click **Export** to download as JSON file
3. Share the file with other users

### Import Theme
1. Click **Import** in the theme editor
2. Select a theme JSON file
3. The theme will be loaded and can be modified

## Troubleshooting

### Theme Not Applying
- Ensure Monaco editor is fully loaded before applying themes
- Check browser console for JavaScript errors
- Try refreshing the page and reapplying the theme

### CSS Not Working
- Use browser developer tools to inspect elements
- Ensure CSS selectors are specific enough
- Check that Monaco classes haven't changed

### Colors Not Showing
- Verify color values are valid hex codes
- Ensure token types are spelled correctly
- Check that the theme is properly saved

## Technical Details

### Theme Storage
- Themes are stored in the user's settings
- Local storage is used as fallback for non-authenticated users
- Themes are automatically synced across devices when logged in

### Monaco Integration
- Themes are registered with Monaco Editor using `monaco.editor.defineTheme()`
- Custom CSS is injected into the document head
- Theme switching is handled by `monaco.editor.setTheme()`

### Performance
- Themes are cached after first load
- CSS injection is optimized to prevent duplicates
- Theme switching is instant with no reload required