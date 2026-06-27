import './TeacherCard.css'

/**
 * TeacherCard
 * Reusable, props-driven summary card used across the Teacher Dashboard.
 *
 * Props:
 * @param {string} title        - Card heading (e.g. "Total Classes")
 * @param {number|string} count - Primary metric value
 * @param {string} description  - Short supporting description
 * @param {string} accent       - One of: 'navy' | 'amber' | 'success' | 'danger' (controls the left status rail + icon tint)
 * @param {string} icon         - Single character / short glyph rendered in the icon badge
 */
function TeacherCard({ title, count, description, accent = 'navy', icon = '•' }) {
  return (
    <div className={`teacher-card teacher-card--${accent}`}>
      <div className="teacher-card__rail" aria-hidden="true" />
      <div className="teacher-card__body">
        <div className="teacher-card__top">
          <span className="teacher-card__title">{title}</span>
          <span className="teacher-card__icon" aria-hidden="true">{icon}</span>
        </div>
        <div className="teacher-card__count tabular-num">{count}</div>
        <p className="teacher-card__description">{description}</p>
      </div>
    </div>
  )
}

export default TeacherCard
