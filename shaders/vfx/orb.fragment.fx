#define saturate(oo) clamp(oo, 0.0, 1.0)

#define MarchSteps 8
#define ExpPosition float3(0.0, 0.0, 0.0)
// #define Radius 2.0
// #define Background float4(0.1, 0.0, 0.0, 0.0)
// #define NoiseSteps 8
// #define NoiseAmplitude 0.09
// #define NoiseFrequency 1.2
// #define Animation float3(0.0, -2.0, 0.5)
// #define Color1 float4(1.0, 0.0, 0.0, 1.0)
// #define Color2 float4(1.0, 0.6, 0.0, 1.0)
// #define Color3 float4(1.0, 0.03, 0.0, 1.0)
// #define Color4 float4(0.05, 0.02, 0.02, 1.0)

uniform float Radius;
uniform float4 Background;
uniform int NoiseSteps;
uniform float NoiseAmplitude;
uniform float NoiseFrequency;
uniform float3 Animation;
uniform float4 Color1;
uniform float4 Color2;
uniform float4 Color3;
uniform float4 Color4;

uniform float iTime;
uniform float2 iResolution;
uniform float2 iMouse;

float2 vUV : TEXCOORD0;

float3 mod289(float3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float4 mod289(float4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
float4 permute(float4 x) { return mod289(((x * 34.0) + 1.0) * x); }
float4 taylorInvSqrt(float4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(float3 v)
{
    const float2 C = float2(1.0 / 6.0, 1.0 / 3.0);
    const float4 D = float4(0.0, 0.5, 1.0, 2.0);

    float3 i = floor(v + dot(v, C.yyy));
    float3 x0 = v - i + dot(i, C.xxx);

    float3 g = step(x0.yzx, x0.xyz);
    float3 l = 1.0 - g;
    float3 i1 = min(g.xyz, l.zxy);
    float3 i2 = max(g.xyz, l.zxy);

    float3 x1 = x0 - i1 + C.xxx;
    float3 x2 = x0 - i2 + C.yyy;
    float3 x3 = x0 - D.yyy;

    i = mod289(i);
    float4 p = permute(permute(permute(i.z + float4(0.0, i1.z, i2.z, 1.0)) + i.y + float4(0.0, i1.y, i2.y, 1.0)) + i.x + float4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    float3 ns = n_ * D.wyz - D.xzx;

    float4 j = p - 49.0 * floor(p * ns.z * ns.z);
    float4 x_ = floor(j * ns.z);
    float4 y_ = floor(j - 7.0 * x_);
    float4 x = x_ * ns.x + ns.yyyy;
    float4 y = y_ * ns.x + ns.yyyy;
    float4 h = 1.0 - abs(x) - abs(y);

    float4 b0 = float4(x.xy, y.xy);
    float4 b1 = float4(x.zw, y.zw);

    float4 s0 = floor(b0) * 2.0 + 1.0;
    float4 s1 = floor(b1) * 2.0 + 1.0;
    float4 sh = -step(h, float4(0.0, 0.0, 0.0, 0.0));

    float4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    float4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    float3 p0 = float3(a0.xy, h.x);
    float3 p1 = float3(a0.zw, h.y);
    float3 p2 = float3(a1.xy, h.z);
    float3 p3 = float3(a1.zw, h.w);

    float4 norm = taylorInvSqrt(float4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    float4 m = max(0.6 - float4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, float4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float Turbulence(float3 position, float minFreq, float maxFreq, float qWidth)
{
    float value = 0.0;
    float cutoff = clamp(0.5 / qWidth, 0.0, maxFreq);
    float fade;
    float fOut = minFreq;
    for (int i = NoiseSteps; i >= 0; i--)
    {
        if (fOut >= 0.5 * cutoff)
            break;
        fOut *= 2.0;
        value += abs(snoise(position * fOut)) / fOut;
    }
    fade = clamp(2.0 * (cutoff - fOut) / cutoff, 0.0, 1.0);
    value += fade * abs(snoise(position * fOut)) / fOut;
    return 1.0 - value;
}

float SphereDist(float3 position)
{
    return length(position - ExpPosition) - Radius;
}

float4 Shade(float distance)
{
    float c1 = saturate(distance * 5.0 + 0.5);
    float c2 = saturate(distance * 5.0);
    float c3 = saturate(distance * 3.4 - 0.5);
    float4 a = lerp(Color1, Color2, c1);
    float4 b = lerp(a, Color3, c2);
    return lerp(b, Color4, c3);
}

float RenderScene(float3 position, out float distance)
{
    float noise = Turbulence(position * NoiseFrequency + Animation * iTime, 0.1, 1.5, 0.03) * NoiseAmplitude;
    noise = saturate(abs(noise));
    distance = SphereDist(position) - noise;
    return noise;
}

float4 March(float3 rayOrigin, float3 rayStep)
{
    float3 position = rayOrigin;
    float distance;
    float displacement;
    for (int step = MarchSteps; step >= 0; --step)
    {
        displacement = RenderScene(position, distance);
        if (distance < 0.05)
            break;
        position += rayStep * distance;
    }
    return lerp(Shade(displacement), Background, float(distance >= 0.5));
}

float4 main() : COLOR
{
    float2 p = (vUV * 2.0 - 1.0) * float2(iResolution.x / iResolution.y, 1.0);
    float3 ro = float3(0.0, 0.0, 5.0);
    float3 rd = normalize(float3(p, -1.5));
    float4 col = Background;
    float3 origin;
    if (SphereDist(ro + rd * Radius) <= Radius)
    {
        col = March(ro, rd);
    }
    return col;
}