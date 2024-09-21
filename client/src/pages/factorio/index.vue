<template>
    <div class="relative">
        <div
            v-for="(creep, creepIndex) in creeps"
            :key="`creep_${creepIndex}`"
            class="bg-gray-500 absolute w-2 h-2 rounded-full"
            :style="{
                left: creep.position.x * 50 + 'px',
                top: creep.position.y * 50 + 'px',
            }"
        ></div>
        <table>
            <tbody>
                <tr v-for="row in map">
                    <td
                        v-for="cell in row"
                        @click="() => (selectedCell = cell)"
                        :style="{
                            width: '50px',
                            height: '50px',
                        }"
                    >
                        <div v-if="cell?.unit">
                            <div
                                v-if="!!(cell.unit instanceof Conveyor)"
                                @click="cell.unit.toggleDirection()"
                            >
                                {{ cell.unit.direction }}
                            </div>
                            <template v-if="!!(cell.unit instanceof Tower100)">1</template>
                            <template v-if="!!(cell.unit instanceof Tower200)">2</template>
                        </div>
                        <div v-else>&nbsp;</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>

    <pre>{{ user }}</pre>

    <pre>selectedCell: {{ selectedCell }}</pre>

    <button
        v-for="(Unit, UnitIndex) in Units"
        :key="`Unit_${UnitIndex}`"
        @click="() => selectedCell && build(selectedCell, Unit)"
        :disabled="selectedCell?.unit"
    >
        {{ Unit.name }} ({{ Unit.price }})
    </button>
</template>

<script setup lang="ts">
import { ref, PropType, watch, computed, reactive, onMounted } from 'vue';

const width = ref(10);
const height = ref(10);

enum Direction {
    'up',
    'right',
    'down',
    'left',
}
abstract class AbstractUnit {
    static title: string;
    static price: number;

    update(ms: number) {
        if (!this.target) this.target = this.getTarget()
    }

    target: Creep | undefined;

    getTarget(){
        creeps.value.find(creep => {
        
            const distance = Math.sqrt(creep.position.x - this)
        })
    }

}

class Tower100 extends AbstractUnit {
    static title = 'Tower-100';
    static price = 100;
}

class Tower200 extends AbstractUnit {
    static title = 'Tower-200';
    static price = 200;
}

class Conveyor extends AbstractUnit {
    static title = 'Конвейер';
    static price = 25;

    direction: Direction = Direction.up;

    toggleDirection() {
        switch (this.direction) {
            case Direction.up: {
                this.direction = Direction.right;
                return;
            }
            case Direction.right: {
                this.direction = Direction.down;
                return;
            }
            case Direction.down: {
                this.direction = Direction.left;
                return;
            }
            case Direction.left: {
                this.direction = Direction.up;
                return;
            }
        }
    }
}

type Unit = Conveyor | Tower100 | Tower200;
type UnitConstructor = typeof Conveyor | typeof Tower100 | typeof Tower200;

const Units = [Conveyor, Tower100, Tower200];

interface Cell {
    x: number;
    y: number;
    unit?: Unit;
}

const user = reactive({
    money: 1000,
    points: 0,
});

class Creep {
    health = 100;

    speed = 0.015;

    position = {
        x: 0,
        y: 0,
        a: Math.PI / 4,
    };

    update(ms: number) {
        this.position.x += Math.cos(this.position.a) * (ms / 1000) * this.speed;
        this.position.y += Math.sin(this.position.a) * (ms / 1000) * this.speed;
    }
}

class Bullet {
    position = {
        x: 0,
        y: 0,
        a: 0,
    };

    speed = 0.05;
    lifetime = 1000;

    update(ms: number) {
        this.position.x += Math.cos(this.position.a) * (ms / 1000) * this.speed;
        this.position.y += Math.sin(this.position.a) * (ms / 1000) * this.speed;
        this.lifetime -= ms;
        if (this.lifetime < 0) removeBullet(this);
    }
}

const creeps = ref<Creep[]>([]);

const map = ref<(Cell | undefined)[][]>([]);

const selectedCell = ref<Cell | undefined>();

const build = (cell: Cell, Unit: UnitConstructor) => {
    if (cell.unit) throw new Error('Unit exist');
    if (user.money < Unit.price) throw new Error('Too expensive');
    const unit = new Unit();
    user.money -= Unit.price;

    map.value[cell.x][cell.y] = {
        x: cell.x,
        y: cell.y,
        unit,
    };

    selectedCell.value = map.value[cell.x][cell.y];
};

watch(
    [width, height],
    () => {
        for (let x = 0; x < width.value; x++) {
            map.value[x] = [];
            for (let y = 0; y < width.value; y++) {
                map.value[x][y] = {
                    x,
                    y,
                    unit: undefined,
                };
            }
        }
    },
    {
        immediate: true,
    },
);

const step = (ms: number) => {
    map.value.forEach(row => {
        row.forEach(cell => {
            if (!cell?.unit) return;
            cell.unit.update(50);
        });
    });

    if (creeps.value.length < 10) {
        const creep = new Creep();
        creeps.value.push(creep);
    }

    creeps.value.forEach(creep => {
        creep.update(ms);
    });

    requestAnimationFrame(step);
};

const bullets = ref<Bullet[]>([]);

const removeBullet = (bullet: Bullet) => {
    const index = bullets.value.indexOf(bullet);
    bullets.value.splice(index, 1);
};

onMounted(() => {
    console.log(map.value);
    requestAnimationFrame(step);
});
</script>
