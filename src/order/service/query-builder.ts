import { Item } from '../model/entities/item.entity.js';
import { Order } from '../model/entities/order.entity.js';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { type SearchCriteria } from '../model/types/searchCriteria.type.js';
import { getLogger } from '../../logger/logger.js';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE, Pageable } from '../utils/pageable.js';
import { FindByIdParams } from '../model/interface/queryParams.interface.js';

@Injectable()
export class OrderQueryBuilder {
    readonly #orderRepository: Repository<Order>;
    readonly #logger = getLogger(OrderQueryBuilder.name);

    readonly #orderAlias = `${Order.name
        .charAt(0)
        .toLowerCase()}${Order.name.slice(1)}`;

    readonly #itemAlias = `${Item.name
        .charAt(0)
        .toLowerCase()}${Item.name.slice(1)}`;

    constructor(@InjectRepository(Order) orderRepository: Repository<Order>) {
        this.#orderRepository = orderRepository;
    }

    buildId({ id, withOrderedItem = false }: FindByIdParams) {
        const queryBuilder = this.#orderRepository.createQueryBuilder(this.#orderAlias);

        if (withOrderedItem) {
            queryBuilder.leftJoinAndSelect(
                `${this.#orderAlias}.items`,
                this.#itemAlias,
            );
        }

        queryBuilder.where(`${this.#orderAlias}.id = :id`, { id: id });
        return queryBuilder;
    }

    build(
        withItems: boolean = false,
        { ...props }: SearchCriteria,
        pageable: Pageable,
    ): SelectQueryBuilder<Order> {
        this.#logger.debug('build: withItems=%s', withItems);
        this.#logger.debug('build: props=%o', props);
        this.#logger.debug('build: pageable=%o', pageable);

        let queryBuilder = this.#orderRepository.createQueryBuilder(
            this.#orderAlias,
        );

        if (withItems) {
            queryBuilder.leftJoinAndSelect(
                `${this.#orderAlias}.items`,
                this.#itemAlias,
            );
        }

        const { createdAfter, createdBefore, ...filterProps } = props;
        let useWhere = true;

        if (createdAfter) {
            queryBuilder = queryBuilder.where(`${this.#orderAlias}.created >= :createdAfter`, {
                createdAfter,
            });
            useWhere = false;
        }

        if (createdBefore) {
            queryBuilder = useWhere
                ? queryBuilder.where(`${this.#orderAlias}.created <= :createdBefore`, {
                    createdBefore,
                })
                : queryBuilder.andWhere(`${this.#orderAlias}.created <= :createdBefore`, {
                    createdBefore,
                });
            useWhere = false;
        }

        Object.entries(filterProps).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            const param = { [key]: value };
            queryBuilder = useWhere
                ? queryBuilder.where(`${this.#orderAlias}.${key} = :${key}`, param)
                : queryBuilder.andWhere(`${this.#orderAlias}.${key} = :${key}`, param);
            useWhere = false;
        });



        if (pageable?.size === 0) {
            return queryBuilder;
        }
        const size = pageable?.size ?? DEFAULT_PAGE_SIZE;
        const number = pageable?.number ?? DEFAULT_PAGE_NUMBER;
        const skip = number * size;
        this.#logger.debug('take=%s, skip=%s', size, skip);
        return queryBuilder.take(size).skip(skip);
    }
}
