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
        this.do_color = color(1, 0.5, 0.2, 1);
        this.do_t = 0;
        this.re_transform = Mat4.translation(-6, 7, -7);
        this.re_color = color(0.3, 0.6, 1, 1);
        this.re_t = 0;

        // animation states
        this.animate_fa = false;
        this.animate_so = false;
        this.animate_la = false;
        this.animate_ti = false;

        // flag for texture
        this.texture = true;

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
        };

        this.shapes.cube.arrays.texture_coord = Vector.cast(
            [0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5], [0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5], 
            [0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5], [0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5], 
            [0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5], [0, 0], [0.5, 0], [0, 0.5], [0.5, 0.5]
        );
        
        const texture_coord_cube2 = this.shapes.cube2.arrays.texture_coord;
        for (let row_index = 0; row_index < texture_coord_cube2.length; row_index += 1) {
            texture_coord_cube2[row_index][0] *= 3;
            texture_coord_cube2[row_index][1] *= 3;
        }
        this.materials = {
            room_wall: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/cloud.jpg", "NEAREST"),
            }),
            stars: new Material(new Shadow_Textured_Phong_Shader(1), {
                color: color(.5, .5, .5, 1),
                ambient: .4, diffusivity: .5, specularity: .5,
                color_texture: new Texture("assets/stars.png"),
                light_depth_texture: null
    
            }),
            room_floor: new Material(new Textured_Phong(), {
                color: hex_color("#000000"),
                ambient: 1.0, diffusivity: 0.1, specularity: 0.1,
                texture: new Texture("assets/wood.jpeg", "NEAREST"),
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
            keys: new Material(new Bump_Map(1), { // texture for piano keys
                color: color(.5, .5, .5, 1),
                ambient: 0.3, diffusivity: 0.5, specularity: 0.5,
                texture: new Texture("assets/stars.png", "LINEAR_MIPMAP_LINEAR"),
                bump_texture: new Texture("assets/bumps.gif", "LINEAR_MIPMAP_LINEAR")
            }),
            pure: new Material(new Color_Phong_Shader(), {
                color: hex_color("#000000"),
                ambient: .3, diffusivity: 0.6, specularity: 0.4, smoothness: 64,
            }),
            bumps: new Material(new defs.Fake_Bump_Map(1), {
                color: color(.5, .5, .5, 1),
                ambient: 0.3, diffusivity: 0.5, specularity: .5, texture: new Texture("assets/stars.png")
            }),
            light_src: new Material(new Phong_Shader(), { // for light source
                color: color(1, 1, 1, 1), ambient: 1, diffusivity: 0, specularity: 0
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
        this.key_triggered_button("Texture", ["t"], () => {this.texture = !this.texture});

        this.key_triggered_button("Do", ["z"], () => {
            this.do = !this.do;
            if (!this.do_key) {
                this.do_start_t = this.t;
                this.do_key = true;
            }
        });

        this.key_triggered_button("Re", ["x"], () => {
            this.re = !this.re;
            if (!this.re_key) {
                this.re_start_t = this.t;
                this.re_key = true;
            }
        });

        this.key_triggered_button("Mi", ["c"], () => {
            if (!this.mi_key) {
                this.mi_start_t = this.t;
                this.mi_key = true;
            }
            if (!this.animate_mi) {
                this.animate_mi_start_t = this.t;
                this.animate_mi = true;
            }
        });

        this.key_triggered_button("Fa", ["v"], () => {
            if (!this.fa_key) {
                this.fa_start_t = this.t;
                this.fa_key = true;
            }
            if (!this.animate_fa) {
                this.animate_fa_start_t = this.t;
                this.animate_fa = true;
            }
        });

        this.key_triggered_button("So", ["b"], () => {
            if (!this.so_key) {
                this.so_start_t = this.t;
                this.so_key = true;
            }
            if (!this.animate_so) {
                this.animate_so_start_t = this.t;
                this.animate_so = true;
            }
        });

        this.key_triggered_button("La", ["n"], () => {
            if (!this.la_key) {
                this.la_start_t = this.t;
                this.la_key = true;
            }
            if (!this.animate_la) {
                this.animate_la_start_t = this.t;
                this.animate_la = true;
            }
        });

        this.key_triggered_button("Ti", ["m"], () => {
            if (!this.ti_key) {
                this.ti_start_t = this.t;
                this.ti_key = true;
            }
            if (!this.animate_ti) {
                this.animate_ti_start_t = this.t;
                this.animate_ti = true;
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
            this.shapes.sphere.draw(context, program_state,
                Mat4.translation(light_position[0], light_position[1], light_position[2]).times(Mat4.scale(.5,.5,.5)),
                this.materials.light_src.override({color: light_color}));
        }

        // Drawing Room
        let model_trans_room_floor = Mat4.translation(0, - 4 - 0.4, 0).times(Mat4.scale(22, 0.1, 28));
        let model_trans_room_back_wall = Mat4.translation(0,  2 - 0.1, -26).times(Mat4.scale(22, 8, 0.1));
        // let model_trans_room_left_wall = Mat4.translation(-11, - 2 - 0.2, 0).times(Mat4.scale(0.33, 2, 4));

        this.shapes.cube2.draw(context, program_state, model_trans_room_floor, shadow_pass? this.materials.room_floor : this.materials.room_floor);
        this.shapes.cube.draw(context, program_state, model_trans_room_back_wall, shadow_pass? this.materials.room_wall : this.materials.room_wall);
        // this.shapes.cube.draw(context, program_state, model_trans_room_left_wall, shadow_pass? this.materials.room_wall : this.materials.room_wall);

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

        if (this.do_key) {
            let do_elapsed_t = t - this.do_start_t;
            if (do_elapsed_t >= 0.2) this.do_key = false;
        }
        if (this.re_key) {
            let re_elapsed_t = t - this.re_start_t;
            if (re_elapsed_t >= 0.2) this.re_key = false;
        }
        if (this.mi_key) {
            let mi_elapsed_t = t - this.mi_start_t;
            if (mi_elapsed_t >= 0.2) this.mi_key = false;
        }
        if (this.fa_key) {
            let fa_elapsed_t = t - this.fa_start_t;
            if (fa_elapsed_t >= 0.2) this.fa_key = false;
        }
        if (this.so_key) {
            let so_elapsed_t = t - this.so_start_t;
            if (so_elapsed_t >= 0.2) this.so_key = false;
        }
        if (this.la_key) {
            let la_elapsed_t = t - this.la_start_t;
            if (la_elapsed_t >= 0.2) this.la_key = false;
        }
        if (this.ti_key) {
            let ti_elapsed_t = t - this.ti_start_t;
            if (ti_elapsed_t >= 0.2) this.ti_key = false;
        }

        let model_trans_key_1 = Mat4.translation(-9, this.do_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.do_key? pressed_height : unpressed_height, 3));
        let model_trans_key_2 = Mat4.translation(-6, this.re_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.re_key? pressed_height : unpressed_height, 3));
        let model_trans_key_3 = Mat4.translation(-3, this.mi_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.mi_key? pressed_height : unpressed_height, 3));
        let model_trans_key_4 = Mat4.translation(0, this.fa_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.fa_key? pressed_height : unpressed_height, 3));
        let model_trans_key_5 = Mat4.translation(3, this.so_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.so_key? pressed_height : unpressed_height, 3));
        let model_trans_key_6 = Mat4.translation(6, this.la_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.la_key? pressed_height : unpressed_height, 3));
        let model_trans_key_7 = Mat4.translation(9, this.ti_key? pressed_height : unpressed_height, 1).times(Mat4.scale(1, this.ti_key? pressed_height : unpressed_height, 3));

//         let key_material = shadow_pass?
//                                this.materials.shadow.override({color: color(1, 1, 1, 1), 
//                                color_texture: new Texture("assets/bumps.gif", "LINEAR_MIPMAP_LINEAR")}) 
//                                : this.materials.pure;
//         if (this.texture) {
//             key_material = this.materials.keys;   
//         }

        this.shapes.cube.draw(context, program_state, model_trans_key_1, shadow_pass? this.materials.keys : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_2, shadow_pass? this.materials.keys : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_3, shadow_pass? this.materials.keys : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_4, shadow_pass? this.materials.keys : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_5, shadow_pass? this.materials.keys : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_6, shadow_pass? this.materials.keys : this.materials.pure);
        this.shapes.cube.draw(context, program_state, model_trans_key_7, shadow_pass? this.materials.keys : this.materials.pure);

        // Drawing Shapes
        if (this.do) {
            this.do_t = this.do_t + dt;
        }
        let model_trans_shape_1 = Mat4.translation(-9, 5, -7)
                                    .times(Mat4.rotation(this.sin_modifier(0.5, 2, this.do_t), 1, 0, 0));
        let shape_1_color = color(this.sin_modifier(0.3, 5, this.do_t, 2.5, 0.5), 
                                    this.cos_modifier(0.4, 2, this.do_t, 1, 0.5), 0.7, 1);
        if (!this.do) {
            model_trans_shape_1 = this.do_transform;
            shape_1_color = this.do_color;
        } else {
            this.do_transform = model_trans_shape_1;
            this.do_color = shape_1_color;
        }

        if (this.re) {
            this.re_t = this.re_t + dt;
        }
        let model_trans_shape_2 = Mat4.translation(-6, this.cos_modifier(2, 2, this.re_t, 0, 6), -7)
                                                    .times(Mat4.rotation(this.sin_modifier(-3, 2, this.re_t), 1, this.cos_modifier(2, 1, this.re_t), 0));
        let shape_2_color = color(0.7, this.cos_modifier(0.2, 2, this.re_t, 1, 0.5), this.cos_modifier(0.4, 3, this.re_t, 1, 0.5), 1);
        if (!this.re) {
            model_trans_shape_1 = this.re_transform;
            shape_1_color = this.re_color;
        } else {
            this.re_transform = model_trans_shape_2;
            this.re_color = shape_2_color;
        }

        let model_trans_shape_3 = Mat4.translation(-3, 6, -7);        
        if (this.animate_mi) {
            const animate_mi_period = 1;
            let animate_mi_elapsed_t = t - this.animate_mi_start_t;
            let translation = this.sin_modifier(5, animate_mi_period, animate_mi_elapsed_t, -Math.PI/2, 5)/2;
            let rotation = this.sin_modifier(2*Math.PI, 0.5, animate_mi_elapsed_t, -Math.PI/2, 2*Math.PI)/2;
            if (animate_mi_elapsed_t >= animate_mi_period) {
                this.animate_mi = false;
            } else {
                model_trans_shape_3 = model_trans_shape_3
                    .times(Mat4.translation(0, 0, translation))
                    .times(Mat4.rotation(rotation, 1, 0, 0));
            }
        }

        let model_trans_shape_4 = Mat4.translation(0, 5, -7);
        if (this.animate_fa) {
            const animate_fa_period = 1;
            let animate_fa_elapsed_t = t - this.animate_fa_start_t;
            let rotate_fa = 1-this.sin_modifier(1, animate_fa_period, animate_fa_elapsed_t, -Math.PI/2, 1)/2;
            if (animate_fa_elapsed_t >= animate_fa_period) {
                this.animate_fa = false;
            } else {
                model_trans_shape_4 = model_trans_shape_4.times(Mat4.scale(rotate_fa, rotate_fa, 0, 0));
            }
        }

        let model_trans_shape_5 = Mat4.translation(3, 6, -7);
        const animate_so_period = 0.5;
        if (this.animate_so) {
            let animate_so_elapsed_t = t - this.animate_so_start_t;
            let translation = this.sin_modifier(3, animate_so_period, animate_so_elapsed_t, -Math.PI/2, 3)/2;
            if (animate_so_elapsed_t >= 2*animate_so_period) {
                this.animate_so = false;
            } else {
                model_trans_shape_5 = model_trans_shape_5
                    .times(Mat4.translation(0, -translation, 0));
            }
        }

        let model_trans_shape_6 = Mat4.translation(6, 5, -7).times(Mat4.rotation(5,0,5,0));
        const animate_la_period = 1;
        if (this.animate_la) {
            let animate_la_elapsed_t = t - this.animate_la_start_t;
            let shift = this.sin_modifier(5, animate_la_period, animate_la_elapsed_t, -Math.PI/2, 5)/2;
            if (animate_la_elapsed_t >= animate_la_period) {
                this.animate_la = false;
            } else {
                model_trans_shape_6 = model_trans_shape_6.times(Mat4.translation(0, shift, 0));
            }
        }

        let model_trans_shape_7 = Mat4.translation(9, 7, -7);
        if (this.animate_ti) {
            const animate_ti_period = 1;
            let animate_ti_elapsed_t = t - this.animate_ti_start_t;
            let rotate_ti = this.sin_modifier(5, animate_ti_period, animate_ti_elapsed_t, -Math.PI/2, 5)/2;
            if (animate_ti_elapsed_t >= animate_ti_period) {
                this.animate_ti = false;
            } else {
                model_trans_shape_7 = model_trans_shape_7.times(Mat4.rotation(rotate_ti, 0, rotate_ti, 0));
            }
        }

        this.shapes.shark.draw(context, program_state, this.do_transform, 
                                this.materials.shadow.override({color: this.do_color}));
        this.shapes.torus.draw(context, program_state, this.re_transform, 
                                this.materials.pure.override({color: this.re_color}));
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
                vec3(0, 12, 18),
                vec3(0, 2, 0),
                vec3(0, 1, 0)
            )); // Locate the camera here
        }

        // The position of the light
        this.light_position = Mat4.rotation(t / 1500, 0, 1, 0).times(vec4(3, 6, 0, 1));
        // The color of the light
        this.light_color = color(
            0.667 + Math.sin(t/500) / 3,
            0.667 + Math.sin(t/1500) / 3,
            0.667 + Math.sin(t/3500) / 3,
            1
        );

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

    // show_explanation(document_element) {
    //     document_element.innerHTML += "<p>This demo loads an external 3D model file of a teapot.  It uses a condensed version of the \"webgl-obj-loader.js\" "
    //         + "open source library, though this version is not guaranteed to be complete and may not handle some .OBJ files.  It is contained in the class \"Shape_From_File\". "
    //         + "</p><p>One of these teapots is lit with bump mapping.  Can you tell which one?</p>";
    // }
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
                    float diffuse  =      max( dot( N, L ), 0.0 );
                    float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
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

                vec3 bumped_N  = N + tex_bumps.rgb - .5*vec3(1,1,1);
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
            context.uniform1i(gpu_addresses.bump_texture, 0); // 0 for bump texture
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

