import debug, { Debugger } from 'debug';
import { Handler, IAgentCreateOptions, IConnectionToCoreOptions, Agent } from 'secret-agent';
// import { join, dirname } from 'path'
// import { Low, JSONFile } from 'lowdb'
// import { fileURLToPath } from 'url'

import getScrapeIt from './scrape-it';


export interface ScraperOptions {
  timeout?: number;
  handlerOverrides?: IConnectionToCoreOptions;
  agentOverrides?: IAgentCreateOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logger?: (...args: any[]) => void;
}
export class Scraper {
  public handler: Handler;

  protected debug: Debugger = debug('LOG:scraper');
  
  protected err: Debugger = debug('ERROR:scraper');

  protected timeout = 2 * 60 * 1000;

  protected hcaptchaAccessibilityUrl?: string;

  protected cfToken?: string;

  constructor(options?: ScraperOptions) {
    this.handler = new Handler({
      maxConcurrency: 10,
      ...options?.handlerOverrides,
    });
    this.handler.defaultAgentOptions = {
      ...this.handler.defaultAgentOptions,
      blockedResourceTypes: ['All'],
      ...options?.agentOverrides,
    };
    this.timeout = options?.timeout ?? this.timeout;
    this.debug = (options?.logger as Debugger) ?? this.debug;
  }

  public scrapeIt(opts: {
    url: string;
    scrape: Record<string, any>;
  }): ReturnType<typeof getScrapeIt> {
    return getScrapeIt.bind(this)(opts);
  }


  public async close(): Promise<void> {
    this.debug('Closing agents');
    return this.handler.close();
  }
}
export type ScraperType = typeof Scraper;
export default Scraper
