import { bobqiushao } from './bobqiushao.js';

const themes = {
  bobqiushao,
};

export function getTheme(name) {
  return themes[name] || themes.bobqiushao;
}

export function listThemes() {
  return Object.values(themes).map(t => ({
    name: t.name,
    description: t.description,
  }));
}

export function applyInlineStyles(html, theme) {
  let result = html;
  const tagStyles = [
    ['h1', theme.h1], ['h2', theme.h2], ['h3', theme.h3],
    ['p', theme.p], ['strong', theme.strong], ['em', theme.em],
    ['blockquote', theme.blockquote], ['ul', theme.ul], ['ol', theme.ol],
    ['table', theme.table], ['hr', theme.hr],
  ];

  for (const [tag, style] of tagStyles) {
    if (style) {
      const regex = new RegExp(`<${tag}([^>]*)>`, 'gi');
      result = result.replace(regex, `<${tag} style="${style}"$1>`);
    }
  }

  return result;
}
