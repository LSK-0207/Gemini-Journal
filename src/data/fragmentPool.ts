// Curated pool of evocative scrapbooking fragment starters and dynamic thought stream placeholders
// Grouped into all 5 moods and vibes from the Template Library

export interface VibeStarterGroup {
  vibe: string;
  moodLabel: string;
  badgeColor: string;
  starters: string[];
}

export const VIBE_STARTER_GROUPS: VibeStarterGroup[] = [
  {
    vibe: 'sunlit-botanical',
    moodLabel: 'Grateful & Warm',
    badgeColor: 'text-amber-900 dark:text-amber-300 bg-amber-100/90 dark:bg-amber-950/70 border-amber-300/80',
    starters: [
      'sunlight streaming through the morning window',
      'feeling grateful for a quiet cup of warm chamomile tea',
      'gratitude: gentle walks, kind words, restful sleep',
      'quote: "Bloom where you are planted"',
      'laughter over homemade soup with loved ones',
      'celebrating a small quiet victory nobody else noticed',
      'grateful for unexpected kindness from a stranger today',
      'early morning market with ripe peaches and flowers',
    ],
  },
  {
    vibe: 'sage-affirmation',
    moodLabel: 'Calm & Hopeful',
    badgeColor: 'text-emerald-900 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/70 border-emerald-300/80',
    starters: [
      'a little tired from work, but calm and breathing deeply',
      'reminder: take things one steady step at a time',
      'learning to forgive myself for yesterday\'s slow pace',
      'feeling peaceful solitude after days of endless noise',
      'reminder: you don\'t have to figure out everything tonight',
      'letting go of worries and expectations I cannot control',
      'finding quiet strength in ordinary small moments',
      'stepping outside to breathe cool crisp fresh air',
    ],
  },
  {
    vibe: 'dusty-rose-diary',
    moodLabel: 'Tender & Cozy',
    badgeColor: 'text-rose-900 dark:text-rose-300 bg-rose-100/90 dark:bg-rose-950/70 border-rose-300/80',
    starters: [
      'a small handwritten letter from an old friend arrived today',
      'warm amber candlelight flickering across the journal pages',
      'soft guitar notes drifting from the neighbor\'s window',
      'rain tapping steadily on the glass while wrapped in a blanket',
      'a gentle memory of childhood summers by the lake',
      'saving a dried flower petal in my favorite book',
      'cherishing a sweet conversation over hot cocoa',
      'feeling comforted by a familiar song heard again',
    ],
  },
  {
    vibe: 'dark-academia',
    moodLabel: 'Introspective & Literary',
    badgeColor: 'text-stone-900 dark:text-stone-200 bg-stone-200/90 dark:bg-stone-800/80 border-stone-400/80',
    starters: [
      'finally finished the book that kept me up for three nights',
      'wandering through quiet museum galleries on a Sunday',
      'quote: "In the depth of winter, I learned there lay in me an invincible summer"',
      'listening to old acoustic vinyl in the dim evening light',
      'sitting in a cozy wooden library booth with ink on my fingers',
      'pondering what truly matters as the seasons turn',
      'late night philosophical musings after everyone went to sleep',
      'the scent of aged books and antique mahogany desks',
    ],
  },
  {
    vibe: 'kraft-vintage',
    moodLabel: 'Nostalgic & Reflective',
    badgeColor: 'text-yellow-950 dark:text-amber-200 bg-amber-100/80 dark:bg-[#342718] border-amber-400/70',
    starters: [
      'the scent of rain hitting warm cedar wood and pines',
      'morning breeze rustling the ivy on the wooden porch',
      'feeling nostalgic for train rides with grandparents',
      'pressed wildflowers between heavy dictionary pages',
      'the crisp autumn air smelling like crushed leaves and firewood',
      'discovering an old black-and-white family photograph',
      'remembering long drives through mountain mist at twilight',
      'a ticket stub from a concert that changed my perspective',
    ],
  },
];

// Flat list for fallback
export const FRAGMENT_STARTER_POOL: string[] = VIBE_STARTER_GROUPS.flatMap((g) => g.starters);

export interface StarterQuad {
  id: string;
  vibe: string;
  moodLabel: string;
  badgeColor: string;
  starters: string[];
}

/**
 * Builds a cycle of 4-item starter sets covering every mood and vibe
 */
export function getStarterQuads(): StarterQuad[] {
  const quads: StarterQuad[] = [];
  VIBE_STARTER_GROUPS.forEach((group, gIdx) => {
    // Slice into quads of 4
    for (let i = 0; i < group.starters.length; i += 4) {
      const items = group.starters.slice(i, i + 4);
      if (items.length > 0) {
        quads.push({
          id: `${group.vibe}-${gIdx}-${i}`,
          vibe: group.vibe,
          moodLabel: group.moodLabel,
          badgeColor: group.badgeColor,
          starters: items,
        });
      }
    }
  });
  return quads;
}

export const PLACEHOLDER_THOUGHT_STREAMS: string[] = [
  `sunlight through the window this morning
warm tea and quiet minutes before the day began
feeling a little overwhelmed by chores, but grateful for peace
grateful for:
- family health
- clean fresh air
- good warm food
quote: "Peace comes from within, do not seek it without."
reminder: breathe, relax, everything is unfolding as it should`,

  `walking home under the golden hour sky
cool evening breeze after a long, demanding week
the city felt slower, kinder today
grateful for:
- finishing the difficult project
- a supportive conversation with my sister
- the cozy corner booth at my favorite cafe
quote: "The quieter you become, the more you are able to hear."`,

  `rain tapping steadily on the glass all afternoon
soft piano music playing in the background
feeling a gentle nostalgia for old family trips
grateful for:
- warm blankets and hot cider
- quiet hours to read and sketch
- memories that keep us grounded
reminder: slow days are not wasted days`,

  `early Saturday morning at the farmers market
fresh sourdough bread, ripe peaches, and lavender bouquets
feeling creatively energized and hopeful about this month
grateful for:
- neighborly smiles and community
- space to make art without expectations
- having time to cook from scratch
quote: "Live in each season as it passes; breathe the air, drink the drink."`,

  `late night reflections after a long quiet drive
the moon looked immense through the pine trees
letting go of worries I cannot control
grateful for:
- safe travels
- good friends who check in
- the quiet resilience I didn't know I had
reminder: take one gentle step at a time`
];

/**
 * Returns a randomized subset of fragment starters without mutating the original pool.
 */
export function getRandomStarters(count: number = 7): string[] {
  const shuffled = [...FRAGMENT_STARTER_POOL].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Returns a random placeholder stream.
 */
export function getRandomPlaceholder(): string {
  const index = Math.floor(Math.random() * PLACEHOLDER_THOUGHT_STREAMS.length);
  return PLACEHOLDER_THOUGHT_STREAMS[index];
}
