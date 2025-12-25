// HLSL Vertex Shader - Orb Effect

struct VS_INPUT
{
    float3 position : POSITION;
    float2 uv : TEXCOORD0;
};

struct VS_OUTPUT {
  float4 position : SV_POSITION;
  float2 vUV : TEXCOORD0;
};

float4x4 worldViewProjection;

VS_OUTPUT main(VS_INPUT input) {
  VS_OUTPUT output;
  output.position = mul(worldViewProjection, float4(input.position, 1.0));
  output.vUV = input.uv;
  return output;
}