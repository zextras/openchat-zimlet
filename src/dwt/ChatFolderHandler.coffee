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
    "../lib/log/LogEngine"
  ],
  (
    require,
    exports,
    LogEngine_1
  ) ->
    "use strict"
    
    Log = LogEngine_1.LogEngine.getLogger(LogEngine_1.LogEngine.CHAT)

    ###*
      Handle the visibility of the chat folder if the history is enabled.
    ###
    class ChatFolderHandler

      constructor: (appCtxt, folderId, hideId = [], apps = []) ->
        @folders = []

        if hideId[folderId]?
          delete hideId[folderId]

        for appName in apps
          app = appCtxt.getApp(appName)
          if app?
            overView = app.getOverview()
            try
              overView.set(app._getOverviewTrees())
              @folders.push(overView.getTreeItemById(folderId))
            catch ignored
              Log.debug(ignored, 'Issue on getting chat folder from trees')

      ###*
        Set the visibility of the chat folder.
        @param {boolean=true} visible
      ###
      setVisible: (visible = true) ->
        folder.setVisible(visible) for folder in @folders

    exports.ChatFolderHandler = ChatFolderHandler
    return
)
