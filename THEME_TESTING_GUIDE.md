# Theme System Testing Guide

This guide will help you test the custom theme system in the Lynx code editor.

## Quick Test Steps

### 1. Check if Themes are Available
1. Open your Lynx editor
2. Click the **Settings** button in the sidebar
3. Navigate to the **Themes** tab
4. You should see:
   - 3 built-in themes (Light, Dark, High Contrast)
   - 1 demo custom theme (Demo Dark Theme)
   - Debug info showing active theme and theme count

### 2. Test Theme Switching
1. Try clicking on different built-in themes
2. The editor should change themes immediately
3. Check the debug info to see if the active theme changes

### 3. Test Custom Theme
1. Click on the "Demo Dark Theme" (purple icon)
2. The editor should switch to a dark blue/GitHub-style theme
3. Check if the custom styling is applied (rounded corners, custom colors)

### 4. Create Your Own Theme
1. Click **Create Theme** button
2. Try the Visual Editor:
   - Change the theme name
   - Use color pickers to modify colors
   - Update syntax highlighting colors
3. Switch to the **Custom CSS** tab:
   - Add custom styling like:
     ```css
     .monaco-editor {
         background-color: #2d1b69 !important;
         border-radius: 12px !important;
     }
     ```
4. Check the **Preview** tab to see your changes
5. Click **Save Theme**

### 5. Test Theme Persistence
1. Create a custom theme and save it
2. Refresh the page
3. Your custom theme should still be available
4. Switch to it - it should work

## Debugging

### Check Browser Console
Open your browser's developer tools (F12) and look for:
- "Registering custom themes:" messages
- "Defining Monaco theme:" messages
- "Setting Monaco theme:" messages
- Any error messages

### Expected Console Output
When switching themes, you should see:
```
Theme selected: demo-dark-theme isDarkMode: true
Setting dark theme to: demo-dark-theme
Settings updated: themeDark demo-dark-theme {...}
Setting Monaco theme: demo-dark-theme
```

### Common Issues

#### Theme Not Applying
- **Check**: Is Monaco Editor fully loaded?
- **Fix**: Wait a few seconds after page load before switching themes

#### Custom CSS Not Working
- **Check**: Are there any CSS syntax errors?
- **Fix**: Use browser dev tools to inspect elements and verify CSS

#### Theme Not Saving
- **Check**: Browser console for errors
- **Fix**: Ensure localStorage is working (not in private/incognito mode)

#### Colors Not Showing
- **Check**: Are color values valid hex codes?
- **Fix**: Use format like `#ffffff` not `ffffff`

## Test Cases

### Basic Functionality
- [ ] Built-in themes switch correctly
- [ ] Custom themes appear in the list
- [ ] Theme switching updates the editor immediately
- [ ] Debug info shows correct active theme

### Theme Creation
- [ ] Theme editor opens when clicking "Create Theme"
- [ ] Color pickers work in Visual Editor
- [ ] Custom CSS can be added and applied
- [ ] Preview shows changes in real-time
- [ ] Themes can be saved successfully

### Persistence
- [ ] Custom themes persist after page refresh
- [ ] Active theme is remembered
- [ ] Themes work after browser restart

### Import/Export
- [ ] Themes can be exported as JSON
- [ ] Exported themes can be imported
- [ ] Imported themes work correctly

## Example Custom Theme JSON

Here's a test theme you can import:

```json
{
  "id": "test-purple-theme",
  "name": "Purple Haze",
  "css": ".monaco-editor { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%) !important; border-radius: 15px !important; }",
  "colors": {
    "background": "#4c1d95",
    "foreground": "#f3e8ff",
    "selection": "#7c3aed",
    "lineHighlight": "#5b21b6",
    "cursor": "#fbbf24"
  },
  "tokenColors": {
    "comment": { "foreground": "#c4b5fd", "fontStyle": "italic" },
    "string": { "foreground": "#34d399" },
    "keyword": { "foreground": "#f472b6", "fontStyle": "bold" },
    "variable": { "foreground": "#fbbf24" },
    "number": { "foreground": "#60a5fa" },
    "operator": { "foreground": "#f3e8ff" }
  },
  "createdAt": "2023-12-01T10:00:00.000Z"
}
```

## Success Criteria

✅ **Working System:**
- Built-in themes switch immediately
- Custom themes can be created and applied
- Themes persist across sessions
- CSS customization works
- Import/export functions work
- No console errors

❌ **Issues to Report:**
- Themes don't apply or take too long
- Console shows errors
- Custom CSS doesn't work
- Themes don't persist
- Import/export fails

## Performance Check

The theme system should be:
- **Fast**: Theme switches should be instant
- **Smooth**: No flickering or loading delays
- **Lightweight**: No impact on editor performance

If you notice slowdowns, check:
- Number of custom themes (should handle 10+ easily)
- Size of custom CSS (keep reasonable)
- Browser memory usage

## Browser Compatibility

Test in multiple browsers:
- Chrome/Chromium
- Firefox
- Safari
- Edge

All should work identically.