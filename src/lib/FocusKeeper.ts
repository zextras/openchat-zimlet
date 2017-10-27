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

export class FocusKeeper {

  public static storeFocusElement(): void {
    FocusKeeper.focusElement = FocusKeeper.getActiveElement();
  }

  public static loadFocusElement() {
    if (typeof FocusKeeper.focusElement !== "undefined" && FocusKeeper !== null) {
      FocusKeeper.focusElement.focus();
      FocusKeeper.focusElement = null;
    }
  }

  private static focusElement: HTMLElement;

  private static getActiveElement(doc?: Document): HTMLElement {
    doc = doc || window.document;

    const activeElement: HTMLElement = doc.activeElement as HTMLElement;
    if (activeElement.tagName === "IFRAME") {
      return FocusKeeper.getActiveElement((doc.activeElement as HTMLIFrameElement).contentWindow.document);
    }
    return activeElement;
  }

}
