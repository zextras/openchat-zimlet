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

import {JQueryPlugin} from "./JQueryPlugin";

declare let $: any;

export class LoadingDotsPlugin implements JQueryPlugin {

  public install(): void {
    if (typeof $.fn.loadingdots !== "undefined") { return; }

    $.fn.loadingdots = function( options: {} )
    {
      let i = 0, settings = $.extend( {}, { duration : 250 }, options ),

        bucle = function() {
          let $el = $( this ), cycle: Function, timing = i * settings.duration, first = true;
          i++;

          cycle = function()
          {
            // if it's not the first time the cycle is called for a dot then the timing fired is 0
            if ( !first )
              timing = 0;
            else
              first = false;
            // delay the animation the timing needed, and then make the animation to fadeIn and Out the dot to make the effect
            $el.delay( timing )
              .fadeTo( 1000, 0.4 )
              .fadeTo( 1000, 0, cycle );
          };

          cycle( first );
        };
      // for every element where the plugin was called we create the loading dots html and start the animations
      return this.each( function() {
        $( this )
          .html( `<span class="dot"></span><span class="dot"></span><span class="dot"></span>` )
          .find( ".dot" )
          .each( bucle );
      });
    };
  }

}