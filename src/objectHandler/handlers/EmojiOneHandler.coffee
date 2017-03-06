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
    "../../libext/emojione",
    "../../zimbra/zimbraMail/share/model/ZmObjectHandler"
    "../../zimbra/ajax/boot/AjxEnv"
  ],
  (
    require,
    exports,
    emojione_1,
    ZmObjectHandler_1
    AjxEnv_1
  ) ->
    "use strict"
    
    ZmObjectHandler = ZmObjectHandler_1.ZmObjectHandler
    emojione = emojione_1.emojione
    toImage = emojione_1.toImage
    AjxEnv = AjxEnv_1.AjxEnv

    class EmojiOneHandler extends ZmObjectHandler

      constructor: () ->
        @asciiRegexp = emojione.asciiRegexp
        @unicodeRegexp = emojione.unicodeRegexp
        @shortnamesRegexp = emojione.shortnamesRegexp

      ###*
        @param {string} line
        @param {number} startIndex
        @return {{}}
      ###
      match: (line, startIndex) ->
        @shortnamesRegexp.lastIndex = startIndex
        @unicodeRegexp.lastIndex = startIndex
        @asciiRegexp.lastIndex = startIndex
        # Exclude dates to the emojify process
        if /(\d{1,2}:\d{1,2})/g.test(line)
          null
        else
          # Create an array with the results
          results = []
          snR = @shortnamesRegexp.exec(line)
          results.push(new MatchResult(@shortnamesRegexp.lastIndex, snR, 1))
          ucR =  @unicodeRegexp.exec(line)
          results.push(new MatchResult(@unicodeRegexp.lastIndex, ucR, 3))
          asciiR = @asciiRegexp.exec(line)
          results.push(new MatchResult(@asciiRegexp.lastIndex, asciiR, 2))
          # Order the result and return the first (lower) match
          if results.length > 0
            results.sort(EmojiOneHandler._compareResults)
            results[0].getResult()
          else
            null

      clicked: (spanElement, contentObjText, matchContext, canvas) ->
        spanElement.parentNode.replaceChild(document.createTextNode(contentObjText), spanElement)

      ###*
        Generate the container span for the object found
        @param {string[]} html
        @param {number} idx
        @param {string} obj
        @param {string} spanId
        @param {{}} context
        @return {number}
      ###
      generateSpan: (html, idx, obj, spanId, context) ->
    #    <span style="height:18;width:18;padding:9px 18px 9px 0; background:url(https://michele.example.com/service/zimlet/com_zimbra_ymemoticons/img/4.gif) no-repeat 0 50%;"
    #      title=":D - big grin">
    #        <span style="visibility:hidden">a</span>
    #    </span>P
        imgDiv = toImage(obj)
        # Reset index, otherwise it always fail
        emojione.asciiRegexp.lastIndex = 0
        # Inline function to replace emoji with text
        removeEmoji = if emojione.asciiRegexp.test(obj) then "cursor: pointer;' id='" + spanId else ""
        html[idx] = "<span style='height:18; width:18;" + removeEmoji + "' title='#{obj}'>"
        idx += 1
    #    html[idx] = "    <span style='visibility:hidden'>a</span>"
    #    idx += 1
        html[idx] = "    #{imgDiv}"
        idx += 1
        html[idx] = "</span>"
        idx += 1
        idx

      ###*
        @param {string} string
        @return {string}
        @private
      ###
      _getImageSrc: (string) ->
        regex = new RegExp("src\\s*=\\s*\"(.+?)\"")
        regex.exec(toImage(string))[1]

      @_compareResults: (a, b) ->
        if a.hasResult() and b.hasResult()
          if a.getPriority()  < b.getPriority()
            -1
          else if a.getPriority()  > b.getPriority()
            1
          else
            0
        else if a.getResult()?
          -1
        else if b.getResult()?
          1
        else
          0

    class MatchResult

      constructor: (@lastIndex, @result, @priority = 999) ->

      getLastIndex: () -> @lastIndex

      getResult: () -> @result

      hasResult: () -> @result?

      getPriority: () -> @priority


    exports.EmojiOneHandler = EmojiOneHandler
    return
)
