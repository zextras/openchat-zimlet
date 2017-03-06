/*
 * Copyright (C) 2017 ZeXtras S.r.l.
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation, version 2 of
 * the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License.
 * If not, see <http://www.gnu.org/licenses/>.
 */

export class HTMLUtils {
  public static getCSSDefinition(name: string): CSSStyleDeclaration {
    let i: number,
      j: number,
      styleSheets: StyleSheetList,
      styleSheet: CSSStyleSheet,
      rules: CSSRuleList,
      rule: CSSStyleRule;
    if (typeof document !== "undefined" && typeof document.styleSheets !== "undefined") {
      styleSheets = document.styleSheets;

      for (i = 0; i < styleSheets.length; i++) {
        styleSheet = <CSSStyleSheet> styleSheets[i];
        if (typeof styleSheet.rules !== "undefined" || typeof styleSheet.cssRules !== "undefined") {
          rules = styleSheet.rules || styleSheet.cssRules;
          for (j = 0; j < rules.length; j++) {
            rule = <CSSStyleRule> rules[j];
            if (name === rule.selectorText) {
              return rule.style;
            }
          }
        }
      }
    }
  }

  public static htmlUnEscape(text: string): string {
    return text.replace(/&amp;/g, "&")
        .replace(/&quot;/g, "\"")
        .replace(/&#39;/g, "\'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/<br>/g, "\n");
  }

  public static htmlEscape(text: string): string {
    return text.replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\r/g, "");
        // .replace(/\n/g, "<br>")
  }
}
