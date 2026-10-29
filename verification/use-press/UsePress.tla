------------------------------ MODULE UsePress ------------------------------
\* Model of the pointer lifecycle in packages/react-aria/src/interactions/usePress.ts.
\* `s.h` follows the hook's state; the other fields are the input protocol and the
\* reference outcome from target.tsx, whose action names and guards this mirrors.
\* `yarn verify conform use-press` checks that the real hook's behavior matches View.
EXTENDS Naturals
CONSTANT MaxSteps
VARIABLES s, step, action
vars == <<s, step, action>>

Init ==
  /\ step = 0
  /\ action = "Init"
  /\ s = [h |-> [isPressed |-> FALSE, didFirePressStart |-> FALSE,
                 listeners |-> FALSE, timer |-> FALSE, clicked |-> FALSE,
                 starts |-> 0, ends |-> 0, presses |-> 0],
           pointer |-> "idle", outcome |-> "none", mounted |-> TRUE,
           disabled |-> FALSE, nativeClicked |-> FALSE, otherClicked |-> FALSE,
           otherDown |-> FALSE]

\* triggerPressEnd (if a start fired) followed by cancel's cleanup of global
\* listeners and disposables.
Stop(h, activate) ==
  [h EXCEPT !.isPressed = FALSE, !.didFirePressStart = FALSE,
            !.listeners = FALSE, !.timer = FALSE, !.clicked = FALSE,
            !.ends = @ + IF h.didFirePressStart THEN 1 ELSE 0,
            !.presses = @ + IF h.didFirePressStart /\ activate THEN 1 ELSE 0]

Cancel(outcome) == IF outcome = "live" THEN "canceled" ELSE outcome

\* pressProps.onPointerDown -> triggerPressStart; adds document pointerup/pointercancel.
PointerDown ==
  /\ s.mounted /\ ~s.disabled /\ s.pointer = "idle"
  /\ s' = [s EXCEPT !.pointer = "down", !.outcome = "live",
             !.h.isPressed = TRUE, !.h.didFirePressStart = TRUE,
             !.h.listeners = TRUE, !.h.starts = @ + 1]

\* Document onPointerUp (matching pointerId) schedules the fallback timer and a
\* capturing click listener; onClick will fire onPress.
PointerUp ==
  /\ s.pointer = "down"
  /\ s' = [s EXCEPT !.pointer = "up", !.h.timer = s.h.listeners /\ s.h.isPressed]

\* Document onPointerCancel -> cancel.
PointerCancel ==
  /\ s.pointer = "down"
  /\ s' = [s EXCEPT !.pointer = "canceled", !.outcome = Cancel(@),
             !.h = IF s.h.listeners /\ s.h.isPressed THEN Stop(@, FALSE) ELSE @]

\* pressProps.onClick, pointer branch: triggerPressEnd(wasPressed) then cancel.
NativeClick ==
  /\ s.mounted /\ s.pointer = "up" /\ ~s.nativeClicked
  /\ s' = [s EXCEPT !.nativeClicked = TRUE,
             !.outcome = IF @ = "live" THEN "activated" ELSE @,
             !.h = IF s.h.isPressed THEN Stop(@, ~s.disabled) ELSE @]

\* The capturing click listener records any click in the document.
OtherClick ==
  /\ s.pointer \in {"down", "up"} /\ ~s.otherClicked
  /\ s' = [s EXCEPT !.otherClicked = TRUE, !.h.clicked = @ \/ s.h.timer]

\* 100 ms pass. The fallback cancels if a click was recorded, and otherwise
\* focuses the target and calls target.click(), which activates.
Tick ==
  /\ s.pointer # "idle"
  /\ s' = [s EXCEPT
             !.outcome = IF @ = "live" /\ s.pointer = "up" /\ ~s.nativeClicked
                         THEN "activated" ELSE @,
             !.h = IF s.h.timer /\ s.h.isPressed
                   THEN Stop(@, ~s.h.clicked /\ ~s.disabled)
                   ELSE [@ EXCEPT !.timer = FALSE]]

OtherPointerDown ==
  /\ ~s.otherDown
  /\ s' = [s EXCEPT !.otherDown = TRUE]

\* The document pointercancel listener does not compare pointerId.
OtherPointerCancel ==
  /\ s.otherDown
  /\ s' = [s EXCEPT !.otherDown = FALSE,
             !.h = IF s.h.listeners /\ s.h.isPressed THEN Stop(@, FALSE) ELSE @]

\* isDisabled effect after a committed rerender.
Disable ==
  /\ s.mounted /\ ~s.disabled
  /\ s' = [s EXCEPT !.disabled = TRUE, !.outcome = Cancel(@),
             !.h = IF s.h.isPressed THEN Stop(@, FALSE) ELSE @]

Enable ==
  /\ s.mounted /\ s.disabled
  /\ s' = [s EXCEPT !.disabled = FALSE]

\* Unmount removes global listeners and disposables; the ref keeps its values.
Unmount ==
  /\ s.mounted
  /\ s' = [s EXCEPT !.mounted = FALSE, !.outcome = Cancel(@),
             !.h.listeners = FALSE, !.h.timer = FALSE]

Next ==
  /\ step < MaxSteps
  /\ step' = step + 1
  /\ \/ (PointerDown /\ action' = "PointerDown")
     \/ (PointerUp /\ action' = "PointerUp")
     \/ (PointerCancel /\ action' = "PointerCancel")
     \/ (NativeClick /\ action' = "NativeClick")
     \/ (OtherClick /\ action' = "OtherClick")
     \/ (Tick /\ action' = "Tick")
     \/ (OtherPointerDown /\ action' = "OtherPointerDown")
     \/ (OtherPointerCancel /\ action' = "OtherPointerCancel")
     \/ (Disable /\ action' = "Disable")
     \/ (Enable /\ action' = "Enable")
     \/ (Unmount /\ action' = "Unmount")

\* What conformance compares with the target's projected observation.
View ==
  [mounted |-> s.mounted, disabled |-> s.disabled, pointer |-> s.pointer,
   outcome |-> s.outcome, nativeClicked |-> s.nativeClicked,
   otherClicked |-> s.otherClicked, otherDown |-> s.otherDown,
   pressed |-> s.mounted /\ s.h.isPressed, starts |-> s.h.starts,
   ends |-> s.h.ends, presses |-> s.h.presses, timer |-> s.h.timer,
   listeners |-> s.h.listeners]

\* Contracts; names match the target's invariants.
PointerOwnership == (s.outcome = "live" /\ s.mounted) => s.h.isPressed
ActivationUnique == s.h.presses <= 1
CancellationSafe == s.outcome = "canceled" => s.h.presses = 0
NoLostActivation == s.outcome = "activated" => s.h.presses = 1
LifecycleBalanced ==
  /\ s.h.ends <= s.h.starts
  /\ s.mounted => s.h.starts - s.h.ends = IF s.h.isPressed THEN 1 ELSE 0
CleanupComplete ==
  (~s.mounted \/ s.outcome \in {"canceled", "activated"}) => ~s.h.timer /\ ~s.h.listeners
=============================================================================
