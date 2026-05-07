// ── Specialty group type ───────────────────────────────────────────────────────
export type SpecialtyGroup = 'I_RK' | 'I_RI' | 'II' | 'III_DT' | 'III_TC' | 'IV'

// ── Subject key → display info ─────────────────────────────────────────────────
const SUBJECT_META: Record<string, { icon: string; title: string }> = {
  azerbaijani:  { icon: '📝', title: 'Azərbaycan dili' },
  math:         { icon: '📐', title: 'Riyaziyyat'      },
  english:      { icon: '🇬🇧', title: 'İngilis dili'   },
  russian:      { icon: '🇷🇺', title: 'Rus dili'       },
  physics:      { icon: '⚡', title: 'Fizika'          },
  chemistry:    { icon: '🧪', title: 'Kimya'           },
  biology:      { icon: '🧬', title: 'Biologiya'       },
  history:      { icon: '🏛️', title: 'Tarix'           },
  geography:    { icon: '🌍', title: 'Coğrafiya'       },
  literature:   { icon: '📚', title: 'Ədəbiyyat'       },
  informatics:  { icon: '💻', title: 'İnformatika'     },
}

// ── Qəbul imtahanı subjects per specialty group ────────────────────────────────
// For groups III_DT and III_TC the language depends on foreignLang
export function getQebulSubjectKeys(group: SpecialtyGroup, foreignLang: string): string[] {
  const lang = foreignLang === 'russian' ? 'russian' : 'azerbaijani'
  const map: Record<SpecialtyGroup, string[]> = {
    I_RK:   ['math', 'physics', 'chemistry'],
    I_RI:   ['math', 'physics', 'informatics'],
    II:     ['math', 'geography', 'history'],
    III_DT: [lang, 'history', 'literature'],
    III_TC: [lang, 'history', 'geography'],
    IV:     ['biology', 'chemistry', 'physics'],
  }
  return map[group] ?? []
}

// ── All active subject keys for a student ─────────────────────────────────────
export function getActiveSubjectKeys(foreignLang: string, specialtyGroup: SpecialtyGroup | ''): string[] {
  const foreignKey = foreignLang === 'russian' ? 'russian' : 'english'
  const buraxilis  = ['azerbaijani', 'math', foreignKey]
  const qebul      = specialtyGroup ? getQebulSubjectKeys(specialtyGroup, foreignLang) : []
  return [...new Set([...buraxilis, ...qebul])]
}

// ── Build dynamic EXAM_DATA for a student ─────────────────────────────────────
export function getExamData(foreignLang = 'english', specialtyGroup: SpecialtyGroup | '' = '') {
  const foreignKey = foreignLang === 'russian' ? 'russian' : 'english'

  const buraxilisKeys = ['azerbaijani', 'math', foreignKey]
  const qebulKeys     = specialtyGroup ? getQebulSubjectKeys(specialtyGroup, foreignLang) : []

  const toSubj = (key: string) => {
    const m = SUBJECT_META[key]
    return m ? { key, icon: m.icon, title: m.title } : null
  }

  return [
    {
      id:       'buraxilis',
      title:    'Buraxılış İmtahanı',
      icon:     '🎓',
      color:    '#4F87FF',
      subjects: buraxilisKeys.map(toSubj).filter(Boolean),
    },
    {
      id:       'qebul',
      title:    'Qəbul İmtahanı',
      icon:     '🎯',
      color:    '#6C63FF',
      subjects: qebulKeys.length ? qebulKeys.map(toSubj).filter(Boolean) : [],
    },
  ]
}

// Static fallback (no profile) – shows both foreign lang options
export const EXAM_DATA = getExamData('english', '')
