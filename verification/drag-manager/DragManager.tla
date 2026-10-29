------------------------------ MODULE DragManager ------------------------------
EXTENDS Naturals, Sequences
CONSTANT MaxSteps
VARIABLES mounted, begun, registered, active, current, drops, ends, listeners, hidden, step, action
vars == <<mounted, begun, registered, active, current, drops, ends, listeners, hidden, step, action>>
Init == /\ mounted = TRUE /\ begun = FALSE /\ registered = <<TRUE, TRUE>>
        /\ active = FALSE /\ current = 0 /\ drops = 0 /\ ends = 0
        /\ listeners = FALSE /\ hidden = FALSE /\ step = 0 /\ action = "Init"
Begin == /\ mounted /\ ~begun /\ begun' = TRUE /\ active' = TRUE
         /\ listeners' = TRUE /\ hidden' = TRUE
         /\ UNCHANGED <<mounted, registered, current, drops, ends>>
Enter(i) == /\ active /\ registered[i] /\ current' = i
            /\ UNCHANGED <<mounted, begun, registered, active, drops, ends, listeners, hidden>>
Leave == /\ active /\ current # 0 /\ current' = 0
         /\ UNCHANGED <<mounted, begun, registered, active, drops, ends, listeners, hidden>>
Unregister(i) ==
  /\ registered[i] /\ registered' = [registered EXCEPT ![i] = FALSE]
  /\ current' = IF active /\ current = i THEN IF registered[3-i] THEN 3-i ELSE 0 ELSE current
  /\ UNCHANGED <<mounted, begun, active, drops, ends, listeners, hidden>>
End(drop) == /\ active /\ active' = FALSE /\ current' = 0
             /\ drops' = drops + IF drop /\ current # 0 THEN 1 ELSE 0
             /\ ends' = ends + 1 /\ listeners' = FALSE /\ hidden' = FALSE
             /\ UNCHANGED <<mounted, begun, registered>>
\* The manager's MutationObserver refreshes drop targets; source removal is
\* deliberately modeled separately from the owner's explicit cancel cleanup.
Unmount == /\ mounted /\ mounted' = FALSE
           /\ UNCHANGED <<begun, registered, active, current, drops, ends, listeners, hidden>>
BeginWhileDragging == /\ active /\ UNCHANGED <<mounted, begun, registered, active, current, drops, ends, listeners, hidden>>
Next == /\ step < MaxSteps /\ step' = step + 1
        /\ \/ (Begin /\ action' = "Begin")
           \/ (BeginWhileDragging /\ action' = "BeginWhileDragging")
           \/ (Enter(1) /\ action' = "Enter0")
           \/ (Enter(2) /\ action' = "Enter1")
           \/ (Unregister(1) /\ action' = "Unregister0")
           \/ (Unregister(2) /\ action' = "Unregister1")
           \/ (Leave /\ action' = "Leave")
           \/ (End(TRUE) /\ action' = "Drop")
           \/ (End(FALSE) /\ action' = "Cancel")
           \/ (Unmount /\ action' = "Unmount")
View == [duplicateSafe |-> TRUE, mounted |-> mounted, begun |-> begun, registered |-> registered,
         active |-> active, current |-> current, drops |-> drops, ends |-> ends,
         listeners |-> listeners, hidden |-> hidden]
AtMostOneSession == ends <= 1 /\ ~(active /\ ends > 0)
SessionCleanup == ~active => ~listeners /\ ~hidden
DropAtMostOnce == drops <= 1
NoStaleTarget == current # 0 => registered[current]
UnmountEndsSession == ~mounted => ~active
=============================================================================
