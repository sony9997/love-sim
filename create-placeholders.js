#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 创建SVG占位符图片
function createPlaceholder(width, height, text, color, outputPath) {
    const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dominant-baseline="middle">
    ${text}
  </text>
</svg>`.trim();

    fs.writeFileSync(outputPath, svg);
    console.log(`Created: ${outputPath}`);
}

// 角色配置
const characters = [
    { id: 'su_qingqian', name: '苏清浅', color: '#4A5568' },
    { id: 'chen_siyao', name: '陈思瑶', color: '#ED8936' },
    { id: 'ling_ruoyu', name: '凌若羽', color: '#805AD5' },
    { id: 'lu_jiaxin', name: '陆嘉欣', color: '#E53E3E' }
];

const emotions = ['default', 'happy', 'angry', 'sad', 'blush'];

// 创建角色图片
characters.forEach(char => {
    const charDir = path.join(__dirname, 'public', 'assets', 'characters', char.id);

    // 创建目录
    if (!fs.existsSync(charDir)) {
        fs.mkdirSync(charDir, { recursive: true });
    }

    // 创建头像
    createPlaceholder(200, 200, char.name, char.color, path.join(charDir, 'avatar.png'));

    // 创建各种表情
    emotions.forEach(emotion => {
        const emotionText = {
            default: '默认',
            happy: '开心',
            angry: '生气',
            sad: '悲伤',
            blush: '脸红'
        }[emotion];

        createPlaceholder(
            1080,
            1920,
            `${char.name}\\n${emotionText}`,
            char.color,
            path.join(charDir, `${emotion}.png`)
        );
    });
});

// 创建背景图片
const backgrounds = [
    { id: 'dorm_room', name: '宿舍', color: '#2D3748' },
    { id: 'campus_map', name: '校园地图', color: '#2F855A' },
    { id: 'library', name: '图书馆', color: '#2C5282' },
    { id: 'classroom', name: '教室', color: '#744210' },
    { id: 'cafeteria', name: '食堂', color: '#C05621' },
    { id: 'student_council', name: '学生会', color: '#1A365D' },
    { id: 'lab', name: '实验室', color: '#553C9A' },
    { id: 'city_map', name: '市中心', color: '#1A202C' },
    { id: 'bar', name: '酒吧', color: '#742A2A' },
    { id: 'biker_club', name: '机车俱乐部', color: '#171923' }
];

const bgDir = path.join(__dirname, 'public', 'assets', 'backgrounds');
if (!fs.existsSync(bgDir)) {
    fs.mkdirSync(bgDir, { recursive: true });
}

backgrounds.forEach(bg => {
    createPlaceholder(
        1920,
        1080,
        bg.name,
        bg.color,
        path.join(bgDir, `${bg.id}.png`)
    );
});

console.log('\\n✅ All placeholder images created successfully!');
console.log('📝 Check CHARACTER_IMAGES.md for details on replacing these with real artwork.');
