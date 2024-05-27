<template>
    <div class="p-4">
        <div v-if="loading" class="text-blue-500">Загрузка...</div>
        <ProductCard v-else-if="product" :product="product" />
        <div v-else class="text-red-500">Товар не найден</div>
    </div>
</template>

<script setup lang="ts">
import { ref, PropType, watch, computed } from 'vue';
import useApi from '@composables/useApi';
import { computedAsync } from '@vueuse/core';
import { Product } from '@server/product/products.database';

const { Api } = useApi();

const props = defineProps({
    itemId: {
        type: String,
        required: true,
    },
});

const loading = ref(true);
const product = ref<string | Product>("");

computedAsync(async () => {
    loading.value = true;

    product.value = await Api.Product.getItem(props.itemId);

    loading.value = false;
});
</script>
