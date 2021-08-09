// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { JdAreaNumbers, JdCategoryNumbers } from "@types";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
export const categoryNumberToAreaNumber = (
  category: JdCategoryNumbers
): JdAreaNumbers => {
  /**
   * We ts-ignore later, but testing shows that it isn't possible to write a
   * call to this function that doesn't take a valid JDCategoryNumber, so we're
   * not doing any further testing here.
   */
  const categoryFirstNumberToAreaDictionary = {
    "0": "00-09",
    "1": "10-19",
    "2": "20-29",
    "3": "30-39",
    "4": "40-49",
    "5": "50-59",
    "6": "60-69",
    "7": "70-79",
    "8": "80-89",
    "9": "90-99",
  };
  const firstNumber = category.charAt(0);
  // @ts-ignore
  return categoryFirstNumberToAreaDictionary[firstNumber];
};
