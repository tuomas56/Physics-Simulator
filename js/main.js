var fs = require("fs");
var bodies = new Array();
var canvas;
var ctx;
var acc = 0;
var vertices = new Array();
var polygoncanvas;
var polygonctx;
var addvertex;
var isfirst;
var pworld;

var Q = function (x) {
    return document.querySelector(x);
};

(function () {
    var highest = 1;

    $.fn.bringToTop = function () {
        this.css('z-index', ++highest);
        $(".top").css("z-index", highest + 2);
    };

    $.fn.fadeOut = function (time) {
        this.animate({
            'opacity': 0
        }, time).addClass("unselect");
    }

    $.fn.fadeIn = function (time) {
        this.animate({
            'opacity': 100
        }, time).removeClass("unselect");
    }
})();


$(function () {
    canvas = Q("#viewport");
    ctx = canvas.getContext("2d");
    //window manager
    $(".draggable").draggable({
        handle: ".handle"
    }).resizable();
    $(".dragonly").draggable({
        handle: ".handle"
    });
    $(".no-select").disableSelection();
    $(".resizable").resizable();
    $(".caption").on('mousedown', function () {
        $(this).parent(".window").bringToTop();
        $(".window").each(function () {
            $(this).addClass("inactive");
        });
        $(this).parent(".window").removeClass("inactive");
    });
    $(".window > .caption > .btn-close").click(function () {
        $(this).parent(".caption").parent(".window").fadeOut(300);
    });

    //buttons
    $("#themelight").click(function () {
        $(".window").addClass("flat");
        $("nav").addClass("light");
        $("nav").removeClass("dark");
        $(".window").resize();
        $(".draggable").draggable({
            handle: ".handle"
        }).resizable();
    });
    $("#themedark").click(function () {
        $(".window").removeClass("flat");
        $("nav").addClass("dark");
        $("nav").removeClass("light");
        $(".window").resize();
        $(".draggable").draggable({
            handle: ".handle"
        }).resizable();
    });
    $("#simulationwindow").click(function () {
        $("#simulation").fadeIn(300);
    });
    $("#controlswindow").click(function () {
        $("#controls").fadeIn(300);
    });
    $("#objectswindow").click(function () {
        $("#objects").fadeIn(300);
    });
    $("#behaviourswindow").click(function () {
        $("#behaviours").fadeIn(300);
    });

    //init
    $(".window").resize();
    $("#polygon").hide();
    Physics({
        integrator: 'verlet',
        maxIPF: 16,
        timestep: 1000.0 / 160
    }, sim);
});

var sim = function (world) {
    pworld = world;
    var renderer = Physics.renderer('canvas', {
        el: 'viewport',
        width: 500,
        height: 500,
        meta: false, // don't display meta data
        styles: {
            // set colors for the circle bodies
            'circle': {
                strokeStyle: 'hsla(60, 37%, 17%, 1)',
                lineWidth: 1,
                fillStyle: 'hsla(60, 37%, 57%, 0.8)',
                angleIndicator: 'hsla(60, 37%, 17%, 0.4)'
            }
        }
    });


    // add the renderer
    world.add(renderer);
    world.subscribe('step', function () {
        if (!Q("#trace").checked)
            world.render();
        else {
            for (i = 0; i < bodies.length; i++) {
                ctx.fillStyle = "rgba(" + Math.floor((Math.random() * 255) + 1) + "," + Math.floor((Math.random() * 255) + 1) + "," + Math.floor((Math.random() * 255) + 1) + "," + 255 + ")";
                ctx.fillRect(bodies[i].state.pos.get(0), bodies[i].state.pos.get(1), 1, 1);
            }
        }
    });

    // bounds of the window
    var viewportBounds = Physics.aabb(0, 0, 500, 500);

    var edgedetect = Physics.behavior('edge-collision-detection', {
        aabb: viewportBounds,
        restitution: 0.99,
        cof: 0.99
    });

    var bodydetect = Physics.behaviour('body-collision-detection');


    // constrain objects to these bounds
    world.add(edgedetect);
    $("#edge").change(function () {
        if (this.checked)
            edgedetect.connect(world);
        else
            edgedetect.disconnect(world);
    });
    edgedetect.disconnect(world);
    world.add(bodydetect);
    $("#body").change(function () {
        if (this.checked)
            bodydetect.connect(world);
        else
            bodydetect.disconnect(world);
    });
    bodydetect.disconnect(world);

    $("#add").click(function () {
        if (Q("#type").value == "circle") {
            var b = Physics.body("circle", {
                x: Q("#x").value,
                y: Q("#y").value,
                vx: Q("#vx").value,
                vy: Q("#vy").value,
                radius: (Q("#radius").percentage / 100) * 40,
                mass: Q("#mass").value
            });
            world.add(b);
            bodies.push(b);
        } else if (Q("#type").value == "square") {
            var b = Physics.body("convex-polygon", {
                x: Q("#x").value,
                y: Q("#y").value,
                vx: Q("#vx").value,
                vy: Q("#vy").value,
                radius: (Q("#radius").percentage / 100) * 40,
                mass: Q("#mass").value,
                vertices: [{
                    x: 0,
                    y: 0
                }, {
                    x: 0,
                    y: (Q("#radius").percentage / 100) * 40
                }, {
                    x: (Q("#radius").percentage / 100) * 40,
                    y: (Q("#radius").percentage / 100) * 40
                }, {
                    x: (Q("#radius").percentage / 100) * 40,
                    y: 0
                }]
            });
            world.add(b);
            bodies.push(b);
        } else {

            if (vertices != new Array()) {
                var b = Physics.body('convex-polygon', {
                    x: Q("#x").value,
                    y: Q("#y").value,
                    vx: Q("#vx").value,
                    vy: Q("#vy").value,
                    radius: (Q("#radius").percentage / 100) * 40,
                    mass: Q("#mass").value,
                    vertices: vertices
                });
                world.add(b);
                bodies.push(b);
            }

        }
        if (world.isPaused()) {
            world.render();
        }
    });

    $("#viewport").click(function (e) {
        if (pickcoords) {
            Q("#x").value = (e.pageX - Q("#viewport").offsetParent.offsetParent.offsetLeft);
            Q("#y").value = (e.pageY - Q("#viewport").offsetParent.offsetParent.offsetTop);
            pickcoords = false;
        }
    });

    $("#go").click(function () {
        if (world.isPaused()) {
            world.unpause();
            this.innerHTML = "Stop";
        } else {
            world.pause();
            this.innerHTML = "Start";
        }
    });

    $("#direction").change(function () {
        acc = ((Q("#constant").percentage) / 100) * 0.01;
        if (Q("#direction").value == "up")
            acc = Math.abs(acc);
        else
            acc = Math.abs(acc) * -1;
        accel.setAcceleration({
            x: 0,
            y: acc
        });
    });

    $("#type").change(function () {
        if (this.value == "polygon") {
            $("#polygon").show();
            polygoncanvas = Q("#polygoncanvas");
            polygonctx = polygoncanvas.getContext('2d');
            isfirst = true;
        }
    });

    $("#vertex").click(function () {
        addvertex = true;
    });

    $("#done").click(function () {
        $("#polygon").hide();
    });

    $("#polygoncanvas").click(function (e) {
        var x = e.pageX - polygoncanvas.offsetParent.offsetParent.offsetLeft - polygoncanvas.offsetParent.offsetLeft - polygoncanvas.offsetLeft;
        var y = e.pageY - polygoncanvas.offsetParent.offsetParent.offsetTop - polygoncanvas.offsetParent.offsetTop - polygoncanvas.offsetTop;
        if (addvertex) {
            if (isfirst) {
                polygonctx.beginPath();
                polygonctx.moveTo(x, y);
                isfirst = false;
            } else
                polygonctx.lineTo(x, y);
            polygonctx.fillRect(x - 2, y - 2, 5, 5);
            polygonctx.stroke();
            polygonctx.fill();
            addvertex = false;
            vertices.push({
                x: x,
                y: y
            });
        }
    });

    // ensure objects bounce when edge collision is detected
    world.add(Physics.behavior('body-impulse-response'));

    // add some gravity
    var gravity = Physics.behavior('newtonian', {
        strength: 0
    });
    world.add(gravity);
    var accel = Physics.behaviour('constant-acceleration');
    world.add(accel);

    world.add(Physics.behaviour("sweep-prune"));

    var prevg = 0;
    var preva = 0;

    // subscribe to ticker to advance the simulation
    Physics.util.ticker.subscribe(function (time, dt) {
        if (Q("#gravity").percentage != prevg) {
            gravity.strength = (Q("#gravity").percentage / 100) * 20;
            prevg = Q("#gravity").percentage;
        }
        if (Q("#constant").percentage != preva) {
            acc = ((Q("#constant").percentage) / 100) * 0.01;
            if (Q("#direction").value == "up")
                acc = Math.abs(acc);
            else
                acc = Math.abs(acc) * -1;
            accel.setAcceleration({
                x: 0,
                y: acc
            });
            preva = Q("#constant").percentage;
        }
        world.step(time);

    });

    world.pause();

    $("#save").click(function () {

        save(prompt("Enter Filename:"));

    });

    $("#open").click(function () {
        open(prompt("Enter Filename:"));
    });

    function save(filename) {
        fs.exists(filename, function (exists) {
            if (!exists) {
                fs.writeFile(filename, JSON.stringify(bodies));
            } else
                alert("File Already Exists");
        });
    }

    function load(filename) {
        fs.exists(filename, function (exists) {
                if (exists) {
                    fs.readFile(filename, function (err, data) {
                        bodies = JSON.parse(data);
                    });
                    for (i = 0, i < bodies.length, i++) {
                        world.add(bodies[i]);
                    }
                } else
                    alert("File does not exist");
            }
        }

        // start the ticker
        Physics.util.ticker.start();
    }
