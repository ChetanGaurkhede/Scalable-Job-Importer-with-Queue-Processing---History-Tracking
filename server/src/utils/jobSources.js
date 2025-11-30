const jobSources = [
  { url: 'https://jobicy.com/?feed=job_feed', label: 'jobicy-all' },
  {
    url: 'https://jobicy.com/?feed=job_feed&job_categories=smm&job_types=full-time',
    label: 'jobicy-smm-fulltime'
  },
  {
    url: 'https://jobicy.com/?feed=job_feed&job_categories=seller&job_types=full-time&search_region=france',
    label: 'jobicy-seller-fr'
  },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=design-multimedia', label: 'jobicy-design' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=data-science', label: 'jobicy-data-science' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=copywriting', label: 'jobicy-copywriting' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=business', label: 'jobicy-business' },
  { url: 'https://jobicy.com/?feed=job_feed&job_categories=management', label: 'jobicy-management' },
  { url: 'https://www.higheredjobs.com/rss/articleFeed.cfm', label: 'higheredjobs' }
];

module.exports = jobSources;