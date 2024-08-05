<template>
    <div class="p-4">
        <button @click="() => generateField(fieldParameters)">Generate</button>
        <table v-if="field">
            <tbody>
                <tr v-for="(row, x) in field.cells" :key="`x_${x}`">
                    <td
                        v-for="(cell, y) in row"
                        :key="`x_${x}`"
                        class="h-[30px] align-middle w-[30px] text-center border"
                        @click="() => openCell(y, x)"
                        @contextmenu="e => toggleFlag(e, y, x)"
                        :class="{
                            'bg-gray-200': !cell.isOpen,
                        }"
                    >
                        <span class="text-blue-500 fa fa-flag" v-if="!cell.isOpen && cell.isFlag">
                            F
                        </span>
                        <span class="text-red-500 fa fa-bomb" v-if="cell.isBomb && cell.isOpen">
                            B
                        </span>
                        <span class="text-gray-500" v-else-if="cell.bombsAround && cell.isOpen">
                            {{ cell.bombsAround }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup lang="ts">
import { ref, PropType, watch, computed, reactive, watchEffect } from 'vue';

interface Cell {
    isFlag: boolean;
    isBomb: boolean;
    isOpen: boolean;
    bombsAround: number;
}

interface FieldParameters {
    width: number;
    height: number;
    minesCount: number;
}

const field = ref<{
    width: number;
    height: number;
    cells: Cell[][];
}>();

const fieldParameters = reactive<FieldParameters>({
    width: 10,
    height: 10,
    minesCount: 30,
});

const getRandomBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

Object.assign(window, { getRandomBetween });

const generateField = (fieldParameters: FieldParameters) => {
    if (fieldParameters.minesCount > fieldParameters.height * fieldParameters.width)
        throw new Error('too many bombs');

    const cells: Cell[][] = [];

    for (let y = 0; y < fieldParameters.height; y++) {
        cells[y] = [];
        for (let x = 0; x < fieldParameters.width; x++) {
            cells[y][x] = {
                isFlag: false,
                isBomb: false,
                isOpen: false,
                bombsAround: 0,
            };
        }
    }

    console.log(cells);

    let mines = fieldParameters.minesCount;
    while (mines) {
        const x = getRandomBetween(0, fieldParameters.width - 1);
        const y = getRandomBetween(0, fieldParameters.height - 1);
        const cell = cells[y][x];

        if (cell.isBomb) continue;

        cell.isBomb = true;

        around.forEach(([dx, dy]) => {
            const cell = cells[y + dy]?.[x + dx];
            if (cell) {
                cell.bombsAround++;
                console.log(x, y, dx, dy, cell);
            }
        });

        mines--;
    }

    field.value = {
        width: fieldParameters.width,
        height: fieldParameters.height,
        cells,
    };
};

const around = [
    [-1, 1],
    [-1, 0],
    [-1, -1],
    [0, 1],
    [0, -1],
    [1, 1],
    [1, 0],
    [1, -1],
];

const openCell = (x: number, y: number) => {
    const cell = field.value?.cells[y]?.[x];
    if (!cell) return;
    if (cell.isOpen) return;
    if (cell.isFlag) return;

    cell.isOpen = true;

    if (cell.isBomb)
        setTimeout(() => {
            alert('Вы проиграли');
            field.value?.cells.forEach(row => {
                row.forEach(cell => {
                    if (cell.isBomb) cell.isOpen = true;
                });
            });
        }, 100);

    if (cell.bombsAround) return;

    around.forEach(([dx, dy]) => openCellIfEmpty(x + dx, y + dy));
};

const openCellIfEmpty = (x: number, y: number) => {
    const cell = field.value?.cells[y]?.[x];
    if (!cell) return;
    if (cell.isOpen) return;
    if (cell.isBomb) return;
    if (cell.bombsAround) {
        cell.isOpen = true;
        return;
    }

    cell.isOpen = true;

    around.forEach(([dx, dy]) => openCellIfEmpty(x + dx, y + dy));
};

const toggleFlag = (event: MouseEvent, x: number, y: number) => {
    event.preventDefault();

    const cell = field.value?.cells[y]?.[x];
    if (!cell) return;

    cell.isFlag = !cell.isFlag;
};

watchEffect(() => {
    const allCells = field.value?.cells.flat();
    if (!allCells) return;

    if (allCells.every(x => x.isBomb || x.isOpen)) {
        setTimeout(() => {
            alert('Победа');
        }, 100);
    }
});
</script>
