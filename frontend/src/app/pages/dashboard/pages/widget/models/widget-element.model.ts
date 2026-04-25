export type WidgetElementType =
  | 'points' | 'streak' | 'level' | 'badge'
  | 'progress' | 'avatar' | 'label' | 'divider';

export interface WidgetElement {
  id: string;
  type: WidgetElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  bg: string;
  fg: string;
  r: number;
  // type-specific
  label?: string;
  val?: string;
  ac?: string;   // accent color (badge, progress)
  pct?: number;  // progress %
  fs?: number;   // font size (label)
}

export interface WidgetFrame {
  bg: string;
  radius: number;
}

export const COMPONENT_LIBRARY = [
  { type: 'points'  as WidgetElementType, icon: '⭐', label: 'Points',   hint: 'Live balance' },
  { type: 'streak'  as WidgetElementType, icon: '🔥', label: 'Streak',   hint: 'Daily streak' },
  { type: 'level'   as WidgetElementType, icon: '🎖️', label: 'Level',    hint: 'Current tier' },
  { type: 'badge'   as WidgetElementType, icon: '🏅', label: 'Badge',    hint: 'Achievement' },
  { type: 'progress'as WidgetElementType, icon: '◼', label: 'XP Bar',   hint: 'Level progress' },
  { type: 'avatar'  as WidgetElementType, icon: '◉', label: 'Avatar',   hint: 'Profile circle' },
  { type: 'label'   as WidgetElementType, icon: 'T', label: 'Text',     hint: 'Custom label' },
  { type: 'divider' as WidgetElementType, icon: '─', label: 'Divider',  hint: 'Separator' },
];

let _uid = 1;
export function makeElement(type: WidgetElementType, x: number, y: number): WidgetElement {
  const id = `el${_uid++}`;
  switch (type) {
    case 'points':   return { id, type, x, y, w:210, h:60,  bg:'#6366F1', fg:'#fff', r:14, label:'Points', val:'8,420' };
    case 'streak':   return { id, type, x, y, w:162, h:52,  bg:'#F59E0B', fg:'#fff', r:12, val:'7' };
    case 'level':    return { id, type, x, y, w:102, h:30,  bg:'#10B981', fg:'#000', r:999, val:'Gold' };
    case 'badge':    return { id, type, x, y, w:160, h:36,  bg:'transparent', fg:'#fff', r:999, label:'Early Adopter', ac:'#6366F1' };
    case 'progress': return { id, type, x, y, w:245, h:52,  bg:'#ffffff0D', fg:'#fff', r:12, ac:'#6366F1', pct:65, label:'Level 4→5' };
    case 'avatar':   return { id, type, x, y, w:52,  h:52,  bg:'#6366F1', fg:'#fff', r:999, val:'A' };
    case 'label':    return { id, type, x, y, w:160, h:28,  bg:'transparent', fg:'#ffffff88', r:0, val:'Your Score', fs:12 };
    case 'divider':  return { id, type, x, y, w:220, h:2,   bg:'#ffffff22', fg:'#fff', r:999 };
  }
}