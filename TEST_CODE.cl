--***************************************************************************** 
--* Project:    -                                                             * 
--* Filename:   - TEST_CODE.CL                                                * 
--* Function:   - XXXXXXXXXX                                                  *
--*                                                                           * 
--* Controller: - AM                                                          * 
--***************************************************************************** 
--* REVISION SUMMARY:                                                         * 
--*   Revision  Date         Editor     Description                           * 
--*   0         XXXXXXXXX    XXXXX      Initial coding                        * 
--***************************************************************************** 

BLOCK TEST_MB(POINT TEST_CODE; AT GENERAL)
-- Define EXTERNAL variables
EXTERNAL 12WS201, 12WS201AVG  -- weight recorder, average
EXTERNAL 12WZ203, 12WZ203AVG  -- SIS weight recorder, average
EXTERNAL 12FC203              -- flowmeter
EXTERNAL 12WR211              -- weight recorder
EXTERNAL 12HS211              -- field switch
EXTERNAL 12WR212              -- weight deviation
EXTERNAL 12HZ220              -- SIS panel switch

-- Define LOCAL constants and variables
LOCAL MAX_NOISE = 5           -- Allowable weight noise/drift in system (5kg)
LOCAL EXPECTED_MASS, TEST_AVG
LOCAL LAST_DEVIATION = ABS(12WR212.PV) -- Get mass deviation from last program cycle
LOCAL TEST_AVG = 12WS201AVG.2M_AVG + 12WZ203AVG.2M_AVG

SET 12WR211.PV = 12WS201.PV + 12WZ203.PV -- Calculate actual mass

-- Inhibit deviation alarm when conditions not met.
-- Reference mass reset logic
IF (12HZ220.PV = "TRIPPED" AND 12WR212.ALENBST = ENABLE) OR
&   12HS211.PVFL THEN SET (
&   12WR212.ALENBST     = INHIBIT ;
&   SET 12HS211.PVFL    = OFF ;
&   SET 12WR211.SP      = 12WR211.PV )
ELSE (
&   SET 12WR212.ALENBST = ENABLE ;

    -- Set 12WR211.SP = EXPECTED_MASS
    -- EXPECTED_MASS is calculated/referenced
    -- from the last expected value (12WR211.SP)
    -- if MAX_NOISE is exceeded during the last
    -- calculation cycle.
    -- Otherwise, use the last actual value as
    -- the reference (12WR211.PV).

&   SET EXPECTED_MASS    = (WHEN LAST_DEVIATION >= MAX_NOISE : 12WR211.SP - 12FC203.PV * 30 / 3600 ;
&                           WHEN OTHERS                      : TEST_AVG - 12FC203.PV * 30 / 3600 ) ;
&   SET 12WR211.SP       = EXPECTED_MASS )

SET 12WR212.PV           = TEST_AVG - 12WR211.SP  -- Set mass deviation value

END TEST_MB