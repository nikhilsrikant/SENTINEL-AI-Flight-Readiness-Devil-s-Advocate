'use client';

// Opens the command palette by sending the same ⌘K event the keyboard shortcut does.
export function SearchButton() {
  return (
    <button
      type="button"
      className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-muted-foreground hover:bg-white/10 transition-colors"
      onClick={() => {
        document.dispatchEvent(
          new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }),
        );
      }}
    >
      <span>Search</span>
      <kbd className="px-1 py-0.5 rounded bg-white/5 text-[10px] font-mono">⌘K</kbd>
    </button>
  );
}
