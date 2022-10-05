import {
  createRef,
  forwardRef,
  useContext,
  useEffect,
  useCallback,
  useState,
} from "react";
import { useQuery } from "react-query";
import Alert from "@mui/material/Alert";
import Fab from "@mui/material/Fab";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { FhirClientContext } from "../context/FhirClientContext";
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
  const [questionnaireList, setQuestionnaireList] = useState(
    getQuestionnaireList()
  );
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState("");
  const [patientBundle, setPatientBundle] = useState({
    resourceType: "Bundle",
    id: "resource-bundle",
    type: "collection",
    entry: [],
    loadComplete: false,
  });
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
  };
  const isReady = useCallback(() => patientBundle.loadComplete || error, [patientBundle.loadComplete, error]);

  const getFhirResources = async () => {
    if (!client || !patient || !patient.id)
      throw new Error("Client or patient missing.");
    const resources = getFHIRResourcePaths(patient.id);
    const requests = resources.map((resource) => client.request(resource));
    if (!requests) {
      console.log("No FHIR resource(s) specified.");
      return [];
    }
    let bundle = [];
    bundle.push({ resource: patient });
    return Promise.allSettled(requests).then(
      (results) => {
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
      },
      (e) => {
        throw new Error(e);
      }
    );
  };

  const hasQuestionnaireResponses = () => {
    return (
      patientBundle.entry &&
      patientBundle.entry.filter(
        (item) =>
          item.resource &&
          String(item.resource.resourceType).toLowerCase() ===
            "questionnaireresponse"
      ).length > 0
    );
  };

  const getQuestionnairesByCarePlan = (carePlans) => {
    if (!carePlans) return [];
    let activities = [];
    carePlans.forEach((item) => {
      if (item.resource.activity) {
        activities = [...activities, ...item.resource.activity];
      }
    });
    let qList = [];
    activities.forEach((a) => {
      if (
        a.detail &&
        a.detail.instantiatesCanonical &&
        a.detail.instantiatesCanonical.length
      ) {
        const qId = a.detail.instantiatesCanonical[0].split("/")[1];
        if (qId && qList.indexOf(qId) === -1) qList.push(qId);
      }
    });
    return qList;
  };

  const fhirQueryResults = useQuery("fhirResources", getFhirResources);

  useEffect(() => {
    if (isReady()) return;
    const status = fhirQueryResults.status;
    const data = fhirQueryResults.data;
    if (status === "error") setError("Error fetching FHIR resources");
    if (status === "success") {
      if (data && data.length) {
        // check if there is a care plan
        const carePlans = data.filter(
          (item) => item.resource.resourceType === "CarePlan"
        );
        const qList = getQuestionnairesByCarePlan(carePlans);
        // extract any questionnaire(s) referenced in the care plan
        if (qList.length) setQuestionnaireList(qList);
      }
      setPatientBundle((prevPatientBundle) => {
        return {
          ...prevPatientBundle,
          entry: [...prevPatientBundle.entry, ...data],
          loadComplete: true,
        };
      });
    }
  }, [isReady, fhirQueryResults]);

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
        <>
          <BoxRef
            ref={anchorRef}
            sx={{
              position: "relative",
              top: "-64px",
              height: "2px",
              width: "2px",
            }}
          ></BoxRef>
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
        </>
      )}
      <Stack className="summaries" sx={{ position: "relative" }}>
        {!isReady() && (
          <Box sx={{ position: "absolute", top: 16, left: 16 }}>
            <CircularProgress></CircularProgress>
          </Box>
        )}
        {patientBundle.loadComplete && (
          <>
            {!hasQuestionnaireResponses() && (
              <Alert severity="warning">No recorded response</Alert>
            )}
            {hasQuestionnaireResponses() && (
              <section>
                {questionnaireList.length > 1 && (
                  <BoxRef
                    ref={selectorRef}
                    style={{
                      opacity: isReady() ? 1 : 0.4,
                      borderBottom: 1,
                      borderColor: "#ececec",
                      borderBottomStyle: "solid",
                      paddingBottom: "32px",
                      marginBottom: "8px",
                    }}
                  >
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
                )}
                {questionnaireList.map((questionnaire, index) => {
                  return (
                    <Box key={`summary_container_${index}`}>
                      <Summary
                        questionnaire={questionnaire}
                        patientBundle={patientBundle}
                        key={`questionnaire_summary_${index}`}
                        callbackFunc={handleCallback}
                        sectionAnchorPrefix={QUESTIONNAIRE_ANCHOR_ID_PREFIX}
                      ></Summary>
                      {index !== questionnaireList.length - 1 && (
                        <Divider
                          key={`questionnaire_divider_${index}`}
                          light
                        ></Divider>
                      )}
                    </Box>
                  );
                })}
              </section>
            )}
          </>
        )}
      </Stack>
    </>
  );
}