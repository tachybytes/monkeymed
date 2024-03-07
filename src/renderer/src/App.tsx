import { HashRouter as Router, Route, Routes } from 'react-router-dom'
import Home from './screens/Home'
import Create from './screens/Create'

const App = (): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </Router>
  )
}

export default App
