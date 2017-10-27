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

import {AjxStringUtil} from "../zimbra/ajax/util/AjxStringUtil";
import {Map} from "./Map";

export class LearningClipUtils {

  public static clip(label: string, maxLength: number, styleClass: string = "noClassMap"): string {
    if (!LearningClipUtils.alreadyInit) {
      LearningClipUtils.alreadyInit = LearningClipUtils.init();
    }
    let currentMap: Map = this.sMapContainer.get(styleClass);
    if (currentMap == null) {
      currentMap = new Map();
      currentMap.put(LearningClipUtils.sEllipsis, LearningClipUtils.getStringWidth("…", styleClass));
      this.sMapContainer.put(styleClass, currentMap);
    }
    let labelWidth: number = LearningClipUtils.getStringWidth(label, styleClass);
    if (labelWidth <= maxLength) { return label; }
    let getChar: string;
    let truncatedLabelWidth: number;
    for (let i = label.length - 1; i > 0; i--) {
      getChar = label[i];
      if (currentMap.containsKey(getChar)) {
        truncatedLabelWidth = labelWidth - currentMap.get(getChar);
      } else {
        // learning step
        truncatedLabelWidth = LearningClipUtils.getStringWidth(label.substring(0, i), styleClass);
        currentMap.put(getChar, labelWidth - truncatedLabelWidth);
      }
      labelWidth = truncatedLabelWidth;
      if (labelWidth + currentMap.get(LearningClipUtils.sEllipsis) <= maxLength) {
        return label.substring(0, i) + "…";
      }
    }
    return label;
  }

  public static getStringWidth(str: string, className: string): number {
    LearningClipUtils.sClipUtilsDiv.className = className;
    LearningClipUtils.sClipUtilsDiv.innerHTML = AjxStringUtil.htmlEncode(str);
    return LearningClipUtils.sClipUtilsDiv.offsetWidth;
  }

  private static sClipUtilsDiv: HTMLDivElement;
  private static sMapContainer: Map = new Map();
  private static sEllipsis: string = "ellipsis";

  private static alreadyInit: boolean = LearningClipUtils.init();

  private static init(): boolean {
    try {
      LearningClipUtils.sClipUtilsDiv = document.createElement("div");
      LearningClipUtils.sClipUtilsDiv.style.zIndex = "0";
      LearningClipUtils.sClipUtilsDiv.style.position = "absolute";
      LearningClipUtils.sClipUtilsDiv.style.visibility = "hidden";
      LearningClipUtils.sClipUtilsDiv.style.whiteSpace = "pre";
      LearningClipUtils.sClipUtilsDiv.style.width = "auto";
      document.body.appendChild(LearningClipUtils.sClipUtilsDiv);
      return true;
    } catch (err) {
      return false;
    }
  }

}
