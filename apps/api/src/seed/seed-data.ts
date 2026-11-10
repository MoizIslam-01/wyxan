export const peopleSeed = [
  { id: '000000000000000000000001', name: 'Mira Chen' },
  { id: '000000000000000000000002', name: 'Sam Okafor' },
  { id: '000000000000000000000003', name: 'Noor Rahman' },
  { id: '000000000000000000000004', name: 'Inez Silva' },
  { id: '000000000000000000000005', name: 'Theo Park' },
] as const;

export const sitesSeed = [
  {
    id: '100000000000000000000001',
    address: 'tidepool.zz',
    title: 'Low Tide Notes',
    authorId: peopleSeed[0].id,
    html: `<main><h1>Low Tide Notes</h1><p>At low tide the shoreline becomes a temporary city: anemones close their doors, crabs repair their tunnels, and every pool holds a different sky.</p><p>I keep a notebook of what returns and what disappears. Today the smallest pool held three shrimp and a bottle-green thread of weed.</p><p>Continue to <a href="fieldnotes.zz">Field Notes</a> or follow the old map to <a href="lighthouse.zz">The Last Lighthouse</a>.</p></main>`,
  },
  {
    id: '100000000000000000000002',
    address: 'fieldnotes.zz',
    title: 'Field Notes from Nowhere',
    authorId: peopleSeed[0].id,
    html: `<article><h1>Field Notes from Nowhere</h1><p>The best observations begin before you know what you are looking for. Sit still for ten minutes. Write down the first sound, then the furthest sound, then the one that repeats.</p><p>This morning: bicycle chain, rain gutter, a pigeon landing above the window. None were rare; together they belonged only to that minute.</p><p>Read <a href="mosslibrary.zz">The Moss Library</a>, or try the abandoned address <a href="weather-station.zz">Weather Station</a>.</p></article>`,
  },
  {
    id: '100000000000000000000003',
    address: 'mosslibrary.zz',
    title: 'The Moss Library',
    authorId: peopleSeed[2].id,
    html: `<main><h1>The Moss Library</h1><p>Moss records a place without using words. Moisture, shade, stone, bark, and time are pressed into every green page.</p><p>This catalogue is intentionally small. Entry one grows on the north wall. Entry two lives under a leaking tap. Entry three arrived in a flowerpot and has not introduced itself.</p><p>The librarian recommends <a href="tinyrecipes.zz">Tiny Recipes</a> and <a href="tidepool.zz">Low Tide Notes</a>.</p></main>`,
  },
  {
    id: '100000000000000000000004',
    address: 'tinyrecipes.zz',
    title: 'Tiny Recipes for Long Days',
    authorId: peopleSeed[1].id,
    html: `<article><h1>Tiny Recipes for Long Days</h1><p>A recipe can be a way home. Toast cumin until the kitchen changes its mind, add lentils and water, then wait without hurrying the pot.</p><p>For the smallest supper: bread, a tomato, salt, and five quiet minutes near an open window.</p><p>After dinner visit <a href="nightbus.zz">The Night Bus</a>, or browse <a href="paperboats.zz">Paper Boats</a>.</p></article>`,
  },
  {
    id: '100000000000000000000005',
    address: 'nightbus.zz',
    title: 'The Night Bus',
    authorId: peopleSeed[1].id,
    html: `<main><h1>The Night Bus</h1><p>After midnight the number 17 carries bakers, nurses, cleaners, musicians, and people who missed the last train. For forty minutes they share the same moving room.</p><p>The city outside is mostly reflections: pharmacy green, brake-light red, and apartment windows floating above dark shops.</p><p>Get off near <a href="lighthouse.zz">The Last Lighthouse</a> or stay aboard for <a href="smallhours.zz">The Small Hours</a>.</p></main>`,
  },
  {
    id: '100000000000000000000006',
    address: 'lighthouse.zz',
    title: 'The Last Lighthouse',
    authorId: peopleSeed[3].id,
    html: `<article><h1>The Last Lighthouse</h1><p>The lamp has been automated for years, but the keeper's log remains in a salt-stiff drawer. Most entries report ordinary weather. The final handwritten line says only: clear enough to see tomorrow.</p><p>Every nine seconds the beam crosses the water and briefly invents a road.</p><p>Take that road to <a href="paperboats.zz">Paper Boats</a> or return to <a href="tidepool.zz">Low Tide Notes</a>.</p></article>`,
  },
  {
    id: '100000000000000000000007',
    address: 'paperboats.zz',
    title: 'Paper Boats',
    authorId: peopleSeed[3].id,
    html: `<main><h1>Paper Boats</h1><p>Fold the page toward its centre, sharpen the creases, and give the paper a destination. A gutter after rain is enough ocean for a first voyage.</p><p>We write no names on the boats. Finding one should feel like discovering a message even when the message is only that somebody made it.</p><p>Sail toward <a href="windowgarden.zz">Window Garden</a> or risk <a href="open-sea.zz">Open Sea</a>.</p></main>`,
  },
  {
    id: '100000000000000000000008',
    address: 'windowgarden.zz',
    title: 'A Garden on the Sill',
    authorId: peopleSeed[4].id,
    html: `<article><h1>A Garden on the Sill</h1><p>Six pots fit on this window: mint, basil, thyme, two hopeful chillies, and one plant whose label vanished. The unknown plant is doing best.</p><p>Turn each pot a quarter turn on Sunday. Water when the soil asks, not when the calendar does.</p><p>Swap seeds at <a href="seedexchange.zz">Seed Exchange</a> or cook something from <a href="tinyrecipes.zz">Tiny Recipes</a>.</p></article>`,
  },
  {
    id: '100000000000000000000009',
    address: 'seedexchange.zz',
    title: 'The Seed Exchange',
    authorId: peopleSeed[4].id,
    html: `<main><h1>The Seed Exchange</h1><p>Take a packet, leave a packet, and write one honest sentence about where it grew. Seeds travel with fewer questions than people and often tell better stories.</p><p>The blue envelopes contain beans from a windy balcony. The brown ones hold marigolds that survived a very hot summer.</p><p>Plant them beside the <a href="windowgarden.zz">Window Garden</a>, then read <a href="smallhours.zz">The Small Hours</a>.</p></main>`,
  },
  {
    id: '100000000000000000000010',
    address: 'smallhours.zz',
    title: 'The Small Hours',
    authorId: peopleSeed[2].id,
    html: `<article><h1>The Small Hours</h1><p>At 3:17 the refrigerator is the loudest machine in the world. A distant car passes. Pipes settle inside the walls. Somewhere, bread is already being made.</p><p>If sleep will not return, make tea and choose one modest task: mend a button, water a plant, or write down the thought that keeps knocking.</p><p>Morning begins at <a href="fieldnotes.zz">Field Notes</a>. Night continues on the <a href="nightbus.zz">Night Bus</a>.</p></article>`,
  },
] as const;

export const historySeed = [
  {
    personId: peopleSeed[0].id,
    addresses: [
      'tidepool.zz',
      'fieldnotes.zz',
      'mosslibrary.zz',
      'tinyrecipes.zz',
      'nightbus.zz',
      'lighthouse.zz',
      'paperboats.zz',
      'windowgarden.zz',
      'seedexchange.zz',
      'smallhours.zz',
      'tidepool.zz',
    ],
  },
  {
    personId: peopleSeed[1].id,
    addresses: [
      'tinyrecipes.zz',
      'nightbus.zz',
      'smallhours.zz',
      'fieldnotes.zz',
      'weather-station.zz',
      'fieldnotes.zz',
    ],
  },
  {
    personId: peopleSeed[2].id,
    addresses: [
      'mosslibrary.zz',
      'tinyrecipes.zz',
      'paperboats.zz',
      'open-sea.zz',
      'paperboats.zz',
    ],
  },
  {
    personId: peopleSeed[3].id,
    addresses: [
      'lighthouse.zz',
      'tidepool.zz',
      'fieldnotes.zz',
      'mosslibrary.zz',
      'tinyrecipes.zz',
    ],
  },
  {
    personId: peopleSeed[4].id,
    addresses: [
      'windowgarden.zz',
      'seedexchange.zz',
      'smallhours.zz',
      'nightbus.zz',
      'lighthouse.zz',
    ],
  },
] as const;
