--***************************************************************************** 
--* Project: -                                                                * 
--* Filename: - PKGCAL.CL                                                    * 
--* Function: - AVERAGE Calculation                                           * 
--* Description - Calculates the average of the PV this package is attached   * 
--* to over the last 0-2, 0-5, 0-10 and 5-15 minutes blocks at 30 sec freq.   * 
--***************************************************************************** 
--* REVISION SUMMARY:                                                         * 
--* Revision Date Editor Description                                          * 
--* XXXXXXXXXXXXXXXXXXXXXXXXX                                                 * 
--***************************************************************************** 
   
PACKAGE 
CUSTOM
-- Point Name for the average calculation 
PARAMETER PTNAME : $REG_CTL
BLD_VISIBLE 
-- VALUE OF THE INPUT 
PARAMETER PVVAL : NUMBER
VALUE 0.0 
ACCESS ENGINEER 
-- Last 30 minutes snapshot data
PARAMETER SVAL : ARRAY(1..30) "LAST 15 MIN SNAPSHOTS"
VALUE 0.0 
ACCESS ENGINEER 
-- Average Value between -2 minutes and Current Time
PARAMETER 2M_AVG : NUMBER 
VALUE 0.0 
ACCESS ENGINEER 
-- Average Value between -5 minutes and Current Time
PARAMETER 5M_AVG : NUMBER
VALUE 0.0 
ACCESS ENGINEER 
-- Average Value between -10 minutes and Current Time 
PARAMETER 10M_AVG : NUMBER 
VALUE 0.0 
ACCESS ENGINEER 
-- Average Value between -15 minutes and -5 minutes
PARAMETER 515M_AVG : NUMBER 
VALUE 0.0 
-- Indicate the BadPV on the point reference
PARAMETER BADFL : LOGICAL
ACCESS ENGINEER 
-- Indicate when the BadPV occurred
PARAMETER BADTM : TIME
ACCESS ENGINEER 
END CUSTOM

BLOCK PKGCAL(GENERIC $REG_CTL; AT GENERAL(1))
LOCAL I : NUMBER -- FOR THE LOOP
LOCAL 2M_SUM : NUMBER
LOCAL 5M_SUM : NUMBER 
LOCAL 10M_SUM : NUMBER
LOCAL 515M_SUM : NUMBER
   
%RELAX LINKER_SDE_CHECKS

CALL ALLOW_BAD(PVVAL, PTNAME.PV)
   
IF BADVAL(PVVAL) AND BADFL<>ON THEN ( 
& SEND LOG_ONLY:"BADPV at ", DATE_TIME; 
& SET BADTM=DATE_TIME)
   
IF BADVAL(PVVAL) THEN ( 
& SET PVVAL=0.0;
& SET BADFL = ON; 
& EXIT) 
   
IF BADFL = ON THEN SET BADFL = OFF

-- FILLS SVAL(1-30) WITH THE LAST 15 MINS PV
L1: LOOP FOR I IN 1..29 
SET SVAL(31-I) = SVAL(30-I)
REPEAT L1 
SET SVAL(1) = PVVAL 
-- CALCULATES THE AVERAGE OF THE -2 MINUTES 
SET 2M_SUM = 0
L2: LOOP FOR I IN 1..4
SET 2M_SUM = 2M_SUM + SVAL(I)
REPEAT L2 
SET 2M_AVG = 2M_SUM / 4 
-- CALCULATES THE AVERAGE OF THE -5 MINUTES 
SET 5M_SUM = 0
L3: LOOP FOR I IN 1..10 
SET 5M_SUM = 5M_SUM + SVAL(I)
REPEAT L3 
SET 5M_AVG = 5M_SUM / 10
-- CALCULATES THE AVERAGE OF THE -10 MINUTES
SET 10M_SUM = 0 
L4: LOOP FOR I IN 1..20 
SET 10M_SUM = 10M_SUM + SVAL(I)
REPEAT L4 
SET 10M_AVG = 10M_SUM / 20
-- CALCULATES THE AVERAGE OF THE PERIOD -15 ... -5 MINUTES 
SET 515M_SUM = 0 
L5: LOOP FOR I IN 11..30
SET 515M_SUM = 515M_SUM + SVAL(I)
REPEAT L5 
SET 515M_AVG = 515M_SUM / 20
   
END PKGCAL
   
END PACKAGE