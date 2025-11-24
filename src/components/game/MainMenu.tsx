'use client';

import { motion } from 'framer-motion';
import { Play, RotateCcw, Settings } from 'lucide-react';

interface MainMenuProps {
    onNewGame: () => void;
    onLoadGame: () => void;
    hasSave: boolean;
}

export default function MainMenu({ onNewGame, onLoadGame, hasSave }: MainMenuProps) {
    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center bg-black">
            {/* Background with blur */}
            <div
                className="absolute inset-0 bg-[url('/assets/backgrounds/campus_map.png')] bg-cover bg-center opacity-50 blur-sm"
            />

            <div className="z-10 flex flex-col items-center space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="text-center"
                >
                    <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 drop-shadow-lg">
                        Love Sim
                    </h1>
                    <p className="mt-4 text-xl text-pink-200 font-light tracking-widest">
                        Qingyun University Chronicles
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex flex-col space-y-4 w-64"
                >
                    <button
                        onClick={onNewGame}
                        className="group relative flex items-center justify-center space-x-3 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all hover:bg-pink-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(236,72,153,0.5)]"
                    >
                        <Play className="h-5 w-5 fill-current" />
                        <span>New Game</span>
                    </button>

                    <button
                        onClick={onLoadGame}
                        disabled={!hasSave}
                        className={`group relative flex items-center justify-center space-x-3 rounded-full px-8 py-4 text-lg font-semibold backdrop-blur-md transition-all ${hasSave
                                ? "bg-white/10 text-white hover:bg-blue-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                                : "bg-white/5 text-gray-500 cursor-not-allowed"
                            }`}
                    >
                        <RotateCcw className="h-5 w-5" />
                        <span>Continue</span>
                    </button>

                    <button
                        className="group relative flex items-center justify-center space-x-3 rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all hover:bg-purple-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                    >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                    </button>
                </motion.div>
            </div>

            <div className="absolute bottom-8 text-xs text-gray-500">
                v0.1.0 • Developed by Antigravity
            </div>
        </div>
    );
}
