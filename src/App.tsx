import React, { Component } from 'react';
import { Routes, Route } from 'react-router-dom';
import Table from './views/Table';

export default class App extends Component {
  render() {
    return (
      <div className="App">
        <Routes>
          <Route path="/" element={<Table />} />
          {/* <Route
            path="/main"
            element={
              <IsLoggedIn>
                <Main />
              </IsLoggedIn>
            }
          /> */}
        </Routes>
      </div>
    );
  }
}
