import type { GameGuide } from './types'

/**
 * Snapshot: Season 42, patch 2.2.16 (taken 2026-10-05).
 * Tiers merge mlbb.io and mlbbhub.com; rates are ranked, all servers.
 * Rates are left out where the sources don't publish them.
 */
export const MLBB: GameGuide = {
  id: 'mlbb',
  name: 'Mobile Legends: Bang Bang',
  shortName: 'MLBB',
  genre: '5v5 mobile MOBA',
  accent: 'yang',
  tagline: 'Season 42 rewards durable frontliners and sustain supports. Matches run slower and the economy punishes snowballing.',
  patch: '2.2.16',
  asOf: '2026-10-05',

  stats: [
    { label: 'Patch', value: '2.2.16', note: 'Season 42 · Starward Decade' },
    { label: 'Highest win rate', value: 'Rafaela 59.4%', note: 'Roam support, ranked on all servers' },
    { label: 'Most banned', value: 'Hirara 65.8%', note: 'Banned in about two of every three drafts' },
    { label: 'Biggest riser', value: 'Aulus +7.7', note: 'Win-rate points gained this patch' },
  ],

  metaNotes: [
    'The patch targets durable frontliners and sustain supports, with slower matches and economy changes that make snowballing harder.',
    'Roam is the strongest lane right now: Rafaela, Marcel, Minotaur, Floryn and Estes all sit in S tier.',
    'Attack-effect items are no longer only for marksmen. Corrosion Scythe and Demon Hunter Sword now carry fighters like Argus.',
    'Hirara is the ban of the patch. If she gets through, first-pick her or ban her.',
    'Falling: Melissa (−8.2) and Miya (−4.0) lost the most win rate this patch.',
  ],

  tierSource: 'Ranked, all servers · mlbb.io and mlbbhub.com',
  tiers: [
    { name: 'Rafaela', roleId: 'roam', archetype: 'Support', tier: 'S', winRate: 59.4, pickRate: 1.22, banRate: 15.5 },
    { name: 'Aulus', roleId: 'jungle', archetype: 'Fighter', tier: 'S', winRate: 59.0, pickRate: 0.83, banRate: 8.9, trend: 'up' },
    { name: 'Masha', roleId: 'exp', archetype: 'Fighter / Tank', tier: 'S', winRate: 58.8, pickRate: 0.7, banRate: 22.4, trend: 'up' },
    { name: 'Marcel', roleId: 'roam', archetype: 'Support', tier: 'S', winRate: 58.4, pickRate: 0.28, banRate: 32.0 },
    { name: 'Argus', roleId: 'exp', archetype: 'Fighter', tier: 'S', winRate: 55.4, pickRate: 0.64, banRate: 1.6, trend: 'up' },
    { name: 'Minotaur', roleId: 'roam', archetype: 'Tank', tier: 'S', winRate: 55.1 },
    { name: 'Floryn', roleId: 'roam', archetype: 'Support', tier: 'S', winRate: 54.5 },
    { name: 'Hirara', roleId: 'jungle', archetype: 'Assassin', tier: 'S', winRate: 54.0, pickRate: 0.65, banRate: 65.8 },
    { name: 'Gloo', roleId: 'roam', archetype: 'Tank', tier: 'S', winRate: 54.0, pickRate: 0.73, banRate: 37.8 },
    { name: 'Obsidia', roleId: 'gold', archetype: 'Marksman', tier: 'S', winRate: 53.7, pickRate: 1.85, banRate: 7.3, trend: 'up' },
    { name: 'Carmilla', roleId: 'roam', archetype: 'Support / Tank', tier: 'S', winRate: 53.7 },
    { name: 'Lukas', roleId: 'jungle', archetype: 'Fighter', tier: 'S', winRate: 53.5 },
    { name: 'Estes', roleId: 'roam', archetype: 'Support', tier: 'S', winRate: 53.3 },
    { name: 'Atlas', roleId: 'roam', archetype: 'Tank', tier: 'S' },

    { name: 'Valir', roleId: 'mid', archetype: 'Mage', tier: 'A', winRate: 53.0, pickRate: 0.94, banRate: 1.7 },
    { name: 'Belerick', roleId: 'roam', archetype: 'Tank', tier: 'A', winRate: 52.5 },
    { name: 'Bruno', roleId: 'gold', archetype: 'Marksman', tier: 'A', trend: 'up' },
    { name: 'Gord', roleId: 'mid', archetype: 'Mage', tier: 'A' },
    { name: 'Kagura', roleId: 'mid', archetype: 'Mage', tier: 'A' },
    { name: 'Novaria', roleId: 'mid', archetype: 'Mage', tier: 'A' },
    { name: 'Xavier', roleId: 'mid', archetype: 'Mage', tier: 'A' },
    { name: 'Kadita', roleId: 'mid', archetype: 'Mage / Assassin', tier: 'A' },
    { name: 'Hanabi', roleId: 'gold', archetype: 'Marksman', tier: 'A' },
    { name: 'Beatrix', roleId: 'gold', archetype: 'Marksman', tier: 'A' },
    { name: 'Moskov', roleId: 'gold', archetype: 'Marksman', tier: 'A' },
    { name: 'Miya', roleId: 'gold', archetype: 'Marksman', tier: 'A', trend: 'down' },
    { name: 'Ling', roleId: 'jungle', archetype: 'Assassin', tier: 'A' },
    { name: 'Fredrinn', roleId: 'jungle', archetype: 'Fighter / Tank', tier: 'A' },
    { name: 'Yi Sun-shin', roleId: 'jungle', archetype: 'Assassin', tier: 'A' },
    { name: 'Nolan', roleId: 'jungle', archetype: 'Assassin', tier: 'A' },
    { name: 'Benedetta', roleId: 'exp', archetype: 'Assassin / Fighter', tier: 'A' },
    { name: 'Paquito', roleId: 'exp', archetype: 'Fighter', tier: 'A' },
    { name: 'Guinevere', roleId: 'exp', archetype: 'Fighter', tier: 'A' },
    { name: 'Khufra', roleId: 'roam', archetype: 'Tank', tier: 'A' },
    { name: 'Diggie', roleId: 'roam', archetype: 'Support', tier: 'A' },
  ],

  lineupsIntro:
    'Squad lineups built from this patch’s strongest pick in each lane. They are starting points for our 5-stacks, not copies of pro drafts.',
  lineups: [
    {
      name: 'Sustain brawl',
      context: 'Teamfight · patch 2.2.16 picks',
      slots: [
        { name: 'Masha', roleId: 'exp' },
        { name: 'Aulus', roleId: 'jungle' },
        { name: 'Valir', roleId: 'mid' },
        { name: 'Obsidia', roleId: 'gold' },
        { name: 'Rafaela', roleId: 'roam' },
      ],
      plan: 'Valir zones the choke, Rafaela speeds the team in and Masha and Aulus heal through the fight. Take Turtle and Lord off won fights instead of chasing kills.',
    },
    {
      name: 'Pick-off',
      context: 'Skirmish · patch 2.2.16 picks',
      slots: [
        { name: 'Argus', roleId: 'exp' },
        { name: 'Hirara', roleId: 'jungle' },
        { name: 'Kagura', roleId: 'mid' },
        { name: 'Bruno', roleId: 'gold' },
        { name: 'Marcel', roleId: 'roam' },
      ],
      plan: 'Hunt isolated targets. Hirara locks one hero down, Marcel freezes the chokepoint and Kagura and Bruno burst the target before help arrives.',
    },
    {
      name: 'Frontline wall',
      context: 'Late game · patch 2.2.16 picks',
      slots: [
        { name: 'Gloo', roleId: 'exp' },
        { name: 'Lukas', roleId: 'jungle' },
        { name: 'Gord', roleId: 'mid' },
        { name: 'Hanabi', roleId: 'gold' },
        { name: 'Floryn', roleId: 'roam' },
      ],
      plan: 'Play safe early and scale. Gloo and Lukas soak damage while Gord pokes from range. Floryn’s global heal turns even fights into wins for Hanabi.',
    },
  ],

  loadoutsTitle: 'Hero builds',
  loadouts: [
    {
      title: 'Hirara',
      subtitle: 'Jungle · Assassin',
      items: ['Tough Boots', 'Hunter Strike', 'Blade of Despair', 'Blade of the Heptaseas', 'Malefic Roar', 'Immortality'],
      extras: [
        { label: 'Emblem', value: 'Assassin: Rupture, Seasoned Hunter, Killing Spree' },
        { label: 'Spell', value: 'Retribution' },
      ],
      note: 'Lockdown, not burst. Drag both skills onto an isolated target and manage her two energy charges.',
    },
    {
      title: 'Aulus',
      subtitle: 'Jungle / EXP · Fighter',
      items: ['Tough Boots', 'War Axe', 'Brute Force Breastplate', 'Rose Gold Meteor', 'Queen’s Wings', 'Malefic Roar'],
      extras: [
        { label: 'Emblem', value: 'Fighter: Firmness, Seasoned Hunter, War Cry' },
        { label: 'Spell', value: 'Retribution' },
      ],
      note: 'One clean entry becomes an area problem. Stay in contact and keep swinging with enhanced attacks.',
    },
    {
      title: 'Masha',
      subtitle: 'EXP lane · Fighter / Tank',
      items: ['Warrior Boots', 'War Axe', 'Corrosion Scythe', 'Thunder Belt', 'Queen’s Wings', 'Immortality'],
      extras: [
        { label: 'Emblem', value: 'Fighter: Firmness, Festival of Blood, Brave Smite' },
        { label: 'Spell', value: 'Sprint' },
      ],
      note: 'Plant the Wound on the closest target, break it to enter Feral, then heal through claw strikes in fights.',
    },
    {
      title: 'Argus',
      subtitle: 'EXP lane · Fighter',
      items: ['Swift Boots', 'Corrosion Scythe', 'Demon Hunter Sword', 'Golden Staff', 'Haas’s Claws', 'Malefic Roar'],
      extras: [
        { label: 'Emblem', value: 'Marksman: Swift, Weapon Master, War Cry' },
        { label: 'Spell', value: 'Flicker' },
      ],
      note: 'Scythe + Demon Hunter Sword spike around minutes 7–9. That is your cue to start hitting turrets.',
    },
    {
      title: 'Valir',
      subtitle: 'Mid lane · Mage',
      items: ['Demon Boots', 'Glowing Wand', 'Ice Queen Wand', 'Genius Wand', 'Divine Glaive', 'Immortality'],
      extras: [
        { label: 'Emblem', value: 'Mage: Inspire, Bargain Hunter, Impure Rage' },
        { label: 'Spell', value: 'Flicker' },
      ],
      note: 'A traffic controller: decide where fights happen by forcing enemies through fire and slows.',
    },
    {
      title: 'Obsidia',
      subtitle: 'Gold lane · Marksman',
      items: ['Swift Boots', 'Corrosion Scythe', 'Demon Hunter Sword', 'Golden Staff', 'Malefic Gun', 'Rose Gold Meteor'],
      extras: [
        { label: 'Emblem', value: 'Marksman: Swift, Weapon Master, Quantum Charge' },
        { label: 'Spell', value: 'Flicker' },
      ],
      note: 'Stack shards safely while farming, then spend the ultimate tether on a target that cannot escape.',
    },
    {
      title: 'Rafaela',
      subtitle: 'Roam · Support',
      items: ['Tough Boots', 'Enchanted Talisman', 'Flask of the Oasis', 'Fleeting Time', 'Oracle', 'Immortality'],
      extras: [
        { label: 'Emblem', value: 'Support: Agility, Pull Yourself Together, Focusing Mark' },
        { label: 'Spell', value: 'Flicker' },
      ],
      note: 'A tempo support: speed the team in, reveal ambushes and buy the carry one extra second.',
    },
    {
      title: 'Marcel',
      subtitle: 'Roam · Support',
      items: ['Tough Boots', 'Thunder Belt', 'Dominance Ice', 'Oracle', 'Athena’s Shield', 'Immortality'],
      extras: [
        { label: 'Emblem', value: 'Support: Agility, Pull Yourself Together, Focusing Mark' },
        { label: 'Spell', value: 'Petrify' },
      ],
      note: 'Turn one chokepoint into a kill box. Freeze the group with the ultimate and let the team follow up.',
    },
    {
      title: 'Gloo',
      subtitle: 'Roam / EXP · Tank',
      items: ['Tough Boots', 'Cursed Helmet', 'Glowing Wand', 'Oracle', 'Antique Cuirass', 'Immortality'],
      extras: [
        { label: 'Emblem', value: 'Common: Agility, Wilderness Blessing, Impure Rage' },
        { label: 'Spell', value: 'Flicker' },
      ],
      note: 'Latch onto a stationary target and redirect damage onto them while your team finishes the kill.',
    },
  ],

  equipmentTitle: 'Meta items, emblems and spells',
  equipment: [
    {
      title: 'Physical attack',
      items: [
        { name: 'Corrosion Scythe', detail: 'Attack speed and slowing basic attacks. Core of every attack-effect build.' },
        { name: 'Demon Hunter Sword', detail: 'Bonus damage from the target’s current HP. Answer to tanky frontlines.' },
        { name: 'Golden Staff', detail: 'Turns attack speed into extra attack effects. Pairs with Scythe.' },
        { name: 'War Axe', detail: 'Stacking attack and spell vamp for fighters in long fights.' },
        { name: 'Blade of Despair', detail: 'Biggest raw attack spike, bonus damage to low-HP targets.' },
        { name: 'Hunter Strike', detail: 'Physical penetration and a speed burst after hits. Assassin core.' },
        { name: 'Malefic Roar', detail: 'Physical penetration that scales with enemy armour. Late slot.' },
        { name: 'Haas’s Claws', detail: 'Lifesteal for attack-speed and crit builds.' },
      ],
    },
    {
      title: 'Magic',
      items: [
        { name: 'Glowing Wand', detail: 'Burn damage plus healing reduction. First item on most mages.' },
        { name: 'Ice Queen Wand', detail: 'Magic damage slows, so control mages keep enemies in zones.' },
        { name: 'Genius Wand', detail: 'Magic penetration and lowers magic defence on hit.' },
        { name: 'Divine Glaive', detail: 'Percentage magic penetration for the late game.' },
        { name: 'Enchanted Talisman', detail: 'Cooldown and mana sustain for supports and mages.' },
        { name: 'Flask of the Oasis', detail: 'Boosts the healing and shields you give allies.' },
        { name: 'Fleeting Time', detail: 'Cuts ultimate cooldown on kills and assists.' },
      ],
    },
    {
      title: 'Defence',
      items: [
        { name: 'Thunder Belt', detail: 'HP and armour; skills add true damage and a slow.' },
        { name: 'Dominance Ice', detail: 'Cuts enemy healing, shields and attack speed nearby.' },
        { name: 'Oracle', detail: 'Strengthens shields and healing you receive. Big with sustain supports.' },
        { name: 'Antique Cuirass', detail: 'Lowers the physical attack of heroes that hit you.' },
        { name: 'Athena’s Shield', detail: 'Magic shield against burst mages.' },
        { name: 'Brute Force Breastplate', detail: 'Stacking defence and movement speed for fighters.' },
        { name: 'Queen’s Wings', detail: 'Damage reduction and spell vamp at low HP.' },
        { name: 'Cursed Helmet', detail: 'Burns nearby enemies, which is great for clearing waves on tanks.' },
        { name: 'Immortality', detail: 'Revive once. Final slot on most builds this patch.' },
      ],
    },
    {
      title: 'Battle spells',
      items: [
        { name: 'Flicker', detail: 'Short blink. Default for mages, marksmen and initiating tanks.' },
        { name: 'Retribution', detail: 'Required for junglers: secures buffs, Turtle and Lord.' },
        { name: 'Petrify', detail: 'Area stun for teamfight supports like Marcel.' },
        { name: 'Sprint', detail: 'Burst of speed for EXP laners that chase or rotate.' },
        { name: 'Inspire', detail: 'Attack-speed boost for carries that can stay protected.' },
      ],
    },
    {
      title: 'Emblems',
      items: [
        { name: 'Marksman', detail: 'Weapon Master and Quantum Charge. Also used by attack-effect fighters.' },
        { name: 'Fighter', detail: 'Firmness with Festival of Blood or Brave Smite for sustain.' },
        { name: 'Assassin', detail: 'Rupture, Seasoned Hunter and Killing Spree for junglers.' },
        { name: 'Mage', detail: 'Inspire, Bargain Hunter and Impure Rage.' },
        { name: 'Support', detail: 'Pull Yourself Together and Focusing Mark for roamers.' },
        { name: 'Common', detail: 'Wilderness Blessing for roaming tanks that need speed.' },
      ],
    },
  ],

  roles: [
    {
      id: 'exp',
      name: 'EXP lane',
      summary: 'Solo laner who wins the 1v1 and frontlines or flanks in teamfights.',
      duties: ['Hold the lane alone', 'Split-push when the team groups elsewhere', 'Peel or dive in fights'],
      picks: ['Masha', 'Argus', 'Aulus'],
    },
    {
      id: 'jungle',
      name: 'Jungle',
      summary: 'Sets the tempo: farms camps, ganks lanes and secures objectives with Retribution.',
      duties: ['Clear buffs and camps', 'Take Turtle and Lord', 'Gank lanes that are pushed'],
      picks: ['Aulus', 'Hirara', 'Lukas'],
    },
    {
      id: 'mid',
      name: 'Mid lane',
      summary: 'Mage who clears waves fast and rotates to help side lanes.',
      duties: ['Clear mid quickly', 'Rotate for ganks and objectives', 'Area damage and control in fights'],
      picks: ['Valir', 'Gord', 'Kagura'],
    },
    {
      id: 'gold',
      name: 'Gold lane',
      summary: 'Marksman who farms gold early and becomes the main damage late.',
      duties: ['Farm safely', 'Take turrets', 'Deal sustained damage from behind the front line'],
      picks: ['Obsidia', 'Bruno', 'Hanabi'],
    },
    {
      id: 'roam',
      name: 'Roam',
      summary: 'Tank or support with roam boots who protects, scouts and starts fights.',
      duties: ['Escort the jungler early', 'Give vision and set up ganks', 'Initiate or peel'],
      picks: ['Rafaela', 'Marcel', 'Minotaur'],
    },
  ],

  modes: ['Ranked', 'Classic', 'Brawl', 'Custom'],
  rankExample: 'Mythic',

  sources: [
    { label: 'mlbbhub.com tier list', url: 'https://mlbbhub.com/tier-list' },
    { label: 'mlbb.io hero tier', url: 'https://mlbb.io/en/hero-tier' },
    { label: 'mlbbhub.com hero builds', url: 'https://mlbbhub.com/heroes/hirara' },
  ],
}
