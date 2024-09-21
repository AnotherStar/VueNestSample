import { World, Edge, Vec2, Circle, Box, Polygon } from 'planck';
import { Renderer } from './render';
import './physics';

enum Color {
    'black' = 'black',
    'white' = 'white',
}

const CHIP_SIZE = 1000 / 1000;
const CHIP_OFFSET = 0;
const BAR_WIDTH = 500 / 1000;
const BOARD_HEIGHT = CHIP_SIZE * 10;
const BOARD_WIDTH = CHIP_SIZE * 12 + BAR_WIDTH;

console.log({
    BOARD_WIDTH,
});
export class Game {
    public world: World;
    private renderer: Renderer;
    private velocityIterations = 4;
    private positionIterations = 8;

    constructor(element: HTMLDivElement) {
        this.world = new World({
            gravity: {
                x: 0,
                y: 0,
            },
            allowSleep: false,
        });

        this.renderer = new Renderer(this, element);

        const initPositions: {
            color: Color;
            quantities: number[];
        }[] = [
            {
                color: Color.black,
                quantities: [
                    2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, 0,
                ],
                // quantities: Array(24).fill(2),
            },
            // {
            //     color: Color.white,
            //     quantities: [
            //         2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 3, 0, 5, 0, 0, 0, 0, 0,
            //     ],
            // },
        ];

        initPositions.forEach(({ color, quantities }) => {
            quantities.forEach((quantity, point) => {
                new Point(this, point + 1);
                for (let index = 0; index < quantity; index++) {
                    new Chip(this, color, point + 1, index);
                }
            });
        });

        this.drawBorder();

        window.requestAnimationFrame(() => {
            this.step();
        });
    }

    prevNow: number = Date.now();

    step() {
        const ms = Date.now() - this.prevNow;
        this.prevNow = Date.now();
        this.world.step(ms / 1000, this.velocityIterations, this.positionIterations);
        this.renderer.renderWorld(ms);
        window.requestAnimationFrame(() => {
            this.step();
        });
    }

    private drawBorder() {
        this.world
            .createBody({
                position: {
                    x: BOARD_WIDTH / 2,
                    y: BOARD_HEIGHT + CHIP_SIZE / 2,
                },
                userData: {
                    render: {
                        color: 'gray',
                    },
                },
            })
            .createFixture(Box(BOARD_WIDTH / 2, CHIP_SIZE / 2));

        this.world
            .createBody({
                position: {
                    x: BOARD_WIDTH / 2,
                    y: -CHIP_SIZE / 2,
                },
                userData: {
                    render: {
                        color: 'gray',
                    },
                },
            })
            .createFixture(Box(BOARD_WIDTH / 2, CHIP_SIZE / 2));

        this.world
            .createBody({
                position: {
                    x: BOARD_WIDTH + CHIP_SIZE / 2,
                    y: BOARD_HEIGHT / 2,
                },
                userData: {
                    render: {
                        color: 'gray',
                    },
                },
            })
            .createFixture(Box(CHIP_SIZE / 2, BOARD_HEIGHT / 2));

        this.world
            .createBody({
                position: {
                    x: -CHIP_SIZE / 2,
                    y: BOARD_HEIGHT / 2,
                },
                userData: {
                    render: {
                        color: 'gray',
                    },
                },
            })
            .createFixture(Box(CHIP_SIZE / 2, BOARD_HEIGHT / 2));

        this.world
            .createBody({
                position: {
                    x: BOARD_WIDTH / 2,
                    y: BOARD_HEIGHT / 2,
                },
                userData: {
                    render: {
                        color: 'gray',
                    },
                },
            })
            .createFixture(Box(BAR_WIDTH / 2, BOARD_HEIGHT / 2));
    }
}

class Point {
    constructor(private game: Game, public point: number) {
        const position =
            point <= 12
                ? {
                      x:
                          (12 - point) * (CHIP_SIZE + CHIP_OFFSET) +
                          CHIP_SIZE / 2 +
                          (point <= 6 ? BAR_WIDTH : 0),
                      y: 0,
                  }
                : {
                      x: (point - 12) * (CHIP_SIZE + CHIP_OFFSET) + (point > 18 ? BAR_WIDTH : 0),
                      y: BOARD_HEIGHT,
                  };

        const angle = point < 12 ? 0 : Math.PI;

        const border = this.game.world
            .createBody({
                type: 'static',
                position,
                angle,
                userData: {},
            })
            .createFixture(Circle(CHIP_SIZE / 10));

        return;

        const vertices: [number, number][][] = [
            [
                [0.5, 0.5],
                [0.5, -0.5],
                [-0.5, -0.5],
                [-0.5, 0.5],
            ],
            // [
            //     [0, 0],
            //     [-1, 0],
            //     [-1, 1],
            // ],
        ];

        vertices.forEach(vertices => {
            const polygon = new Polygon(
                vertices.map(([x, y]) => Vec2((x * CHIP_SIZE) / 2, (y * CHIP_SIZE) / 2)),
            );
            border.createFixture(polygon);
        });
    }
}

class Chip {
    constructor(private game: Game, public color: Color, point: number, indexOnPoint: number) {
        console.log(point);
        const position =
            point <= 12
                ? {
                      x:
                          (12 - point) * (CHIP_SIZE + CHIP_OFFSET) +
                          CHIP_SIZE / 2 +
                          (point < 6 ? BAR_WIDTH : 0),
                      y: CHIP_SIZE / 2 + indexOnPoint * (CHIP_SIZE + CHIP_OFFSET),
                  }
                : {
                      x: (point - 12) * (CHIP_SIZE + CHIP_OFFSET) + (point > 18 ? BAR_WIDTH : 0),
                      y: BOARD_HEIGHT - CHIP_SIZE / 2 - indexOnPoint * (CHIP_SIZE + CHIP_OFFSET),
                  };

        const body = this.game.world.createBody({
            type: 'dynamic',
            userData: {
                render: {
                    color,
                },
            },
            position,
            // angularDamping: 0.4 + Math.random() * 0.2,
            // linearDamping: 1 + Math.random() * 0.4,
        });

        body.createFixture({
            shape: Circle((0.5 * CHIP_SIZE) / 2),
            restitution: 0.25,
            density: 1,
            friction: 0.4,
        });

        setInterval(() => {
            body.setLinearDamping(1 + Math.random());
        }, 500 + Math.random() * 500);
    }

    changeFriction() {}
}
