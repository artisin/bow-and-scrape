import scrapeIt from 'scrape-it';
import { Agent } from 'secret-agent';

import type {
  Scraper,
} from './index';

const toScraper = async (html: string, scrape: Record<string, any>) => {
  const results = await  scrapeIt.scrapeHTML(html, scrape)
  return (results ?? null) as Record<string, any> | null;
}


const getScrapeIt = async function getScrapeIt(
  this: Scraper,
  opts: {
    url: string,
    scrape: Record<string, any>,
  }
  // filterParams?: PlayerFilterParams
): Promise<null | Record<string, any>> {
  const agent = (await this.handler.createAgent()) as Agent;
  try {
    const {
      url,
      scrape,
    } = opts;

    const resolvedUrl = url;
    this.debug(`Going to ${resolvedUrl}`);
    const gotoResp = await agent.goto(resolvedUrl, this.timeout);
    // Check for page error
    const statusCode = await gotoResp.response.statusCode;
    if (statusCode !== 200) {
      throw new Error(`${url} -> returned a non-200 response: ${statusCode}`);
    }
    await agent.waitForPaintingStable();

    let appHtml = ``
    try {

    const doc = agent?.document;
    const body = doc?.querySelector('body');
    const head = await doc?.head.outerHTML;
    const html = await body?.outerHTML;
    appHtml = `
  <html class="page page_fonts-loaded" lang="en">
  ${head}
  ${html}
  </html>
    `
    } catch (error) {
      this.err(`failed to parse`, {error})
      await agent.close();
      return null;
    }

    let results: null | Record<string, any> = null
    try {
      results = await toScraper(appHtml, scrape)
    } catch (error) {
      this.err(`failed to scrape`, {error})
    }
    await agent.close();
    return results;

  } catch (error) {
    this.err(`failed complete`, {error})
    await agent.close();
    return null;
  }
}

export default getScrapeIt;
