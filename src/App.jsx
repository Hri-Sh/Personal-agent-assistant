
import './App.css'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Timetable from './pages/Timetable'
import Home from './pages/Home'
import Habits from './pages/Habits'
import Goals from './pages/Goals'
import BucketList from './pages/BucketList'
import SkillTree from './pages/SkillTree'
import Fitness from './pages/Fitness'
import Assistant from './pages/Assistant'



function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/bucketlist" element={<BucketList />} />
            <Route path="/skilltree" element={<SkillTree />} />
            <Route path="/fitness" element={<Fitness />} />
            <Route path="/assistant" element={<Assistant />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
