/**
 * Generic Array CRUD Operations Composable
 * Provides reusable create, read, update, delete, and move operations for arrays
 */

export function useArrayCRUD<T>(
    storeGetter: () => T[],
    storeSetter: (items: T[]) => void,
    defaultItem: () => T,
) {
    return {
        /**
         * Add a new item to the array
         */
        add() {
            const items = [...storeGetter()];
            items.push(defaultItem());
            storeSetter(items);
        },

        /**
         * Update a specific field of an item at the given index
         */
        update(index: number, field: keyof T, value: unknown) {
            const items = [...storeGetter()];
            if (items[index]) {
                items[index] = {
                    ...items[index],
                    [field]: value,
                };
                storeSetter(items);
            }
        },

        /**
         * Remove an item at the given index
         */
        remove(index: number) {
            const items = [...storeGetter()];
            items.splice(index, 1);
            storeSetter(items);
        },

        /**
         * Move an item from one index to another
         */
        move(fromIndex: number, toIndex: number) {
            const items = [...storeGetter()];
            const [item] = items.splice(fromIndex, 1);
            items.splice(toIndex, 0, item);
            storeSetter(items);
        },
    };
}

/**
 * Nested Achievements CRUD Operations
 * For entities with nested achievements arrays (Experience, Internship, Volunteering)
 */
export function useNestedAchievementsCRUD<T extends { achievements: Array<{ text: string }> }>(
    storeGetter: () => T[],
    storeSetter: (items: T[]) => void,
) {
    return {
        /**
         * Add a new achievement to an item
         */
        addAchievement(itemIndex: number, text = '') {
            const items = [...storeGetter()];
            if (items[itemIndex]) {
                items[itemIndex] = {
                    ...items[itemIndex],
                    achievements: [...items[itemIndex].achievements, { text }],
                };
                storeSetter(items);
            }
        },

        /**
         * Update an achievement's text
         */
        updateAchievement(itemIndex: number, achievementIndex: number, text: string) {
            const items = [...storeGetter()];
            if (items[itemIndex]?.achievements[achievementIndex]) {
                const achievements = [...items[itemIndex].achievements];
                achievements[achievementIndex] = { text };
                items[itemIndex] = {
                    ...items[itemIndex],
                    achievements,
                };
                storeSetter(items);
            }
        },

        /**
         * Remove an achievement from an item
         */
        removeAchievement(itemIndex: number, achievementIndex: number) {
            const items = [...storeGetter()];
            if (items[itemIndex]) {
                const achievements = [...items[itemIndex].achievements];
                achievements.splice(achievementIndex, 1);
                items[itemIndex] = {
                    ...items[itemIndex],
                    achievements,
                };
                storeSetter(items);
            }
        },

        /**
         * Move an achievement within an item's achievements array
         */
        moveAchievement(itemIndex: number, fromIndex: number, toIndex: number) {
            const items = [...storeGetter()];
            if (items[itemIndex]) {
                const achievements = [...items[itemIndex].achievements];
                const [item] = achievements.splice(fromIndex, 1);
                achievements.splice(toIndex, 0, item);
                items[itemIndex] = {
                    ...items[itemIndex],
                    achievements,
                };
                storeSetter(items);
            }
        },
    };
}
