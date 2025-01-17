import {defs, tiny} from './examples/common.js';
// Pull these names into this module's scope for convenience:
const {vec3, vec4, vec, Vector, color, hex_color, Matrix, Mat4, Light, Shape, Material, Shader, Texture, Scene} = tiny;
const {Cube, Axis_Arrows, Textured_Phong, Phong_Shader, Basic_Shader, Subdivision_Sphere} = defs

import {Shape_From_File} from './examples/obj-file-demo.js'
import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
    Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './examples/shadow-demo-shaders.js'


// The scene
export class Fur_Graphics extends Scene {
    constructor() {
        super();

        // flags for keys
        this.do = false;
        this.re = false;

        // key animation states
        this.do_key = false;
        this.re_key = false;
        this.mi_key = false;
        this.fa_key = false;
        this.so_key = false;
        this.la_key = false;
        this.ti_key = false;

        // object states
        this.do_transform = Mat4.translation(-9, 5, -7);
        this.do_color = color(0.9, 0.8, 0.1, 1);
        this.do_t = 0;
        this.re_transform = Mat4.translation(-6, 7, -7);
        this.re_color = color(0.3, 0.6, 1, 1);
        this.re_t = 0;

        // animation states
        this.do_shift = 0;
        this.animate_do_up = false;
        this.animate_do_down = false;
        this.animate_do_up_done = false;
        this.animate_do_down_done = false;

        this.re_shift = 4;
        this.animate_re_up = false;
        this.animate_re_down = false;
        this.animate_re_up_done = false;
        this.animate_re_down_done = false;

        this.mi_shift = -7;
        this.mi_rot = 0;
        this.animate_mi_up = false;
        this.animate_mi_down = false;
        this.animate_mi_up_done = false;
        this.animate_mi_down_done = false;

        this.fa_shift = 1;
        this.animate_fa_up = false;
        this.animate_fa_down = false;
        this.animate_fa_up_done = false;
        this.animate_fa_down_done = false;

        this.so_shift = 0;
        this.animate_so_up = false;
        this.animate_so_down = false;
        this.animate_so_up_done = false;
        this.animate_so_down_done = false;

        this.la_shift = 5;
        this.animate_la_up = false;
        this.animate_la_down = false;
        this.animate_la_up_done = false;
        this.animate_la_down_done = false;

        this.ti_shift = 0;
        this.animate_ti_up = false;
        this.animate_ti_down = false;
        this.animate_ti_up_done = false;
        this.animate_ti_down_done = false;

        // flag for texture
        this.texture = true;

        // room decor states
        this.floor = 1;
        this.wall = 1;

        // light movement
        this.light_movement = true;

        // Load the model file:
        this.shapes = {
            "teapot": new Shape_From_File("assets/teapot.obj"),
            "sphere": new Subdivision_Sphere(6),
            "cube": new Cube(),
            "cube2": new Cube(),
            "torus": new defs.Torus(15, 15),
            "circle": new defs.Regular_2D_Polygon(1, 15),
            "planet": new (defs.Subdivision_Sphere.prototype.make_flat_shaded_version())(1),
            "among_us": new Shape_From_File("assets/among_us.obj"),
            "arrow": new Shape_From_File("assets/arrow.obj"),
            "rubik_cube": new Shape_From_File("assets/rubik_cube.obj"),
            "shark": new Shape_From_File("assets/shark.obj"),
            "light": new Shape_From_File("assets/lamp2.obj"),
            "puppy": new Shape_From_File("assets/puppy.obj"),
            "plant": new Shape_From_File("assets/plant.obj"),
            "plant2": new Shape_From_File("assets/plant2.obj"),
        };

        this.shapes.cube.arrays.texture_coord = Vector.cast(
            [0.25, 0], [0.75, 0], [0.25, 1], [0.75, 1], [0.25, 0], [0.75, 0], [0.25, 1], [0.75, 1],
            [0, 0], [5, 0], [0, 1], [5, 1], [0, 0], [5, 0], [0, 1], [5, 1],
            [0, 0], [1, 0], [0, 1], [1, 1], [0, 0], [1, 0], [0, 1], [1, 1], [0, 0],
        );

        const texture_coord_cube2 = this.shapes.cube2.arrays.texture_coord;
        for (let row_index = 0; row_index < texture_coord_cube2.length; row_index += 1) {
            texture_coord_cube2[row_index][0] *= 3;
            texture_coord_cube2[row_index][1] *= 3;
        }
        this.materials = {
            cloud_wall: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/cloud.jpg", "NEAREST"),
            }),
            lines_wall: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/lines.jpeg", "NEAREST"),
            }),
            leaf_wall: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/leaf2.jpeg", "NEAREST"),
            }),
            triangles_wall: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/triangles.jpeg", "NEAREST"),
            }),
            stars: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(.5, .5, .5, 1),
                ambient: .4, diffusivity: .5, specularity: .5,
                color_texture: new Texture("assets/stars.png"),
                light_depth_texture: null

            }),
            wooden_floor: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/wood.jpeg", "NEAREST"),
            }),
            carpet_floor: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/carpet.jpg", "NEAREST"),
            }),
            rocky_floor: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/rocky.jpeg", "NEAREST"),
            }),
            shadow: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: hex_color("#D2691E"),
                ambient: 0.6, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
                color_texture: null,
                light_depth_texture: null
            }),
//             keys: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
//                 color: color(.5, .5, .5, 1),
//                 ambient: 0.3, diffusivity: 0.5, specularity: 0.5, smoothness: 64,
//                 color_texture: new Texture("assets/bump2.jpeg", "LINEAR_MIPMAP_LINEAR"),
//                 bump_texture: new Texture("assets/bumps.gif", "LINEAR_MIPMAP_LINEAR"),
//                 light_depth_texture: null
//             }),
            keys1: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
                color: color(0.6, .6, .6, 1),
                ambient: 0.4, diffusivity: 0.5, specularity: 1, smoothness: 64,
                color_texture: new Texture("assets/waves.jpeg", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/handbumps.png", "LINEAR_MIPMAP_LINEAR"),
                light_depth_texture: null
            }),
            keys2: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
                color: color(0.6, .6, .6, 1),
                ambient: 0.4, diffusivity: 0.5, specularity: 1, smoothness: 12,
                color_texture: new Texture("assets/donut.jpeg", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/wrinklebumps.png", "LINEAR_MIPMAP_LINEAR"),
                light_depth_texture: null
            }),
            keys3: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
                color: color(0.6, .6, .6, 1),
                ambient: 0.4, diffusivity: 0.5, specularity: 1, smoothness: 64,
                color_texture: new Texture("assets/polygon.png", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/dogbumps.png", "LINEAR_MIPMAP_LINEAR"),
                light_depth_texture: null
            }),
            keys4: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
                color: color(0.6, .6, .6, 1),
                ambient: 0.4, diffusivity: 0.5, specularity: 1, smoothness: 64,
                color_texture: new Texture("assets/amongus.jpeg", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/bump2.jpeg", "LINEAR_MIPMAP_LINEAR"),
                light_depth_texture: null
            }),
            keys5: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
                color: color(0.6, .6, .6, 1),
                ambient: 0.4, diffusivity: 0.5, specularity: 1, smoothness: 64,
                color_texture: new Texture("assets/dots.png", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/stars.png", "LINEAR_MIPMAP_LINEAR"),
                light_depth_texture: null
            }),
            keys6: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
                color: color(0.6, .6, .6, 1),
                ambient: 0.4, diffusivity: 0.5, specularity: 1, smoothness: 64,
                color_texture: new Texture("assets/arrow.png", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/cube.png", "LINEAR_MIPMAP_LINEAR"),
                light_depth_texture: null
            }),
            keys7: new Material(new Bump_Shadow_Textured_Phong_Shader(1), { // texture for piano keys
                color: color(0.6, .6, .6, 1),
                ambient: 0.4, diffusivity: 0.5, specularity: 1, smoothness: 64,
                color_texture: new Texture("assets/cube.png", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/paperbump.png", "LINEAR_MIPMAP_LINEAR"),
                light_depth_texture: null
            }),
            pure: new Material(new Color_Phong_Shader(), {
                color: hex_color("#000000"),
                ambient: .3, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
            }),
            plant: new Material(new Color_Phong_Shader(), {
                color: hex_color("#00CC00"),
                ambient: .3, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
            }),
            bumps: new Material(new defs.Fake_Bump_Map(1), {
                color: color(.5, .5, .5, 1),
                ambient: 0.3, diffusivity: 0.5, specularity: .5, texture: new Texture("assets/stars.png")
            }),
            light_src: new Material(new Phong_Shader(), { 
                color: color(1, 1, 1, 1), ambient: 1, diffusivity: 0, specularity: 0
            }),
            lighting: new Material(new Shadow_Textured_Phong_Shader(1), { // for light source
                color: color(1, 1, 1, 1),
                ambient: 0.8, diffusivity: 0.8, specularity: 0.6, smoothness: 64,
            }),
            depth_tex: new Material(new Depth_Texture_Shader_2D(), { // For depth texture display
                color: color(0, 0, .0, 1),
                ambient: 1, diffusivity: 0, specularity: 0, texture: null
            }),
        }

        // To make sure texture initialization only does once
        this.init_ok = false;
    }

    make_control_panel() {
        this.key_triggered_button("Change Floor", ["o"], () => {
            this.floor === 3 ? this.floor = 1 : this.floor += 1;
        });
        this.key_triggered_button("Change Wall", ["l"], () => {
            this.wall === 3 ? this.wall = 1 : this.wall += 1;
        });
        this.key_triggered_button("Light Movement", ["g"], () => this.light_movement ^= 1);
        

        this.new_line();
        this.key_triggered_button("Do", ["z"], () => {
            this.do_key = true;
            this.do = true;
            if (!this.animate_do_up && !this.animate_do_up_done) {
                this.animate_do_up = true;
                this.animate_do_down_done = false;
                this.animate_do_down = false;
            }
        }, '#6E6460', () => {
            this.do_key = false;
            this.do = true;
            if (!this.animate_do_down && !this.animate_do_down_done) {
                this.animate_do_down = true;
                this.animate_do_up_done = false;
                this.animate_do_up = false;
            }
        });

        this.key_triggered_button("Re", ["x"], () => {
            this.re_key = true;
            this.re = true;
            if (!this.animate_re_up && !this.animate_re_up_done) {
                this.animate_re_up = true;
                this.animate_re_down_done = false;
                this.animate_re_down = false;
            }
        }, '#6E6460', () => {
            this.re_key = false;
            this.re = true;
            if (!this.animate_re_down && !this.animate_re_down_done) {
                this.animate_re_down = true;
                this.animate_re_up_done = false;
                this.animate_re_up = false;
            }
        });

        this.key_triggered_button("Mi", ["c"], () => {
            this.mi_key = true;
            if (!this.animate_mi_up && !this.animate_mi_up_done) {
                this.animate_mi_up = true;
                this.animate_mi_down_done = false;
                this.animate_mi_down = false;
            }
        }, '#6E6460', () => {
            this.mi_key = false;
            if (!this.animate_mi_down && !this.animate_mi_down_done) {
                this.animate_mi_down = true;
                this.animate_mi_up_done = false;
                this.animate_mi_up = false;

            }
        });

        this.key_triggered_button("Fa", ["v"], () => {
            this.fa_key = true;
            if (!this.animate_fa_up && !this.animate_fa_up_done) {
                this.animate_fa_up = true;
                this.animate_fa_down_done = false;
                this.animate_fa_down = false;
            }
        }, '#6E6460', () => {
            this.fa_key = false;
            if (!this.animate_fa_down && !this.animate_fa_down_done) {
                this.animate_fa_down = true;
                this.animate_fa_up_done = false;
                this.animate_fa_up = false;
            }
        });

        this.key_triggered_button("So", ["b"], () => {
            this.so_key = true;
            if (!this.animate_so_up && !this.animate_so_up_done) {
                this.animate_so_up = true;
                this.animate_so_down_done = false;
                this.animate_so_down = false;
            }
        }, '#6E6460', () => {
            this.so_key = false;
            if (!this.animate_so_down && !this.animate_so_down_done) {
                this.animate_so_down = true;
                this.animate_so_up_done = false;
                this.animate_so_up = false;
            }
        });

        this.key_triggered_button("La", ["n"], () => {
            this.la_key = true;
            if (!this.animate_la_up && !this.animate_la_up_done) {
                this.animate_la_up = true;
                this.animate_la_down_done = false;
                this.animate_la_down = false;
            }
        }, '#6E6460', () => {
            this.la_key = false;
            if (!this.animate_la_down && !this.animate_la_down_done) {
                this.animate_la_down = true;
                this.animate_la_up_done = false;
                this.animate_la_up = false;

            }
        });

        this.key_triggered_button("Ti", ["m"], () => {
            this.ti_key = true;
            if (!this.animate_ti_up && !this.animate_ti_up_done) {
                this.animate_ti_up = true;
                this.animate_ti_down_done = false;
                this.animate_ti_down = false;
            }
        }, '#6E6460', () => {
            this.ti_key = false;
            if (!this.animate_ti_down && !this.animate_ti_down_done) {
                this.animate_ti_down = true;
                this.animate_ti_up_done = false;
                this.animate_ti_up = false;

            }
        });
    }

    texture_buffer_init(gl) {
        // Depth Texture
        this.lightDepthTexture = gl.createTexture();
        // Bind it to TinyGraphics
        this.light_depth_texture = new Buffered_Texture(this.lightDepthTexture);
        this.materials.stars.light_depth_texture = this.light_depth_texture
        this.materials.shadow.light_depth_texture = this.light_depth_texture

        this.lightDepthTextureSize = LIGHT_DEPTH_TEX_SIZE;
        gl.bindTexture(gl.TEXTURE_2D, this.lightDepthTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,      // target
            0,                  // mip level
            gl.DEPTH_COMPONENT, // internal format
            this.lightDepthTextureSize,   // width
            this.lightDepthTextureSize,   // height
            0,                  // border
            gl.DEPTH_COMPONENT, // format
            gl.UNSIGNED_INT,    // type
            null);              // data
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // Depth Texture Buffer
        this.lightDepthFramebuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,       // target
            gl.DEPTH_ATTACHMENT,  // attachment point
            gl.TEXTURE_2D,        // texture target
            this.lightDepthTexture,         // texture
            0);                   // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // create a color texture of the same size as the depth texture
        // see article why this is needed_
        this.unusedTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.unusedTexture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            this.lightDepthTextureSize,
            this.lightDepthTextureSize,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null,
        );
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        // attach it to the framebuffer
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,        // target
            gl.COLOR_ATTACHMENT0,  // attachment point
            gl.TEXTURE_2D,         // texture target
            this.unusedTexture,         // texture
            0);                    // mip level
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    sin_modifier(amplitude, period, t, phase_shift=0, vertical_shift=0) {
        return amplitude*Math.sin(2*Math.PI*t/period + phase_shift) + vertical_shift;
    }

    cos_modifier(amplitude, period, t, phase_shift=0, vertical_shift=0) {
        return amplitude*Math.cos(2*Math.PI*t/period + phase_shift) + vertical_shift;
    }

    render_scene(context, program_state, shadow_pass, draw_light_source=false, draw_shadow=false) {
        // shadow_pass: true if this is the second pass that draw the shadow.
        // draw_light_source: true if we want to draw the light source.
        // draw_shadow: true if we want to draw the shadow

        let light_position = this.light_position;
        let light_color = this.light_color;
        const t = this.t = program_state.animation_time/1000;
        const dt = this.dt = program_state.animation_delta_time / 1000;

        program_state.draw_shadow = draw_shadow;

        if (draw_light_source && shadow_pass) {
            this.shapes.light.draw(context, program_state,
                Mat4.translation(light_position[0], light_position[1], light_position[2]).times(Mat4.translation(0,4.5,0)).times(Mat4.scale(1.5,1.5,1.5)),
                this.materials.lighting.override({color: light_color}));
        }

        // Drawing Room
        let model_trans_room_floor = Mat4.translation(0, - 4 - 0.4, 0).times(Mat4.scale(22, 0.1, 28));
        let model_trans_room_ceiling = Mat4.translation(0, 15 + 0.1, 0).times(Mat4.scale(22, 0.1, 28));
        let model_trans_room_back_wall = Mat4.translation(0,  5 + 0.5, -28).times(Mat4.scale(22, 10, 0.1));
        let model_trans_room_front_wall = Mat4.translation(0,  5 + 0.5, 28).times(Mat4.scale(22, 10, 0.1));
        let model_trans_room_left_wall = Mat4.translation(-21.9, 5 + 0.5, 0).times(Mat4.scale(0.1, 10, 28));
        let model_trans_room_right_wall = Mat4.translation(21.9, 5 + 0.5, 0).times(Mat4.scale(0.1, 10, 28));

        this.floor === 1 ? this.shapes.cube2.draw(context, program_state, model_trans_room_floor, this.materials.wooden_floor) :
        this.floor === 2 ? this.shapes.cube2.draw(context, program_state, model_trans_room_floor, this.materials.carpet_floor)
                         : this.shapes.cube2.draw(context, program_state, model_trans_room_floor, this.materials.rocky_floor);
        
        let wall_material = (
            this.wall === 1 ? this.materials.cloud_wall : 
            this.wall === 2 ? this.materials.triangles_wall
                            : this.materials.leaf_wall
        );
        this.shapes.cube2.draw(context, program_state, model_trans_room_back_wall, wall_material);
        this.shapes.cube.draw(context, program_state, model_trans_room_front_wall, wall_material);
        this.shapes.cube.draw(context, program_state, model_trans_room_left_wall, wall_material);
        this.shapes.cube.draw(context, program_state, model_trans_room_right_wall, wall_material);
        this.shapes.cube.draw(context, program_state, model_trans_room_ceiling, wall_material);

        // Drawing Decor
        let model_trans_room_plant2 = Mat4.translation(-18, -3, -16);
        let model_trans_room_plant = Mat4.translation(21, 5, -16).times(Mat4.rotation(-30,0,0,1));
        this.shapes.plant2.draw(context, program_state, model_trans_room_plant2, this.materials.plant);
        this.shapes.plant.draw(context, program_state, model_trans_room_plant, this.materials.plant);

        // Drawing Table
        let model_trans_keys_table = Mat4.translation(0, -0.10, 0).times(Mat4.scale(10, 0.1, 4));
        let model_trans_left_leg = Mat4.translation(-9.5, - 2 - 0.2, 0).times(Mat4.scale(0.33, 2, 4));
        let model_trans_right_leg = Mat4.translation(+9.5, - 2 - 0.2, 0).times(Mat4.scale(0.33, 2, 4));
        let model_trans_book_stand = Mat4.translation(0,  2 - 0.1, -3.5).times(Mat4.scale(8, 2, 0.33));

        this.shapes.cube.draw(context, program_state, model_trans_keys_table, shadow_pass? this.materials.shadow : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_left_leg, shadow_pass? this.materials.shadow : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_right_leg, shadow_pass? this.materials.shadow : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_book_stand, shadow_pass? this.materials.shadow : this.materials.pure);

        // Drawing Keys
        const unpressed_height = 0.6;
        const pressed_height = 0.3;

        let model_trans_key_1 = Mat4.translation(-9, this.do_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.do_key? pressed_height : unpressed_height, 3));
        let model_trans_key_2 = Mat4.translation(-6, this.re_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.re_key? pressed_height : unpressed_height, 3));
        let model_trans_key_3 = Mat4.translation(-3, this.mi_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.mi_key? pressed_height : unpressed_height, 3));
        let model_trans_key_4 = Mat4.translation(0, this.fa_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.fa_key? pressed_height : unpressed_height, 3));
        let model_trans_key_5 = Mat4.translation(3, this.so_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.so_key? pressed_height : unpressed_height, 3));
        let model_trans_key_6 = Mat4.translation(6, this.la_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.la_key? pressed_height : unpressed_height, 3));
        let model_trans_key_7 = Mat4.translation(9, this.ti_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.ti_key? pressed_height : unpressed_height, 3));


        this.shapes.cube.draw(context, program_state, model_trans_key_1, shadow_pass? this.materials.keys1 : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_2, shadow_pass? this.materials.keys2 : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_3, shadow_pass? this.materials.keys3 : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_4, shadow_pass? this.materials.keys4 : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_5, shadow_pass? this.materials.keys5 : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_6, shadow_pass? this.materials.keys6 : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_7, shadow_pass? this.materials.keys7 : this.materials.pure);

        // Drawing Shapes
        if (this.animate_do_up) {
            if (this.do_shift >= 0.5) {
                this.animate_do_up = false;
                this.animate_do_up_done = true;
                this.do_shift = 0.5;
                this.do = false;
            } else {
                this.do_shift += 0.05;
            }
        }
        if (this.animate_do_down) {
            if (this.do_shift <= -0.5) {
                this.animate_do_down = false;
                this.animate_do_down_done = true;
                this.do_shift = -0.5;
                this.do = false;
            } else {
                this.do_shift -= 0.05;
            }
        }
        if (this.do) {
            this.do_t = this.do_t + dt;
        }
        let model_trans_shape_1 = Mat4.translation(-9, 5, -7).times(Mat4.rotation(this.do_shift, 1, 0, 0));
        let shape_1_color = color(this.sin_modifier(0.3, 5, this.do_t, 2.5, 0.5),
                                    this.cos_modifier(0.4, 2, this.do_t, 1, 0.5), 0.7, 1);


        if (this.animate_re_up) {
            if (this.re_shift >= 8) {
                this.animate_re_up = false;
                this.animate_re_up_done = true;
                this.re_shift = 8;
                this.re = false;
            } else {
                this.re_shift += 0.1;
            }
        }
        if (this.animate_re_down) {
            if (this.re_shift <= 4) {
                this.animate_re_down = false;
                this.animate_re_down_done = true;
                this.re_shift = 4;
                this.re = false;
            } else {
                this.re_shift -= 0.1;
            }
        }
        if (this.re) {
            this.re_t = this.re_t + dt;
        }
        let model_trans_shape_2 = Mat4.translation(-6, this.re_shift, -7)
                                                    .times(Mat4.rotation(this.sin_modifier(-3, 2, this.re_t), 1, this.cos_modifier(2, 1, this.re_t), 0));
        let shape_2_color = color(0.7, this.cos_modifier(0.2, 2, this.re_t, 1, 0.5), this.cos_modifier(0.4, 3, this.re_t, 1, 0.5), 1);

        if (this.animate_mi_up) {
            if (this.mi_shift >= -2) {
                this.animate_mi_up = false;
                this.animate_mi_up_done = true;
                this.mi_shift = -2;
            } else {
                this.mi_shift += 0.1;
                this.mi_rot += 0.5;
            }
        }
        if (this.animate_mi_down) {
            if (this.mi_shift <= -7) {
                this.animate_mi_down = false;
                this.animate_mi_down_done = true;
                this.mi_shift = -7;
            } else {
                this.mi_shift -= 0.1;
                this.mi_rot -= 0.5;
            }
        }
        let model_trans_shape_3 = Mat4.translation(-3, 6, this.mi_shift).times(Mat4.rotation(this.mi_rot, 1, 0, 0))

        if (this.animate_fa_up) {
            if (this.fa_shift <= 0) {
                this.animate_fa_up = false;
                this.animate_fa_up_done = true;
                this.fa_shift = 0;
            } else {
                this.fa_shift -= 0.05;
            }
        }
        if (this.animate_fa_down) {
            if (this.fa_shift >= 1) {
                this.animate_fa_down = false;
                this.animate_fa_down_done = true;
                this.fa_shift = 1;
            } else {
                this.fa_shift += 0.05;
            }
        }
        let model_trans_shape_4 = Mat4.translation(0, 5, -7).times(Mat4.scale(this.fa_shift, this.fa_shift, 1, 0));

        if (this.animate_so_up) {
            if (this.so_shift <= -3) {
                this.animate_so_up = false;
                this.animate_so_up_done = true;
                this.so_shift = -3;
            } else {
                this.so_shift -= 0.1;
            }
        }
        if (this.animate_so_down) {
            if (this.so_shift >= 0) {
                this.animate_so_down = false;
                this.animate_so_down_done = true;
                this.so_shift = 0;
            } else {
                this.so_shift += 0.1;
            }
        }
        let model_trans_shape_5 = Mat4.translation(3, 6, -7).times(Mat4.translation(0, this.so_shift, 0));

        if (this.animate_la_up) {
            if (this.la_shift >= 7.5) {
                this.animate_la_up = false;
                this.animate_la_up_done = true;
                this.la_shift = 7.5;
            } else {
                this.la_shift += 0.1;
            }
        }
        if (this.animate_la_down) {
            if (this.la_shift <= 5) {
                this.animate_la_down = false;
                this.animate_la_down_done = true;
                this.la_shift = 5;
            } else {
                this.la_shift -= 0.1;
            }
        }
        let model_trans_shape_6 = Mat4.translation(6, this.la_shift, -7).times(Mat4.rotation(5,0,5,0));

        if (this.animate_ti_up) {
            if (this.ti_shift >= 5) {
                this.animate_ti_up = false;
                this.animate_ti_up_done = true;
                this.ti_shift = 5;
            } else {
                this.ti_shift += 0.1;
            }
        }
        if (this.animate_ti_down) {
            if (this.ti_shift <= 0) {
                this.animate_ti_down = false;
                this.animate_ti_down_done = true;
                this.ti_shift = 0;
            } else {
                this.ti_shift -= 0.1;
            }
        }
        let model_trans_shape_7 = Mat4.translation(9, 7, -7).times(Mat4.rotation(this.ti_shift, 0, 0.01+this.ti_shift, 0));

        this.shapes.shark.draw(context, program_state, model_trans_shape_1,
                                this.materials.shadow.override({color: shape_1_color}));
        this.shapes.torus.draw(context, program_state, model_trans_shape_2,
                                this.materials.pure.override({color: shape_2_color}));
        this.shapes.planet.draw(context, program_state, model_trans_shape_3, this.materials.shadow.override({color: hex_color("#8A2BE2")}));
        this.shapes.among_us.draw(context, program_state, model_trans_shape_4, this.materials.shadow.override({color: hex_color("#FF8C00")}));
        this.shapes.sphere.draw(context, program_state, model_trans_shape_5, this.materials.shadow.override({color: hex_color("#00FF7F")}));
        this.shapes.arrow.draw(context, program_state, model_trans_shape_6, this.materials.shadow.override({color: hex_color("#00FFFF")}));
        this.shapes.rubik_cube.draw(context, program_state, model_trans_shape_7, this.materials.shadow.override({color: hex_color("#FF4500")}));
    }

    display(context, program_state) {
        const t = program_state.animation_time;
        const gl = context.context;

        if (!this.init_ok) {
            const ext = gl.getExtension('WEBGL_depth_texture');
            if (!ext) {
                return alert('need WEBGL_depth_texture');  // eslint-disable-line
            }
            this.texture_buffer_init(gl);

            this.init_ok = true;
        }

        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            // Define the global camera and projection matrices, which are stored in program_state.
            program_state.set_camera(Mat4.look_at(
                // vec3(0, 12, 18),
                vec3(0, 12, 22),
                vec3(0, 2, 0),
                vec3(0, 1, 0)
            )); // Locate the camera here
        }

        // The position of the light
        this.light_position = this.light_movement 
                ? Mat4.rotation(t / 1500, 0, 1, 0).times(vec4(3, 6, 0, 1))
                : Mat4.rotation(Math.PI*3/2, 0, 1, 0).times(vec4(3, 6, 0, 1));
        this.light_color = color(0.9, 0.9, 0.9, 1);

        // This is a rough target of the light.
        // Although the light is point light, we need a target to set the POV of the light
        this.light_view_target = vec4(0, 0, 0, 1);
        this.light_field_of_view = 130 * Math.PI / 180; // 130 degree

        program_state.lights = [new Light(this.light_position, this.light_color, 1000)];

        // Step 1: set the perspective and camera to the POV of light
        const light_view_mat = Mat4.look_at(
            vec3(this.light_position[0], this.light_position[1], this.light_position[2]),
            vec3(this.light_view_target[0], this.light_view_target[1], this.light_view_target[2]),
            vec3(0, 1, 0), // assume the light to target will have a up dir of +y, maybe need to change according to your case
        );
        const light_proj_mat = Mat4.perspective(this.light_field_of_view, 1, 0.5, 500);
        // Bind the Depth Texture Buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.lightDepthFramebuffer);
        gl.viewport(0, 0, this.lightDepthTextureSize, this.lightDepthTextureSize);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // Prepare uniforms
        program_state.light_view_mat = light_view_mat;
        program_state.light_proj_mat = light_proj_mat;
        program_state.light_tex_mat = light_proj_mat;
        program_state.view_mat = light_view_mat;
        program_state.projection_transform = light_proj_mat;
        this.render_scene(context, program_state, false,false, false);

        // Step 2: unbind, draw to the canvas
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        program_state.view_mat = program_state.camera_inverse;
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 0.5, 500);
        this.render_scene(context, program_state, true,true, true);


    }
}


class Bump_Map extends Textured_Phong {
    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` precision mediump float;
            const int N_LIGHTS = ` + this.num_lights + `;
            uniform float ambient, diffusivity, specularity, smoothness;
            uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
            uniform float light_attenuation_factors[N_LIGHTS];
            uniform vec4 shape_color;
            uniform vec3 squared_scale, camera_center;

            // Specifier "varying" means a variable's final value will be passed from the vertex shader
            // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
            // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
            varying vec3 N, vertex_worldspace;
            // ***** PHONG SHADING HAPPENS HERE: *****
            vec3 phong_model_lights( vec3 N, vec3 bumps_N, vec3 vertex_worldspace ){
                // phong_model_lights():  Add up the lights' contributions.
                vec3 E = normalize( camera_center - vertex_worldspace );
                vec3 result = vec3( 0.0 );
                for(int i = 0; i < N_LIGHTS; i++){
                    // Lights store homogeneous coords - either a position or vector.  If w is 0, the
                    // light will appear directional (uniform direction from all points), and we
                    // simply obtain a vector towards the light by directly using the stored value.
                    // Otherwise if w is 1 it will appear as a point light -- compute the vector to
                    // the point light's location from the current surface point.  In either case,
                    // fade (attenuate) the light as the vector needed to reach it gets longer.
                    vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                                                   light_positions_or_vectors[i].w * vertex_worldspace;
                    float distance_to_light = length( surface_to_light_vector );

                    vec3 L = normalize( surface_to_light_vector );
                    vec3 H = normalize( L + E );
                    // Compute the diffuse and specular components from the Phong
                    // Reflection Model, using Blinn's "halfway vector" method:
                    float diffuse  =      max( dot( bumps_N, L ), 0.0 );
                    float specular = pow( max( dot( bumps_N, H ), 0.0 ), smoothness );
                    float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );

                    vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                              + light_colors[i].xyz * specularity * specular;
                    result += attenuation * light_contribution;
                  }
                return result;
              } `;
    }
    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform sampler2D bump_texture;

            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                if( tex_color.w < .01 ) discard;

                // add bump_texture normal
                vec4 bump_color = texture2D( bump_texture, f_tex_coord );

                // Slightly disturb normals based on sampling the same image that was used for texturing:
                vec3 bumped_N  = N + bump_color.rgb - .5*vec3(1,1,1);
                // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w );
                // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), normalize( bumped_N ), vertex_worldspace );
              } `;
    }
    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Add a little more to the base class's version of this method.
        super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);

        if (material.texture && material.texture.ready) {
            // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
            context.uniform1i(gpu_addresses.texture, 0);
            // For this draw, use the texture image from correct the GPU buffer:
            material.texture.activate(context);
        }

        if (material.bump_texture && material.bump_texture.ready) {
            context.uniform1i(gpu_addresses.bump_texture, 1);
            material.bump_texture.activate(context, 1);
        }
    }
}


class Bump_Shadow_Textured_Phong_Shader extends Shadow_Textured_Phong_Shader {
    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` precision mediump float;
            const int N_LIGHTS = ` + this.num_lights + `;
            uniform float ambient, diffusivity, specularity, smoothness;
            uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
            uniform float light_attenuation_factors[N_LIGHTS];
            uniform vec4 shape_color;
            uniform vec3 squared_scale, camera_center;

            // Specifier "varying" means a variable's final value will be passed from the vertex shader
            // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
            // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
            varying vec3 N, vertex_worldspace;
            // ***** PHONG SHADING HAPPENS HERE: *****
            vec3 phong_model_lights( vec3 N, vec3 bumps_N, vec3 vertex_worldspace,
                    out vec3 light_diffuse_contribution, out vec3 light_specular_contribution ){
                // phong_model_lights():  Add up the lights' contributions.
                vec3 E = normalize( camera_center - vertex_worldspace );
                vec3 result = vec3( 0.0 );
                light_diffuse_contribution = vec3( 0.0 );
                light_specular_contribution = vec3( 0.0 );
                for(int i = 0; i < N_LIGHTS; i++){
                    // Lights store homogeneous coords - either a position or vector.  If w is 0, the
                    // light will appear directional (uniform direction from all points), and we
                    // simply obtain a vector towards the light by directly using the stored value.
                    // Otherwise if w is 1 it will appear as a point light -- compute the vector to
                    // the point light's location from the current surface point.  In either case,
                    // fade (attenuate) the light as the vector needed to reach it gets longer.
                    vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                                                   light_positions_or_vectors[i].w * vertex_worldspace;
                    float distance_to_light = length( surface_to_light_vector );

                    vec3 L = normalize( surface_to_light_vector );
                    vec3 H = normalize( L + E );
                    // Compute the diffuse and specular components from the Phong
                    // Reflection Model, using Blinn's "halfway vector" method:
                    float diffuse  =      max( dot( bumps_N, L ), 0.0 );
                    float specular = pow( max( dot( bumps_N, H ), 0.0 ), smoothness );
                    float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );

                    vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                              + light_colors[i].xyz * specularity * specular;
                    light_diffuse_contribution += attenuation * shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse;
                    light_specular_contribution += attenuation * shape_color.xyz * specularity * specular;
                    result += attenuation * light_contribution;
                  }
                return result;
              } `;
    }
    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // Same as Shadow_Textured_Phong_Shader except adds a line to allow for bump mapping
        return this.shared_glsl_code() + `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform sampler2D bump_texture;
            uniform sampler2D light_depth_texture;
            uniform mat4 light_view_mat;
            uniform mat4 light_proj_mat;
            uniform float animation_time;
            uniform float light_depth_bias;
            uniform bool use_texture;
            uniform bool use_bump_texture;
            uniform bool draw_shadow;
            uniform float light_texture_size;

            float PCF_shadow(vec2 center, float projected_depth) {
                float shadow = 0.0;
                float texel_size = 1.0 / light_texture_size;
                for(int x = -1; x <= 1; ++x)
                {
                    for(int y = -1; y <= 1; ++y)
                    {
                        float light_depth_value = texture2D(light_depth_texture, center + vec2(x, y) * texel_size).r;
                        shadow += projected_depth >= light_depth_value + light_depth_bias ? 1.0 : 0.0;
                    }
                }
                shadow /= 9.0;
                return shadow;
            }

            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord );
                if (!use_texture)
                    tex_color = vec4(0, 0, 0, 1);
                if( tex_color.w < .01 ) discard;

                // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w );

                // Compute the final color with contributions from lights:
                vec3 diffuse, specular;

                // calculate the bumped_N from bump_texture
                vec4 tex_bumps = texture2D( bump_texture, f_tex_coord );

                vec3 bumped_N  = N + 10.*(tex_bumps.rgb - .5*vec3(1,1,1));
                vec3 other_than_ambient = phong_model_lights( normalize( N ), normalize( bumped_N ), vertex_worldspace, diffuse, specular );
                gl_FragColor.xyz += other_than_ambient;


                // Deal with shadow:
                if (draw_shadow) {
                    vec4 light_tex_coord = (light_proj_mat * light_view_mat * vec4(vertex_worldspace, 1.0));
                    // convert NDCS from light's POV to light depth texture coordinates
                    light_tex_coord.xyz /= light_tex_coord.w;
                    light_tex_coord.xyz *= 0.5;
                    light_tex_coord.xyz += 0.5;
                    float light_depth_value = texture2D( light_depth_texture, light_tex_coord.xy ).r;
                    float projected_depth = light_tex_coord.z;

                    bool inRange =
                        light_tex_coord.x >= 0.0 &&
                        light_tex_coord.x <= 1.0 &&
                        light_tex_coord.y >= 0.0 &&
                        light_tex_coord.y <= 1.0;

                    float shadowness = PCF_shadow(light_tex_coord.xy, projected_depth);

                    if (inRange && shadowness > 0.3) {
                        diffuse *= 0.2 + 0.8 * (1.0 - shadowness);
                        specular *= 1.0 - shadowness;
                    }
                }

                gl_FragColor.xyz += diffuse + specular;
            } `;
    }
    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Add a little more to the base class's version of this method.
        super.update_GPU(context, gpu_addresses, gpu_state, model_transform, material);
        // Updated for assignment 4
        context.uniform1f(gpu_addresses.animation_time, gpu_state.animation_time / 1000);
        if (material.color_texture && material.color_texture.ready) {
            // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
            context.uniform1i(gpu_addresses.color_texture, 0); // 0 for color texture
            // For this draw, use the texture image from correct the GPU buffer:
            context.activeTexture(context["TEXTURE" + 0]);
            material.color_texture.activate(context);
            context.uniform1i(gpu_addresses.use_texture, 1);
        }
        else {
            context.uniform1i(gpu_addresses.use_texture, 0);
        }
        // add bump texture to differentiate from color texture
        if (material.bump_texture && material.bump_texture.ready) {
            // Select texture unit 0 for the fragment shader Sampler2D uniform called "texture":
            context.uniform1i(gpu_addresses.bump_texture, 2); // 0 for bump texture
            // For this draw, use the texture image from correct the GPU buffer:
            context.activeTexture(context["TEXTURE" + 2]);
            material.bump_texture.activate(context, 2);
            context.uniform1i(gpu_addresses.use_bump_texture, 1);
        }
        else {
            context.uniform1i(gpu_addresses.use_bump_texture, 0);
        }
        if (gpu_state.draw_shadow) {
            context.uniform1i(gpu_addresses.draw_shadow, 1);
            context.uniform1f(gpu_addresses.light_depth_bias, 0.003);
            context.uniform1f(gpu_addresses.light_texture_size, LIGHT_DEPTH_TEX_SIZE);
            context.uniform1i(gpu_addresses.light_depth_texture, 1); // 1 for light-view depth texture}
            if (material.light_depth_texture && material.light_depth_texture.ready) {
                context.activeTexture(context["TEXTURE" + 1]);
                material.light_depth_texture.activate(context, 1);
            }
        }
        else {
            context.uniform1i(gpu_addresses.draw_shadow, 0);
        }
    }
}
