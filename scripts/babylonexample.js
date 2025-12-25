import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Sparkles,
  Zap,
  Terminal,
  Database,
  ChevronRight,
  Search,
  Settings2,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Note: In a real app, you'd import * as BABYLON from 'babylonjs';
// This simulation shows how the UI interacts with the Babylon Engine.

const BabylonAdminLobby = () => {
  const canvasRef = useRef(null);
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState([
    "Engine initialized...",
    "Waiting for AI command...",
  ]);

  // UI State
  const scenes = [
    { id: "env_1", name: "Main Archipelago", status: "Loaded" },
    { id: "env_2", name: "Underground Lab", status: "Standby" },
    { id: "env_3", name: "Neon City", status: "Standby" },
  ];

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (!command) return;

    // 1. Log the intent
    setLogs((prev) => [...prev.slice(-4), `AI Processing: "${command}"`]);

    // 2. EMIT TO NODE.JS (Simulation)
    // socket.emit('ai-command', { prompt: command });

    // 3. UI Feedback
    setCommand("");

    // 4. Simulate Babylon Response
    setTimeout(() => {
      setLogs((prev) => [...prev, `Success: Modified Scene Node [Grid_Alpha]`]);
    }, 1500);
  };

  return (
    <div className="flex h-screen w-full bg-[#050505] text-slate-200 overflow-hidden font-sans">
      {/* LEFT: ASSET REGISTRY */}
      <aside className="w-72 bg-[#0c0c0c] border-r border-yellow-500/10 flex flex-col shadow-2xl z-20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Database className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-lg font-black tracking-widest text-white uppercase">
              Assets
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search Node.js DB..."
              className="pl-10 bg-white/5 border-none"
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                Meshes (Babylon)
              </p>
              {["Generic_Box_01", "Player_Capsule", "Terrain_Chunk"].map(
                (mesh) => (
                  <div
                    key={mesh}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-yellow-500/10 cursor-pointer group"
                  >
                    <Box className="w-4 h-4 text-slate-500 group-hover:text-yellow-500" />
                    <span className="text-sm text-slate-400 group-hover:text-white">
                      {mesh}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>
        </ScrollArea>
      </aside>

      {/* MAIN: BABYLON VIEWPORT & SCENE CARDS */}
      <main className="flex-1 flex flex-col relative bg-[#080808]">
        {/* TOP NAV */}
        <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-black/40 backdrop-blur-md">
          <div className="flex gap-4">
            {["Lobby", "Live Editor", "Network", "Security"].map((tab) => (
              <span
                key={tab}
                className="text-xs font-bold text-slate-500 hover:text-yellow-500 cursor-pointer transition-colors uppercase tracking-widest"
              >
                {tab}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono text-green-500/70 uppercase">
              Node.js Connected
            </span>
          </div>
        </div>

        {/* GENERIC BOXES GRID (UX EXAMPLE) */}
        <div className="p-8 grid grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {scenes.map((s) => (
            <Card
              key={s.id}
              className="bg-[#111] border-white/5 hover:border-yellow-500/30 transition-all p-4 cursor-pointer group"
            >
              <div className="aspect-video bg-[#050505] rounded-lg mb-4 flex items-center justify-center border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#eab308_1px,transparent_1px)] [background-size:16px_16px]" />
                <Box className="w-12 h-12 text-yellow-500/20 group-hover:text-yellow-500/50 transition-all" />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-bold">{s.name}</h4>
                  <span className="text-[10px] text-slate-500 uppercase">
                    {s.status}
                  </span>
                </div>
                <ChevronRight className="text-slate-600 group-hover:text-yellow-500 transition-all" />
              </div>
            </Card>
          ))}
        </div>

        {/* AI COMMAND CENTER (BOTTOM OVERLAY) */}
        <div className="mt-auto p-8 flex justify-center w-full">
          <div className="w-full max-w-3xl">
            <div className="bg-[#151515] border border-yellow-500/20 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <form onSubmit={handleAISubmit} className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center text-black shadow-lg">
                  <Sparkles size={20} />
                </div>
                <Input
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="AI: Adjust generic boxes, light colors, or spawn assets..."
                  className="bg-transparent border-none text-white text-lg focus-visible:ring-0 px-0 h-10"
                />
                <Button
                  type="submit"
                  className="bg-white/5 hover:bg-yellow-500 hover:text-black font-bold rounded-xl px-6"
                >
                  EXECUTE <Zap size={14} className="ml-2 fill-current" />
                </Button>
              </form>

              {/* LOG TERMINAL */}
              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal size={12} className="text-yellow-500" />
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                    System Log
                  </span>
                </div>
                <div className="font-mono text-[11px] space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className="text-slate-400">
                      <span className="text-yellow-500/50 mr-2">{">"}</span>{" "}
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* QUICK SETTINGS */}
      <aside className="w-16 bg-black border-l border-white/5 flex flex-col items-center py-8 gap-8">
        <Settings2 className="w-5 h-5 text-slate-500 hover:text-yellow-500 cursor-pointer" />
        <Layers className="w-5 h-5 text-slate-500 hover:text-yellow-500 cursor-pointer" />
      </aside>
    </div>
  );
};

export default BabylonAdminLobby;
