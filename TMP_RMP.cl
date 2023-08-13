--******************************************************************************
--*   Project:    -                                                            * 
--*   Filename:   - TMP_RMP.CL                                                 *
--*   Function:   - Temperature ramping program                                *
--*   Controller: - HPM                                                        * 
--****************************************************************************** 
--*   REVISION SUMMARY:                                                        * 
--*     Revision        Date          Editor           Description             * 
--*     0               XXXXXXXXX     XXXXXXXX         Initial coding          *
--****************************************************************************** 
   
BLOCK  TMP_RMP (Point TEMP_RAMP_PT; AT GENERAL)
--  Define External Variables
--
External 15XY700PM          -- Recipe setpoint
   
External 15TC001            -- Temperature Controller 1
External 15TC001SP_OLD      -- Original SP value
External 15TC001FL1         -- SP change flag   
   
External 15TC002            -- Temperature Controller 2
External 15TC002SP_OLD      -- Original SP value
External 15TC002FL1         -- SP change flag 
   
--
--  Define Local variables
--
   
Local sp_change_line1       --  Change in SP
Local sp_change_line2       --  Change in SP
--
-- If SP values different sets flag         
--
  
IF 15TC001.SPTV <> 15XY700PM.NN(39) THEN ( 
&       SET 15TC001FL1.PV = ON )
  
IF 15TC002.SPTV <> 15XY700PM.NN(69) THEN ( 
&       SET 15TC002FL1.PV = ON )
   
--
--  If ramp not active sets 15TC001 ramp parameters         
--
    
IF 15TC001.MODE = AUTO AND 15TC001FL1.PV = ON AND 15TC001.TVPROC = OFF THEN( 
&           SET 15TC001.MODATTR    = PROGRAM; 
&           SET sp_change_line1    = ABS(15XY700PM.NN(39) - 15TC001SP_OLD.PV);
&           SET 15TC001.SPTV       = 15XY700PM.NN(39);
&           SET 15TC001.RAMPTIME   = sp_change_line1 * 2 ;
&           SET 15TC001.TVPROC     = RUN; 
&           SET 15TC001.MODATTR    = OPERATOR;
&           SET 15TC001SP_OLD.PV   = 15XY700PM.NN(39);
&           SET 15TC001FL1.PV      = OFF )
--  
--  If previous ramp has not concluded stops previous ramp and resets 15TC001 
--  ramp parameters.
--        
IF 15TC001.MODE = AUTO AND 15TC001FL1.PV = ON AND 15TC001.TVPROC = RUN THEN( 
&           SET 15TC001.MODATTR    = PROGRAM; 
&           SET 15TC001.TVPROC     = OFF; 
&           SET sp_change_line1    = ABS(15XY700PM.NN(39) - 15TC001SP_OLD.PV);
&           SET 15TC001.SPTV       = 15XY700PM.NN(39);
&           SET 15TC001.RAMPTIME   = sp_change_line1 * 2; 
&           SET 15TC001.TVPROC     = RUN; 
&           SET 15TC001.MODATTR    = OPERATOR;
&           SET 15TC001SP_OLD.PV   = 15XY700PM.NN(39);
&           SET 15TC001FL1.PV      = OFF )
   
--
--  If ramp not active sets 15TC002 ramp parameters         
--
    
IF 15TC002.MODE = AUTO AND 15TC002FL1.PV = ON AND 15TC002.TVPROC = OFF THEN( 
&           SET 15TC002.MODATTR    = PROGRAM; 
&           SET sp_change_line2    = ABS(15XY700PM.NN(69) - 15TC002SP_OLD.PV);
&           SET 15TC002.SPTV       = 15XY700PM.NN(69);
&           SET 15TC002.RAMPTIME   = sp_change_line2 * 2; 
&           SET 15TC002.TVPROC     = RUN; 
&           SET 15TC002.MODATTR    = OPERATOR;
&           SET 15TC002SP_OLD.PV   = 15XY700PM.NN(69);
&           SET 15TC002FL1.PV      = OFF )
--  
--  If previous ramp has not concluded stops previous ramp and resets 15TC002 
--  ramp parameters.
--        
IF 15TC002.MODE = AUTO AND 15TC002FL1.PV = ON AND 15TC002.TVPROC = RUN THEN( 
&           SET 15TC002.MODATTR    = PROGRAM; 
&           SET 15TC002.TVPROC     = OFF; 
&           SET sp_change_line2    = ABS(15XY700PM.NN(69) - 15TC002SP_OLD.PV);
&           SET 15TC002.SPTV       = 15XY700PM.NN(69);
&           SET 15TC002.RAMPTIME   = sp_change_line2 * 2; 
&           SET 15TC002.TVPROC     = RUN; 
&           SET 15TC002.MODATTR    = OPERATOR;
&           SET 15TC002SP_OLD.PV   = 15XY700PM.NN(69);
&           SET 15TC002FL1.PV      = OFF )
   
END TMP_RMP