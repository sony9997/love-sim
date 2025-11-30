import { Location } from './types';

export const LOCATIONS: Record<string, Location> = {
    dorm_room: {
        id: 'dorm_room',
        name: { en: 'Dorm Room', zh: '宿舍' },
        description: { en: 'Your small but cozy room. It is a bit messy.', zh: '你的小窝，虽然不大但很温馨。有点乱。' },
        background: '/assets/backgrounds/dorm_room.png',
        interactables: [
            { id: 'bed', label: { en: 'Sleep', zh: '睡觉' }, action: 'move', target: 'dorm_room' },
            { id: 'computer', label: { en: 'Study', zh: '学习' }, action: 'examine' },
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
        ],
    },
    campus_map: {
        id: 'campus_map',
        name: { en: 'Campus Map', zh: '校园地图' },
        description: { en: 'The main campus of Mist City University.', zh: '雾城大学的主校区。' },
        background: '/assets/backgrounds/campus_map.png',
        interactables: [
            { id: 'loc_dorm', label: { en: 'Dorm', zh: '宿舍' }, action: 'move', target: 'dorm_room' },
            { id: 'loc_library', label: { en: 'Library', zh: '图书馆' }, action: 'move', target: 'library' },
            { id: 'loc_classroom', label: { en: 'Classroom', zh: '教室' }, action: 'move', target: 'classroom' },
            { id: 'loc_cafeteria', label: { en: 'Cafeteria', zh: '食堂' }, action: 'move', target: 'cafeteria' },
            { id: 'loc_student_council', label: { en: 'Student Council', zh: '学生会' }, action: 'move', target: 'student_council' },
            { id: 'loc_lab', label: { en: 'Physics Lab', zh: '物理实验室' }, action: 'move', target: 'lab' },
            { id: 'loc_city', label: { en: 'City', zh: '市区' }, action: 'move', target: 'city_map' },
        ],
    },
    library: {
        id: 'library',
        name: { en: 'Library', zh: '图书馆' },
        description: { en: 'Quiet and filled with books. Su Qingqian might be here.', zh: '安静的图书馆。苏清浅可能在这里。' },
        background: '/assets/backgrounds/library.png',
        interactables: [
            { id: 'study_table', label: { en: 'Study', zh: '自习' }, action: 'examine' },
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
            { id: 'talk_su_qingqian', label: { en: 'Look for Su Qingqian', zh: '找苏清浅' }, action: 'talk', target: 'su_qingqian' },
        ],
    },
    classroom: {
        id: 'classroom',
        name: { en: 'Classroom', zh: '教室' },
        description: { en: 'A standard university lecture hall.', zh: '标准的大学阶梯教室。' },
        background: '/assets/backgrounds/classroom.png',
        interactables: [
            { id: 'desk', label: { en: 'Sit Down', zh: '坐下' }, action: 'examine' },
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
            { id: 'talk_professor', label: { en: 'Attend Class', zh: '上课' }, action: 'talk', target: 'meet_professor' },
        ],
    },
    cafeteria: {
        id: 'cafeteria',
        name: { en: 'Cafeteria', zh: '食堂' },
        description: { en: 'Smells of cheap but delicious food.', zh: '飘散着便宜又美味的食物香气。' },
        background: '/assets/backgrounds/cafeteria.png',
        interactables: [
            { id: 'food_counter', label: { en: 'Buy Food', zh: '买饭' }, action: 'examine' },
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
        ],
    },
    student_council: {
        id: 'student_council',
        name: { en: 'Student Council Office', zh: '学生会办公室' },
        description: { en: 'The center of student power. Very organized.', zh: '学生权力的中心。非常整洁有序。' },
        background: '/assets/backgrounds/student_council.png',
        interactables: [
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
            { id: 'talk_su_qingqian', label: { en: 'Talk to President', zh: '找会长' }, action: 'talk', target: 'su_qingqian' },
        ],
    },
    lab: {
        id: 'lab',
        name: { en: 'Physics Lab', zh: '物理实验室' },
        description: { en: 'Filled with complex equipment. Ling Ruoyu works here.', zh: '充满了复杂的设备。凌若羽在这里工作。' },
        background: '/assets/backgrounds/lab.png',
        interactables: [
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
            { id: 'talk_ling_ruoyu', label: { en: 'Find Prof. Ling', zh: '找凌教授' }, action: 'talk', target: 'ling_ruoyu' },
        ],
    },
    city_map: {
        id: 'city_map',
        name: { en: 'Mist City Center', zh: '雾城市中心' },
        description: { en: 'The bustling city center.', zh: '繁华的市中心。' },
        background: '/assets/backgrounds/city_map.png',
        interactables: [
            { id: 'loc_campus', label: { en: 'Campus', zh: '回学校' }, action: 'move', target: 'campus_map' },
            { id: 'loc_mall', label: { en: 'Mall', zh: '商场' }, action: 'examine' },
            { id: 'loc_bar', label: { en: 'Bar', zh: '酒吧' }, action: 'move', target: 'bar' },
            { id: 'loc_biker_club', label: { en: 'Biker Club', zh: '机车俱乐部' }, action: 'move', target: 'biker_club' },
            { id: 'talk_chen_siyao', label: { en: 'Walk around', zh: '逛街' }, action: 'talk', target: 'chen_siyao' },
        ],
    },
    bar: {
        id: 'bar',
        name: { en: 'Bar', zh: '酒吧' },
        description: { en: 'Dimly lit and noisy. Lu Jiaxin sings here sometimes.', zh: '灯光昏暗，有些嘈杂。陆嘉欣有时会在这里驻唱。' },
        background: '/assets/backgrounds/bar.png',
        interactables: [
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'city_map' },
            { id: 'talk_lu_jiaxin', label: { en: 'Look for Lu Jiaxin', zh: '找陆嘉欣' }, action: 'talk', target: 'lu_jiaxin' },
        ],
    },
    biker_club: {
        id: 'biker_club',
        name: { en: 'Biker Club', zh: '机车俱乐部' },
        description: { en: 'Smells of gasoline and leather.', zh: '充满了汽油和皮革的味道。' },
        background: '/assets/backgrounds/biker_club.png',
        interactables: [
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'city_map' },
            { id: 'talk_lu_jiaxin', label: { en: 'Hang out', zh: '闲逛' }, action: 'talk', target: 'lu_jiaxin' },
        ],
    },
};
