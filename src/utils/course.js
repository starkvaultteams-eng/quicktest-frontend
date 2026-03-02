export const COURSE_DISPLAY_MAP = {
  'Information Literacy': 'Use of Library',
};

export function formatCourseLabel(course, title) {
  if (!course) return '';
  // use explicit title if given, otherwise fall back to map or code
  let base = title || COURSE_DISPLAY_MAP[course] || course;
  // if we had a separate title (e.g. key was "Mathematics" but course is "Math"),
  // show both for clarity
  if (title && title !== course) {
    base = `${title} (${course})`;
  }
  // mark 100-level courses as Year 1
  try {
    if (/^100/.test(String(course))) {
      return `${base} (100L — Year 1)`;
    }
  } catch (e) {
    // ignore
  }
  return base;
}
