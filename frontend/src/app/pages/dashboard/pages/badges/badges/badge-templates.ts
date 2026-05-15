

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
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f525.svg'
  },
  {
    emoji: '⚡',
    category: 'Engagement',
    name: 'Early Bird',
    description: 'Given to users who show up consistently first.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/26a1.svg'
  },
  {
    emoji: '💎',
    category: 'Engagement',
    name: 'Diamond Member',
    description: 'Top-tier loyalty badge for your most dedicated users.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f48e.svg'
  },

  // ── Achievement ──────────────────────────────────────────────────────
  {
    emoji: '🏆',
    category: 'Achievement',
    name: 'Champion',
    description: 'Awarded to users who reach the top of the leaderboard.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3c6.svg'
  },
  {
    emoji: '🥇',
    category: 'Achievement',
    name: 'First Place',
    description: 'Celebrate users who finish #1 in a challenge.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f947.svg'
  },
  {
    emoji: '🎯',
    category: 'Achievement',
    name: 'Sharp Shooter',
    description: 'For users who hit their goals with precision.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f3af.svg'
  },
  {
    emoji: '🚀',
    category: 'Achievement',
    name: 'Rocket Start',
    description: 'Awarded for an exceptional first week of activity.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f680.svg'
  },

  // ── Social ───────────────────────────────────────────────────────────
  {
    emoji: '🤝',
    category: 'Social',
    name: 'Team Player',
    description: 'Recognizes users who help and collaborate with others.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f91d.svg'
  },
  {
    emoji: '📣',
    category: 'Social',
    name: 'Influencer',
    description: 'Given to users who refer the most new members.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4e3.svg'
  },

  // ── Milestones ───────────────────────────────────────────────────────
  {
    emoji: '🌟',
    category: 'Milestone',
    name: 'Rising Star',
    description: 'Awarded when a user reaches their first major milestone.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f31f.svg'
  },
  {
    emoji: '💯',
    category: 'Milestone',
    name: 'Century Club',
    description: 'For users who complete 100 actions.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f4af.svg'
  },
  {
    emoji: '🎖️',
    category: 'Milestone',
    name: 'Veteran',
    description: 'Awarded to users who have been active for over a year.',
    imageUrl: 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/1f396.svg'
  },
];

export const TEMPLATE_CATEGORIES = [...new Set(BADGE_TEMPLATES.map(t => t.category))];