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

import {appCtxt} from "../zimbra/zimbraMail/appCtxt";
import {DwtTreeItem} from "../zimbra/ajax/dwt/widgets/DwtTreeItem";
import {ZmApp} from "../zimbra/zimbraMail/core/ZmApp";
import {ZmOverview} from "../zimbra/zimbraMail/share/view/ZmOverview";

export class ChatFolderHandler {
  private folders: DwtTreeItem[];

  constructor(folderId: number, hideId: {[id: number]: boolean} = {}, apps: string[] = []) {
    this.folders = [];
    if (typeof hideId[folderId] !== "undefined") {
      delete hideId[folderId];
    }
    let app: ZmApp;
    let overView: ZmOverview;
    for (const appName of apps) {
      app = appCtxt.getApp(appName);
      if (typeof app !== "undefined" && app !== null) {
        overView = app.getOverview();
        try {
          overView.set(app._getOverviewTrees());
          this.folders.push(overView.getTreeItemById(folderId));
        } catch (ignored) {
          // Log.debug(ignored, "Issue on getting chat folder from trees");
        }
      }
    }
  }

  public setVisible(visible: boolean = true): void {
    for (const folder of this.folders) {
      folder.setVisible(visible);
    }
  }

}
