export default class DeviceHelper {
  /** Determine if the device is a phone
   * @returns true if the device is a phone, false otherwise
   */
  public static isPhone(): boolean {
    const width = this.getWidth();
    if (width <= 600) {
      return true;
    }
    return false;
  }

  /** Determine if the device is a tablet
   * @returns true if the device is a tablet, false otherwise
   */
  public static isTablet(): boolean {
    const width = this.getWidth();
    if (width >= 600 && width <= 1024) {
      return true;
    }
    return false;
  }

  /** Determine if device is a desktop/laptop
   * @returns true if device is desktop/laptop, false otherwise
   */
  public static isDesktop(): boolean {
    return !(DeviceHelper.isTablet() || DeviceHelper.isPhone());
  }

  /** Returns the device height in pixels */
  public static getHeight(): number {
    return window.screen.height;
  }

  /** Returns the device width in pixels */
  public static getWidth(): number {
    return window.screen.width;
  }
}
