export const LEARN_METHOD_LABELS_EN: Record<string, string> = {
  'level-up': 'Level-up',
  egg: 'Egg',
  machine: 'TM/HM',
  tutor: 'Tutor'
};

export const LEARN_METHOD_LABELS_DE: Record<string, string> = {
  'level-up': 'Level-Aufstieg',
  egg: 'Ei',
  machine: 'TM/VM',
  tutor: 'Lehrer'
};

export function learnMethodLabel(method: string, language: 'en' | 'de'): string {
  const labels = language === 'de' ? LEARN_METHOD_LABELS_DE : LEARN_METHOD_LABELS_EN;
  return labels[method] ?? method;
}

/** Known methods in display priority order; anything else sorts after these. */
export const LEARN_METHOD_ORDER = ['level-up', 'machine', 'egg', 'tutor'];
