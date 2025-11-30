const sanitizeText = (value) => {
  if (!value) return '';
  if (Array.isArray(value)) {
    return value.join(' ').trim();
  }
  return String(value).trim();
};

const buildExternalId = (item) => {
  if (item.guid && typeof item.guid === 'object' && item.guid._) {
    return item.guid._;
  }
  if (item.guid) {
    return sanitizeText(item.guid);
  }
  if (item.link) {
    return sanitizeText(item.link);
  }
  return sanitizeText(item.title);
};

const mapFeedItemToJob = (item, feedLabel) => {
  const externalId = buildExternalId(item);
  return {
    externalId,
    title: sanitizeText(item.title) || 'Untitled role',
    company: sanitizeText(item['job:company'] || item['company'] || item.creator),
    location: sanitizeText(item['job:location'] || item.location),
    description: sanitizeText(item['job:description'] || item.description),
    url: sanitizeText(item.link),
    source: feedLabel,
    publishedAt: item.pubdate ? new Date(item.pubdate) : undefined,
    raw: item
  };
};

module.exports = { mapFeedItemToJob };