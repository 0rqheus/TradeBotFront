import { Routes, Route } from 'react-router-dom';
import Accounts from './views/Accounts';
import Login from './views/Login';
import { AuthProvider, RequireAdmin, RequireAuth } from './AuthProvider';
import WorkerBlackBox from './views/WorkerBlackBox';
import SbcStatistics from './views/SbcStatistics';

const App = () => {
  return (
    <AuthProvider>
      <div className="App" >
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Accounts />
              </RequireAuth>
            }
          />
          <Route
            path="/wbb"
            element={
              <RequireAdmin>
                <WorkerBlackBox />
              </RequireAdmin>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;