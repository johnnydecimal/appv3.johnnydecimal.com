export const idNumberToCategoryNumber = (
  id: JdIdNumbers
): JdCategoryNumbers => {
  return id.slice(0, 2) as JdCategoryNumbers;
};
