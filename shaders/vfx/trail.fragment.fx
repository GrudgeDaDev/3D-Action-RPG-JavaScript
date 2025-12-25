// Varying
struct PS_INPUT
{
    float2 vUV : TEXCOORD0;
};

// Uniforms
uniform float time;

// Permutation function
float3 permute(float3 x)
{
    return fmod(((x * 34.0) + 1.0) * x, 289.0);
}

// 2D Simplex noise
float snoise(float2 v)
{
    const float4 C = float4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                            0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                            -0.577350269189626, // -1.0 + 2.0 * C.x
                            0.024390243902439); // 1.0 / 41.0

    float2 i = floor(v + dot(v, C.yy));
    float2 x0 = v - i + dot(i, C.xx);

    float2 i1;
    i1 = (x0.x > x0.y) ? float2(1.0, 0.0) : float2(0.0, 1.0);
    float2 x1 = x0.xy + C.xx - i1;
    float2 x2 = x0.xy + C.zz;

    i = fmod(i, 289.0);
    float3 p = permute(permute(i.y + float3(0.0, i1.y, 1.0)) + i.x + float3(0.0, i1.x, 1.0));

    float3 m = max(0.5 - float3(dot(x0, x0), dot(x1, x1), dot(x2, x2)), 0.0);
    m = m * m;
    m = m * m;

    float3 x = 2.0 * fract(p * C.www) - 1.0;
    float3 h = abs(x) - 0.5;
    float3 ox = floor(x + 0.5);
    float3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    float3 g0 = float3(a0.x * x0.x + h.x * x0.y,
                       a0.y * x1.x + h.y * x1.y,
                       a0.z * x2.x + h.z * x2.y);

    return 130.0 * dot(m, g0);
}

float4 main(PS_INPUT input) : SV_TARGET
{
    float2 uv = input.vUV;
    // uv.y = time * 0.9; // Scroll the noise over time
    // uv.x = time * 0.1;
    float noise = snoise(uv * 2.5);
    float4 color = float4(10.0, 0.2, 0.0, 1.0); // Fireball color
    return color * noise;
}
