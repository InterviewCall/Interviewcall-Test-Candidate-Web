import type { HighlighterCore, ThemedToken } from "shiki/core";

/**
 * Syntax colours for the code in questions: Shiki, the highlighter VS Code's own
 * grammars come from, with the "Dark+" theme. It loads on first use so the gate and
 * lobby never pay for it, and only the four languages the questions use are bundled.
 */
const THEME = "dark-plus";
const LANGUAGES = new Set(["cpp", "java", "javascript", "python"]);

export interface Highlighter {
  tokenize: (code: string, language: string) => ThemedToken[][] | null;
}

let loaded: Highlighter | null = null;
let pending: Promise<Highlighter | null> | null = null;

export function loadedHighlighter(): Highlighter | null {
  return loaded;
}

export function loadHighlighter(): Promise<Highlighter | null> {
  pending ??= (async () => {
    try {
      const [{ createHighlighterCore }, { createJavaScriptRegexEngine }] = await Promise.all([
        import("shiki/core"),
        import("shiki/engine/javascript"),
      ]);
      const core: HighlighterCore = await createHighlighterCore({
        themes: [import("@shikijs/themes/dark-plus")],
        langs: [
          import("@shikijs/langs/cpp"),
          import("@shikijs/langs/java"),
          import("@shikijs/langs/javascript"),
          import("@shikijs/langs/python"),
        ],
        engine: createJavaScriptRegexEngine({ forgiving: true }),
      });
      loaded = {
        tokenize(code, language) {
          if (!LANGUAGES.has(language)) return null;
          try {
            return core.codeToTokensBase(code, { lang: language, theme: THEME });
          } catch {
            return null;
          }
        },
      };
      return loaded;
    } catch {
      // Colours are an extra. The plain code stays readable if they cannot load.
      return null;
    }
  })();
  return pending;
}
