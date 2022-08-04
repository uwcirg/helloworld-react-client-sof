import React from 'react';
import FHIR from 'fhirclient';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Error from './Error';
import { fetchEnvData, queryPatientIdKey } from "../util/util.js";
import '../style/App.scss';

export default function Launch() {

    const [error, setError] = React.useState('');

    React.useEffect(() => fetchEnvData(), []);

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
                throw Error(result.status);
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
            {error && <Error message={error.message}></Error>}
            {!error && <Box style={{ padding: "1rem" }}>
                <CircularProgress></CircularProgress>
                <span>Launching ...</span>
            </Box>}
        </React.Fragment>
    );
}

