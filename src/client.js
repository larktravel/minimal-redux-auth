import React from "react";
import ReactDOM from "react-dom";
import { initialize } from "./app";


/**
 * Fire-up React Router.
 */
const reactRoot = window.document.getElementById("react-root");
initialize().then((provider) => {
  ReactDOM.render(provider, reactRoot);
});
