import { Component} from "react";
import FhirClientProvider from "../FhirClientProvider";
import Summary from "./Summary";
import "../style/App.scss";
import { fetchEnvData, getEnvs} from "../util/util.js";

class App extends Component {
  componentWillMount() {
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

