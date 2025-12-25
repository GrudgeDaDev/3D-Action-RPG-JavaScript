// Uniforms
cbuffer TransformBuffer : register(b0) {
    float4x4 worldViewProjection;
};

// Input
struct VS_INPUT {
    float3 position : POSITION;
    float2 uv : TEXCOORD0;
};

// Output
struct VS_OUTPUT {
    float4 position : SV_POSITION;
    float2 uv : TEXCOORD0;
};

VS_OUTPUT main(VS_INPUT input) {
    VS_OUTPUT output;
    output.position = mul(float4(input.position, 1.0), worldViewProjection);
    output.uv = input.uv;
    return output;
}
