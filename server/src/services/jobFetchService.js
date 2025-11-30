import axios from "axios";
import { parseStringPromise } from "xml2js";

const FEEDS = [
  "https://jobicy.com/?feed=job_feed",
  "https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time",
  "https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france",
  "https://jobicy.com/?feed=job_feed&job_categories=design-multimedia",
  "https://jobicy.com/?feed=job_feed&job_categories=data-science",
  "https://jobicy.com/?feed=job_feed&job_categories=copywriting",
  "https://jobicy.com/?feed=job_feed&job_categories=business",
  "https://jobicy.com/?feed=job_feed&job_categories=management",
  "https://www.higheredjobs.com/rss/articleFeed.cfm"
];

export function getFeedUrls() {
  return FEEDS;
}

export async function fetchJobsFromFeed(feedUrl) {
  try {
    const response = await axios.get(feedUrl, { 
      responseType: "text",
      timeout: 10000 // 10 second timeout
    });
    const xml = response.data;
    
    // Parse XML with lenient options to handle malformed XML
    const json = await parseStringPromise(xml, { 
      explicitArray: true,
      trim: true,
      ignoreAttrs: false,
      mergeAttrs: true,
      explicitCharkey: false,
      explicitChildren: false,
      explicitRoot: false,
      validator: null,
      xmlns: false,
      explicitNamespaces: false,
      stripPrefix: false,
      async: false,
      strict: false, // Don't fail on malformed XML
      attrkey: '@',
      charkey: '#',
      emptyTag: ''
    });

    const channel = json?.rss?.channel?.[0];
    if (!channel || !channel.item) {
      console.warn(`No items found in feed: ${feedUrl}`);
      return [];
    }

    return channel.item;
  } catch (err) {
    console.error(`Error fetching/parsing feed ${feedUrl}:`, err.message);
    // Return empty array instead of crashing
    return [];
  }
}


