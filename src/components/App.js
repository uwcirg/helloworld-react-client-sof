import {Component} from "react";
import FhirClientProvider from "../FhirClientProvider";
import Summary from "./Summary";
import "../style/App.scss";
import {fetchEnvData, getEnvs} from "../util/util.js";

class App extends Component {
  componentWillMount() {
    // calling function to get environment variables here to make sure they are accessible before component is rendered
    fetchEnvData();
    console.log("environment variables ", getEnvs());
  }
  render() {
    return (
      <FhirClientProvider>
        {<Summary></Summary>}
        {/* add other components as needed */}
      </FhirClientProvider>
    );
  }
}
export default App;
