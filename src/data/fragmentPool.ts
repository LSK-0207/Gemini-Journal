// Curated pool of evocative scrapbooking fragment starters and dynamic thought stream placeholders

export const FRAGMENT_STARTER_POOL: string[] = [
  'sunlight streaming through the morning window',
  'feeling grateful for a quiet cup of warm chamomile tea',
  'a little tired from work, but calm and breathing deeply',
  'quote: "Bloom where you are planted"',
  'gratitude: gentle walks, kind words, restful sleep',
  'reminder: take things one steady step at a time',
  'the scent of rain hitting warm cedar wood',
  'listening to old acoustic records in the dim evening light',
  'finally finished the book that kept me up for three nights',
  'a small handwritten letter from an old friend arrived today',
  'morning breeze rustling the ivy on the porch',
  'laughter over homemade soup with loved ones',
  'wandering through quiet museum galleries on a Sunday',
  'feeling nostalgic for childhood summer train rides',
  'quote: "In the depth of winter, I finally learned that within me there lay an invincible summer."',
  'warm amber candlelight flickering across the journal pages',
  'celebrating a small quiet victory nobody else noticed',
  'learning to forgive myself for yesterday\'s slow pace',
  'soft guitar notes drifting from the neighbor\'s window',
  'pressed wildflowers between heavy dictionary pages',
  'the crisp autumn air smelling like crushed leaves and firewood',
  'feeling peaceful solitude after days of endless noise',
  'grateful for unexpected kindness from a stranger today',
  'reminder: you don\'t have to figure out everything tonight'
];

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
