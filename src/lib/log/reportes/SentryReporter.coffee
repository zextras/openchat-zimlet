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
    'raven-js',
    '../blacklists/SentryBlacklist',
    '../../callbacks/Callback',
    '../FeedbackReporter',
    '../../../ZimletVersion'
  ],
  (
    require,
    exports,
    Raven,
    SentryBlacklist_1,
    Callback_1,
    FeedbackReporter_1,
    ZimletVersion_1
  ) ->
    "use strict"
    
    FeedbackReporter = FeedbackReporter_1.FeedbackReporter
    SentryBlacklist = SentryBlacklist_1.SentryBlacklist
    Callback = Callback_1.Callback
    ZimletVersion = ZimletVersion_1.ZimletVersion

    class SentryReporter extends FeedbackReporter

      @DSN_CHAT_PUBLIC = "https://e6d27a26a2a24466a09a13f9a3cf96fd@feedback.zextras.com/3"

      constructor: (enabled, appCtxt, dsn = SentryReporter.DSN_CHAT_PUBLIC) ->
        super('Raven', enabled)
        environment = ''
        if ZimletVersion.STABLE
          environment = ' stable'
        if ZimletVersion.STAGING
          environment = ' staging'
        if ZimletVersion.TESTING
          environment = ' testing'

        if Raven.isSetup()
          @_raven = Raven
        else
          @_raven = Raven.config(
            dsn
            {
              fetchContext: true
              linesOfContext: 11
              collectWindowErrors: false
              release: ZimletVersion.VERSION + '-' + ZimletVersion.COMMIT,
              environment: environment
            }
          ).install()
          @_raven._userContextSet = false
          @_raven.setUserContext()
        @onError(new Callback(@, @_processError))

      ###*
        Set the user context.
        @param {{}} data
      ###
      setUserContext: (data) ->
        if not @_raven._userContextSet? or not @_raven._userContextSet
          @_raven._userContextSet = true
          @_raven.setUserContext(data)

      _processError: (ex, ctxtMessage) ->
        data = @getContextData()
        if ctxtMessage?
          data.Message = ctxtMessage
        if not SentryBlacklist.mustBeReported(ex) then return
        if typeof ex is 'string' then ex = new Error(ex)
        @_raven.captureException(ex, data)

    exports.SentryReporter = SentryReporter
    return
)
