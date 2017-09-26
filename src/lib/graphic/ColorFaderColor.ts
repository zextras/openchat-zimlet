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

export class ColorFaderColor {

  public static GREEN: ColorFaderColor = new ColorFaderColor(139, 195, 74); // rgb(139, 195, 74)
  public static BLACK: ColorFaderColor = new ColorFaderColor(0, 0, 0);
  public static WHITE: ColorFaderColor = new ColorFaderColor(255, 255, 255);

  public static fromRGB(rgbString: string): ColorFaderColor {
    const result: string[] = /^rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)$/i.exec(rgbString);
    if (typeof result !== "undefined") {
      return new ColorFaderColor(
        parseInt(result[1], 10),
        parseInt(result[2], 10),
        parseInt(result[3], 10),
      );
    }
    return new ColorFaderColor(0, 0, 0);
  }

  public static fromHEX(hexString: string): ColorFaderColor {
    const result: string[] = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexString);
    if (typeof result !== "undefined") {
      return new ColorFaderColor(
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      );
    }
    return new ColorFaderColor(0, 0, 0);
  }

  public static from3DigitHEX(hexString: string): ColorFaderColor  {
    const result: string[] = /^#?([a-f\d])([a-f\d])([a-f\d])$/i.exec(hexString);
    if (typeof result !== "undefined") {
      return new ColorFaderColor(
        parseInt(result[1] + result[1], 16),
        parseInt(result[2] + result[2], 16),
        parseInt(result[3] + result[3], 16),
      );
    }
    return new ColorFaderColor(0, 0, 0);
  }

  // This can be useful
  public static fromName(colour: string): ColorFaderColor {
    const colours: {[name: string]: string} = {
      "aliceblue": "#f0f8ff",             "antiquewhite": "#faebd7",    "aqua": "#00ffff",
      "aquamarine": "#7fffd4",            "azure": "#f0ffff",           "beige": "#f5f5dc",
      "bisque": "#ffe4c4",                "black": "#000000",           "blanchedalmond": "#ffebcd",
      "blue": "#0000ff",                 "blueviolet": "#8a2be2",       "brown": "#a52a2a",
      "burlywood": "#deb887",             "cadetblue": "#5f9ea0",       "chartreuse": "#7fff00",
      "chocolate": "#d2691e",             "coral": "#ff7f50",           "cornflowerblue": "#6495ed",
      "cornsilk": "#fff8dc",              "crimson": "#dc143c",         "cyan": "#00ffff",
      "darkblue": "#00008b",              "darkcyan": "#008b8b",        "darkgoldenrod": "#b8860b",
      "darkgray": "#a9a9a9",              "darkgreen": "#006400",       "darkkhaki": "#bdb76b",
      "darkmagenta": "#8b008b",           "darkolivegreen":             "#556b2f", "darkorange": "#ff8c00",
      "darkorchid": "#9932cc",            "darkred": "#8b0000",         "darksalmon": "#e9967a",
      "darkseagreen": "#8fbc8f",          "darkslateblue": "#483d8b",   "darkslategray": "#2f4f4f",
      "darkturquoise": "#00ced1",         "darkviolet": "#9400d3",      "deeppink": "#ff1493",
      "deepskyblue": "#00bfff",           "dimgray": "#696969",         "dodgerblue": "#1e90ff",
      "firebrick": "#b22222",             "floralwhite": "#fffaf0",     "forestgreen": "#228b22",
      "fuchsia": "#ff00ff",               "gainsboro": "#dcdcdc",       "ghostwhite": "#f8f8ff",
      "gold": "#ffd700",                  "goldenrod": "#daa520",       "gray": "#808080",
      "green": "#008000",                 "greenyellow": "#adff2f",     "honeydew": "#f0fff0",
      "hotpink": "#ff69b4",               "indianred ": "#cd5c5c",      "indigo": "#4b0082",
      "ivory": "#fffff0",                 "khaki": "#f0e68c",           "lavender": "#e6e6fa",
      "lavenderblush": "#fff0f5",         "lawngreen": "#7cfc00",       "lemonchiffon": "#fffacd",
      "lightblue": "#add8e6",             "lightcoral": "#f08080",      "lightcyan": "#e0ffff",
      "lightgoldenrodyellow": "#fafad2",  "lightgreen": "#90ee90",      "lightgrey": "#d3d3d3",
      "lightpink": "#ffb6c1",             "lightsalmon": "#ffa07a",     "lightseagreen": "#20b2aa",
      "lightskyblue": "#87cefa",          "lightslategray": "#778899",  "lightsteelblue": "#b0c4de",
      "lightyellow": "#ffffe0",           "lime": "#00ff00",            "limegreen": "#32cd32",
      "linen": "#faf0e6",                 "magenta": "#ff00ff",         "maroon": "#800000",
      "mediumaquamarine": "#66cdaa",      "mediumblue": "#0000cd",      "mediumorchid": "#ba55d3",
      "mediumpurple": "#9370d8",          "mediumseagreen": "#3cb371",  "mediumslateblue": "#7b68ee",
      "mediumspringgreen": "#00fa9a",     "mediumturquoise": "#48d1cc", "mediumvioletred": "#c71585",
      "midnightblue": "#191970",          "mintcream": "#f5fffa",       "mistyrose": "#ffe4e1",
      "moccasin": "#ffe4b5",              "navajowhite": "#ffdead",     "navy": "#000080",
      "oldlace": "#fdf5e6",               "olive": "#808000",           "olivedrab": "#6b8e23",
      "orange": "#ffa500",                "orangered": "#ff4500",       "orchid": "#da70d6",
      "palegoldenrod": "#eee8aa",         "palegreen": "#98fb98",       "paleturquoise": "#afeeee",
      "palevioletred": "#d87093",         "papayawhip": "#ffefd5",      "peachpuff": "#ffdab9",
      "peru": "#cd853f",                  "pink": "#ffc0cb",            "plum": "#dda0dd",
      "powderblue": "#b0e0e6",            "purple": "#800080",          "red": "#ff0000",
      "rosybrown": "#bc8f8f",             "royalblue": "#4169e1",       "saddlebrown": "#8b4513",
      "salmon": "#fa8072",                "sandybrown": "#f4a460",      "seagreen": "#2e8b57",
      "seashell": "#fff5ee",              "sienna": "#a0522d",          "silver": "#c0c0c0",
      "skyblue": "#87ceeb",               "slateblue": "#6a5acd",       "slategray": "#708090",
      "snow": "#fffafa",                  "springgreen": "#00ff7f",     "steelblue": "#4682b4",
      "tan": "#d2b48c",                   "teal": "#008080",            "thistle": "#d8bfd8",
      "tomato": "#ff6347",                "turquoise": "#40e0d0",       "violet": "#ee82ee",
      "wheat": "#f5deb3",                 "white": "#ffffff",           "whitesmoke": "#f5f5f5",
      "yellow": "#ffff00",                "yellowgreen": "#9acd32",
    };
    if (typeof colours[colour.toLowerCase()] !== "undefined") {
      return this.fromHEX(colours[colour.toLowerCase()]);
    }
    return undefined;
  }

  public static average(color1: ColorFaderColor, color2: ColorFaderColor, ratio: number = 0.5) {
    return new ColorFaderColor(
      Math.floor(color1.r * ratio + color2.r * (1 - ratio)),
      Math.floor(color1.g * ratio + color2.g * (1 - ratio)),
      Math.floor(color1.b * ratio + color2.b * (1 - ratio)),
    );
  }

  public static averageFromStringWithRGB(property: string): ColorFaderColor {
    let firstColor: ColorFaderColor;
    let secondColor: ColorFaderColor;
    const regex: RegExp = /rgb\(([0-9]+), ([0-9]+), ([0-9]+)\)/g;
    const firstResult: string[] = regex.exec(property);
    if (typeof firstResult !== "undefined" && firstResult !== null) {
      firstColor = new ColorFaderColor(
        parseInt(firstResult[1], 10),
        parseInt(firstResult[2], 10),
        parseInt(firstResult[3], 10),
      );
      const secondResult: string[] = regex.exec(property);
      if (typeof secondResult !== "undefined" && firstResult !== null) {
        secondColor = new ColorFaderColor(
          parseInt(secondResult[1], 10),
          parseInt(secondResult[2], 10),
          parseInt(secondResult[3], 10),
        );
        return ColorFaderColor.average(firstColor, secondColor);
      } else {
        return firstColor;
      }
    } else {
      return undefined;
    }
  }

  public static averageFromStringWithHEX(property: string): ColorFaderColor {
    let firstColor: ColorFaderColor;
    let secondColor: ColorFaderColor;
    const regex: RegExp = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})/g;
    const firstResult: string[] = regex.exec(property);
    if (typeof firstResult !== "undefined" && firstResult !== null) {
      firstColor = new ColorFaderColor(
        parseInt(firstResult[1], 16),
        parseInt(firstResult[2], 16),
        parseInt(firstResult[3], 16),
      );
      const secondResult: string[] = regex.exec(property);
      if (typeof secondResult !== "undefined" && firstResult !== null) {
        secondColor = new ColorFaderColor(
          parseInt(secondResult[1], 16),
          parseInt(secondResult[2], 16),
          parseInt(secondResult[3], 16),
        );
        return ColorFaderColor.average(firstColor, secondColor);
      } else {
        return firstColor;
      }
    } else {
      return undefined;
    }
  }

  public static brightenColor(color: ColorFaderColor, ratio: number): ColorFaderColor {
    // ratio 0 return white
    // ratio 1 return color
    return ColorFaderColor.average(color, ColorFaderColor.WHITE, ratio);
  }

  public static darkenColor(color: ColorFaderColor, ratio: number) {
    // ratio 0 return black
    // ratio 1 return color
    return ColorFaderColor.average(color, ColorFaderColor.BLACK, ratio);
  }

  private static componentToHex(c: number): string {
    const hex: string = c.toString(16);
    if (hex.length === 1) {
      return "0" + hex;
    } else {
      return hex;
    }
  }

  public r: number;
  public g: number;
  public b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public toHEX(): string {
    return "#" + ColorFaderColor.componentToHex(this.r) +
      ColorFaderColor.componentToHex(this.g) +
      ColorFaderColor.componentToHex(this.b);
  }

  public toRGB(): string {
    return "rgb(" + this.r + ", " + this.g + ", " + this.b + ")";
  }
}
