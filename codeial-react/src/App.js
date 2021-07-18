import logo from './logo.svg';
import './App.css';
import PostsList from './components/PostsList';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <PostsList></PostsList>
      </header>
    </div>
  );
}

export default App;
