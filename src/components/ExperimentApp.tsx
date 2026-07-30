"use client";

import { useEffect, useState } from "react";
import { Arm } from "@/config/experiment";
import { Welcome } from "@/components/screens/Welcome";
import { HowItWorks } from "@/components/screens/HowItWorks";
import { QuickCheck } from "@/components/screens/QuickCheck";
import { Baseline } from "@/components/screens/Baseline";
import { Practice } from "@/components/screens/Practice";
import { RoundsContainer } from "@/components/screens/RoundsContainer";
import { Results } from "@/components/screens/Results";
import { ExitSurvey } from "@/components/screens/ExitSurvey";
import { Debrief } from "@/components/screens/Debrief";
import { ScreenShell } from "@/components/ui/Primitives";

type Screen =
  | "loading"
  | "welcome"
  | "how"
  | "quickcheck"
  | "baseline"
  | "practice"
  | "rounds"
  | "results"
  | "exitsurvey"
  | "debrief";

export function ExperimentApp() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [arm, setArm] = useState<Arm>("control");
  const [initialRound, setInitialRound] = useState(1);

  useEffect(() => {
    (async () => {
      await fetch("/api/session/start", { method: "POST" });
      const me = await fetch("/api/session/me").then((r) => r.json());
      setArm(me.arm);

      if (me.status === "completed") {
        setScreen("debrief");
      } else if (!me.consentAt) {
        setScreen("welcome");
      } else if (me.attentionCheckPassed === null) {
        setScreen("quickcheck");
      } else if (me.literacyScore === null) {
        setScreen("baseline");
      } else {
        const progress = me.roundProgress as { roundNumber: number; hasEstimate: boolean; hasFinal: boolean }[];
        const anyStarted = progress.some((r) => r.hasEstimate);
        const allFinal = progress.every((r) => r.hasFinal);
        const firstIncomplete = progress.find((r) => !r.hasFinal)?.roundNumber ?? 1;
        if (allFinal) setScreen("results");
        else if (anyStarted) {
          setInitialRound(firstIncomplete);
          setScreen("rounds");
        } else setScreen("practice");
      }
    })();
  }, []);

  async function afterConsent() {
    await fetch("/api/session/consent", { method: "POST" });
    setScreen("how");
  }

  return (
    <ScreenShell>
      {screen === "loading" && <p className="text-center text-slate-400">Loading…</p>}
      {screen === "welcome" && <Welcome onConsent={afterConsent} />}
      {screen === "how" && (
        <HowItWorks
          onNext={() => {
            fetch("/api/session/screen-event", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ screenName: "how_it_works", leftAt: new Date().toISOString() }),
            });
            setScreen("quickcheck");
          }}
        />
      )}
      {screen === "quickcheck" && <QuickCheck onDone={async () => setScreen("baseline")} />}
      {screen === "baseline" && <Baseline onDone={async () => setScreen("practice")} />}
      {screen === "practice" && <Practice arm={arm} onDone={() => setScreen("rounds")} />}
      {screen === "rounds" && (
        <RoundsContainer arm={arm} startRound={initialRound} onAllDone={() => setScreen("results")} />
      )}
      {screen === "results" && <Results onNext={() => setScreen("exitsurvey")} />}
      {screen === "exitsurvey" && <ExitSurvey onDone={async () => setScreen("debrief")} />}
      {screen === "debrief" && <Debrief />}
    </ScreenShell>
  );
}
