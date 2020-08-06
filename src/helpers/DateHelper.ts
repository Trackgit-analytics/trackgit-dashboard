export default class DateHelper {
  public static monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  /**
   * Get the UTC date in milliseconds
   * @param milliseconds (optional) date to convert from regular time to UTC time
   */
  public static UTC(milliseconds?: number): number {
    const x = milliseconds != null ? new Date(milliseconds) : new Date();
    const UTCDateNow = x.getTime() + x.getTimezoneOffset() * 60 * 1000;
    return UTCDateNow;
  }
}
