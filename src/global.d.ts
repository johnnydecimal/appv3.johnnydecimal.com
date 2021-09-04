import type {
    JdProjectNumbers,
    JdAreaNumbers,
    JdCategoryNumbers,
    JdIdNumbers,
    JdItem
} from '@types'

interface DatabaseReactContextValue {
    changeDatabase: (newDatabase: JdProjectNumbers) => void;
    selectArea: (area: JdAreaNumbers | null) => void;
    selectCategory: (category: JdCategoryNumbers | null) => void;
    selectId: (id: JdIdNumbers | null) => void;
    insertItem: (item: JdItem) => void;
  };