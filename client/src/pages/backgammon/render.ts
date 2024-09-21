import * as PIXI from 'pixi.js';
import { Fixture, World, Body, Vec2, MouseJoint } from 'planck';

import { DisplayObject, Graphics } from 'pixi.js';

import { Game } from './game';

export class Renderer {
    application: PIXI.Application;

    get scale() {
        return 20;
    }

    get lineWidth() {
        return 0.0;
    }

    constructor(private game: Game, element: HTMLDivElement) {
        this.application = new PIXI.Application({
            antialias: false,
            backgroundColor: 0xeeeeee,
            autoStart: true,
            resolution: window.devicePixelRatio,
            width: window.innerWidth, // this.resolution,
            height: window.innerHeight, // this.resolution,
            eventFeatures: {
                move: true,
            },
        });

        element.appendChild(this.application.view as unknown as Node);

        this.application.stage.on('mouseup', () => this.destroyMouseJoint());

        this.application.stage.on('mouseleave', () => this.destroyMouseJoint());

        this.application.stage.on('mousemove', e => {
            if (!this.mouseJoint) return;
            this.mouseJoint.setTarget({
                x: e.pageX / this.scale,
                y: e.pageY / this.scale,
            });
        });

        this.application.stage.hitArea = this.application.screen;

        this.application.stage.eventMode = 'static';

        this.application.stage.position.x += 50;
        this.application.stage.position.y += 50;
    }

    mouseJoint: MouseJoint | undefined;

    destroyMouseJoint() {
        if (!this.mouseJoint) return;
        this.game.world.destroyJoint(this.mouseJoint);
        this.mouseJoint = undefined;
    }

    renderWorld(ms: number) {
        this.game.world.forEachBody(body => {
            this.renderBody(body);
        });
    }

    private getBodyContainer(body: Body): {
        container: PIXI.Container;
        graphics?: PIXI.Graphics;
    } {
        let container: PIXI.Container | null = this.application.stage.getChildByName(
            body.userData._id,
        );

        if (container) {
            return {
                container,
                graphics: container.getChildByName('graphics') || undefined,
            };
        }

        container = new PIXI.Container();
        container.name = body.userData._id;

        let graphics: PIXI.Graphics | undefined = undefined;

        graphics = new PIXI.Graphics();
        graphics.name = 'graphics';
        container.addChild(graphics);

        const color = body.userData.render?.color || 0xffffff;
        const fixturesCount = body.getFixturesCount();

        if (body.userData.render?.fillOnly) fillAlpha = 1;
        if (fixturesCount > 1 && body.userData.render?.outer) fillAlpha = fillAlpha / 2;

        graphics.beginFill(color);

        let width = this.lineWidth;
        if (body.userData.render?.fillOnly) width = 0;

        graphics.lineStyle({
            width: fixturesCount > 1 && body.userData.render?.outer ? width / 4 : width,
            color,
            cap: PIXI.LINE_CAP.ROUND,
        });

        body.forEachFixture(fixture => {
            const shape = fixture.getShape();
            if (shape.getType() === 'polygon') {
                const lastPoint = shape.m_vertices[shape.m_vertices.length - 1];
                if (!lastPoint) throw '!lastPoint';

                graphics.moveTo(lastPoint.x * this.scale, lastPoint.y * this.scale);
                shape.m_vertices.forEach(verticle => {
                    graphics.lineTo(verticle.x * this.scale, verticle.y * this.scale);
                });
            } else if (shape.getType() === 'circle') {
                graphics.drawCircle(
                    shape.m_p.x * this.scale,
                    shape.m_p.y * this.scale,
                    shape.m_radius * this.scale,
                );
            }
        });

        if (fixturesCount > 1 && body.userData.render?.outer) {
            graphics.lineStyle({
                width,
                color,
                cap: PIXI.LINE_CAP.ROUND,
            });

            const lastPoint = body.userData.render.outer[body.userData.render.outer.length - 1];
            if (!lastPoint) throw '!lastPoint';
            graphics.moveTo(lastPoint.x * this.scale, lastPoint.y * this.scale);

            body.userData.render?.outer.forEach(point => {
                graphics.lineTo(point.x * this.scale, point.y * this.scale);
            });
        }

        graphics.endFill();

        graphics.on('mousedown', e => {
            if (this.mouseJoint) return;
            const world = body.getWorld();

            const mouseGround = world.createBody({
                userData: {},
            });

            this.mouseJoint = new MouseJoint(
                { maxForce: 10, dampingRatio: 0.1, frequencyHz: 20 },
                mouseGround,
                body,
                {
                    x: e.pageX / this.scale,
                    y: e.pageY / this.scale,
                },
            );

            world.createJoint(this.mouseJoint);
        });

        graphics.eventMode = 'static';

        this.application.stage.addChild(container as DisplayObject);

        return {
            container,
            graphics,
        };
    }

    private renderBody(body: Body) {
        const { container, graphics } = this.getBodyContainer(body);

        if (graphics) {
            graphics.position.x = body.getPosition().x * this.scale;
            graphics.position.y = body.getPosition().y * this.scale;
            graphics.angle = radiansToDegrees(body.getAngle());
        }
    }
}

const radiansToDegrees = (radians: number): number => radians * 57.29577951308232; //; 180 / Math.PI
