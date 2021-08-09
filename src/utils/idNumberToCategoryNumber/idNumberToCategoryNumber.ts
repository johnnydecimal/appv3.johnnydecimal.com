// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { JdCategoryNumbers, JDIdNumbers } from "@types";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const idNumberToCategoryNumber = (
  id: JDIdNumbers
): JdCategoryNumbers => {
  return id.slice(0, 2) as JdCategoryNumbers;
};
