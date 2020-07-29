export default class NumberHelper {
  /**
   * Abbreviate a number into a shortened form
   * Source: https://stackoverflow.com/questions/18151877/javascript-shorten-large-numbers-force-decimal-places-and-choose-to-represent/18154846
   */
  public static abbreviate(
    number: number,
    maxPlaces = 2,
    forcePlaces: number | boolean = 2,
    forceLetter: boolean | string = false
  ) {
    if (forceLetter !== false) {
      return this.annotate(number, maxPlaces, forcePlaces, forceLetter);
    }
    let abbr;
    if (number >= 1e12) {
      abbr = "T";
    } else if (number >= 1e9) {
      abbr = "B";
    } else if (number >= 1e6) {
      abbr = "M";
    } else if (number >= 1e3) {
      abbr = "K";
    } else {
      abbr = "";
    }

    const annotated = this.annotate(number, maxPlaces, forcePlaces, abbr);
    switch (annotated.length) {
      case 1:
        return `    ${annotated}`;
      case 2:
        return `    ${annotated}`;
      case 3:
        return `  ${annotated}`;
      default:
        return annotated;
    }
  }

  private static annotate(
    number: number,
    maxPlaces: number | boolean,
    forcePlaces: number | boolean = false,
    abbr: boolean | string
  ) {
    // set places to false to not round
    let rounded = 0;
    switch (abbr) {
      case "T":
        rounded = number / 1e12;
        break;
      case "B":
        rounded = number / 1e9;
        break;
      case "M":
        rounded = number / 1e6;
        break;
      case "K":
        rounded = number / 1e3;
        break;
      case "":
        rounded = number;
        break;
    }
    if (maxPlaces !== false) {
      const test = new RegExp(
        "\\.\\d{" + (((maxPlaces as any) as number) + 1) + ",}$"
      );
      if (test.test("" + rounded)) {
        rounded = Number(rounded.toFixed((maxPlaces as any) as number));
      }
    }
    if (forcePlaces !== false) {
      rounded = Number(Number(rounded).toFixed(forcePlaces as number));
    }
    return `${rounded}${abbr}`;
  }
}
