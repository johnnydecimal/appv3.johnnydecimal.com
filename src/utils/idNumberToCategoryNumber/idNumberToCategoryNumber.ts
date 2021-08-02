// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { JDCategoryNumbers, JDIdNumbers } from "@types";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const idNumberToCategoryNumber = (
  id: JDIdNumbers
): JDCategoryNumbers => {
  return id.slice(0, 2) as JDCategoryNumbers;
};
