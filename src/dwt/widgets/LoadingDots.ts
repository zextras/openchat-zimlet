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

import {DwtComposite} from "../../zimbra/ajax/dwt/widgets/DwtComposite";
import {Dwt} from "../../zimbra/ajax/dwt/core/Dwt";

declare let $: any;

export class LoadingDots extends DwtComposite {

  private mConfig: LoadingDotsConfig;

  constructor(parent: DwtComposite, config: LoadingDotsConfig) {
    super({
      parent: parent,
      className: "DwtComposite LoadingDots",
      template: "com_zextras_chat_open.Widgets#LoadingDots"
    });
    this.mConfig = config;
    this._createHtmlFromTemplate(this.TEMPLATE, {
      id: this._htmlElId
    });
    this.setSize(
      Dwt.DEFAULT,
      "5px"
    );
  }

  public _createHtml(): void {
    let data = {
      id: this._htmlElId
    };
    DwtComposite.prototype._createHtmlFromTemplate.call(this, this.TEMPLATE, data);
  }

  public start(): void {
    $(`#${this._htmlElId}_dots`).loadingdots(this.mConfig);
  }

  public stop(): void {
    let el = document.getElementById(`${this._htmlElId}_dots`);
    el.innerHTML = "";
  }

}

export interface LoadingDotsConfig {
  dots: number;
}
