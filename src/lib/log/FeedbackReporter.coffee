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
    "exports",
    '../callbacks/CallbackManager'
  ],
  (
    require,
    exports,
    CallbackManager_1
  ) ->
    "use strict"
    
    CallbackManager = CallbackManager_1.CallbackManager

    class FeedbackReporter

      constructor: (name, enabled) ->
        @_name = name
        @_enabled = enabled
        @_onDebug = new CallbackManager()
        @_onLog = new CallbackManager()
        @_onInfo = new CallbackManager()
        @_onWarning = new CallbackManager()
        @_onError = new CallbackManager()
        @contextData = {
          tags: {}
          extra: {}
        }

      ###*
        Get if the error reporter is enabled
        @return {boolean}
      ###
      isEnabled: () -> @_enabled

      ###*
        Enable the error reporter.
      ###
      enable: () -> @_enabled = true

      ###*
        Enable the error reporter.
      ###
      disable: () -> @_enabled = false

      ###*
        Set the context extra data which be attached to the error report.
        @param {string} key
        @param {string} value
      ###
      setExtra: (key, value) -> @contextData.extra[key] = value

      ###*
        Set a tag which be attached to the error report.
        @param {string} key
        @param {string} value
      ###
      setTag: (key, value) -> @contextData.tags[key] = value

      ###*
        Get the context data associated to the error report.
        @return {}
      ###
      getContextData: () -> @contextData

      ###*
        Set a callback which will be invoked when a
        debug line is added
        @param {Callback} fcn
      ###
      onDebug: (fcn) -> @_onDebug.addCallback(fcn)

      ###*
        Set a callback which will be invoked when a
        log line is added
        @param {Callback} fcn
      ###
      onLog: (fcn) -> @_onLog.addCallback(fcn)

      ###*
        Set a callback which will be invoked when an
        info line is added
        @param {Callback} fcn
      ###
      onInfo: (fcn) -> @_onInfo.addCallback(fcn)

      ###*
        Set a callback which will be invoked when a
        warning line is added
        @param {Callback} fcn
      ###
      onWarning: (fcn) -> @_onWarning.addCallback(fcn)

      ###*
        Set a callback which will be invoked when an
        error is added
        @param {Callback} fcn
      ###
      onError: (fcn) -> @_onError.addCallback(fcn)

      ###*
        Get the reporter name
        @return {string}
      ###
      getName: () -> @_name

      ###*
        Capture a debug line.
        @param {string} message
        @param {string} ctxtMessage
        @protected
      ###
      captureDebug: (message, ctxtMessage) ->
        if not @_enabled then return
        @_onDebug.run(message, ctxtMessage)

      ###*
        Capture a log line.
        @param {string} message
        @param {string} ctxtMessage
        @protected
      ###
      captureLog: (message, ctxtMessage) ->
        if not @_enabled then return
        @_onLog.run(message, ctxtMessage)

      ###*
        Capture an info line.
        @param {string} message
        @param {string} ctxtMessage
        @protected
      ###
      captureInfo: (message, ctxtMessage) ->
        if not @_enabled then return
        @_onInfo.run(message, ctxtMessage)

      ###*
        Capture a warning line.
        @param {string} message
        @param {string} ctxtMessage
        @protected
      ###
      captureWarning: (message, ctxtMessage) ->
        if not @_enabled then return
        @_onWarning.run(message, ctxtMessage)

      ###*
        Capture an error.
        @param {Error} error
        @param {string} ctxtMessage
        @protected
      ###
      captureError: (error, ctxtMessage) ->
        if not @_enabled then return
        @_onError.run(error, ctxtMessage)

    exports.FeedbackReporter = FeedbackReporter
    return
)
