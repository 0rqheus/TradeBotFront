import { Routes, Route } from 'react-router-dom';
import AccountsTable from './views/AccountsTable';
import Auth from './views/Auth';
import { AuthProvider, RequireAdmin, RequireAuth } from './AuthProvider';
import WorkerBlackBoxTable from './views/WorkerBlackBoxTable';

const App = () => {
  return (
    <AuthProvider>
      <div className="App" >
        <Routes>
          <Route
            path="/"
            element={
              <RequireAuth>
                <AccountsTable />
              </RequireAuth>
            }
          />
          <Route
            path="/wbb"
            element={
              <RequireAdmin>
                <WorkerBlackBoxTable />
              </RequireAdmin>
            }
          />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;