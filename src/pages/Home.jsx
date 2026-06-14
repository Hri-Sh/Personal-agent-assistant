import './Home.css'

function Home(){
    return(
        <div className="Home-container">
        
            <div className="header-row">
                <h1>Good Morning, Hridayesh</h1>
                <button id="QuickAddBtn">+ Quick Add </button>
            </div>
        <div className = 'stats-row'>
            <div id="events">Events</div>
            <div id="habits">Habits</div>
            <div id="streak">Streak</div>
        </div>
        <div className="bottom-row">
            <div id="schedule">#Schedule</div>
            <div id="goals">#Goals
            <div id="AI-tip">
                <p>#AI-tip</p>
            </div>
            </div>
        </div>
        </div>
    )
}

export default Home