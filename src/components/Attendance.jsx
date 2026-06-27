import { useState, useMemo } from 'react'
import './Attendance.css'

/**
 * Attendance
 * Displays today's attendance for a teacher's classes.
 * Self-contained: owns its sample data, search, and pagination state.
 * No backend, no API calls, no localStorage — React state only.
 */

const ATTENDANCE_SEED = [
  { rollNo: 'R101', name: 'Aarav Sharma', className: '10-A', status: 'Present' },
  { rollNo: 'R102', name: 'Diya Mehta', className: '10-A', status: 'Absent' },
  { rollNo: 'R103', name: 'Kabir Nair', className: '10-A', status: 'Late' },
  { rollNo: 'R104', name: 'Ishita Rao', className: '10-A', status: 'Present' },
  { rollNo: 'R105', name: 'Vihaan Gupta', className: '10-B', status: 'Present' },
  { rollNo: 'R106', name: 'Anaya Joshi', className: '10-B', status: 'Absent' },
  { rollNo: 'R107', name: 'Reyansh Iyer', className: '10-B', status: 'Present' },
  { rollNo: 'R108', name: 'Myra Pillai', className: '10-B', status: 'Late' },
  { rollNo: 'R109', name: 'Arjun Verma', className: '11-A', status: 'Present' },
  { rollNo: 'R110', name: 'Saanvi Reddy', className: '11-A', status: 'Present' },
  { rollNo: 'R111', name: 'Vivaan Kapoor', className: '11-A', status: 'Absent' },
  { rollNo: 'R112', name: 'Kiara Desai', className: '11-A', status: 'Present' },
  { rollNo: 'R113', name: 'Aditya Singh', className: '12-B', status: 'Late' },
  { rollNo: 'R114', name: 'Riya Choudhary', className: '12-B', status: 'Present' },
  { rollNo: 'R115', name: 'Shaurya Bhat', className: '12-B', status: 'Present' },
  { rollNo: 'R116', name: 'Tara Menon', className: '12-B', status: 'Absent' },
  { rollNo: 'R117', name: 'Yash Malhotra', className: '10-A', status: 'Present' },
  { rollNo: 'R118', name: 'Navya Bose', className: '10-B', status: 'Present' },
  { rollNo: 'R119', name: 'Krishna Pandey', className: '11-A', status: 'Late' },
  { rollNo: 'R120', name: 'Aisha Khan', className: '12-B', status: 'Present' },
  { rollNo: 'R121', name: 'Rohan Saxena', className: '10-A', status: 'Absent' },
  { rollNo: 'R122', name: 'Sara Thomas', className: '10-B', status: 'Present' },
  { rollNo: 'R123', name: 'Dhruv Kulkarni', className: '11-A', status: 'Present' },
  { rollNo: 'R124', name: 'Avni Chatterjee', className: '12-B', status: 'Late' },
  { rollNo: 'R125', name: 'Ayaan Bakshi', className: '10-A', status: 'Present' },
]

const ROWS_PER_PAGE = 5

const STATUS_STYLE = {
  Present: 'status-pill--present',
  Absent: 'status-pill--absent',
  Late: 'status-pill--late',
}

function Attendance() {
  const [searchTerm, setSearchTerm] = useState('')
  const [classFilter, setClassFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)

  const classOptions = useMemo(() => {
    const unique = Array.from(new Set(ATTENDANCE_SEED.map((row) => row.className)))
    return ['All', ...unique.sort()]
  }, [])

  // Filter by search term (name or roll no) and class — resets page implicitly via derived list
  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return ATTENDANCE_SEED.filter((row) => {
      const matchesClass = classFilter === 'All' || row.className === classFilter
      const matchesTerm =
        term === '' ||
        row.name.toLowerCase().includes(term) ||
        row.rollNo.toLowerCase().includes(term)
      return matchesClass && matchesTerm
    })
  }, [searchTerm, classFilter])

  const totalRecords = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / ROWS_PER_PAGE))
  const safePage = Math.min(currentPage, totalPages)

  const paginatedRows = useMemo(() => {
    const start = (safePage - 1) * ROWS_PER_PAGE
    return filteredRows.slice(start, start + ROWS_PER_PAGE)
  }, [filteredRows, safePage])

  const rangeStart = totalRecords === 0 ? 0 : (safePage - 1) * ROWS_PER_PAGE + 1
  const rangeEnd = Math.min(safePage * ROWS_PER_PAGE, totalRecords)

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
    setCurrentPage(1)
  }

  function handleClassFilterChange(event) {
    setClassFilter(event.target.value)
    setCurrentPage(1)
  }

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(1, page), totalPages))
  }

  return (
    <section className="attendance-panel">
      <div className="panel-heading">
        <h3>Today's Attendance</h3>
        <span className="panel-heading__meta">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
      </div>

      <div className="attendance-toolbar">
        <div className="search-field">
          <span className="search-field__icon" aria-hidden="true">⌕</span>
          <input
            type="text"
            placeholder="Search by student name or roll number..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search attendance by name or roll number"
          />
        </div>
        <select
          className="class-filter"
          value={classFilter}
          onChange={handleClassFilterChange}
          aria-label="Filter attendance by class"
        >
          {classOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All' ? 'All Classes' : `Class ${option}`}
            </option>
          ))}
        </select>
      </div>

      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="empty-row">No matching attendance records.</td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr key={row.rollNo}>
                  <td className="tabular-num">{row.rollNo}</td>
                  <td>{row.name}</td>
                  <td>{row.className}</td>
                  <td>
                    <span className={`status-pill ${STATUS_STYLE[row.status]}`}>{row.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationBar
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        totalRecords={totalRecords}
        currentPage={safePage}
        totalPages={totalPages}
        onGoToPage={goToPage}
      />
    </section>
  )
}

/**
 * PaginationBar
 * Small local presentational component for pagination controls.
 * Kept in this file since it is only ever used by Attendance/Marks-style tables
 * and is not part of the required deliverable file list.
 */
function PaginationBar({ rangeStart, rangeEnd, totalRecords, currentPage, totalPages, onGoToPage }) {
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  return (
    <div className="pagination-bar">
      <span className="pagination-bar__summary">
        Showing <strong>{rangeStart}–{rangeEnd}</strong> of <strong>{totalRecords}</strong> Records
      </span>
      <div className="pagination-bar__controls">
        <button
          type="button"
          className="pagination-btn"
          onClick={() => onGoToPage(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>

        <div className="pagination-bar__pages">
          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              className={`pagination-page ${page === currentPage ? 'pagination-page--active' : ''}`}
              onClick={() => onGoToPage(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="pagination-btn"
          onClick={() => onGoToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Attendance
