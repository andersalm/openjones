import { MockGame } from '@shared/mocks';

function App() {
  const game = new MockGame();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>OpenJones - Browser Edition</h1>
      <p>Phase 0 Setup Complete! 🚀</p>

      <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '5px' }}>
        <h2>Mock Game Test</h2>
        <p>Game ID: {game.id}</p>
        <p>Current Week: {game.currentWeek}</p>
        <p>Time Remaining: {game.timeUnitsRemaining} units</p>
        <p>Players: {game.players.length}</p>
        <p>Buildings: {game.map.getAllBuildings().length}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e8f5e9', borderRadius: '5px' }}>
        <h3>✅ What's Working</h3>
        <ul>
          <li>React + TypeScript + Vite configured</li>
          <li>TypeScript contracts defined</li>
          <li>Mock implementations available</li>
          <li>Path aliases working (@shared, @engine, etc.)</li>
          <li>Development server running</li>
        </ul>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#fff3e0', borderRadius: '5px' }}>
        <h3>📋 Next Steps</h3>
        <ol>
          <li>Read <code>docs/WORKER_SETUP.md</code> to get started</li>
          <li>Choose your track (A, B, C, D, or E)</li>
          <li>Create your feature branch</li>
          <li>Start implementing!</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
