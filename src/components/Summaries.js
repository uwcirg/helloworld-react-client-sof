import {
  createRef,
  forwardRef,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import Alert from "@mui/material/Alert";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { FhirClientContext } from "../FhirClientContext";
import {
  getFHIRResourcePaths,
  getQuestionnaireList,
  isInViewport,
  QUESTIONNAIRE_ANCHOR_ID_PREFIX,
} from "../util/util";
import QuestionnaireSelector from "./QuestionnaireSelector";
import Summary from "./Summary";
let scrollIntervalId = 0;
let scrollToTimeoutId = 0;

export default function Summaries() {
  const { client, patient } = useContext(FhirClientContext);
  const fabRef = createRef();
  const anchorRef = createRef();
  const selectorRef = createRef();
  const questionnaireList = getQuestionnaireList();
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState("");
  const [patientBundle, setPatientBundle] = useState({
    resourceType: "Bundle",
    id: "resource-bundle",
    type: "collection",
    entry: [],
  });
  const [updated, setUpdated] = useState(0);
  const [error, setError] = useState(null);

  const BoxRef = forwardRef((props, ref) => (
    <Box {...props} ref={ref}>
      {props.children}
    </Box>
  ));
  const FabRef = forwardRef((props, ref) => (
    <Fab ref={ref} {...props}>
      {props.children}
    </Fab>
  ));
  const handleFab = useCallback(() => {
    const selectorElement = selectorRef.current;
    const fabElement = fabRef.current;
    if (!fabElement || !selectorElement) return;
    clearInterval(scrollIntervalId);
    scrollIntervalId = setInterval(() => {
      if (isInViewport(selectorElement)) {
        fabElement.classList.remove("flex");
        fabElement.classList.add("hide");
        return;
      }
      fabElement.classList.add("flex");
      fabElement.classList.remove("hide");
    }, 150);
  }, [fabRef, selectorRef]);

  const handleCallback = (obj) => {
    if (isReady()) return;
    if (obj && obj.status === "error") setError(true);
    if (obj && obj.status === "ok") {
      setUpdated((prev) => prev + 1);
    }
  };
  const isReady = () => updated === questionnaireList.length || error;

  const getFhirResources = useCallback(async () => {
    if (!client || !patient || !patient.id)
      throw new Error("Client or patient missing.");
    const resources = getFHIRResourcePaths(patient.id);
    const requests = resources.map((resource) => client.request(resource));
    let bundle = [];
    bundle.push({ resource: patient });
    return Promise.allSettled(requests).then((results) => {
      results.forEach((item) => {
        if (item.status === "rejected") {
          console.log("Fhir resource retrieval error ", item.reason);
          return true;
        }
        const result = item.value;
        if (result.resourceType === "Bundle" && result.entry) {
          result.entry.forEach((o) => {
            if (o && o.resource) bundle.push({ resource: o.resource });
          });
        } else if (Array.isArray(result)) {
          result.forEach((o) => {
            if (o.resourceType) bundle.push({ resource: o });
          });
        } else {
          bundle.push({ resource: result });
        }
      });
      return bundle;
    }, e => {
      throw new Error(e);
    });
  }, [client, patient]);

  const hasQuestionnaireResponses = () => {
     return patientBundle.entry && patientBundle.entry.filter(
       (item) =>
         item.resource &&
         String(item.resource.resourceType).toLowerCase() === "questionnaireresponse"
     ).length > 0;
  };

  useEffect(() => {
    /* get FHIR resources */
    getFhirResources().then(
      (dataResult) => {
        console.log("data ", dataResult)
        setPatientBundle((prevPatientBundle) => {
          return {
            ...prevPatientBundle,
            entry: [...prevPatientBundle.entry, ...dataResult],
          };
        });
      },
      (e) => setError(e.message?e.message:e)
    );
  }, [getFhirResources]);

  useEffect(() => {
    window.addEventListener("scroll", handleFab);
    return () => {
      clearInterval(scrollIntervalId);
      window.removeEventListener("scroll", handleFab, false);
    };
  }, [handleFab]);

  return (
    <>
      {isReady() && (
        <BoxRef
          ref={anchorRef}
          sx={{
            position: "relative",
            top: "-64px",
            height: "2px",
            width: "2px",
          }}
        ></BoxRef>
      )}
      {isReady() && (
        <FabRef
          className={"hide"}
          ref={fabRef}
          color="primary"
          aria-label="add"
          size="small"
          sx={{ position: "fixed", bottom: "24px", right: "24px" }}
          onClick={(e) => {
            e.stopPropagation();
            if (!anchorRef.current) return;
            anchorRef.current.scrollIntoView();
            setSelectedQuestionnaire("");
          }}
          title="Back to Top"
        >
          <ArrowUpwardIcon aria-label="Back to Top" />
        </FabRef>
      )}
      {isReady() && !hasQuestionnaireResponses() && (
        <Stack className="summaries">
          <Alert severity="warning">No recorded response</Alert>
        </Stack>
      )}
      {hasQuestionnaireResponses() && (
        <Stack className="summaries">
          <BoxRef ref={selectorRef} style={{ opacity: isReady() ? 1 : 0.4 }}>
            <QuestionnaireSelector
              title="Go to Questionnaire"
              list={questionnaireList}
              value={selectedQuestionnaire}
              handleSelectorChange={(event) => {
                setSelectedQuestionnaire(event.target.value);
                clearTimeout(scrollToTimeoutId);
                scrollToTimeoutId = setTimeout(
                  () =>
                    document
                      .querySelector(
                        `#${QUESTIONNAIRE_ANCHOR_ID_PREFIX}_${event.target.value}`
                      )
                      .scrollIntoView(),
                  50
                );
              }}
            ></QuestionnaireSelector>
          </BoxRef>
          {questionnaireList.map((questionnaire, index) => {
            return (
              <Summary
                questionnaire={questionnaire}
                patientBundle={patientBundle}
                key={`questionnaire_${index}`}
                callbackFunc={handleCallback}
                sectionAnchorPrefix={QUESTIONNAIRE_ANCHOR_ID_PREFIX}
              ></Summary>
            );
          })}
        </Stack>
      )}
    </>
  );
}
