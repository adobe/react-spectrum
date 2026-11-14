------------------------------ MODULE FocusScope ------------------------------
EXTENDS Naturals, Integers, Sequences
CONSTANT MaxSteps
VARIABLES modes, restore, focus, outside, detached, active, step, action
vars == <<modes, restore, focus, outside, detached, active, step, action>>
Init == /\ modes = <<0, 0>> /\ restore = <<-1, -1>> /\ focus = 0
        /\ outside = TRUE /\ detached = FALSE /\ active = 0 /\ step = 0 /\ action = "Init"
Connected(f) == IF f = 0 THEN outside ELSE IF f = 1 THEN modes[1] > 0 ELSE IF f = 2 THEN modes[2] > 0 ELSE f = -1

\* ---- FocusScope's module-level activeScope: 0 (null), 1 (outer), or 2 (inner) ----

InScope(t, j) == IF j = 1 THEN t \in {1, 2} ELSE t = 2
\* Walks up from the active scope to j: false past a containing scope.
ShouldContain(j, a, m) == ~(a = 2 /\ j = 1 /\ m[2] = 3)
\* focusin reaches the scopes' element listeners from the target up, then the
\* document's in the order the scopes mounted.
Handlers(t, m) ==
  SelectSeq((IF t = 2 THEN <<2, 1>> ELSE IF t = 1 THEN <<1>> ELSE <<>>) \o <<1, 2>>,
            LAMBDA j : m[j] > 0)
\* The focusin handlers for target t, with st.f where focus is now: plain scopes'
\* useActiveScopeTracker, restoring scopes' useRestoreFocus, and containing scopes'
\* useFocusContainment, which moves focus back to `back` and handles that first.
RECURSIVE Pass(_, _, _, _, _)
Pass(t, back, m, hs, st) ==
  IF hs = <<>> THEN st
  ELSE LET j == Head(hs)
           a == st.a
           next ==
             IF m[j] = 1
             THEN [st EXCEPT !.a = IF InScope(t, j) THEN j ELSE IF t \in {1, 2} THEN @ ELSE 0]
             ELSE IF m[j] = 2
             THEN IF (a = 0 \/ (a = 1 /\ j = 2)) /\ InScope(st.f, j) THEN [st EXCEPT !.a = j] ELSE st
             ELSE IF (a = 0 \/ (a = 1 /\ j = 2)) /\ InScope(t, j) THEN [st EXCEPT !.a = j]
             ELSE IF ShouldContain(j, a, m) /\ ~InScope(t, j)
             THEN LET to == IF InScope(back, j) THEN back ELSE j
                  IN Pass(to, to, m, Handlers(to, m), [st EXCEPT !.f = to])
             ELSE st
       IN Pass(t, back, m, Tail(hs), next)
FocusIn(t, back, m, a) == IF t < 0 THEN a ELSE Pass(t, back, m, Handlers(t, m), [a |-> a, f |-> t]).a

\* useRestoreFocus restores from <body> only if the scope is active, or it is an
\* ancestor of the active scope and no scope in between restores focus.
ShouldRestore(i) == IF i = 2 THEN active = 2 ELSE active = 1 \/ (active = 2 /\ modes[2] < 2)
\* Its animation frame restores the first connected node up the tree, or focuses
\* the first control of the nearest surviving ancestor.
RestoreFromBody(i) ==
  IF Connected(restore[i]) THEN restore[i]
  ELSE IF i = 2 /\ modes[1] >= 2 /\ Connected(restore[1]) THEN restore[1]
  ELSE IF i = 2 THEN 1 ELSE -1

Mount(i, mode) ==
  /\ modes[i] = 0 /\ (i = 1 \/ modes[1] > 0)
  /\ modes' = [modes EXCEPT ![i] = mode]
  /\ restore' = [restore EXCEPT ![i] = focus]
  /\ focus' = IF mode >= 2 THEN i ELSE focus
  /\ active' = IF mode >= 2 THEN i ELSE active
  /\ UNCHANGED <<outside, detached>>
Unmount(i) ==
  /\ modes[i] > 0
  /\ modes' = IF i = 1 THEN <<0, 0>> ELSE [modes EXCEPT ![2] = 0]
  \* React cleans up the outer scope first, so its animation frame restores first,
  \* unless its target is <body>, which leaves focus there for the inner scope's.
  /\ focus' = IF focus >= i THEN
        IF i = 1 /\ modes[1] >= 2 /\ restore[1] = 0 /\ outside THEN 0
        ELSE IF focus = 2 /\ modes[2] >= 2 /\ Connected(restore[2]) /\ restore[2] < i THEN restore[2]
        ELSE IF modes[i] >= 2 /\ Connected(restore[i]) /\ restore[i] < i THEN restore[i]
        ELSE IF i = 2 /\ modes[2] >= 2 /\ modes[1] >= 2 /\ Connected(restore[1]) THEN restore[1]
        ELSE IF i = 2 /\ (modes[1] = 3 \/ modes[2] >= 2) THEN 1 ELSE -1
      ELSE IF focus = -1 /\ modes[i] >= 2 /\ ShouldRestore(i) THEN RestoreFromBody(i)
      ELSE focus
  \* Removing a scope makes its parent active if it or a descendant was.
  /\ LET removed == IF i = 1 THEN 0 ELSE IF active = 2 THEN 1 ELSE active
     IN active' = IF focus' # focus THEN FocusIn(focus', focus', modes', removed) ELSE removed
  /\ UNCHANGED <<restore, outside, detached>>
Focus(f) ==
  /\ Connected(f) /\ f >= 0
  /\ focus' = IF modes[2] = 3 /\ f # 2 THEN focus
               ELSE IF modes[1] = 3 /\ f = 0 THEN focus ELSE f
  \* Focusing the focused element fires no event.
  /\ active' = IF f = focus THEN active ELSE FocusIn(f, focus, modes, active)
  /\ UNCHANGED <<modes, restore, outside, detached>>
RemoveOutside ==
  /\ outside /\ outside' = FALSE
  /\ focus' = IF focus = 0 THEN -1 ELSE focus
  /\ UNCHANGED <<modes, restore, detached, active>>
Next == /\ step < MaxSteps /\ step' = step + 1
        /\ \/ (Mount(1, 1) /\ action' = "MountPlain0")
           \/ (Mount(1, 2) /\ action' = "MountRestore0")
           \/ (Mount(1, 3) /\ action' = "MountContain0")
           \/ (Mount(2, 1) /\ action' = "MountPlain1")
           \/ (Mount(2, 2) /\ action' = "MountRestore1")
           \/ (Mount(2, 3) /\ action' = "MountContain1")
           \/ (Unmount(1) /\ action' = "Unmount0")
           \/ (Unmount(2) /\ action' = "Unmount1")
           \/ (Focus(0) /\ action' = "Focus0")
           \/ (Focus(1) /\ action' = "Focus1")
           \/ (Focus(2) /\ action' = "Focus2")
           \/ (RemoveOutside /\ action' = "RemoveOutside")
Nodes == (IF modes[1] > 0 THEN 1 ELSE 0) + (IF modes[2] > 0 THEN 1 ELSE 0)
View == [modes |-> modes, focus |-> focus, outside |-> outside, nodes |-> Nodes, detached |-> detached]
\* What `yarn verify cover` generates tests from: the whole state, which is finite.
Coverage == <<modes, restore, focus, outside, detached, active>>
FocusConnected == Connected(focus)
RestoreConnected == ~detached
NoDanglingNodes == modes[2] > 0 => modes[1] > 0
Containment == /\ (modes[2] = 3 => focus = 2)
               /\ (modes[1] = 3 => focus \in {1, 2})
=============================================================================
