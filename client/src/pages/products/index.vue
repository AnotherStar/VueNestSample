<template>
    <div class="p-4 flex flex-col space-y-4">
        <input
            type="text"
            v-model="searchInput"
            class="border"
            placeholder="Поиск по товарам"
        />

        <table>
            <tbody>
                <tr v-for="(product, productIndex) in products" :key="`product_${productIndex}`">
                    <td>
                        <RouterLink :to="`/products/${product.id}`">{{ product.name }}</RouterLink>
                    </td>
                    <td>
                        {{ product.price }}
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="flex flex-row space-x-4 items-center">
            <button @click="handlePreviousPage">Назад</button>
            <div @click="askPage">{{ page }} / {{ totalPages }}</div>
            <button @click="handleNextPage">Вперед</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, reactive } from 'vue';
import useApi from '@composables/useApi';
import { debounce } from 'lodash';

import { ItemsFilter } from '@server/product/product.service';
import { Product } from '@server/product/products.database';

const { Api } = useApi();

const filter = reactive<ItemsFilter>({
    searchString: '',
    offset: 0,
});

const searchInput = ref('');
const products = ref<Product[]>([]);
const page = ref(1);
const total = ref(0);
const totalPages = ref(0);
let currentRequest: Promise<void> | null = null;

const fetchProducts = async () => {
    if (currentRequest) {
        currentRequest = null;
    }

    currentRequest = Api.Product.getList(filter).then(data => {
        products.value = data.items;
        total.value = data.total;
        totalPages.value = Math.ceil(data.total / data.limit);
        currentRequest = null;
    });
};

const debouncedFetchProducts = debounce(fetchProducts, 300);

watch(searchInput, (newSearchString) => {
    filter.searchString = newSearchString;
    page.value = 1;
    filter.offset = 0;

    debouncedFetchProducts();
});

watch(page, () => {
    filter.offset = (page.value - 1) * 10;
    fetchProducts();
});

fetchProducts();

const handlePreviousPage = () => {
    if (page.value > 1) {
        page.value--;
    }
};

const handleNextPage = () => {
    if (page.value < totalPages.value) {
        page.value++;
    }
};
</script>
