// Varying
float2 vUV : TEXCOORD0;

// Uniforms
float time;

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

    float3 x = 2.0 * frac(p * C.www) - 1.0;
    float3 h = abs(x) - 0.5;
    float3 ox = floor(x + 0.5);
    float3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    float3 g0 = float3(a0.x * x0.x + h.x * x0.y,
                       a0.y * x1.x + h.y * x1.y,
                       a0.z * x2.x + h.z * x2.y);

    return 130.0 * dot(m, g0);
}

float4 main() : SV_TARGET
{
    float2 uv = vUV;
    float noise = snoise(uv * 2.5);

    // Create a gradient for alpha based on the vertical position with faster falloff
    // float alpha = pow(uv.x, 5.0);
    // float alpha = pow(uv.y, 4.0);
    // Reverse the gradient and limit it to the top half
    // float alpha = (uv.y > 0.5) ? pow(1.0 - uv.y, 2.0) * 2.0 : 0.0;

    float alphaX = pow(1.0 - uv.x, 8.5); // Adjust power to control falloff rate
    float alphaY = pow(uv.y, 8.5);       // Adjust power to control falloff rate

    // Combine the two alpha values (multiplication will ensure a stronger effect where both are high)
    float combinedAlpha = alphaX * alphaY;
    float maxAlpha = 2.01; // Adjust this value to set the maximum alpha
    float alpha = min(combinedAlpha, maxAlpha);

    uv.y += 10.0;

    float4 color = float4(10.0, 0.2, 0.0, alpha);
    return color;
}