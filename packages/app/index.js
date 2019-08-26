import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from 'react-router-dom';

import Page, { Grid, GridColumn } from '@atlaskit/page';
import Navigation, {
  AkNavigationItem,
  AkNavigationTitle,
  presetThemes
} from '@atlaskit/navigation';

function AppPage({ children }) {
  return (
    <Page
      navigation={
        <Navigation containerTheme={presetThemes.global} isOpen>
          <AkNavigationItem href="#/page/stuff" text="Stuff" />
        </Navigation>
      }>
      <Grid layout="fixed">{children}</Grid>
    </Page>
  );
}

function Routes() {
  return (
    <Router>
      <Route
        path="/page/:pageName"
        component={() => (
          <AppPage>
            <div>Page</div>
          </AppPage>
        )}
      />
      <Route component={() => <AppPage>Home</AppPage>} />
    </Router>
  );
}

ReactDOM.render(<Routes />, document.getElementById('react-root'));
