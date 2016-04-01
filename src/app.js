import React from "react";
import {Provider} from "react-redux";
import {ReduxRouter} from "redux-router";
import {Route, IndexRoute} from "react-router";
import {configure, authStateReducer} from "redux-auth";
import {createStore, compose, applyMiddleware} from "redux";
import {createHistory} from "history";
import {routerStateReducer, reduxReactRouter as clientRouter} from "redux-router";
import {combineReducers} from "redux";
import thunk from "redux-thunk";

import demoButtons from "./reducers/request-test-buttons";
import demoUi from "./reducers/demo-ui";
import Container from "./views/partials/Container";
import Main from "./views/Main";
import Account from "./views/Account";
import SignIn from "./views/SignIn";
import GlobalComponents from "./views/partials/GlobalComponents";

class App extends React.Component {
  render() {
    return (
      <Container>
        <GlobalComponents /> {/*this adds the modals.  Tis optional*/}
        {this.props.children}
      </Container>
    );
  }
}

export function initialize() {
  var reducer = combineReducers({
    auth:   authStateReducer,
    router: routerStateReducer,
    demoButtons,
    demoUi
  });

  var store;

  // access control method, used above in the "account" route
  var requireAuth = (nextState, transition, cb) => {
    // the setTimeout is necessary because of this bug:
    // https://github.com/rackt/redux-router/pull/62
    // this will result in a bunch of warnings, but it doesn't seem to be a serious problem
    setTimeout(() => {
      if (!store.getState().auth.getIn(["user", "isSignedIn"])) {
        transition(null, "/login");
      }
      cb();
    }, 0);
  };

  // define app routes
  var routes = (
    <Route path="/" component={App}>
      <IndexRoute component={Main} />
      <Route path="login" component={SignIn} />
      <Route path="account" component={Account} onEnter={requireAuth} />
    </Route>
  );

  // these methods will differ from server to client
  var reduxReactRouter    = clientRouter;
  var createHistoryMethod = createHistory;

  // create the redux store
  store = compose(
    applyMiddleware(thunk),
    reduxReactRouter({
      createHistory: createHistoryMethod,
      routes
    })
  )(createStore)(reducer);


  /**
   * The React Router 1.0 routes for both the server and the client.
   */
  return store.dispatch(configure([
    {
      default: {
        apiUrl: __API_URL__,
        signOutPath:           "/profile/sign_out",
        emailSignInPath:       "/profile/sign_in",
        emailRegistrationPath: "/profile/sign_up",
        passwordResetPath:     "/profile/password",
        passwordUpdatePath:    "/profile/password",
        tokenValidationPath:   "/profile/validate_token"
      }
    }, {
      evilUser: {
        apiUrl:                __API_URL__,
        signOutPath:           "/profile/sign_out",
        emailSignInPath:       "/profile/sign_in",
        emailRegistrationPath: "/profile/sign_up",
        passwordResetPath:     "/profile/password",
        passwordUpdatePath:    "/profile/password",
        tokenValidationPath:   "/profile/validate_token",
        authProviderPaths: {
          github:    "/mangs/github",
          facebook:  "/mangs/facebook",
          google:    "/mangs/google_oauth2"
        }
      }
    }
  ])).then(() => {
    return (
      <Provider store={store} key="provider">
        <ReduxRouter children={routes} />
      </Provider>
    );
  });
}
