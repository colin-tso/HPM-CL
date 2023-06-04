BLOCK Btu_swch (GENERIC $REG_CTL; AT Pre_PVAg;
& WHEN swch_pos <> swch_req)
--
-- This routine performs the functions of PMX Switch algo No. 31 (BTU
-- 2/3). This block runs when a switch position change is requested.
-- The appropriate control path is selected (gas or oil). Status and
-- mode of the secondary are checked, as well as the mode of the
-- alternate secondary.
--
-- If these are not proper, the bad switch exit is taken. If OK, the
-- new control configuration is set up and the temperature control 
-- primary is set up for initialization. Finally, the current switch
-- position is set to the requested switch position.
--
--
EXTERNAL a, b, c
If swch_req = oil THEN GOTO gas_to_oil
--
-- Change from oil to gas. Check current modes and status.
--
IF oilpnt.ptexecst <> active
& OR oilpnt.mode <> cas
& OR gaspnt.mode <> Auto THEN GOTO badsw
--
-- If OK, disable Oil SP control.
-- First, set oil output status to inactive.
--
SET coactsts(2) = inactive
SET oilpnt.mode = auto
--
-- Set up Gas SP control.
-- First, set gas output status to active.
--
SET coactsts(1) = active
SET gaspnt.mode = cas
--
-- Set up primary initialization & close switch.
--
SET gaspnt.ctrlinit = on
SET COT.ctrlinit = on
SET swch_pos = swch_req
EXIT
--
-- Change from gas to oil. Check current modes and status.
--
gas_to_oil : IF gaspnt.ptexecst <> active
& OR gaspnt.mode <> cas
& OR oilpnt.mode <> Auto THEN GOTO
badsw
--
-- If OK, disable gas SP control.
-- First, set gas output status to inactive.
--

SET coactsts(1) = inactive
SET gaspnt.mode = auto
--
-- Set up Gas SP control.
-- First, set oil output status to active.
--
SET coactsts(2) = active
SET oilpnt.mode = cas
SET oilpnt.ctrlinit = on
--
-- Set up primary initialization & open switch.
--
SET COT.ctrlinit = on
--
--
SET swch_pos = swch_req
--
EXIT
-- Bad switch exit.
--
--
badsw: SET bad_swch = on
END Btu_swch
--
------------------------------------------------------------------------
--
BLOCK BTUswPV (GENERIC $REG_CTL; AT pv_alg)
--
-- This routine performs the functions of PMX PV algorithm No. 102.
-- (HTCALC)
-- Calculate the total heat input to the furnace.
-- First, test input variables.
--
IF (oilpnt.pvautost<>normal)or(gaspnt.pvautost<>normal)
& THEN EXIT
--
-- Now solve for the total heat input.
--
SET PVCALC = HG*CG*GASPNT.PV+ HO*CO*OILPNT.PV
SET PVAUTOST=NORMAL
END BtuswPV

LOCAL stat : $MODSTR
LOCAL target, source : STRING
LOCAL tindex, sindex, chars
SET target = "net>cust>recipenn.x"
SET tindex = 16.0
SET chars = 2.0
SET source = "ab"
SET sindex = 1.0
CALL MODIFY_STRING (stat, target, tindex, chars, source, sindex)

SET fdas = 55;