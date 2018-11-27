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

import {IJQueryPlugin} from "./JQueryPlugin";

declare let $: any;

export class LoadingDotsPlugin implements IJQueryPlugin {

  public install(): void {
    if (typeof $.fn.loadingdots !== "undefined") { return; }

    $.fn.loadingdots = function( options: {} ) {
      let i = 0;
      const settings = $.extend( {}, { duration : 250 }, options );
      const bucle = function() {
          const $el = $(this);
          let cycle: (isFirst?: boolean) => void;
          let timing = i * settings.duration;
          i++;
          cycle = (isFirst?: boolean) => {
            // if it's not the first time the cycle is called for a dot then the timing fired is 0
            if ( !isFirst ) {
              timing = 0;
            } else {
              isFirst = false;
            }
            // delay the animation the timing needed,
            // and then make the animation to fadeIn and Out the dot to make the effect
            $el.delay( timing )
              .fadeTo( 1000, 0.4 )
              .fadeTo( 1000, 0, cycle );
          };
          cycle(true);
        };
      // for every element where the plugin was called we create the loading dots html and start the animations
      return this.each(
        function() {
          $(this)
            .html( `<span class="LoadingDots-dot"></span>
                    <span class="LoadingDots-dot"></span>
                    <span class="LoadingDots-dot"></span>` )
            .find( ".LoadingDots-dot" )
            .each( bucle );
        },
      );
    };
  }

}
