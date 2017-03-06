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

import {Map} from "./Map";

export class LearningClipUtils {

  private static clipUtilsDiv: HTMLDivElement;
  private static mapContainer: Map = new Map();
  private static _ellipsis: string = "ellipsis";

  private static init(): boolean {
    try {
      LearningClipUtils.clipUtilsDiv = document.createElement("div");
      LearningClipUtils.clipUtilsDiv.style.zIndex = "0";
      LearningClipUtils.clipUtilsDiv.style.position = "absolute";
      LearningClipUtils.clipUtilsDiv.style.visibility = "hidden";
      LearningClipUtils.clipUtilsDiv.style.whiteSpace = "pre";
      LearningClipUtils.clipUtilsDiv.style.width = "auto";
      document.body.appendChild(LearningClipUtils.clipUtilsDiv);
      return true;
    } catch (err) {
      return false;
    }
  }

  private static alreadyInit: boolean = LearningClipUtils.init();

  public static clip(label: string, maxLength: number, styleClass: string = "noClassMap"): string {
    if (!LearningClipUtils.alreadyInit) {
      LearningClipUtils.alreadyInit = LearningClipUtils.init();
    }
    let currentMap: Map = this.mapContainer.get(styleClass);
    if (currentMap == null) {
      currentMap = new Map();
      currentMap.put(LearningClipUtils._ellipsis, LearningClipUtils._testString(" ...", styleClass));
      this.mapContainer.put(styleClass, currentMap);
    }
    let labelWidth: number = LearningClipUtils._testString(label, styleClass);
    if (labelWidth <= maxLength) return label;
    let getChar: string, truncatedLabelWidth: number;
    for (let i = label.length - 1; i > 0; i--) {
      getChar = label[i];
      if (currentMap.containsKey(getChar)) {
        truncatedLabelWidth = labelWidth - currentMap.get(getChar);
      }
      else {
        // learning step
        truncatedLabelWidth = LearningClipUtils._testString(label.substring(0, i), styleClass);
        currentMap.put(getChar, labelWidth - truncatedLabelWidth);
      }
      labelWidth = truncatedLabelWidth;
      if (labelWidth + currentMap.get(LearningClipUtils._ellipsis) <= maxLength) return label.substring(0, i) + " ...";
    }
    return label;
  }

  private static _testString(str: string, className: string): number {
    LearningClipUtils.clipUtilsDiv.className = className;
    LearningClipUtils.clipUtilsDiv.innerHTML = str;
    return LearningClipUtils.clipUtilsDiv.offsetWidth;
  }
}