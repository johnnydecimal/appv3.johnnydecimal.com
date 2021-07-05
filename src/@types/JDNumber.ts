import type { JDArea, JDCategory, JDID } from ".";

/**
 * JDNumber describes *any* of the valid JD numbers. Be careful.
 */
type JDNumber = JDArea | JDCategory | JDID;

export default JDNumber;
