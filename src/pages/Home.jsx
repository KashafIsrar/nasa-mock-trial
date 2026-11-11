import { Link } from 'react-router-dom'

function Home() {
  return (
    <main>
      <h1>NASA Mock Trial</h1>
      <p>Home page placeholder.</p>
      <Link to="/game">Start Game</Link>
    </main>
  )
}

export default Home
