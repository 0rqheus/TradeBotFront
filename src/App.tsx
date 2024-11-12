import { Routes, Route } from 'react-router-dom';
// import 'bootstrap/dist/css/bootstrap.min.css';
import AccountsTable from './views/AccountsTable';
import Auth from './views/Auth';
import { AuthProvider, RequireAuth } from './AuthProvider';

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
          <Route path="/login" element={<Auth />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;