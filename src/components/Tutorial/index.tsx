"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import Joyride, { Step, CallBackProps, Styles } from "react-joyride";

interface TutorialComponentProps {
  tutorialKey: string;
  steps: Step[];
  continuous?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  startOnLoad?: boolean;
  onFinish?: () => void;
}

export interface TutorialComponentRef {
  startTutorial: () => void;
}

const Tutorial = forwardRef<TutorialComponentRef, TutorialComponentProps>(
  (
    {
      tutorialKey,
      steps,
      continuous = true,
      showProgress = true,
      showSkipButton = true,
      startOnLoad = false,
      onFinish,
    },
    ref
  ) => {
    const [run, setRun] = useState(false);

    useEffect(() => {
      const tutorialCompleted = localStorage.getItem(tutorialKey);
      if (startOnLoad && !tutorialCompleted) {
        const checkElements = setInterval(() => {
          const allElementsPresent = steps.every((step) =>
            document.querySelector(step.target as string)
          );
          if (allElementsPresent) {
            setRun(true);
            clearInterval(checkElements);
          }
        }, 100);
        return () => clearInterval(checkElements);
      }
    }, [tutorialKey, startOnLoad, steps]);

    const handleJoyrideCallback = useCallback(
      (data: CallBackProps) => {
        const { status } = data;
        if (status === "finished" || status === "skipped") {
          setRun(false);
          localStorage.setItem(tutorialKey, "true");
          if (onFinish) {
            onFinish();
          }
        }
      },
      [tutorialKey, onFinish]
    );

    const startTutorial = () => {
      localStorage.removeItem(tutorialKey);
      setRun(true);
    };

    useImperativeHandle(ref, () => ({
      startTutorial,
    }));

    const joyrideStyles: Partial<Styles> = {
      options: {
        arrowColor: "#fff",
        backgroundColor: "#fff",
        overlayColor: "rgba(0, 0, 0, 0.5)",
        primaryColor: "#feca00",
        textColor: "#000",
        width: undefined,
        zIndex: 1000,
      },
      tooltipContainer: {
        textAlign: "left",
      },
      buttonNext: {
        backgroundColor: "#feca00",
        color: "#000",
      },
      buttonBack: {
        color: "#555",
        marginRight: 10,
      },
      buttonSkip: {
        color: "#555",
      },
      tooltip: {
        padding: 20,
      },
      tooltipTitle: {
        fontSize: 18,
        marginBottom: 10,
      },
      tooltipContent: {
        fontSize: 14,
      },
    };

    return (
      <Joyride
        key={tutorialKey}
        steps={steps}
        run={run}
        continuous={continuous}
        showProgress={showProgress}
        showSkipButton={showSkipButton}
        scrollToFirstStep={true}
        disableOverlayClose={true}
        scrollOffset={100}
        spotlightPadding={10}
        callback={handleJoyrideCallback}
        styles={joyrideStyles}
      />
    );
  }
);

export default Tutorial;
