import type { GameGuide } from './types'

/**
 * Snapshot: patch 13.06 (taken 2026-10-05).
 * Ranked tiers and rates: metabot.gg (updated 2026-09-26).
 * Pro rates and comps: VCT 2026 Champions, Sep 24 – Oct 4 (vct-reference.com).
 * proRate is the share of team-maps an agent was picked on; 0 = not picked.
 */
export const VALORANT: GameGuide = {
  id: 'valorant',
  name: 'Valorant',
  shortName: 'Valorant',
  genre: '5v5 tactical shooter',
  accent: 'ruby',
  tagline: 'Patch 13.06 adds the Warden rifle. Ranked favours Clove and Neon, while pros still put Omen on almost every map.',
  patch: '13.06',
  asOf: '2026-10-05',

  stats: [
    { label: 'Patch', value: '13.06', note: 'Released 22 Sep 2026' },
    { label: 'Top ranked agent', value: 'Clove 52.9%', note: 'Ranked win rate · 13.8% pick rate' },
    { label: 'Pro favourite', value: 'Omen 79.8%', note: 'Of team-maps at VCT Champions 2026' },
    { label: 'New rifle', value: 'Warden', note: '2,900 creds · 2x scope · no falloff' },
  ],

  metaNotes: [
    'Ranked and pro disagree. Omen is on four of every five pro comps but sits near the bottom of ranked (47.8%), because smokes only pay off with comms.',
    'Clove leads ranked. Smoking after death and self-healing suit lobbies without coordination.',
    'The most common Champions shape was 2 duelists, 1 initiator, 1 controller and 1 sentinel (about 41% of maps).',
    'Warden (13.06): 2x scope, 50 body damage at every range and a 200 headshot, at the same price as Vandal. Strong on long angles.',
    'Performance Score (0–500) now decides MVP and scoreboard order instead of ACS.',
    'Biggest win-rate gains in 13.06: Viper (+2.3), Vyse (+1.6) and Veto (+1.5). Deadlock and Gekko slipped.',
  ],

  tierSource: 'Ranked win and pick rates · metabot.gg · Pro rate: VCT Champions 2026',
  tiers: [
    { name: 'Clove', roleId: 'controller', tier: 'S', winRate: 52.9, pickRate: 13.8, proRate: 0 },
    { name: 'Neon', roleId: 'duelist', tier: 'S', winRate: 52.1, pickRate: 5.4, proRate: 55.3 },

    { name: 'Sage', roleId: 'sentinel', tier: 'A', winRate: 52.3, pickRate: 1.3, proRate: 20.2 },
    { name: 'Cypher', roleId: 'sentinel', tier: 'A', winRate: 52.0, pickRate: 3.1, proRate: 28.7 },
    { name: 'Fade', roleId: 'initiator', tier: 'A', winRate: 52.0, pickRate: 5.4, proRate: 53.2 },
    { name: 'Phoenix', roleId: 'duelist', tier: 'A', winRate: 51.7, pickRate: 3.6, proRate: 17.0 },
    { name: 'Sova', roleId: 'initiator', tier: 'A', winRate: 51.7, pickRate: 8.0, proRate: 35.1 },

    { name: 'Vyse', roleId: 'sentinel', tier: 'B', winRate: 51.9, pickRate: 1.3, proRate: 7.4, trend: 'up' },
    { name: 'Killjoy', roleId: 'sentinel', tier: 'B', winRate: 51.9, pickRate: 1.9, proRate: 3.2 },
    { name: 'Viper', roleId: 'controller', tier: 'B', winRate: 51.1, pickRate: 1.9, proRate: 27.7, trend: 'up' },
    { name: 'Skye', roleId: 'initiator', tier: 'B', winRate: 50.9, pickRate: 2.4, proRate: 10.6 },

    { name: 'Raze', roleId: 'duelist', tier: 'C', winRate: 50.6, pickRate: 3.2, proRate: 18.1 },
    { name: 'Jett', roleId: 'duelist', tier: 'C', winRate: 50.3, pickRate: 13.6, proRate: 8.5 },
    { name: 'Yoru', roleId: 'duelist', tier: 'C', winRate: 50.2, pickRate: 3.6, proRate: 38.3 },
    { name: 'Chamber', roleId: 'sentinel', tier: 'C', winRate: 50.1, pickRate: 10.4, proRate: 43.6 },
    { name: 'Waylay', roleId: 'duelist', tier: 'C', winRate: 50.0, pickRate: 3.9, proRate: 19.1 },
    { name: 'Reyna', roleId: 'duelist', tier: 'C', winRate: 49.8, pickRate: 7.2, proRate: 0 },

    { name: 'Deadlock', roleId: 'sentinel', tier: 'D', winRate: 50.8, pickRate: 0.6, proRate: 1.1, trend: 'down' },
    { name: 'Tejo', roleId: 'initiator', tier: 'D', winRate: 50.0, pickRate: 0.9, proRate: 2.1 },
    { name: 'Brimstone', roleId: 'controller', tier: 'D', winRate: 49.4, pickRate: 0.6, proRate: 2.1 },
    { name: 'Veto', roleId: 'sentinel', tier: 'D', winRate: 49.1, pickRate: 0.6, proRate: 1.1, trend: 'up' },
    { name: 'Miks', roleId: 'controller', tier: 'D', winRate: 48.5, pickRate: 0.9, proRate: 0 },
    { name: 'Iso', roleId: 'duelist', tier: 'D', winRate: 48.4, pickRate: 1.2, proRate: 0 },

    { name: 'Gekko', roleId: 'initiator', tier: 'F', winRate: 48.5, pickRate: 0.2, proRate: 0, trend: 'down' },
    { name: 'Omen', roleId: 'controller', tier: 'F', winRate: 47.8, pickRate: 2.4, proRate: 79.8 },
    { name: 'Astra', roleId: 'controller', tier: 'F', winRate: 47.5, pickRate: 1.3, proRate: 10.6 },
    { name: 'Harbor', roleId: 'controller', tier: 'F', winRate: 46.7, pickRate: 0.3, proRate: 13.8 },
    { name: 'KAY/O', roleId: 'initiator', tier: 'F', winRate: 46.7, pickRate: 0.4, proRate: 2.1 },
    { name: 'Breach', roleId: 'initiator', tier: 'F', winRate: 46.5, pickRate: 0.5, proRate: 1.1 },
  ],

  lineupsIntro:
    'Most-played comp on each map at VCT Champions 2026 (map pool: Summit, Lotus, Ascent, Sunset, Split, Haven, Abyss). Abyss had too few games to call one. The last card is our ranked starter.',
  lineups: [
    {
      name: 'Lotus',
      context: 'VCT Champions 2026',
      record: '6 maps · 33% won',
      slots: [
        { name: 'Omen', roleId: 'controller' },
        { name: 'Viper', roleId: 'controller' },
        { name: 'Fade', roleId: 'initiator' },
        { name: 'Neon', roleId: 'duelist' },
        { name: 'Chamber', roleId: 'sentinel' },
      ],
      plan: 'Double controller. Viper’s wall splits a site, Omen covers the rest, Fade clears corners and Neon runs in. Chamber anchors and holds the flank.',
    },
    {
      name: 'Ascent',
      context: 'VCT Champions 2026',
      record: '5 maps · 40% won',
      slots: [
        { name: 'Omen', roleId: 'controller' },
        { name: 'Sova', roleId: 'initiator' },
        { name: 'Jett', roleId: 'duelist' },
        { name: 'Phoenix', roleId: 'duelist' },
        { name: 'Cypher', roleId: 'sentinel' },
      ],
      plan: 'Classic mid-control comp. Sova darts take mid info, Jett holds the Operator, Phoenix flashes in first and Cypher locks down the off-site.',
    },
    {
      name: 'Sunset',
      context: 'VCT Champions 2026',
      record: '4 maps · 25% won',
      slots: [
        { name: 'Omen', roleId: 'controller' },
        { name: 'Fade', roleId: 'initiator' },
        { name: 'Yoru', roleId: 'duelist' },
        { name: 'Waylay', roleId: 'duelist' },
        { name: 'Cypher', roleId: 'sentinel' },
      ],
      plan: 'Two duelists who play mind games. Yoru teleports to fake pressure, Waylay hits fast off it and Cypher watches the flank while Fade finds the defenders.',
    },
    {
      name: 'Split',
      context: 'VCT Champions 2026',
      record: '3 maps · 100% won',
      slots: [
        { name: 'Omen', roleId: 'controller' },
        { name: 'Viper', roleId: 'controller' },
        { name: 'Skye', roleId: 'initiator' },
        { name: 'Neon', roleId: 'duelist' },
        { name: 'Chamber', roleId: 'sentinel' },
      ],
      plan: 'Viper was on every Split comp. Omen adds a second set of smokes, Neon slides through ramps and mid, and Skye flashes and heals the trade.',
    },
    {
      name: 'Summit',
      context: 'VCT Champions 2026',
      record: '3 maps · 100% won',
      slots: [
        { name: 'Harbor', roleId: 'controller' },
        { name: 'Fade', roleId: 'initiator' },
        { name: 'Neon', roleId: 'duelist' },
        { name: 'Chamber', roleId: 'sentinel' },
        { name: 'Sage', roleId: 'sentinel' },
      ],
      plan: 'Harbor’s moving walls cover long sightlines on the new map. Neon executes at speed and Sage’s wall and heals keep the retake alive.',
    },
    {
      name: 'Haven',
      context: 'VCT Champions 2026',
      record: '2 maps · 50% won',
      slots: [
        { name: 'Astra', roleId: 'controller' },
        { name: 'Fade', roleId: 'initiator' },
        { name: 'Phoenix', roleId: 'duelist' },
        { name: 'Yoru', roleId: 'duelist' },
        { name: 'Chamber', roleId: 'sentinel' },
      ],
      plan: 'Astra’s global smokes reach all three sites. Yoru and Phoenix create pressure and Chamber rotates quickly with his teleport.',
    },
    {
      name: 'Ranked starter',
      context: 'Ranked · top win rates',
      slots: [
        { name: 'Clove', roleId: 'controller' },
        { name: 'Sova', roleId: 'initiator' },
        { name: 'Neon', roleId: 'duelist' },
        { name: 'Phoenix', roleId: 'duelist' },
        { name: 'Sage', roleId: 'sentinel' },
      ],
      plan: 'Every role covered with the highest ranked win rates. Clove can still smoke after dying, Sage heals and revives, and Sova gives information without needing comms.',
    },
  ],

  loadoutsTitle: 'Buy rounds',
  loadouts: [
    {
      title: 'Pistol round',
      subtitle: 'Rounds 1 and 13',
      items: ['Classic + Light Armor', 'or Ghost / Bandit', 'Cheap utility'],
      extras: [
        { label: 'Budget', value: '800' },
        { label: 'Shield', value: 'Light (400)' },
      ],
      note: 'Light armour with the Classic is the safe default. Take a Ghost if you trust your headshots.',
    },
    {
      title: 'Bonus round',
      subtitle: 'After winning pistol',
      items: ['Keep your pistol', 'Spectre or Stinger', 'Light Armor'],
      extras: [
        { label: 'Budget', value: '≈ 3,000+' },
        { label: 'Shield', value: 'Light (400)' },
      ],
      note: 'Cheap guns punish the enemy eco. Never buy rifles here, because the money is needed for round 3.',
    },
    {
      title: 'Eco',
      subtitle: 'Saving',
      items: ['Classic or Sheriff', 'Maybe Light Armor', 'Save the rest'],
      extras: [
        { label: 'Budget', value: 'Under 2,000' },
        { label: 'Shield', value: 'None / Light' },
      ],
      note: 'Spend little so the whole team can full buy together next round. Loss bonus caps at 2,900.',
    },
    {
      title: 'Half buy',
      subtitle: 'Partial spend',
      items: ['Sheriff, Stinger or Spectre', 'Light Armor', 'Key utility'],
      extras: [
        { label: 'Budget', value: '2,000 – 3,300' },
        { label: 'Shield', value: 'Light (400)' },
      ],
      note: 'Enough to win close-range fights while keeping a full buy possible next round.',
    },
    {
      title: 'Force buy',
      subtitle: 'All in',
      items: ['Spectre, Bulldog, Marshal or Outlaw', 'Light Armor', 'Whatever is left'],
      extras: [
        { label: 'Budget', value: 'Under 3,900' },
        { label: 'Shield', value: 'Light (400)' },
      ],
      note: 'Use when one more lost round loses the half or the game. The whole team must force together.',
    },
    {
      title: 'Full buy',
      subtitle: 'Standard',
      items: ['Vandal, Phantom or Warden', 'Heavy Armor', 'Full utility'],
      extras: [
        { label: 'Budget', value: '3,900+' },
        { label: 'Shield', value: 'Heavy (1,000)' },
      ],
      note: 'Operator rounds need about 5,700+ before utility. Drop rifles for teammates who are short.',
    },
  ],

  equipmentTitle: 'Arsenal and prices',
  equipment: [
    {
      title: 'Rifles',
      items: [
        { name: 'Vandal', cost: '2,900', detail: 'One-tap headshot at any range. The default rifle for most players.' },
        { name: 'Phantom', cost: '2,900', detail: 'Suppressed, faster fire rate, easier spray; damage drops at long range.' },
        { name: 'Warden', cost: '2,900', detail: 'New in 13.06. 2x scope, 50 body / 200 head with no falloff, 6.5 rounds/s, 18-round mag.' },
        { name: 'Guardian', cost: '2,250', detail: 'Semi-auto, one-tap headshot. Good force-buy pick for long angles.' },
        { name: 'Bulldog', cost: '2,050', detail: 'Burst-fire scope. Cheap force-buy rifle.' },
      ],
    },
    {
      title: 'Snipers',
      items: [
        { name: 'Operator', cost: '4,700', detail: 'One-shot kill above the legs. Changes how the enemy plays the map.' },
        { name: 'Outlaw', cost: '2,400', detail: 'Two-shot double-barrel sniper. Mid-price AWP alternative.' },
        { name: 'Marshal', cost: '950', detail: 'One-shot headshot, light and fast. Classic eco sniper.' },
      ],
    },
    {
      title: 'SMGs and shotguns',
      items: [
        { name: 'Spectre', cost: '1,600', detail: 'Accurate SMG. Best half-buy gun for close and mid range.' },
        { name: 'Stinger', cost: '1,100', detail: 'Fast spray up close, burst mode for range.' },
        { name: 'Judge', cost: '1,850', detail: 'Auto shotgun for tight sites and site holds.' },
        { name: 'Bucky', cost: '850', detail: 'Cheap shotgun with a strong right-click slug.' },
      ],
    },
    {
      title: 'Sidearms',
      items: [
        { name: 'Sheriff', cost: '800', detail: 'Revolver. One-tap headshot at close range even through armour.' },
        { name: 'Bandit', cost: '600', detail: 'Mid-price pistol between the Ghost and the Sheriff.' },
        { name: 'Ghost', cost: '500', detail: 'Suppressed and accurate. The pistol-round favourite.' },
        { name: 'Frenzy', cost: '450', detail: 'Automatic pistol for close fights.' },
        { name: 'Shorty', cost: '300', detail: 'Two-shot shotgun for corners.' },
        { name: 'Classic', cost: 'Free', detail: 'Default pistol; right-click burst up close.' },
      ],
    },
    {
      title: 'Heavy and shields',
      items: [
        { name: 'Odin', cost: '3,200', detail: 'Wall-bang spray machine gun.' },
        { name: 'Ares', cost: '1,600', detail: 'Cheaper machine gun that also shoots through walls.' },
        { name: 'Heavy Armor', cost: '1,000', detail: '50 armour. Standard on full buys.' },
        { name: 'Regen Shield', cost: '650', detail: 'Mid-tier shield that regenerates.' },
        { name: 'Light Armor', cost: '400', detail: '25 armour. Pistol rounds and force buys.' },
      ],
    },
  ],

  roles: [
    {
      id: 'duelist',
      name: 'Duelist',
      summary: 'Entry fragger who takes the first fight and makes space for the team.',
      duties: ['Enter sites first', 'Trade aggressively', 'Win opening duels'],
      picks: ['Neon', 'Phoenix', 'Raze'],
    },
    {
      id: 'initiator',
      name: 'Initiator',
      summary: 'Gathers information and sets up entries with flashes, stuns and recon.',
      duties: ['Clear corners before entries', 'Find defenders with recon', 'Support retakes'],
      picks: ['Fade', 'Sova', 'Skye'],
    },
    {
      id: 'controller',
      name: 'Controller',
      summary: 'Cuts sightlines with smokes and walls. Often the in-game leader.',
      duties: ['Smoke for executes', 'Delay pushes on defence', 'Call the round'],
      picks: ['Clove', 'Viper', 'Omen'],
    },
    {
      id: 'sentinel',
      name: 'Sentinel',
      summary: 'Locks down a site, watches flanks and slows enemy pushes.',
      duties: ['Anchor a site', 'Watch flanks with traps', 'Hold post-plant'],
      picks: ['Sage', 'Cypher', 'Killjoy'],
    },
  ],

  modes: ['Competitive', 'Unrated', 'Swiftplay', 'Premier', 'Custom'],
  rankExample: 'Platinum 2',

  sources: [
    { label: 'metabot.gg agent tier list', url: 'https://metabot.gg/en/valorant/agents/tier-list' },
    { label: 'VCT 2026 Champions stats', url: 'https://vct-reference.com/events/vct-2026-champions-2766' },
    { label: 'Patch notes 13.06', url: 'https://wiki.playvalorant.com/en-us/Patch_Notes/13.06' },
    { label: 'Economy guide (13.06)', url: 'https://turbosmurfs.gg/article/valorant-economy-guide' },
  ],
  liveLinks: [
    { label: 'metabot.gg win rates', url: 'https://metabot.gg/en/valorant/agents/win-rate' },
    { label: 'Blitz.gg agent stats', url: 'https://blitz.gg/valorant/stats/agents' },
    { label: 'vstats.gg tier list', url: 'https://www.vstats.gg/' },
  ],
}
