<template>
    <div class="fixed z-10 top-0 left-0">
        <button @click="() => start()" class="z-20 absolute" v-if="!isRunning">Start</button>
        <div id="board"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef } from 'vue';
import { Game } from './game';

const game = shallowRef<Game>();

const onDeviceOrientation = (event: DeviceMotionEvent) => {
    if (!game.value) return;

    game.value.world.setGravity({
        x: event.accelerationIncludingGravity?.x || 0,
        y: -event.accelerationIncludingGravity?.y || 0,
    });
};

onMounted(() => {
    const board = document.getElementById('board') as HTMLDivElement;
    game.value = new Game(board);
    Object.assign(window, { game: game.value });
});

const isRunning = ref(false);

const start = () => {
    if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                isRunning.value = response === 'granted';
                if (response == 'granted')
                    window.addEventListener('devicemotion', onDeviceOrientation);
            })
            .catch(alert);
    } else {
        alert('DeviceMotionEvent is not defined');
    }
};
</script>
