<template>
    <button @click="() => game.rollDices()">
        {{ game.dices.join(' + ') }}
    </button>
    <table>
        <tbody>
            <tr v-for="points in [getRangeBetween(12, 1), getRangeBetween(13, 24)]">
                <td v-for="point in points" style="vertical-align: top">
                    {{ point }}

                    <div
                        v-for="chip in game.chips.filter(x => x.point === point)"
                        :class="{
                            'bg-gray-800': chip.color === Color.black,
                            'bg-gray-200': chip.color === Color.white,
                        }"
                        class="rounded-full w-4 h-4"
                        @click="() => game.go(chip, game.dices[0])"
                    ></div>
                </td>
            </tr>
        </tbody>
    </table>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';

const field = ref();

const chips = [];

enum Color {
    'black' = 'black',
    'white' = 'white',
}

class Chip {
    constructor(public color: Color, public point: number) {}
}

interface Player {
    color: Color;
}

class Game {
    constructor() {}

    chips: Chip[] = [];

    dices: [number, number] = [1, 1];

    start() {
        const initPositions: {
            color: Color;
            quantities: number[];
        }[] = [
            {
                color: Color.black,
                quantities: [
                    2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, 0,
                ].reverse(),
            },
            {
                color: Color.white,
                quantities: [
                    2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, 0,
                ],
            },
        ];

        initPositions.forEach(({ color, quantities }) => {
            quantities.forEach((quantity, index) => {
                for (let i = 0; i < quantity; i++) {
                    const chip = new Chip(color, index + 1);
                    this.chips.push(chip);
                }
            });
        });
    }

    rollDices() {
        this.dices = [randomIntegerBetween(1, 6), randomIntegerBetween(1, 6)];
    }

    go(chip: Chip, points: number): boolean {
        if (chip.color === Color.black) points = -points;

        if (chip.point + points > 24) return false;
        if (chip.point + points < 1) return false;

        const targetChips = this.getChips(chip.point + points);
        const isEnemyColor = targetChips[0] && targetChips[0].color !== chip.color;

        if (isEnemyColor) {
            if (targetChips.length > 1) return false;
            targetChips[0].point = 0;
        }

        chip.point += points;
        return true;
    }

    getChips(point: number) {
        return this.chips.filter(x => x.point === point);
    }
}

const game = ref(new Game());

Object.assign(window, { game });

const randomIntegerBetween = (min: number, max: number) => {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
};

const getRangeBetween = (start: number, end: number) => {
    const direction = start < end ? 1 : -1;
    return Array(Math.abs(end - start) + 1)
        .fill()
        .map((_, idx) => start + idx * direction);
};

onMounted(() => {
    game.value.start();
});
</script>
