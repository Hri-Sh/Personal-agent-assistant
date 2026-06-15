import './Home.css'

function Home(){
    return(
        <div className="home-container">
        
            <div className="header-row">
                <h1>Good Morning, Hridayesh</h1>
                <button id="QuickAddBtn">+ Quick Add </button>
            </div>
            <div className = 'stats-row'>
                <div id="events"><p>Today's Events</p>
                <h2>0</h2>
                    <label htmlFor=""></label>
                </div>

                <div id="habits">
                    <p>Habits</p>
                    <h2>2/5</h2>
                </div>
                <div id="streak">
                    <p>Streak</p>
                    <h2>12 days</h2>
                </div>
            </div>
            <div className="bottom-row">
                <div id="schedule">
                <p className="section-label">Today's Schedule</p>
                <div className="schedule-item">
                  <span className="time">7:00</span>
                  <div className="event-bar green"><p>Morning Run</p></div>
                </div>
                <div className="schedule-item">
                  <span className="time">9:00</span>
                  <div className="event-bar blue"><p>Lecture — CITS2200</p></div>
                </div>
                <div className="schedule-item">
                  <span className="time">17:00</span>
                  <div className="event-bar red"><p>Gym</p></div>
                </div>
                </div>
                <div id="goals">
                    <p className="section-label">Goals</p>
                    <div className="goal-item">
                      <div className="goal-header">
                        <span>Learn React</span>
                        <span>60%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill green" style={{width: '60%'}}></div>
                      </div>
                    </div>
                    <div className="goal-item">
                      <div className="goal-header">
                        <span>Run 5k</span>
                        <span>35%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill blue" style={{width: '35%'}}></div>
                      </div>
                    </div>
                    <div id="AI-tip">
                        <p className="section-label">AI Tip</p>
                        <p>Free slot at 3pm — good time for your 5k training.</p>
                        </div>
                </div>
            </div>
        </div>
    )   
}

export default Home