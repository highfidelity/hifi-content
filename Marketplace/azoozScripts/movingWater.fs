// Simple Water shader. (c) Victor Korsun, bitekas@gmail.com; 2012.
//
// Attribution-ShareAlike CC License.

#ifdef GL_ES
precision highp float;
#endif

const float PI = 3.1415926535897932;

// play with these parameters to custimize the effect
// ===================================================

//speed
uniform float speed = 0.15;
uniform float speed_x = 0.3;
uniform float speed_y = 0.3;

//velocity
uniform vec2 velocity = {0.0, 0.0};

// refraction
const float emboss = 2.5;
const float intensity = 3;
const int steps = 5;
const float frequency = 3;
const int angle = 7; // better when a prime

// reflection
const float delta = 50.;
const float intence = 10.;

const float reflectionCutOff = 0.012;
const float reflectionIntence = 200000.;

// ===================================================

float time = iGlobalTime*1.3;

float col(vec2 coord) {
    float delta_theta = 2.0 * PI / float(angle);
    float col = 0.0;
    float theta = 0.0;
    for (int i = 0; i < steps; i++) {
        vec2 adjc = coord;
        theta = delta_theta*float(i);
        adjc.x += cos(theta)*time*speed + time * speed_x;
        adjc.y -= sin(theta)*time*speed - time * speed_y;
        col = col + cos((adjc.x*cos(theta) - adjc.y*sin(theta))*frequency)*intensity;
    }

    return cos(col);
}

//---------- main

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 p = (fragCoord.xy) / iResolution.xy, c1 = p, c2 = p;

    float cc1 = col(c1);

    c2.x += iResolution.x/delta;
    float dx = emboss*(cc1-col(c2))/delta;

    c2.x = p.x;
    c2.y += iResolution.y / delta;
    float dy = emboss*(cc1-col(c2))/delta;

    c1.x += dx*2.;
    c1.y = -(c1.y+dy*2.);

    float alpha = 1.+dot(dx,dy)*intence;
    	
    float ddx = dx - reflectionCutOff;
    float ddy = dy - reflectionCutOff;
    if (ddx > 0. && ddy > 0.) {
    	alpha = pow(alpha, ddx * ddy * reflectionIntence);
    }
    //
    c1 /= 4.0;
    //	
    vec4 col = texture(iChannel0, c1) * (alpha);
    fragColor = col;
}


float getProceduralColors(inout vec3 diffuse, inout vec3 specular, inout float shininess) {
	vec2 position = _position.xz;
	position += 0.5;
    position.x += time * velocity.x;
    position.y += time * velocity.y;
	position.y = 1.0 - position.y;
	vec4 pixelColor;
	mainImage(pixelColor, position * iWorldScale.xz);

	diffuse = pixelColor.rgb;	// Return 0.0 and color in diffuse for a lit surface
	specular = pixelColor.rgb;	// or return 1.0 and color in specular for unlit surface.
	return 1.0;
}