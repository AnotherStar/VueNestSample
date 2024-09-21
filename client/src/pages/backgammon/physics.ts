import { Body, BodyDef, Fixture, Vec2, World } from 'planck';

export interface BodyUserData {
    _id: string;
    playerId: string;
    score?: {
        min: number;
        max: number;
    };
    /* Отрисовка */
    render?: {
        color?: string;
        fillOnly?: boolean;
        sprite?:
            | {
                  src: string;
                  animationSpeed: never;
                  width: number;
                  height: number;
              }
            | {
                  src: string[];
                  animationSpeed: number;
                  width: number;
                  height: number;
              };
        emitterPosition?: Vec2;
    };
    /* Мера, указывающая как тело дрифтует*/
    sideFriction?: number;
    /* Газует каждый шаг, летя вперёд */
    thruster?: number;
    /* Этот урон применяется мгновенно в начале контакта */
    damage?: {
        min: number;
        max: number;
    };
    /* Каждый шаг это время уменьшается. После чего тело будет уничтожено */
    lifetime?: {
        max: number;
        current: number;
    };
    /* При уничтожении тела будет вызван этот взрыв, нанося урон вокруг */
    explosion?: {
        radius: number;
        force: number;
        damage: number;
    };
    /* При коллизиях это здоровье будет уменьшаться */
    health?: {
        max: number;
        current: number;
    };
    attraction?: number;
    collideId?: string;
    healthAura: {
        radius: 10;
        healthPerSecond: 10;
    };
}

declare module 'planck' {
    interface Body {
        userData: BodyUserData;
        setUserData(this: Body, userData: BodyUserData): void;
        forEachFixture(this: Body, callback: ForEachFixtureCallback): void;
        getFixturesCount(this: Body): number;
        getDistanceToBody(this: Body, bodyTo: Body): number;
        getAngleLocalToBody(this: Body, bodyTo: Body): number;
        getAngleWorldToBody(this: Body, bodyTo: Body): number;
        getWorldVectorToBody(this: Body, bodyTo: Body): Vec2;
        getLocalVectorToBody(this: Body, bodyTo: Body): Vec2;
        resetOrigin(this: Body): void;
    }
    interface World {
        createBody(this: World, bodyDef: BodyDef & { userData?: BodyUserData }): Body;
        forEachBody(this: World, callback: ForEachBodyCallback): void;
        mapBody<T>(this: World, callback: MapBodyCallback<T>): T[];
        getBodyById(this: World, bodyId: string): Body | undefined;
        /**
         * @deprecated Нужно вызывать game.removeBody
         */
        destroyBody(this: World, body: Body): boolean;
    }
}

type ForEachBodyCallback = (body: Body, index?: number) => void;
World.prototype.forEachBody = function (this: World, callback: ForEachBodyCallback) {
    let index = 0;
    let body = this.getBodyList();
    while (body) {
        callback(body, index);
        body = body.getNext();
        index++;
    }
};

type MapBodyCallback<T> = (body: Body, index?: number) => T;
World.prototype.mapBody = function <T>(this: World, callback: MapBodyCallback<T>): T[] {
    let array: T[] = [];
    let index = 0;
    let body = this.getBodyList();
    while (body) {
        array.push(callback(body, index));
        body = body.getNext();
        index++;
    }
    return array;
};

Object.defineProperty(Body.prototype, 'userData', {
    get: function userData(): BodyUserData {
        const userData = this.m_userData;
        if (!userData._id) userData._id = Math.random().toString(16).slice(2, 7);
        return this.m_userData;
    },
    set: function userData(userData: BodyUserData) {
        this.m_userData = userData;
    },
});

type ForEachFixtureCallback = (fixture: Fixture, index?: number) => void;
Body.prototype.forEachFixture = function (this: Body, callback: ForEachFixtureCallback) {
    let index = 0;
    let fixture = this.getFixtureList();
    while (fixture) {
        callback(fixture, index);
        fixture = fixture.getNext();
        index++;
    }
};

Body.prototype.getFixturesCount = function (this: Body): number {
    let count: number = 0;
    this.forEachFixture(x => count++);
    return count;
};

Body.prototype.getDistanceToBody = function (this: Body, bodyTo: Body): number {
    return this.getWorldVectorToBody(bodyTo).length();
};

/** Вектор относительно системы координат, совпадающий с телом */
Body.prototype.getLocalVectorToBody = function (this: Body, bodyTo: Body): Vec2 {
    const direction = this.getWorldVectorToBody(bodyTo);
    const length = direction.length();
    const v = new Vec2(0, length);
    const a = this.getAngleLocalToBody(bodyTo);
    return new Vec2(
        -(Math.cos(a) * v.x - Math.sin(a)) * v.y,
        Math.sin(a) * v.x + Math.cos(a) * v.y,
    );
};

Body.prototype.resetOrigin = function (this: Body): void {
    const localCenter = this.getLocalCenter();
    this.forEachFixture(fixture => {
        const shape = fixture.getShape();
        if (shape.getType() === 'polygon') {
            shape.m_vertices.forEach(verticle => {
                verticle.x -= localCenter.x;
                verticle.y -= localCenter.y;
            });
        }
    });
};
/* ------------------------------------------------------------------------------------------------------------------ */
/*                                                        WORLD                                                       */
/* ------------------------------------------------------------------------------------------------------------------ */

World.prototype.getBodyById = function (this: World, bodyId: string): Body | undefined {
    let body = this.getBodyList();
    while (body) {
        if (body.userData._id === bodyId) return body;
        body = body.getNext();
    }
};
