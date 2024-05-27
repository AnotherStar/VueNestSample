import { Injectable } from '@nestjs/common';
import { ItemsList } from './product.controller';
import { productsDatabase, Product } from './products.database';

export interface ItemsFilter {
    searchString?: string;
    offset?: number;
}

export const delay = (ms: number) => {
    return new Promise(r => setTimeout(r, ms));
};

export const randomBetween = (min: number, max: number, round?: true) => {
    let random = Math.random() * (max - min) + min;
    return round ? Math.round(random) : random;
};

@Injectable()
export class ProductService {
    async getList(filter?: ItemsFilter): Promise<ItemsList<Product>> {
        //!todo filter works
        await delay(randomBetween(100, 1000));

        let items = productsDatabase;

        const searchString = filter?.searchString ?? '';

        if (searchString) {
            items = items.filter(item =>
                item.name.toLowerCase().includes(searchString.toLowerCase())
            );
        }

        const offset = filter?.offset ?? 0;
        const limit = 10;

        return {
            total: items.length,
            limit,
            offset,
            items: items.slice(offset, offset + limit),
        };
    }

    async getItem(itemId: string): Promise<Product | undefined> {
        await delay(randomBetween(100, 500));
        return productsDatabase.find(x => x.id === itemId);
    }
}
