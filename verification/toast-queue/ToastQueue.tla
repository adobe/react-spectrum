----------------------------- MODULE ToastQueue -----------------------------
\* Model of ToastQueue timers driven through a ToastRegion (useToastState.ts,
\* useToast.ts, useToastRegion.ts). Time is in ticks of 2500 ms; the timeout is
\* two ticks. Toast ids are added in order 1..MaxAdded. Action names, guards, and
\* the reference timing (elapsed, problems) mirror target.tsx; the rest follows
\* the implementation, including Timer.resume not clearing a running timeout.
\* `yarn verify conform toast-queue` checks that the real code matches View.
EXTENDS Integers, Sequences
CONSTANT MaxSteps
VARIABLES s, step, action
vars == <<s, step, action>>

Timeout == 2
MaxVisible == 1
MaxOpen == 2
MaxAdded == 3
Ids == 1..MaxAdded

Min(a, b) == IF a < b THEN a ELSE b
VisibleSeq(q) == SubSeq(q, 1, Min(MaxVisible, Len(q)))
VisibleSet(q) == {q[i] : i \in 1..Min(MaxVisible, Len(q))}
InQueue(st, i) == \E k \in 1..Len(st.queue) : st.queue[k] = i
IndexOf(q, x) == IF \E k \in 1..Len(q) : q[k] = x THEN (CHOOSE k \in 1..Len(q) : q[k] = x) - 1 ELSE -1

\* Focus location: 0 is the button outside the region, -1 is <body>, and a
\* positive value is that toast. The region's refs: within (isFocused, from
\* useFocusWithin), lastFocused (whether it is the outside button), focusedIndex
\* (focusedToast; -2 is null), toastsList (toasts.current), prevVisible.
FocusIn(st) == st.loc > 0

Init ==
  /\ step = 0
  /\ action = "Init"
  /\ s = [now |-> 0, added |-> 0, queue |-> <<>>, shown |-> {},
          timer |-> [i \in Ids |-> [id |-> 0, remaining |-> 0, start |-> 0]],
          timeouts |-> <<>>, serial |-> 0,
          pointer |-> FALSE, loc |-> 0, within |-> FALSE, lastFocused |-> FALSE,
          focusedIndex |-> -2, toastsList |-> <<>>, prevVisible |-> <<>>, apiPaused |-> FALSE,
          elapsed |-> [i \in Ids |-> 0], problems |-> <<>>]

\* ---- Reference timing (target.tsx's advance, refreshVisible, onClose) ----

Paused(st) == st.pointer \/ FocusIn(st) \/ st.apiPaused

Advance(st, t) ==
  [st EXCEPT !.now = t,
     !.elapsed = [i \in Ids |->
       IF ~Paused(st) /\ i \in VisibleSet(st.queue) THEN @[i] + (t - st.now) ELSE @[i]]]

\* A toast that becomes visible starts a fresh timeout.
ShowReset(st, before) ==
  [st EXCEPT !.elapsed = [i \in Ids |->
     IF i \in VisibleSet(st.queue) /\ i \notin before THEN 0 ELSE @[i]]]

\* ---- Timer (useToastState.ts) ----

Pause(st, i) ==
  IF st.timer[i].id = 0 THEN st
  ELSE [st EXCEPT !.timeouts = SelectSeq(@, LAMBDA x : x.serial # st.timer[i].id),
                  !.timer[i].id = 0,
                  !.timer[i].remaining = @ - (st.now - st.timer[i].start)]

\* Does not clear a running timeout: the old one keeps running untracked.
Resume(st, i) ==
  IF st.timer[i].remaining <= 0 THEN st
  ELSE [st EXCEPT !.serial = @ + 1,
                  !.timer[i] = [id |-> st.serial + 1, remaining |-> @.remaining, start |-> st.now],
                  !.timeouts = Append(@, [toast |-> i, serial |-> st.serial + 1,
                                          due |-> st.now + st.timer[i].remaining])]

Reset(st, i) == Resume([st EXCEPT !.timer[i].remaining = Timeout], i)

RECURSIVE PauseEach(_, _), ResumeEach(_, _)
PauseEach(st, ids) == IF ids = <<>> THEN st ELSE PauseEach(Pause(st, Head(ids)), Tail(ids))
ResumeEach(st, ids) == IF ids = <<>> THEN st ELSE ResumeEach(Resume(st, Head(ids)), Tail(ids))
PauseAll(st) == PauseEach(st, VisibleSeq(st.queue))
ResumeAll(st) == ResumeEach(st, VisibleSeq(st.queue))

\* useToastRegion's updateTimers, called on hover and focus-within changes. It
\* uses the region's refs, not where focus actually is.
UpdateTimers(st) == IF st.pointer \/ st.within THEN PauseAll(st) ELSE ResumeAll(st)

\* Moving focus fires the region's handlers: onBlur (focusedIndex = -1) only if a
\* toast in the region loses focus; useFocusWithin's onBlurWithin on any focusin
\* outside the region; onFocus and onFocusWithin when a toast gains focus.
MoveFocus(st, target) ==
  IF st.loc = target THEN st
  ELSE IF target = 0
    THEN LET left == [st EXCEPT !.loc = 0,
                        !.focusedIndex = IF st.loc > 0 THEN -1 ELSE @]
         IN IF st.within
            THEN UpdateTimers([left EXCEPT !.within = FALSE, !.lastFocused = FALSE])
            ELSE left
    ELSE LET entered == [st EXCEPT !.loc = target,
                           !.focusedIndex = IndexOf(st.toastsList, target)]
         IN IF st.within THEN entered
            ELSE UpdateTimers([entered EXCEPT !.within = TRUE, !.lastFocused = (st.loc = 0)])

\* ToastQueue.close, with target.tsx's check of timer-driven closes.
Close(st, i, byTimer) ==
  LET before == VisibleSet(st.queue)
      problem ==
        IF ~byTimer THEN <<>>
        ELSE IF Paused(st)
          THEN <<IF st.apiPaused THEN "PauseAllHoldsTimers" ELSE "RegionPauseHoldsTimers">>
        ELSE IF i \notin before \/ st.elapsed[i] # Timeout THEN <<"AutoCloseAfterTimeout">>
        ELSE <<>>
  IN ShowReset([st EXCEPT !.queue = SelectSeq(@, LAMBDA x : x # i),
                          !.problems = @ \o problem], before)

\* A pending timeout fires: the Timer forgets its timeout and closes the toast.
Fire(st, x) ==
  LET fired == [st EXCEPT !.timeouts = SelectSeq(@, LAMBDA y : y.serial # x.serial),
                          !.timer[x.toast].id = 0, !.timer[x.toast].remaining = 0]
  IN IF InQueue(fired, x.toast) THEN Close(fired, x.toast, TRUE) ELSE fired

RECURSIVE FireEach(_, _)
FireEach(st, xs) == IF xs = <<>> THEN st ELSE FireEach(Fire(st, Head(xs)), Tail(xs))

\* React commit after an action. Removing a focused toast leaves focus on <body>
\* without events. The region's layout effect then moves focus if the toast it
\* last saw focused was removed: to lastFocused in pointer modality, otherwise to
\* the remaining toast. Passive effects follow: useToast pauses removed toasts and
\* resets new ones, then the region restores lastFocused once no toasts are visible.
Render(st) ==
  LET visible == VisibleSeq(st.queue)
      visibleSet == VisibleSet(st.queue)
      dom == IF st.loc > 0 /\ st.loc \notin visibleSet THEN [st EXCEPT !.loc = -1] ELSE st
      prev == dom.prevVisible
      removedFocused == dom.focusedIndex >= 0 /\ dom.focusedIndex < Len(prev)
                        /\ prev[dom.focusedIndex + 1] \notin visibleSet
      layout ==
        IF dom.focusedIndex = -1 \/ visible = <<>>
        THEN [dom EXCEPT !.toastsList = <<>>, !.prevVisible = visible]
        ELSE LET listed == [dom EXCEPT !.toastsList = visible]
                 moved == IF prev # visible /\ removedFocused
                          THEN MoveFocus(listed, IF dom.lastFocused THEN 0 ELSE Head(visible))
                          ELSE listed
             IN [moved EXCEPT !.prevVisible = visible]
      removed == st.shown \ visibleSet
      new == visibleSet \ st.shown
      paused == IF removed = {} THEN layout ELSE Pause(layout, CHOOSE i \in removed : TRUE)
      reset == IF new = {} THEN paused ELSE Reset(paused, CHOOSE i \in new : TRUE)
      restored == IF visible = <<>> /\ st.shown # {} /\ reset.lastFocused
                  THEN [MoveFocus(reset, 0) EXCEPT !.lastFocused = FALSE]
                  ELSE reset
  IN [restored EXCEPT !.shown = visibleSet]

\* target.tsx moves the pointer away when the region unmounts under it.
LeaveEmpty(st) == IF st.pointer /\ st.queue = <<>> THEN [st EXCEPT !.pointer = FALSE] ELSE st

\* ---- Actions (target.tsx) ----

\* target.tsx records focus entering the region during any action but Focus.
Steal(after) ==
  IF ~FocusIn(s) /\ FocusIn(after)
  THEN [after EXCEPT !.problems = @ \o <<"FocusNotStolen">>]
  ELSE after

Add ==
  /\ ~s.apiPaused /\ Len(s.queue) < MaxOpen /\ s.added < MaxAdded
  /\ LET i == s.added + 1
         added == [s EXCEPT !.added = i, !.queue = <<i>> \o @, !.elapsed[i] = 0,
                            !.timer[i] = [id |-> 0, remaining |-> Timeout, start |-> 0]]
     IN s' = Steal(Render(ShowReset(added, VisibleSet(s.queue))))

CloseNewest ==
  /\ ~s.apiPaused /\ s.queue # <<>>
  /\ s' = Steal(LeaveEmpty(Render(Close(s, Head(s.queue), FALSE))))

Hover ==
  /\ ~s.apiPaused /\ ~s.pointer /\ s.queue # <<>>
  /\ s' = Steal(UpdateTimers([s EXCEPT !.pointer = TRUE]))

Unhover ==
  /\ s.pointer
  /\ s' = Steal(UpdateTimers([s EXCEPT !.pointer = FALSE]))

Focus ==
  /\ ~s.apiPaused /\ ~FocusIn(s) /\ s.queue # <<>>
  /\ s' = MoveFocus(s, Head(s.queue))

Blur ==
  /\ FocusIn(s)
  /\ s' = Steal(MoveFocus(s, 0))

Tick ==
  /\ s.queue # <<>>
  /\ LET advanced == Advance(s, s.now + 1)
     IN s' = Steal(LeaveEmpty(Render(FireEach(advanced,
                SelectSeq(advanced.timeouts, LAMBDA x : x.due <= advanced.now)))))

PauseAllAction ==
  /\ ~s.pointer /\ ~FocusIn(s)
  /\ s' = Steal(PauseAll([s EXCEPT !.apiPaused = TRUE]))

ResumeAllAction ==
  /\ ~s.pointer /\ ~FocusIn(s)
  /\ s' = Steal(ResumeAll([s EXCEPT !.apiPaused = FALSE]))

Next ==
  /\ step < MaxSteps
  /\ step' = step + 1
  /\ \/ (Add /\ action' = "add")
     \/ (CloseNewest /\ action' = "close")
     \/ (Hover /\ action' = "hover")
     \/ (Unhover /\ action' = "unhover")
     \/ (Focus /\ action' = "focus")
     \/ (Blur /\ action' = "blur")
     \/ (Tick /\ action' = "tick")
     \/ (PauseAllAction /\ action' = "pauseAll")
     \/ (ResumeAllAction /\ action' = "resumeAll")

\* Ticks until each pending timeout fires, in ascending order, including the
\* untracked ones Resume leaves running. A timeout is due within Timeout ticks.
RECURSIVE ScheduleFrom(_)
ScheduleFrom(d) ==
  IF d > Timeout THEN <<>>
  ELSE [k \in 1..Len(SelectSeq(s.timeouts, LAMBDA x : x.due - s.now = d)) |-> d]
         \o ScheduleFrom(d + 1)

\* What conformance compares with the target's projected observation (times in ticks).
View ==
  [pointerOverRegion |-> s.pointer, focusInRegion |-> FocusIn(s),
   apiPaused |-> s.apiPaused, added |-> s.added,
   toasts |-> [k \in 1..Len(s.queue) |->
     LET i == s.queue[k] IN
       [id |-> i, visible |-> i \in VisibleSet(s.queue), elapsed |-> s.elapsed[i],
        running |-> s.timer[i].id # 0, remaining |-> s.timer[i].remaining,
        sinceStart |-> IF s.timer[i].id # 0 THEN s.now - s.timer[i].start ELSE -1]],
   pendingTimers |-> ScheduleFrom(1), problems |-> s.problems]

\* Contracts; names match the target's invariants.
NoProblem(name) == \A k \in 1..Len(s.problems) : s.problems[k] # name
RegionPauseHoldsTimers == NoProblem("RegionPauseHoldsTimers")
PauseAllHoldsTimers == NoProblem("PauseAllHoldsTimers")
AutoCloseAfterTimeout == NoProblem("AutoCloseAfterTimeout")
FocusNotStolen == NoProblem("FocusNotStolen")
NoOverdueToast == Paused(s) \/ \A i \in VisibleSet(s.queue) : s.elapsed[i] < Timeout
VisibleToastsMatchReference == s.shown = VisibleSet(s.queue)
=============================================================================
