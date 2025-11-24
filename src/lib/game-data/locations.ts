import { Location } from './types';

export const LOCATIONS: Record<string, Location> = {
    dorm_room: {
        id: 'dorm_room',
        name: { en: 'Dorm Room', zh: '宿舍' },
        description: { en: 'Your small but cozy room. It is a bit messy.', zh: '你的小窝，虽然不大但很温馨。有点乱。' },
        background: '/assets/backgrounds/dorm_room.png',
        interactables: [
            { id: 'bed', label: { en: 'Sleep', zh: '睡觉' }, action: 'move', target: 'dorm_room' }, // Just a placeholder action
            { id: 'computer', label: { en: 'Study', zh: '学习' }, action: 'examine' },
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
        ],
    },
    campus_map: {
        id: 'campus_map',
        name: { en: 'Campus Map', zh: '校园地图' },
        description: { en: 'The main campus of Qingyun University.', zh: '庆云大学的主校区。' },
        background: '/assets/backgrounds/campus_map.png',
        interactables: [
            { id: 'loc_dorm', label: { en: 'Dorm', zh: '宿舍' }, action: 'move', target: 'dorm_room' },
            { id: 'loc_library', label: { en: 'Library', zh: '图书馆' }, action: 'move', target: 'library' },
            { id: 'loc_classroom', label: { en: 'Classroom', zh: '教室' }, action: 'move', target: 'classroom' },
            { id: 'loc_cafeteria', label: { en: 'Cafeteria', zh: '食堂' }, action: 'move', target: 'cafeteria' },
            { id: 'loc_city', label: { en: 'City', zh: '市区' }, action: 'move', target: 'city_map' },
        ],
    },
    library: {
        id: 'library',
        name: { en: 'Library', zh: '图书馆' },
        description: { en: 'Quiet and filled with books. Perfect for studying.', zh: '安静的图书馆，充满了书香气息。适合学习。' },
        background: '/assets/backgrounds/library.png',
        interactables: [
            { id: 'study_table', label: { en: 'Study', zh: '自习' }, action: 'examine' },
            { id: 'door', label: { en: 'Leave', zh: '离开' }, action: 'move', target: 'campus_map' },
            { id: 'talk_linyue', label: { en: 'Look around', zh: '四处看看' }, action: 'talk', target: 'meet_linyue' },
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
            { id: 'talk_suqing', label: { en: 'Find a seat', zh: '找座位' }, action: 'talk', target: 'meet_suqing' },
        ],
    },
    city_map: {
        id: 'city_map',
        name: { en: 'Changsha City', zh: '常纱市' },
        description: { en: 'The bustling city center.', zh: '繁华的市中心。' },
        background: '/assets/backgrounds/city_map.png',
        interactables: [
            { id: 'loc_campus', label: { en: 'Campus', zh: '回学校' }, action: 'move', target: 'campus_map' },
            { id: 'loc_mall', label: { en: 'Mall', zh: '商场' }, action: 'examine' },
            { id: 'loc_park', label: { en: 'Park', zh: '公园' }, action: 'examine' },
            { id: 'talk_chenxi', label: { en: 'Walk around', zh: '逛街' }, action: 'talk', target: 'meet_chenxi' },
        ],
    },
};
