/**
 * Page meta tag interface.
 * These tags are expected to be inserted into the head element of the page.
 */
interface PageMetatag {
  name?: string;
  content: string;
  property?: string;
}

export default PageMetatag;
