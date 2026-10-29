------------------------------ MODULE UsePress ------------------------------
EXTENDS Naturals
CONSTANT MaxSteps
VARIABLES s, step, action
vars == <<s, step, action>>

\* One mounted target, one activation attempt by pointer 1, pointer 2 elsewhere.
\* Each action is one synchronous handler/effect. Callbacks are passive.
Init ==
  /\ step = 0
  /\ action = "Init"
  /\ s = [h |-> [isPressed |-> FALSE, didFirePressStart |-> FALSE,
                 activePointerId |-> 0, isOverTarget |-> FALSE,
                 listeners |-> FALSE, timer |-> FALSE, clicked |-> FALSE,
                 starts |-> 0, ends |-> 0, presses |-> 0],
           phase |-> "idle", otherDown |-> FALSE, disabled |-> FALSE,
           mounted |-> TRUE, canceled |-> FALSE, isolationBroken |-> FALSE]

\* triggerPressEnd followed by cancel: listeners and disposables are cleared.
Stop(h, activate) ==
  [h EXCEPT !.isPressed = FALSE, !.didFirePressStart = FALSE,
            !.activePointerId = 0, !.isOverTarget = FALSE,
            !.listeners = FALSE, !.timer = FALSE,
            !.ends = @ + IF h.didFirePressStart THEN 1 ELSE 0,
            !.presses = @ + IF h.didFirePressStart /\ activate THEN 1 ELSE 0]

\* pressProps.onPointerDown -> triggerPressStart; no user callback reentrancy.
PointerDown ==
  /\ s.mounted /\ ~s.disabled /\ s.phase = "idle"
  /\ s' = [s EXCEPT !.phase = "down",
             !.h.isPressed = TRUE, !.h.didFirePressStart = TRUE,
             !.h.activePointerId = 1, !.h.isOverTarget = TRUE,
             !.h.listeners = TRUE, !.h.starts = @ + 1]

OtherPointerDown ==
  /\ ~s.otherDown
  /\ s' = [s EXCEPT !.otherDown = TRUE]

\* The document pointercancel listener currently does not compare pointerId.
OtherPointerCancel ==
  /\ s.otherDown
  /\ s' = [s EXCEPT !.otherDown = FALSE,
             !.isolationBroken = @ \/ (s.h.listeners /\ s.h.isPressed),
             !.h = IF s.h.listeners /\ s.h.isPressed THEN Stop(@, FALSE) ELSE @]

PointerCancel ==
  /\ s.phase = "down"
  /\ s' = [s EXCEPT !.phase = "canceled", !.canceled = TRUE,
             !.h = IF s.h.listeners /\ s.h.isPressed THEN Stop(@, FALSE) ELSE @]

\* Document onPointerUp schedules the fallback and clears isOverTarget.
PointerUp ==
  /\ s.phase = "down"
  /\ s' = [s EXCEPT !.phase = "released",
             !.h.timer = s.h.listeners /\ s.h.isPressed,
             !.h.isOverTarget = FALSE]

\* A detail=1 native click; standalone virtual clicks are outside this model.
NativeClick ==
  /\ s.mounted /\ s.phase = "released"
  /\ s' = [s EXCEPT !.phase = "done",
             !.h = IF s.h.isPressed THEN Stop(@, ~s.disabled) ELSE @]

\* The capturing click listener observes any click in the document.
OtherClick ==
  /\ s.h.timer /\ ~s.h.clicked
  /\ s' = [s EXCEPT !.h.clicked = TRUE]

\* Timer callback's focus and target.click are synchronous; focus handlers
\* and onPress callbacks do not mutate props, unmount, or dispatch events.
Fallback ==
  /\ s.h.timer /\ s.mounted
  /\ s' = [s EXCEPT !.h = Stop(@, ~s.h.clicked /\ ~s.disabled)]

\* isDisabled effect after a committed rerender.
Disable ==
  /\ s.mounted /\ ~s.disabled
  /\ s' = [s EXCEPT !.disabled = TRUE,
             !.canceled = @ \/ s.h.isPressed,
             !.h = IF s.h.isPressed THEN Stop(@, FALSE) ELSE @]

Enable ==
  /\ s.mounted /\ s.disabled
  /\ s' = [s EXCEPT !.disabled = FALSE]

\* Unmount clears global listeners and disposables, not the retained ref.
Unmount ==
  /\ s.mounted
  /\ s' = [s EXCEPT !.mounted = FALSE, !.h.listeners = FALSE, !.h.timer = FALSE]

Next ==
  /\ step < MaxSteps
  /\ step' = step + 1
  /\ ( (PointerDown /\ action' = "PointerDown")
       \/ (OtherPointerDown /\ action' = "OtherPointerDown")
       \/ (OtherPointerCancel /\ action' = "OtherPointerCancel")
       \/ (PointerCancel /\ action' = "PointerCancel")
       \/ (PointerUp /\ action' = "PointerUp")
       \/ (NativeClick /\ action' = "NativeClick")
       \/ (OtherClick /\ action' = "OtherClick")
       \/ (Fallback /\ action' = "Fallback")
       \/ (Disable /\ action' = "Disable")
       \/ (Enable /\ action' = "Enable")
       \/ (Unmount /\ action' = "Unmount"))

ActivationUnique == s.h.presses <= 1
CancellationSafe == s.canceled => s.h.presses = 0
LifecycleBalanced ==
  /\ s.h.ends <= s.h.starts
  /\ (s.mounted => (s.h.starts - s.h.ends = IF s.h.didFirePressStart THEN 1 ELSE 0))
CleanupComplete == (~s.mounted \/ s.canceled) => ~s.h.timer /\ ~s.h.listeners
PointerOwnership == ~s.isolationBroken
=============================================================================
