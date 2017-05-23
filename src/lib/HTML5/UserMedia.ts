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

import {Callback} from "../callbacks/Callback";

export class UserMedia {

  public static qvgaConstraints: UserMediaParams = { // Should be `MediaStreamConstraints`
    video: {
      mandatory: {
        maxWidth: 320,
        maxHeight: 240
      }
    }
  };

  public static vgaConstraints: UserMediaParams = { // Should be `MediaStreamConstraints`
    video: {
      mandatory: {
        maxWidth: 640,
        maxHeight: 480
      }
    }
  };

  public static hdConstraints: UserMediaParams = { // Should be `MediaStreamConstraints`
    video: {
      mandatory: {
        maxWidth: 1280,
        minHeight: 960
      }
    }
  };

  public static getUserMedia(constraints: UserMediaParams, callback: Callback, errorCallback: Callback) {
    if (typeof navigator !== "undefined" && typeof navigator.getUserMedia !== "undefined") {
      navigator.getUserMedia(constraints, callback.toClosure(), errorCallback.toClosure());
    } else if (typeof navigator !== "undefined" && typeof navigator.webkitGetUserMedia !== "undefined") {
      navigator.webkitGetUserMedia(constraints, callback.toClosure(), errorCallback.toClosure());
    } else if (typeof navigator !== "undefined" && typeof navigator.mozGetUserMedia !== "undefined") {
      navigator.mozGetUserMedia(constraints, callback.toClosure(), errorCallback.toClosure());
    } else {
      errorCallback.run(new Error("Error while requesting getUserMedia()"));
    }
  }

  public static getDefaultAudioVideoParams() {
    return {
      audio: true,
      video: {
        mandatory: {
          maxWidth: 640,
          maxHeight: 480,
        },
        optional: [
          { facingMode: "user" }
        ]
      }
    };
  }

  public static getDefaultAudioParams() {
    return { audio: true };
  }

  public static testBrowserSupport() {
    return (typeof navigator !== "undefined" && (
      typeof navigator.getUserMedia !== "undefined" ||
      typeof navigator.webkitGetUserMedia !== "undefined" ||
      typeof navigator.mozGetUserMedia !== "undefined"
    ));
  }

}

interface UserMediaParams {
  video: {
    mandatory: {
      minWidth?: number;
      maxWidth?: number;
      minHeight?: number;
      maxHeight?: number;
    };
  };
}
