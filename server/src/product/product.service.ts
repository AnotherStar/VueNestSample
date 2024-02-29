import { Injectable } from '@nestjs/common';
import { productsDatabase, Product } from './products.database';

export interface ItemsFilter {
    searchString?: string;
    priceMin?: number;
    priceMax?: number;
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
    async getList(filter?: ItemsFilter): Promise<Product[]> {
        //!todo filter works
        await delay(randomBetween(100, 1000));
        return productsDatabase;
    }

    async getItem(itemId: string): Promise<Product | undefined> {
        await delay(randomBetween(100, 500));
        return productsDatabase.find(x => x.id === itemId);
    }
}
