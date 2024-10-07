import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from './views/Table';
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
                <Table />
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