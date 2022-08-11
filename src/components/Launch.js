import React from 'react';
import FHIR from 'fhirclient';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import LaunchError from './LaunchError';
import {queryPatientIdKey} from '../util/util.js';
import '../style/App.scss';

export default function Launch() {

    const [error, setError] = React.useState('');

    React.useEffect(() => {
        let authURL = 'launch-context.json';
        if (process.env.REACT_APP_BACKEND_URL) {
            authURL = `${process.env.REACT_APP_BACKEND_URL}/auth/auth-info`;
        }
        const urlParams = new URLSearchParams(window.location.search);
        //retrieve patient id from URL querystring if any
        let patientId = urlParams.get('patient');
        console.log("patient id from url query string: ", patientId);
        console.log("authURL: ", authURL);

        fetch(authURL, {
            // include cookies in request
            credentials: 'include'
        })
            .then(result => {
                if (!result.ok) {
                    throw new Error(result.status.toString());
                }
                return result.json();
            })
            .catch(e => setError(e))
            .then(json => {
                if (patientId) {
                    //only do this IF patient id comes from url queryString
                    json.patientId = patientId;
                    sessionStorage.setItem(queryPatientIdKey, patientId);
                }
                //allow auth scopes to be updated via environment variable
                //see https://build.fhir.org/ig/HL7/smart-app-launch/scopes-and-launch-context.html
                const envAuthScopes = process.env.REACT_APP_AUTH_SCOPES;
                if (envAuthScopes) json.scope = envAuthScopes;

                console.log("launch context json ", json);
                FHIR.oauth2.authorize(json).catch((e) => {
                    setError(e);
                });

            })
            .catch(e => {
                setError(e);
                console.log('launch error ', e);
            });
    }, []);

    return (
        <React.Fragment>
            {error && <LaunchError message={error.message}></LaunchError>}
            {!error && <Box style={{ padding: "1rem" }}>
                <CircularProgress></CircularProgress>
                <span>Launching ...</span>
            </Box>}
        </React.Fragment>
    );
}

