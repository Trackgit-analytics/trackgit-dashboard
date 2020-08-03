import PageMetaTag from "@/models/interfaces/PageMetaTag";

export default class BodyMetaHelper {
  /**
   * Assign meta tags to the head region of page
   * @param tagDefs The PageMeta tags to add
   */
  public static addMetaInfo(tagDefs: PageMetaTag[]) {
    tagDefs.forEach(tagDef => {
      const tag = document.createElement("meta");

      Object.keys(tagDef).forEach(key => {
        tag.setAttribute(
          key,
          ((tagDef as unknown) as { [x: string]: string })[key]
        );
      });

      tag.setAttribute("data-vue-router-controlled", "");
      document.head.appendChild(tag);
    });
  }

  /**
   * Set document title
   * @param title The title to set
   */
  public static setDocumentTitle(title: string) {
    document.title = title;
  }
}
