// Attributes
float3 position : POSITION;
float2 uv : TEXCOORD0;

// Uniforms
float4x4 worldViewProjection;

// Output structure
struct VS_OUTPUT {
  float4 Position : SV_POSITION;
  float2 UV : TEXCOORD0;
};

VS_OUTPUT main() {
  VS_OUTPUT output;
  output.Position = mul(worldViewProjection, float4(position, 1.0));
  output.UV = uv;
  return output;
}
