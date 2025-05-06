import { Module } from "@nestjs/common";
import { ShoppingCartClient } from "./shopping-cart.client.js";
import { ShoppingCartService } from "./shopping-cart.service.js";

@Module({
    providers: [ShoppingCartClient, ShoppingCartService],
    exports: [ShoppingCartService],
})
export class ShoppingCartModule { }
