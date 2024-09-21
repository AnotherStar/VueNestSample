<template>
    <div>item</div>
    <video ref="videoRef"></video>
    <canvas ref="canvasRef"></canvas>
    <button @click="refactorImageData">refactorImageData</button>
</template>

<script setup lang="ts">
import { ref, PropType, watch, computed, onMounted } from 'vue';

const props = defineProps({
    item: {
        type: String,
        required: true,
    },
});

const stream = ref();
const videoRef = ref<HTMLVideoElement>();
const canvasRef = ref<HTMLCanvasElement>();

const getCamera = async () => {
    stream.value = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280 / 4, height: 720 / 4 },
    });
};

watch([stream, videoRef], () => {
    if (!videoRef.value || !stream.value) return;
    videoRef.value.srcObject = stream.value;
    videoRef.value.play();
    refactorImageData();
});

onMounted(() => {
    getCamera();
});

let imageDataOld: ImageData = new ImageData(1280 / 4, 720 / 4);

const refactorImageData = () => {
    if (!canvasRef.value || !videoRef.value) return;

    const context = canvasRef.value.getContext('2d');
    if (!context) return;

    context.drawImage(videoRef.value, 0, 0, 1280 / 4, 720 / 4);

    const imageData = context.getImageData(0, 0, 1280 / 4, 720 / 4);

    imageDatas.push(imageData);
    if (imageDatas.length > 100) imageDatas.pop();

    for (let i = 0; i < imageData.data.length; i++) {
        if (i % 4 === 0) {
            imageData.data[i] = imageDatas.reduce((a, x) => a + x[i], 0) / imageDatas.length;
        }
    }

    context.putImageData(imageDataOld, 0, 0);

    window.requestAnimationFrame(refactorImageData);
};
</script>
