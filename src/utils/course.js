export const COURSE_CODE_MAP = {
  Math: 'MTH 101',
  'Computer Science': 'CST 101',
  'CST 101': 'CST 101',
  'CST 101 (Health Sciences)': 'CST 101 (Health Sciences)',
  'CHM 101': 'CHM 101',
  'CHM 107': 'CHM 107',
  'Information Literacy': 'GST 121',
  'PUA-GST 121 Information Literacy': 'GST 121',
};

function toTitleCaseWords(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase())
    .trim();
}

export function formatCourseLabel(course) {
  if (!course) return '';
  return COURSE_CODE_MAP[course] || course;
}

export function formatCourseFullLabel(course, title) {
  if (!course) return '';

  const code = formatCourseLabel(course);

  let description = '';
  if (title) {
    description = toTitleCaseWords(title)
      .replace(/^Chm 101 /, '')
      .replace(/^Chm 107 /, '')
      .replace(/^Gst 121 /, '')
      .trim();
  } else if (course === 'Information Literacy') {
    description = 'Information Literacy';
  }

  const base = description ? `${code} ${description}` : code;
  return `${base} (100L)`;
}
