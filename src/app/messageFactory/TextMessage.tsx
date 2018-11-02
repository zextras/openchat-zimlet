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

// tslint:disable:max-line-length

import {Component, h} from "preact";
import {anchorme, AnchormeAttributeOption, IAnchormeUrl} from "../../libext/anchorme";

import "./TextMessage.scss";

import {emojione, toImage} from "../../libext/emojione";
import {IOpenChatTextMessage} from "../../redux/IOpenChatState";

interface ITextMessageProps extends IOpenChatTextMessage {
  emojiSize: "16" | "32";
}

interface ITextMessageState {}

export class TextMessage extends Component<ITextMessageProps, ITextMessageState> {

  public static constainsAnEmoji(str: string): boolean {
    emojione.asciiRegexp.lastIndex = 0;
    emojione.shortnamesRegexp.lastIndex = 0;
    emojione.unicodeRegexp.lastIndex = 0;
    const containsAnEmoji = emojione.asciiRegexp.test(str)
      || emojione.shortnamesRegexp.test(str)
      || emojione.unicodeRegexp.test(str);
    emojione.asciiRegexp.lastIndex = 0;
    emojione.shortnamesRegexp.lastIndex = 0;
    emojione.unicodeRegexp.lastIndex = 0;
    return containsAnEmoji;
  }

  public static constainsALink(str: string): boolean {
    return (anchorme(
      str,
      {
        list: true,
      },
    ) as string[]).length > 0;
  }

  private static isOnlyEmojiRegExp: RegExp = /(^:[^\s]+:$)/;

  public render() {
    return this.emojify(this.props.content, this.props.emojiSize);
  }

  public shouldComponentUpdate(
    nextProps: Readonly<ITextMessageProps>,
    nextState: Readonly<ITextMessageState>,
    nextContext: any,
  ): boolean {
    return this.props.content !== nextProps.content
      || this.props.id !== nextProps.id
      || this.props.date.getTime() !== nextProps.date.getTime()
      ;
  }

  public emojify(str: string, emojiSize: "16" | "32"): JSX.Element {
    const escapedStr: string = str
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    if (!TextMessage.constainsAnEmoji(str) && !TextMessage.constainsALink(str)) {
      return (
        <div
          className="TextMessage"
          dangerouslySetInnerHTML={{
            __html: escapedStr,
          }}
        />
      );
    } else {
      const size: "16" | "32" = TextMessage.isOnlyEmojiRegExp.test(str) ? "32" : emojiSize;
      return (
        <div
          className="TextMessage"
          dangerouslySetInnerHTML={{
            __html: anchorme(
              toImage(escapedStr)
                .replace(/emojione emojione-/g, `emojione_${size} emojione_${size}-`),
              {
                attributes: [
                  (urlObj: IAnchormeUrl) => this.openLinksToBlank(urlObj),
                  (urlObj: IAnchormeUrl) => this.openMailtoLinks(urlObj),
                ],
                files: false,
              },
            ) as string,
          }}
        />
      );
    }
  }

  private openLinksToBlank(urlObj: IAnchormeUrl): AnchormeAttributeOption {
    if (
      urlObj.reason === "url"
      || urlObj.reason === "ip"
    ) {
      return { name: "target", value: "_blank" };
    }
  }

  private openMailtoLinks(urlObj: IAnchormeUrl): AnchormeAttributeOption {
    if (urlObj.reason === "email") {
      const mailto: string = urlObj.encoded;
      urlObj.raw = "#";
      urlObj.encoded = "#";
      urlObj.protocol = "";
      return {
        name: "onclick",
        value: `
          AjxDispatcher.run('Compose', {
            action: ZmOperation.NEW_MESSAGE,
            toOverride: '${mailto}',
          });
          return false;
        `,
      };
    }
  }
}
