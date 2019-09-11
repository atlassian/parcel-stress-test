import React from 'react';
import ReactDOM from 'react-dom';
import { Editor as Editor1 } from 'editor-1';
// import { Editor as Editor2 } from 'editor-2';
// import { Editor as Editor3 } from 'editor-3';
// import { Editor as Editor4 } from 'editor-4';
// import { Editor as Editor5 } from 'editor-5';
import '@atlaskit/css-reset/dist/bundle.css';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

class AppContainer extends React.Component {
  render() {
    return (<Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/editor-1">Editor 1</Link>
            </li>
            <li>
              <Link to="/editor-2">Editor 2</Link>
            </li>
            <li>
              <Link to="/editor-3">Editor 3</Link>
            </li>
          </ul>
        </nav>

        <Route path="/editor-1" render={() => <Editor1 placeholder="editor" appearance="comment"/>} />
        {/* <Route path="/editor-2" render={() => <Editor2 placeholder="editor" appearance="comment"/>} /> */}
        {/* <Route path="/editor-3" render={() => <Editor3 placeholder="editor" appearance="comment"/>} /> */}
        {/* <Route path="/editor-4" render={() => <Editor4 placeholder="editor" appearance="comment"/>} /> */}
        {/* <Route path="/editor-5" render={() => <Editor5 placeholder="editor" appearance="comment"/>} /> */}
      </div>
    </Router>);
  }
}

ReactDOM.render(
  <AppContainer />,
  document.getElementById('react-root')
);
