import { Routes, Route } from 'react-router-dom';
import Accounts from './views/Accounts';
import Login from './views/Login';
import { AuthProvider, RequireAdmin, RequireAuth, RequireSbcOperator } from './AuthProvider';
import WorkerBlackBox from './views/WorkerBlackBox';
import SbcStatistics from './views/SbcStatistics';
import CreateUser from './views/CreateUser';

const App = () => {
  return (
    <AuthProvider>
      <div className='App' >
        <Routes>
          <Route
            path='/'
            element={
              <RequireAuth>
                <Accounts />
              </RequireAuth>
            }
          />
          <Route
            path='/sbc_stats'
            element={
              <RequireSbcOperator>
                <SbcStatistics />
              </RequireSbcOperator>
            }
          />
          <Route
            path='/wbb'
            element={
              <RequireAdmin>
                <WorkerBlackBox />
              </RequireAdmin>
            }
          />
          <Route path='/login' element={<Login />} />
          <Route
            path='/create_user'
            element={
              <RequireAdmin>
                <CreateUser />
              </RequireAdmin>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;