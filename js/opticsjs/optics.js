var Body = (function () {
    function Body(InteractionType, shape, refractiveIndex, reflectivity, power, width) {
        this.InteractionType = InteractionType;
        this.shape = shape;
        this.refractiveIndex = refractiveIndex;
        this.reflectivity = reflectivity;
        this.power = power;
        this.width = width;
    }
    return Body;
})();

var EnumIteractionType;
(function (EnumIteractionType) {
    EnumIteractionType[EnumIteractionType["REFRACTION"] = 0] = "REFRACTION";
    EnumIteractionType[EnumIteractionType["REFLECTION"] = 1] = "REFLECTION";
    EnumIteractionType[EnumIteractionType["BLOCK"] = 2] = "BLOCK";
    EnumIteractionType[EnumIteractionType["SOURCE"] = 3] = "SOURCE";
})(EnumIteractionType || (EnumIteractionType = {}));

var Shape = (function () {
    function Shape(mesh, location, scale, angle) {
        this.mesh = mesh;
        this.location = location;
        this.scale = scale;
        this.angle = angle;
    }
    return Shape;
})();

var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    return Point;
})();

var World = (function () {
    function World() {
    }
    World.prototype.add = function (x) {
        this.bodies.push(x);
    };

    World.prototype.render = function (canvas) {
    };

    World.prototype.update = function () {
    };
    return World;
})();
