------------------------------ MODULE FocusScope ------------------------------
EXTENDS Naturals, Integers, Sequences
CONSTANT MaxSteps
VARIABLES modes, restore, focus, outside, detached, step, action
vars == <<modes, restore, focus, outside, detached, step, action>>
Init == /\ modes = <<0, 0>> /\ restore = <<-1, -1>> /\ focus = 0
        /\ outside = TRUE /\ detached = FALSE /\ step = 0 /\ action = "Init"
Connected(f) == IF f = 0 THEN outside ELSE IF f = 1 THEN modes[1] > 0 ELSE IF f = 2 THEN modes[2] > 0 ELSE f = -1
Mount(i, mode) ==
  /\ modes[i] = 0 /\ (i = 1 \/ modes[1] > 0)
  /\ modes' = [modes EXCEPT ![i] = mode]
  /\ restore' = [restore EXCEPT ![i] = focus]
  /\ focus' = IF mode >= 2 THEN i ELSE focus
  /\ UNCHANGED <<outside, detached>>
Unmount(i) ==
  /\ modes[i] > 0
  /\ modes' = IF i = 1 THEN <<0, 0>> ELSE [modes EXCEPT ![2] = 0]
  /\ focus' = IF focus >= i THEN
        IF focus = 2 /\ modes[2] >= 2 /\ Connected(restore[2]) /\ restore[2] < i THEN restore[2]
        ELSE IF modes[i] >= 2 /\ Connected(restore[i]) /\ restore[i] < i THEN restore[i]
        ELSE IF i = 2 /\ (modes[1] = 3 \/ modes[2] >= 2) THEN 1 ELSE -1
      ELSE focus
  /\ UNCHANGED <<restore, outside, detached>>
Focus(f) ==
  /\ Connected(f) /\ f >= 0
  /\ focus' = IF modes[2] = 3 /\ f # 2 THEN focus
               ELSE IF modes[1] = 3 /\ f = 0 THEN focus ELSE f
  /\ UNCHANGED <<modes, restore, outside, detached>>
RemoveOutside ==
  /\ outside /\ outside' = FALSE
  /\ focus' = IF focus = 0 THEN -1 ELSE focus
  /\ UNCHANGED <<modes, restore, detached>>
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
FocusConnected == Connected(focus)
RestoreConnected == ~detached
NoDanglingNodes == modes[2] > 0 => modes[1] > 0
Containment == /\ (modes[2] = 3 => focus = 2)
               /\ (modes[1] = 3 => focus \in {1, 2})
=============================================================================
