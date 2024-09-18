import { Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Table from './views/Table';
import Auth from './views/Auth';

const App = () => {
  return (
    < Table />
    // <div className="App" >
    //   <Routes>
    //     <Route path="/main" element={< Table />} />
    //     < Route path="/" element={< Auth />} />
    //   </Routes>
    // </div>
  );
}

export default App;