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
    '../../libext/stacktrace-js',
    '../../libext/xregexp',
    '../../libext/json3',
    './ZxErrorCode'
  ],
  (
    require,
    exports,
    StackTrace_1,
    XRegExp_1,
    JSON3_1
    ZxErrorCode_1,
  ) ->
    "use strict"

    printStackTrace = StackTrace_1.printStackTrace
    XRegExp = XRegExp_1.XRegExp
    JSON3 = JSON3_1.JSON3
    ZxErrorCode = ZxErrorCode_1.ZxErrorCode

    class ZxError extends Error

      @KEY_CODE = "code"
      @KEY_DETAILS = "details"
      @KEY_MESSAGE = "message"
      @KEY_STACKTRACE = "stackTrace"
      @KEY_CAUSE = "cause"
      @KEY_ERROR_TIME = "time"

      @UNKNOWN_JS_EXCEPTION_CODE = 'UNKNOWN_JS_EXCEPTION'
      @UNKNOWN_JS_EXCEPTION_MSG  = 'JavaScript Exception: {details}'

      constructor: (code, cause) ->
        @_time = new Date().getTime()
        # If only a cause is passed, fix the variables
        if not cause? and code instanceof Error
          cause = code
          code = null

        if not code?
          code = ZxError.UNKNOWN_JS_EXCEPTION_CODE

        if typeof code == "string"
          if ZxErrorCode? and not ZxErrorCode.hasOwnProperty(code) and not /test/ig.test(code)
            code = ZxErrorCode.GENERIC_ERROR
        else if code instanceof Error or code.toString() == "AjxException"
          cause = code
          code = ZxErrorCode.UNKNOWN_JS_EXCEPTION

        else
          throw new TypeError("Unknown Error type")

        this.stack = super(code).stack

        if cause?
          @initCause(cause)
        else
          @_cause = null

        @name = "ZxError"
        @_code = code
        @_message = code
        if ZxErrorCode? and ZxErrorCode.getMessage?
          @_message = ZxErrorCode.getMessage(code)
        @_isException = false
        @_details = {}
        @_trace = printStackTrace()


      ###*
        Encode the error as JSONObject.
        @return {{}}
      ###
      toJSON: () ->
        obj = {}
        obj[ZxError.KEY_CODE] = @_code
        obj[ZxError.KEY_MESSAGE] = @_message
        obj[ZxError.KEY_ERROR_TIME] = @_time
        obj[ZxError.KEY_DETAILS] = @_details

        trace = []
        for traceEl in @_trace
          traceJson = {
            className: "#{traceEl.className}"
            fileName: "#{traceEl.fileName}"
            lineNumber: traceEl.lineNumber or 0
            methodName: "#{traceEl.methodName}"
            nativeMethod: traceEl.nativeMethod or false
          }
          if traceEl.character?
            traceJson.character = traceEl.character
          trace.push(traceJson)

        obj[ZxError.KEY_STACKTRACE] = trace
        if @_cause?
          obj[ZxError.KEY_CAUSE] = @_cause.toJSON()
        else
          obj[ZxError.KEY_CAUSE] = null
        obj

      ###*
        Set a cause for the error
        @param {ZxError|Error|AjxException} error
        @return {this}
      ###
      initCause: (cause) ->
        if cause instanceof ZxError
          @_cause = cause
        else if cause.toString? and cause.toString() == "AjxException"
          @_cause = ZxError.convertError(cause)
        else if cause instanceof Error
          @_cause = ZxError.convertError(cause)
        @

      ###*
        Set the details map.
        @param {string} message
        @return {this}
      ###
      _setMessage: (message) ->
        @_message = message
        @

      ###*
        Get the message of the error
        @param {string=} br Break character, default is "<br>"
        @return {string}
      ###
      getMessage: (br = "<br>") ->
        message = @_message
        for own key, value of @_details
          message = message.replace("{#{key}}", value)
        message.replace(/\n/mg, br)

      ###*
        Set the error code, the code must be one from @see {ZxErrorCode}
        @param {String} code
        @return {this}
      ###
      setCode: (code) ->
        if ZxErrorCode?
          if not ZxErrorCode.hasOwnProperty(code)
            code = ZxErrorCode.UNKNOWN_ERROR
        @_code = code
        if ZxErrorCode? and ZxErrorCode.getMessage(code)?
          @_message = ZxErrorCode.getMessage(code)
        @

      ###*
        Get the error code of the ZxError.
        @return {string}
      ###
      getCode: () ->
        @_code

      ###*
        Set the details map, this method will override all previous details set.
        @param {{}} details
        @return {this}
      ###
      setDetails: (details) ->
        @_details = details
        @

      ###*
        Set a single detail value into the details map.
        @param {String} key
        @param {String} value
        @return {ZxError}
      ###
      setDetail: (key, value) ->
        @_details[key] = value
        @

      ###*
        Get a single detail contained into detail map.
        @param {string} key
        @return {string|undefined}
      ###
      getDetail: (key) ->
        @_details[key]

      ###*
        Get the whole into detail map.
        @return {{}}
      ###
      getDetails: () ->
        @_details


      ###*
        Get if the ZxError is an exception.
        @return {boolean}
      ###
      isException: () ->
        @_isException

      ###*
        Get if the ZxError is an error.
        @return {boolean}
      ###
      isError: () ->
        not @_isException

      ###*
        Set the ZxError as an exception.
        @return {this}
      ###
      setIsException: () ->
        @_isException = true
        @

      ###*
        Set the ZxError as an error.
        @return {this}
      ###
      setIsError: () ->
        @_isException = false
        @

      ###*
        Set the stack trace information.
        @param {{}[]} trace
        @return {this}
      ###
      setStackTrace: (trace = []) ->
        @_trace = trace
        @

      ###*
        Get the stack trace information.
        @return {String[]}
      ###
      getStackTrace: () ->
        @_trace

      ###*
        Set creation time of error.
        @param {number} time
        @return {this}
      ###
      setTime: (time) ->
        @_time = time
        @

      ###*
        Get creation time of error.
        @return {number}
      ###
      getTime: () ->
        @_time

      ###*
        Get the cause of error.
        @return {ZxError}
      ###
      getCause: () ->
        @_cause

      ###*
        Create a {ZxError} object directly form a SOAP response.
        @param {{}} resp
        @return {ZxError|undefined}
        @static
      ###
      @fromResponse: (resp) ->
        error = new ZxError()

        if resp? and resp.error?
          if typeof resp.error is 'string'
            resp.error = JSON3.parse(resp.error)

          error.setIsError()
          error.setCode(resp.error[ZxError.KEY_CODE])
          error._setMessage(resp.error[ZxError.KEY_MESSAGE])
          error.setDetails(resp.error[ZxError.KEY_DETAILS])
          error.setStackTrace(resp.error[ZxError.KEY_STACKTRACE])
          if resp.error?
            cause = ZxError.convertError(resp.error)
            if cause?
              cause.setIsError()
              error = cause

        if resp? and resp.exception?
          if typeof resp.exception is 'string'
            resp.exception = JSON3.parse(resp.exception)

          error.setIsException()
          error.setCode(resp.exception[ZxError.KEY_CODE])
          error.setDetails(resp.exception[ZxError.KEY_DETAILS])
          error.setStackTrace(resp.exception[ZxError.KEY_STACKTRACE])
          if resp.exception?
            cause = ZxError.convertError(resp.exception)
            if cause?
              cause.setIsException()
              error = cause

        return error

      ###*
        Convert an arbitrary error into a ZxError object.
        @param {Error|AjxException} errorToConvert
        @return {ZxError}
        @static
      ###
      @convertError: (error) ->
        try
          if error instanceof ZxError # Does not need a conversion
            return error

          else if error.toString? and error.toString() == "ZmCsfeException"
            converted = new ZxError(ZxErrorCode.ZM_CSFE_EXCEPTION)
            converted.setDetails({
              code: error.code,
              msg: error.msg
            })

          else if error.toString? and error.toString() == "AjxException"
            converted = new ZxError(ZxErrorCode.AJX_EXCEPTION)
            converted.setDetails({details: error.msg})
            converted.setStackTrace(ZxError._buildStackTrace(error))

          else if error instanceof Error
            converted = new ZxError(ZxErrorCode.UNKNOWN_JS_EXCEPTION)
            converted.setDetails({details: error.message})
            converted.setStackTrace(ZxError._buildStackTrace(error))


          else if typeof error == 'object'
            # The cause is a plain object, try to extract useful some information.
            converted = new ZxError()
            if error[ZxError.KEY_CODE]?
              converted.setCode(error[ZxError.KEY_CODE])

            if error[ZxError.KEY_MESSAGE]?
              converted._setMessage(error[ZxError.KEY_MESSAGE])

            if error[ZxError.KEY_DETAILS]?
              converted.setDetails(error[ZxError.KEY_DETAILS])

            if error[ZxError.KEY_STACKTRACE]?
              converted.setStackTrace(error[ZxError.KEY_STACKTRACE])

            if error[ZxError.KEY_CAUSE]?
              converted.initCause(ZxError.convertError(error[ZxError.KEY_CAUSE]))

            if error[ZxError.KEY_ERROR_TIME]?
              converted.setTime(error[ZxError.KEY_ERROR_TIME])
            else
              converted.setTime(new Date().getTime())

        catch ex

        return converted

      toString: (html = false) ->
        buffer = []
        if html
          buffer.push("<pre>")

        buffer.push("#{@getMessage()}\n")
        for row in @getStackTrace()
          nativeStr = if row.nativeMethod then " [native]" else ""
          buffer.push(
            "  at #{row.className}.#{row.methodName} ( #{row.fileName}:#{row.lineNumber} )#{nativeStr}\n"
          )
        if @_cause?
          buffer.push("Caused By: ")
          buffer.push(@getCause().toString(html))

        if html
          buffer.push("</pre>")
        buffer.join("")


      ###*
        Create the internal StackTrace of error.
        @param {Error|ZxError} error
        @param {String} mode For testing purpose
        @return {String[]} Contains the stacktrace built
      ###
      @_buildStackTrace: (error, mode = null) ->
        trace = []

        if not error?
          try
            throw new Error("ZxError")
          catch err
            error = err

        emptyTraceLine = {
          fileName: 'UnknownFile'
          lineNumber: '0'
          className: 'Unknown'
          methodName: 'Unknown'
          nativeMethod: false
        }
        errorTraceLine = {
          fileName: "UnknownFile, cannot be parsed"
          lineNumber: "0"
          className: "Unknown"
          methodName: "Unknown"
          nativeMethod: false
        }

        if error instanceof ZxError
          if error.getStackTrace()? and error.getStackTrace().length > 0
            trace = error.getStackTrace()

        else if error instanceof Error or ( error.toString? and error.toString() == "AjxException" )
          stackStrings = printStackTrace({e: error, mode: mode})
          #
          # Example array lines of printStackTrace():
          #
          # Object.printStackTrace.implementation.createException@https://example.com:7071/service/.../js/lib/printStackTrace.js?v=130910130547:35:12
          # Object.exports.ZxErrorTest.ZxError new ZxError(Error)@/home/michele/ZeXtras/tests/js/common-libs/unit/ZxErrorTest.coffee:63:17
          # {anonymous}()@/home/michele/ZeXtras/build-commons/nodejs/lib/node_modules/nodeunit/deps/async.js:463:34
          # {anonymous}()@<anonymous>:463:34
          #
          #
          # Result of a match with regex:
          #
          # ClassName = 'Object.printStackTrace.implementation'
          # Method = 'createException'
          # FileName = 'printStackTrace.js'
          # Line = 35
          #
          #      regex = XRegExp(
          #        "
          #        (?:                          # Begin optional (present 1 or 0 times) grouping
          #          (?<ClassName>[^ ]+)        # Matches all characters != space and captures the match as "ClassName".
          #          \\.                        # Matches a literal '.'
          #        )?                           # End grouping
          #        (?:                          # Begin grouping
          #            \\{anonymous\\}\\(\\)    # Matches the literal '{anonymous}()'
          #          |                          # Alternation
          #            (?<Method>.+)            # Matches 1 or more characters and captures the result as "Method"
          #        )                            # End grouping
          #        @                            # Matches a literal '@'
          #        (?:                          # Begin grouping
          #            [^ ]+[^\\\\]/            # Matches all characters != space followed by a '/' character not preceded by '\'
          #            (?<FileName>[^ ?:]+)     # Matches all characters != space or '?' or ':' and captures the match as "FileName"
          #            (?:                      # Begin optional (present 1 or 0 times) grouping
          #              \\?[^ :]+              # Matches a literal '?' followed by 1+ characters != space or ':'
          #            )?                       # End grouping
          #          |                          # Alternation
          #            <anonymous>              # Matches a literal '<anonymous>'
          #        )                            # End grouping
          #        :                            # Matches a literal ':'
          #        (?<Line>\\d+)                # Matches 1+ digits and captures the match as "Line"
          #        :?(?<Character>\\d+)?        # Matches 1+ digits and captures the match as "Character"
          #        ",
          #        "x"
          #      )

          regex = XRegExp(
            "(?:
               (?<ClassName>[^ ]+)
               \\.
             )?
             (?:
                 \\{anonymous\\}\\(\\)
               |
                 (?<Method>.+)
             )
             @
             (?:
                 [^ ]+[^\\\\]/
                 (?<FileName>[^ ?:]+)
                 (?:
                   \\?[^ :]+
                 )?
               |
                 <anonymous>
             )
             :
             (?<Line>\\d+)
             :?(?<Character>\\d+)?
            ",
            "x"
          )

          for oneMatch in stackStrings
            try
              match = XRegExp.exec(oneMatch, regex)
              if match?
                className = "Unknown"
                if match.ClassName?
                  className = match.ClassName.replace(/^\{anonymous}\(\)@/g, '')
                  className = className.replace(/\//g, '.')
                methodName = "Unknown"
                if match.Method?
                  methodName = match.Method.replace(/\/</g, '.')
                  methodName = methodName.replace(/\.*$/g, '')

                trace.push({
                  fileName: if match.FileName? then match.FileName else "Unknown"
                  lineNumber: if match.Line? then match.Line else "0"
                  character: if match.Character? then match.Character else "0"
                  className: className
                  methodName: methodName
                  nativeMethod: false
                })
              else
                trace.push(errorTraceLine)
            catch error
              trace.push(errorTraceLine)

          if trace.length == 0
            trace[0] = emptyTraceLine
        trace

    exports.ZxError = ZxError
    return
)