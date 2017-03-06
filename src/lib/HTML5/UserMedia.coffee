#
# Copyright (C) 2017 ZeXtras S.r.l.
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation, version 2 of
# the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License.
# If not, see <http://www.gnu.org/licenses/>.
#

define(
  [
    "require",
    "exports"
  ],
  (
    require,
    exports
  ) ->
    "use strict"
    
    class UserMedia

      ###*
        Constraints object for low resolution video
      ###
      @qvgaConstraints  = {
        video: {
          mandatory: {
            maxWidth: 320
            maxHeight: 240
          }
        }
      }

      ###*
        Constraints object for standard resolution video
      ###
      @vgaConstraints  = {
        video: {
          mandatory: {
            maxWidth: 640
            maxHeight: 480
          }
        }
      }

      ###*
        Constraints object for high resolution video
      ###
      @hdConstraints  = {
        video: {
          mandatory: {
            minWidth: 1280
            minHeight: 960
          }
        }
      }

      ###*
        Proxy for the getUserMedia() function
        @param {{}} mediaParams use one of UserMedia.(qvga|vga|hd)Constraints
        @param {Callback} callback
        @param {Callback} errorCallback
      ###
      @getUserMedia: (constraints, callback, errorCallback) ->
        if navigator.getUserMedia?
          navigator.getUserMedia(constraints, callback.toClosure(), errorCallback.toClosure())
        else if navigator.webkitGetUserMedia?
          navigator.webkitGetUserMedia(constraints, callback.toClosure(), errorCallback.toClosure())
        else if navigator.mozGetUserMedia?
          navigator.mozGetUserMedia(constraints, callback.toClosure(), errorCallback.toClosure())

      ###*
        Get the default getUserMedia constraints with:
        - Audio enabled
        - Video at resolution 460x480
        - If possible retrieve the user facing camera
       @return {{}}
      ###
      @getDefaultAudioVideoParams: () ->
        {
          audio: true
          video: {
            mandatory: {
              maxWidth: 640
              maxHeight: 480
            }
            optional: [
              { facingMode: "user" }
            ]
          }
        }

      ###*
        Get the default getUserMedia constraints with:
        - Audio enabled
       @return {{}}
      ###
      @getDefaultAudioParams: () ->
        {
          audio: true
        }

      ###*
        Test the user media capabilities of the current browser
        @return {boolean}
      ###
      @testBrowserSupport: () ->
        if navigator.getUserMedia? or navigator.webkitGetUserMedia? or navigator.mozGetUserMedia?
          true
        else
          false

    exports.UserMedia = UserMedia
    return
)
