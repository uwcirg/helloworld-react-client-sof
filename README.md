# Hello World SoF App in React

This application was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).
To learn React, check out the [React documentation](https://reactjs.org/).
The app can be launched via the [SMART<sup>&reg;</sup> app launch framework](http://hl7.org/fhir/smart-app-launch/index.html).


## Other Underlying Technologies

### React Material UI
[Material UI](https://mui.com/) is a library of React UI components that implements Google's Material Design.

## Usage
A number of options are available for local usage to support testing with synthetic data.

### Setup
This project manages dependencies using the [NPM package manager](https://www.npmjs.com/) in the [Node environment](https://nodejs.dev/) (Node version <= 16 is recommended for this application). Make sure to have both NPM and Node installed before proceeding. The dependencies for the application can be installed locally by typing `npm install` at the command line. A local version of the app can be launched by typing `npm start` at the command line and the page will reload when you make changes. A copy suitable for distribution can be built using the `npm run build` command (see the `build` folder).

### Docker
To start services via docker, first copy the default configuration files and modify as necessary:

    # docker-compose service/project configuration
    cp .env.default .env

    # React App configuration
    cp frontend.env.default frontend.env

To start all services, run the below command:

    docker-compose up

### Configuration
Parameters for the app are stored in [environmental variables](http://man7.org/linux/man-pages/man7/environ.7.html) that are stored in an `.env` file (run `cp default.env .env` at command line to create the .env file) and it allows the environment variables thus specified to be read by the application at build time. The [dotenv package](https://www.npmjs.com/package/dotenv) is used to store the default variable values, which can be overwritten by defining a more specific env (e.g., `.env.local`) file or by setting the variables in the deployment system. For more information, see the [React documentation](https://create-react-app.dev/docs/adding-custom-environment-variables/).

#### Parameters
| Parameter | Description | Allowed Values |
| --- | --- | --- |
| `REACT_APP_FHIR_RESOURCES` | Define the FHIR resource(s) to load for the patient | `Condition,Procedure,Observation,Questionnaire,QuestionnaireResponse` |
| `REACT_APP_FHIR_OBSERVATION_CATEGORIES` | Define what categor(ies) of FHIR observations to load for the patient | `social-history,vital-signs,imaging,laboratory,procedure,survey,exam,therapy,activity` |
| `REACT_APP_AUTH_SCOPES` | For allowing the app to specify the delegation of a specific set of access rights via launch context. see [App Launch: Scopes and Launch Context](https://build.fhir.org/ig/HL7/smart-app-launch/scopes-and-launch-context.html) | `profile roles email patient/*.read openid fhirUser patient/QuestionnaireResponse.write` |
| `REACT_APP_DASHBOARD_URL` | Define the (f)EMR URL to which the app can return to | example: https://dashboard.acc.dev.cosri.cirg.washington.edu

### Using with Public SMART Sandbox
A public [SMART<sup>&reg;</sup> App Launcher](https://launch.smarthealthit.org/index.html) is available for sandbox tesing of SMART on FHIR apps with synthetic data.

### Launch for SMART App Launcher

#### Launching from a local instance
1. Make sure Node and NPM package manager have been installed
2. Run `npm install` to install all dependencies (this step can be skipped subsequently unless dependencies have changed)
3. Run `npm start` to install dependencies
4. Navigate to the public SMART<sup>&reg;</sup> App Launcher and choose the "Provider EHR Launch" Launch Type. **Uncheck** "Simulate launch within the EHR user interface".  Leave all other options unselected. Paste the launch URL, e.g. `http://localhost:3000/launch.html` into the "App Launch URL" box at the bottom of the SMART<sup>&reg;</sup> App Launcher page. Select "Launch App!" which will bring up a patient selector widget before the app is launched.
