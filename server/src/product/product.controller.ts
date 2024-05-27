import {
    Controller,
    DefaultValuePipe,
    Get,
    Param,
    ParseFloatPipe,
    ParseIntPipe,
    Query,
} from '@nestjs/common';
import { ItemsFilter, ProductService } from './product.service';
import { Product } from './products.database';

//!todo generic
export interface ItemsList<T> {
    total: number;
    limit: number;
    offset: number;
    items: T[];
}

@Controller('/product')
export class ProductController {
    constructor(private productService: ProductService) {}

    @Get('/')
    async getList(
        @Query('searchString') searchString?: string,
        @Query('offset', ParseIntPipe) offset: number = 0,
    ): Promise<ItemsList<Product>> {
        return await this.productService.getList({
            searchString,
            offset
        });
    }

    @Get('/:itemId')
    async getItem(@Param('itemId') itemId: string) {
        return this.productService.getItem(itemId);
    }
}
