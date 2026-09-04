export interface Category {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  commonIssues: string[];
  galleryCount: number;
  hasVideo: boolean;
  showcase: boolean;
}

export const categories: Category[] = [
  {
    slug: 'plumbing',
    name: 'Plumbing',
    tagline: 'Leaks, blockages, and pipework',
    description:
      'Track plumbing requests from the first report through to a verified fix. Leaks and blockages escalate fast, so priority routing matters more here than almost anywhere else.',
    commonIssues: ['Burst or leaking pipe', 'Blocked drain', 'Water heater fault', 'Low water pressure', 'Fixture replacement'],
    galleryCount: 5,
    hasVideo: true,
    showcase: true,
  },
  {
    slug: 'electrical',
    name: 'Electrical',
    tagline: 'Wiring, outlets, and power faults',
    description:
      'Electrical work carries real safety risk, so every request needs a clear description and an accurate priority. Capture the fault, the location, and a photo before anyone is dispatched.',
    commonIssues: ['Power outage in a zone', 'Faulty outlet or switch', 'Breaker tripping repeatedly', 'Lighting installation', 'Wiring inspection'],
    galleryCount: 4,
    hasVideo: true,
    showcase: true,
  },
  {
    slug: 'hvac',
    name: 'HVAC',
    tagline: 'Heating, ventilation, and cooling',
    description:
      'HVAC requests cluster hard around seasonal peaks. Status tracking keeps a long queue visible so nothing sits untouched while the weather turns.',
    commonIssues: ['No heating or cooling', 'Poor airflow', 'Unusual noise from unit', 'Thermostat fault', 'Scheduled servicing'],
    galleryCount: 4,
    hasVideo: true,
    showcase: true,
  },
  {
    slug: 'roofing',
    name: 'Roofing',
    tagline: 'Repairs, leaks, and inspections',
    description:
      'Roofing jobs depend on weather windows and access equipment. Recording location and photos up front saves a wasted site visit.',
    commonIssues: ['Roof leak', 'Missing or damaged tiles', 'Gutter blockage', 'Storm damage', 'Annual inspection'],
    galleryCount: 3,
    hasVideo: true,
    showcase: true,
  },
  {
    slug: 'carpentry',
    name: 'Carpentry',
    tagline: 'Fittings, repairs, and joinery',
    description:
      'Carpentry covers everything from a sticking door to a full fit-out, so descriptions vary widely. A clear title and photo keep the queue readable.',
    commonIssues: ['Door or window repair', 'Cabinet installation', 'Damaged skirting or trim', 'Shelving and storage', 'Timber repair'],
    galleryCount: 2,
    hasVideo: true,
    showcase: true,
  },
  {
    slug: 'painting',
    name: 'Painting',
    tagline: 'Interior and exterior finishes',
    description:
      'Painting jobs are usually planned rather than urgent, which makes them ideal for batching. Filter by status to see what is queued for the next available slot.',
    commonIssues: ['Interior repaint', 'Exterior weatherproofing', 'Damp or stain covering', 'Touch-up work', 'Surface preparation'],
    galleryCount: 0,
    hasVideo: true,
    showcase: true,
  },
  {
    slug: 'flooring',
    name: 'Flooring',
    tagline: 'Installation, repair, and refinishing',
    description:
      'Flooring work needs accurate measurements and material notes captured before scheduling. Attach the detail to the request so it travels with the job.',
    commonIssues: ['Damaged boards or tiles', 'New floor installation', 'Refinishing and sanding', 'Squeaking or lifting floor', 'Subfloor repair'],
    galleryCount: 2,
    hasVideo: false,
    showcase: true,
  },
  {
    slug: 'landscaping',
    name: 'Landscaping',
    tagline: 'Grounds, planting, and upkeep',
    description:
      'Grounds work runs on a seasonal rhythm. Recurring requests are easy to spot once past jobs are archived rather than deleted.',
    commonIssues: ['Hedge and tree trimming', 'Lawn maintenance', 'Planting and bed work', 'Irrigation fault', 'Seasonal clearance'],
    galleryCount: 1,
    hasVideo: true,
    showcase: true,
  },
  {
    slug: 'cleaning',
    name: 'Cleaning',
    tagline: 'Routine and deep cleaning',
    description:
      'Cleaning is mostly scheduled and repetitive, which makes status tracking the important part. Move requests through the lifecycle to keep an honest record of what was completed.',
    commonIssues: ['Routine scheduled clean', 'Deep clean request', 'Post-works cleanup', 'Window cleaning', 'Waste removal'],
    galleryCount: 1,
    hasVideo: false,
    showcase: true,
  },
  {
    slug: 'maintenance',
    name: 'General Maintenance',
    tagline: 'Small repairs and upkeep',
    description:
      'The catch-all for jobs too small to sit in a trade category but too important to lose. Most teams find this becomes their highest-volume queue.',
    commonIssues: ['Minor repair', 'Fixture or fitting replacement', 'Preventive maintenance check', 'Safety inspection', 'Small installation'],
    galleryCount: 1,
    hasVideo: false,
    showcase: true,
  },
  {
    slug: 'other',
    name: 'Other',
    tagline: 'Anything that does not fit elsewhere',
    description:
      'A fallback so nothing gets blocked at submission. Requests logged here can be reclassified once someone has looked at them.',
    commonIssues: ['Unclassified request', 'Multi-trade job', 'Requires assessment'],
    galleryCount: 5,
    hasVideo: false,
    showcase: false,
  },
];

// Landing page grid — excludes "Other"
export const showcaseCategories = categories.filter((c) => c.showcase);

// Dashboard dropdown — includes everything
export const allCategories = categories;

export const getCategory = (slug: string) =>
  categories.find((c) => c.slug === slug);