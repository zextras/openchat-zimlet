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
    "./callbacks/Callback"
  ],
  (
    require,
    exports,
    Callback_1
  ) ->
    "use strict"
    
    Callback = Callback_1.Callback

    class IdleTimer

      @_attachedToWindow = false
      @_idleTimers = {}
      @_prevTimerId = -1
      @_idCounter = 0

      ###*
        Instantiate IdleTimer for AutoAway feature
        @param {int} timeout
        @param {Callback} callback
      ###

      constructor: (timeout = 60 * 1000, callback) ->
        IdleTimer._attachToWindow()
        IdleTimer._prevTimerId += 1
        @_timerId = IdleTimer._prevTimerId
        IdleTimer._idleTimers[@_timerId] = @
        @_timeout = timeout
        @_callback = callback
        @mIdle = false
        @_windowTimerId = null
        @_stopped = true
        @start()

      toString: () ->
        "IdleTimer"

      setTime: (newTime) ->
        @_timeout = newTime
        @start()

      ###*
        Set idle
        @param {boolean} idleStatus
      ###
      setIdle: (idleStatus) ->
        if @mIdle != idleStatus
          @mIdle = idleStatus
          try
            if idleStatus
              @stop()
            else
              @start()
            if @_callback?
              @_callback.run(idleStatus)
          catch ignored

      start: () ->
        @stop()
        @_windowTimerId = setTimeout(
          (new Callback(@, @setIdle, true)).toClosure()
          @_timeout
        )
        @_stopped = false

      stop: () ->
        if @_windowTimerId?
          clearTimeout(@_windowTimerId)
          @_windowTimerId = null
          @_stopped = true

      @_attachToWindow: () ->
        if not IdleTimer._attachedToWindow
          if window? and window.addEventListener
            window.addEventListener("keydown", IdleTimer._onEvent, true)
            window.addEventListener("mousemove", IdleTimer._onEvent, true)
            window.addEventListener("mousedown", IdleTimer._onEvent, true)
            window.addEventListener("focus", IdleTimer._onEvent, true)
            IdleTimer._attachedToWindow = true
          else if document? and document.body? and document.body.attachEvent?
            document.body.attachEvent("onkeydown", IdleTimer._onEvent)
            document.body.attachEvent("onkeyup", IdleTimer._onEvent)
            document.body.attachEvent("onmousedown", IdleTimer._onEvent)
            document.body.attachEvent("onmousemove", IdleTimer._onEvent)
            document.body.attachEvent("onmouseover", IdleTimer._onEvent)
            document.body.attachEvent("onmouseout", IdleTimer._onEvent)
            window.attachEvent("onfocus", IdleTimer._onEvent)
            IdleTimer._attachedToWindow = true
          else
            IdleTimer._attachedToWindow = false
            throw new Error("Unable to attach avent listeners to the window")

      @_onEvent: () ->
        for own id, idleTimer of IdleTimer._idleTimers
          if not idleTimer._stopped or idleTimer.mIdle
            idleTimer.setIdle(false)
            idleTimer.start()

    exports.IdleTimer = IdleTimer
    return
)