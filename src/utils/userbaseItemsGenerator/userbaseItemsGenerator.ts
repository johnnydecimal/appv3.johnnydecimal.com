// === External ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { nanoid } from "nanoid";

// === Internal ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import { shuffleArray } from "utils";

// === Types    ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
import {
  JdAreaNumbers,
  JDCategoryNumbers,
  JDIdNumbers,
  JDProjectNumbers,
  UserbaseItem,
} from "@types";

// === Main ===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===-===
/**
 * `userbaseItemsGenerator` takes simple arrays of areas, categories, and ID
 * strings and generates a Userbase-like return array with each of the inputs
 * as a `UserbaseItem` object. It shuffles the final array so it's more
 * representative of the array you get from Userbase.
 *
 * Note that **no consistency checks** are performed here. Junk in, junk out.
 */
export const userbaseItemsGenerator = (
  jdProjects?: JDProjectNumbers[],
  jdAreas?: JdAreaNumbers[],
  jdCategories?: JDCategoryNumbers[],
  jdIds?: JDIdNumbers[]
) => {
  // console.log("Starting to create the über-JDSystem.");
  // const startTime = window.performance.now();

  // Set up the return array
  const userbaseItems: UserbaseItem[] = [];

  // Push all projects to it
  if (jdProjects) {
    jdProjects.forEach((project) => {
      userbaseItems.push({
        itemId: nanoid(),
        createdBy: {
          timestamp: new Date(),
          username: "john",
        },
        item: {
          jdType: "project",
          jdNumber: project,
          jdTitle: `Project ${project}`,
        },
      });
    });
  }

  // Push all areas to it
  if (jdAreas) {
    jdAreas.forEach((area) => {
      userbaseItems.push({
        itemId: nanoid(),
        createdBy: {
          timestamp: new Date(),
          username: "john",
        },
        item: {
          jdType: "area",
          jdNumber: area,
          jdTitle: `Area ${area}`,
        },
      });
    });
  }
  // Push all categories to it
  if (jdCategories) {
    jdCategories.forEach((category) => {
      userbaseItems.push({
        itemId: nanoid(),
        createdBy: {
          timestamp: new Date(),
          username: "john",
        },
        item: {
          jdType: "category",
          jdNumber: category,
          jdTitle: `Category ${category}`,
        },
      });
    });
  }
  // Push all IDs to it
  if (jdIds) {
    jdIds.forEach((id) => {
      userbaseItems.push({
        itemId: nanoid(),
        createdBy: {
          timestamp: new Date(),
          username: "john",
        },
        item: {
          jdType: "id",
          jdNumber: id,
          jdTitle: `ID ${id}`,
        },
      });
    });
  }

  // Shuffle it
  const shuffledUserbaseItems: UserbaseItem[] = shuffleArray(userbaseItems);

  // const endTime = window.performance.now();
  // console.log(
  //   `Creating all possibilities and shuffling them took ${
  //     endTime - startTime
  //   }ms.`
  // );

  return shuffledUserbaseItems;
};
