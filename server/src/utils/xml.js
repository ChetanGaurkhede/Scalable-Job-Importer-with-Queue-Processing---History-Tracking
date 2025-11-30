const { parseStringPromise } = require('xml2js');

const parseFeed = async (xml) => {
  const parsed = await parseStringPromise(xml, {
    explicitArray: false,
    trim: true,
    normalizeTags: true,
    mergeAttrs: true
  });

  const channel = parsed?.rss?.channel || parsed?.channel || parsed;
  const items = channel?.item
    ? Array.isArray(channel.item)
      ? channel.item
      : [channel.item]
    : [];

  return { meta: channel, items };
};

module.exports = { parseFeed };