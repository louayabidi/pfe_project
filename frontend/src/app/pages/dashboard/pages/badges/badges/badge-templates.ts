export interface BadgeTemplate {
  name: string;
  description: string;
  imageUrl: string;
  emoji: string;
  category: string;
}

export const BADGE_TEMPLATES: BadgeTemplate[] = [

  // ── Engagement ──────────────────────────────────────────────────────
  {
    emoji: '🔥',
    category: 'Engagement',
    name: 'On Fire',
    description: 'Awarded to users on a hot streak of activity.',
    imageUrl: 'https://img.icons8.com/fluency/96/fire-element.png'
  },
  {
    emoji: '⚡',
    category: 'Engagement',
    name: 'Early Bird',
    description: 'Given to users who show up consistently first.',
    imageUrl: 'https://img.icons8.com/fluency/96/lightning-bolt.png'
  },
  {
    emoji: '💎',
    category: 'Engagement',
    name: 'Diamond Member',
    description: 'Top-tier loyalty badge for your most dedicated users.',
    imageUrl: 'https://img.icons8.com/fluency/96/diamond.png'
  },
  {
    emoji: '👑',
    category: 'Engagement',
    name: 'Royalty',
    description: 'Reserved for users who dominate every metric.',
    imageUrl: 'https://img.icons8.com/fluency/96/crown.png'
  },
  {
    emoji: '❤️‍🔥',
    category: 'Engagement',
    name: 'Obsessed',
    description: 'Can\'t stop, won\'t stop — daily presence for 30 days.',
    imageUrl: 'https://img.icons8.com/fluency/96/like.png'
  },

  // ── Achievement ──────────────────────────────────────────────────────
  {
    emoji: '🏆',
    category: 'Achievement',
    name: 'Champion',
    description: 'Awarded to users who reach the top of the leaderboard.',
    imageUrl: 'https://img.icons8.com/fluency/96/trophy.png'
  },
  {
    emoji: '🥇',
    category: 'Achievement',
    name: 'First Place',
    description: 'Celebrate users who finish #1 in a challenge.',
    imageUrl: 'https://img.icons8.com/fluency/96/medal2.png'
  },
  {
    emoji: '🎯',
    category: 'Achievement',
    name: 'Sharp Shooter',
    description: 'For users who hit their goals with precision.',
    imageUrl: 'https://img.icons8.com/fluency/96/goal.png'
  },
  {
    emoji: '🚀',
    category: 'Achievement',
    name: 'Rocket Start',
    description: 'Awarded for an exceptional first week of activity.',
    imageUrl: 'https://img.icons8.com/fluency/96/rocket.png'
  },
  {
    emoji: '🧠',
    category: 'Achievement',
    name: 'Galaxy Brain',
    description: 'Unlocked by mastering the hardest challenges.',
    imageUrl: 'https://img.icons8.com/fluency/96/brain.png'
  },
  {
    emoji: '⚔️',
    category: 'Achievement',
    name: 'Gladiator',
    description: 'Won 10 head-to-head competitions.',
    imageUrl: 'https://img.icons8.com/fluency/96/sword.png'
  },
  {
    emoji: '🌋',
    category: 'Achievement',
    name: 'Unstoppable',
    description: 'Completed every challenge in a season.',
    imageUrl: 'https://img.icons8.com/fluency/96/mountain.png'
  },

  // ── Social ───────────────────────────────────────────────────────────
  {
    emoji: '🤝',
    category: 'Social',
    name: 'Team Player',
    description: 'Recognizes users who help and collaborate with others.',
    imageUrl: 'https://img.icons8.com/fluency/96/handshake.png'
  },
  {
    emoji: '📣',
    category: 'Social',
    name: 'Influencer',
    description: 'Given to users who refer the most new members.',
    imageUrl: 'https://img.icons8.com/fluency/96/megaphone.png'
  },
  {
    emoji: '🌐',
    category: 'Social',
    name: 'Connector',
    description: 'Built a network of 50+ connections.',
    imageUrl: 'https://img.icons8.com/fluency/96/worldwide-location.png'
  },
  {
    emoji: '🎤',
    category: 'Social',
    name: 'Voice of the Community',
    description: 'Most upvoted contributor of the month.',
    imageUrl: 'https://img.icons8.com/fluency/96/microphone.png'
  },

  // ── Milestone ────────────────────────────────────────────────────────
  {
    emoji: '🌟',
    category: 'Milestone',
    name: 'Rising Star',
    description: 'Awarded when a user reaches their first major milestone.',
    imageUrl: 'https://img.icons8.com/fluency/96/star.png'
  },
  {
    emoji: '💯',
    category: 'Milestone',
    name: 'Century Club',
    description: 'For users who complete 100 actions.',
    imageUrl: 'https://img.icons8.com/fluency/96/100.png'
  },
  {
    emoji: '🎖️',
    category: 'Milestone',
    name: 'Veteran',
    description: 'Awarded to users who have been active for over a year.',
    imageUrl: 'https://img.icons8.com/fluency/96/medal.png'
  },
  {
    emoji: '🗓️',
    category: 'Milestone',
    name: '365 Club',
    description: 'Active every single day for a full year.',
    imageUrl: 'https://img.icons8.com/fluency/96/planner.png'
  },
  {
    emoji: '🏅',
    category: 'Milestone',
    name: 'Hall of Fame',
    description: 'Inducted after reaching lifetime elite status.',
    imageUrl: 'https://img.icons8.com/fluency/96/prize.png'
  },

  // ── Special ──────────────────────────────────────────────────────────
  {
    emoji: '👻',
    category: 'Special',
    name: 'Ghost Mode',
    description: 'Active every day without a single public post.',
    imageUrl: 'https://img.icons8.com/fluency/96/ghost.png'
  },
  {
    emoji: '🐉',
    category: 'Special',
    name: 'Dragon Slayer',
    description: 'Defeated the highest-difficulty boss challenge.',
    imageUrl: 'https://img.icons8.com/fluency/96/dragon.png'
  },
  {
    emoji: '🔮',
    category: 'Special',
    name: 'Oracle',
    description: 'Predicted outcomes with 90%+ accuracy.',
    imageUrl: 'https://img.icons8.com/fluency/96/crystal-ball.png'
  },
  {
    emoji: '🧊',
    category: 'Special',
    name: 'Ice Cold',
    description: 'Never broke a streak — not once.',
    imageUrl: 'https://img.icons8.com/fluency/96/ice.png'
  },
  {
    emoji: '⚡',
    category: 'Special',
    name: 'Speed Demon',
    description: 'Completed 10 tasks in under 1 minute each.',
    imageUrl: 'https://img.icons8.com/fluency/96/flash-on.png'
  },
];

export const TEMPLATE_CATEGORIES = [...new Set(BADGE_TEMPLATES.map(t => t.category))];