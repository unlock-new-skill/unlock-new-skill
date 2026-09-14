# Phase 1: Advanced Keyboard-driven Slash Commands Menu

Install suggestion and popover libraries, define command items, build the interactive suggestion popover dropdown with arrow key navigation, and integrate it into the TipTap editor.

## Dependencies

- `@tiptap/suggestion` (Handles cursor positioning and key triggers)
- `tippy.js` (Handles lightweight popover positioning)

## Design the Menu React Component (`src/components/admin/todo/slash-menu-list.jsx`)

Create a React component that receives the list of items and handles:
- **Index State:** Tracks `selectedIndex`.
- **Keyboard Listener:**
  - `ArrowUp`: Decrement `selectedIndex` (and handle wrap-around).
  - `ArrowDown`: Increment `selectedIndex` (and handle wrap-around).
  - `Enter`: Trigger selection.
  - `Escape`: Cancel suggestions.
- **Visual styling:** Small scrollable popup (`w-64 max-h-80 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 shadow-2xl`), featuring Lucide icons, titles, and sub-descriptions.

## Configure Suggestion Helper (`src/components/admin/todo/slash-suggestion.js`)

Create a helper file that configures how suggestions behave:
1. **Items filtering:** Filters the standard list of command items based on typing search terms (e.g. typing `/h1` filters down to "Heading 1").
2. **Tippy.js integration:** Binds Tippy.js to the suggestion's target rect, mounting and unmounting the `CommandList` React element smoothly.

## Integrate with Editor (`src/components/admin/todo/notion-editor.jsx`)

1. Load the custom `SlashCommands` extension.
2. Ensure typing `/` pops up the custom dropdown menu seamlessly.
