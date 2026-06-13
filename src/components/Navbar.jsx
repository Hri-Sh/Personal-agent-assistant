import { Link, useLocation } from 'react-router-dom'
import { House, CalendarDays, CheckCircle, Target, ListChecks, GitBranch, Activity, Bot } from 'lucide-react'
import './Navbar.css'

const navItems = [
  { to: '/', label: 'Home', icon: House },
  { to: '/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/habits', label: 'Habits', icon: CheckCircle },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/bucketlist', label: 'Bucket List', icon: ListChecks },
  { to: '/skilltree', label: 'Skill Tree', icon: GitBranch },
  { to: '/fitness', label: 'Fitness', icon: Activity },
  { to: '/assistant', label: 'AI Assistant', icon: Bot },
]

function Navbar() {
  const location = useLocation()

  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <h1>L.I.F.E</h1>
        <p>Personal Assistant</p>
      </div>

      <div className="sidebar-links">
        {navItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className={`sidebar-link ${location.pathname === to ? 'active' : ''}`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </Link>
        ))}
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">H</div>
        <div>
          <p>Hridayesh</p>
          <small>Settings</small>
        </div>
      </div>
    </nav>
  )
}

export default Navbar