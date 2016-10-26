#version 410 core


// Working with quads, so four vertices out
layout(vertices = 4) out;

uniform float u_tessLevelInner;
uniform float u_tessLevelOuter;

void main(void)
{
    
    float level = 1.0;
    
    // Outer tessellation level, so we have four "outer" rows and columns
    gl_TessLevelOuter[0] = u_tessLevelOuter;
    gl_TessLevelOuter[1] = u_tessLevelOuter;
    gl_TessLevelOuter[2] = u_tessLevelOuter;
    gl_TessLevelOuter[3] = u_tessLevelOuter;
    
    // Inner tessellation level, so we have four "inner" rows and columns
    gl_TessLevelInner[0] = u_tessLevelInner;
    gl_TessLevelInner[1] = u_tessLevelInner;
    
    // Finally, we have a four by four tessellated plane
    gl_out[gl_InvocationID].gl_Position = gl_in[gl_InvocationID].gl_Position;
}

