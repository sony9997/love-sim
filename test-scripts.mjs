// 测试脚本是否正确加载
import { SCRIPTS } from './src/lib/game-data/scripts';

console.log('Available scripts:', Object.keys(SCRIPTS));
console.log('prologue_explore exists:', 'prologue_explore' in SCRIPTS);
console.log('prologue_explore content:', SCRIPTS.prologue_explore);
