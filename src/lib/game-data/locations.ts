import { Location } from './types';

export const LOCATIONS: Record<string, Location> = {
    dorm_room: {
        id: 'dorm_room',
        name: 'Dorm Room',
        description: 'Your messy room. A place to rest and study.',
        background: '/assets/backgrounds/dorm_room.png',
        interactables: [
            { id: 'bed', label: 'Sleep', action: 'examine' },
            { id: 'computer', label: 'Check Messages', action: 'talk', target: 'meet_jiangyu' }, // Trigger Heroine 4
            { id: 'door', label: 'Leave', action: 'move', target: 'campus_map' },
        ],
    },
    campus_map: {
        id: 'campus_map',
        name: 'Qingyun University Map',
        description: 'The map of the campus.',
        background: '/assets/backgrounds/campus_map.png',
        interactables: [
            { id: 'loc_dorm', label: 'Dormitory', action: 'move', target: 'dorm_room' },
            { id: 'loc_library', label: 'Library', action: 'move', target: 'library' },
            { id: 'loc_classroom', label: 'Classroom', action: 'move', target: 'classroom' },
            { id: 'loc_cafeteria', label: 'Cafeteria', action: 'move', target: 'cafeteria' },
            { id: 'loc_city', label: 'Go to City', action: 'move', target: 'city_map' },
        ],
    },
    library: {
        id: 'library',
        name: 'Library',
        description: 'Quiet and full of books. Good for studying.',
        background: '/assets/backgrounds/library.png',
        interactables: [
            { id: 'study_table', label: 'Study', action: 'examine' },
            { id: 'meet_girl', label: 'Look around', action: 'talk', target: 'meet_linyue' }, // Trigger Heroine 1
            { id: 'exit', label: 'Leave', action: 'move', target: 'campus_map' },
        ],
    },
    classroom: {
        id: 'classroom',
        name: 'Classroom 302',
        description: 'Where you have your CS lectures.',
        background: '/assets/backgrounds/classroom.png',
        interactables: [
            { id: 'desk', label: 'Attend Class', action: 'talk', target: 'meet_professor' }, // Trigger Heroine 5
            { id: 'exit', label: 'Leave', action: 'move', target: 'campus_map' },
        ],
    },
    cafeteria: {
        id: 'cafeteria',
        name: 'Cafeteria',
        description: 'Smells like cheap food and instant noodles.',
        background: '/assets/backgrounds/cafeteria.png',
        interactables: [
            { id: 'food_counter', label: 'Buy Food', action: 'talk', target: 'meet_suqing' }, // Trigger Heroine 2
            { id: 'exit', label: 'Leave', action: 'move', target: 'campus_map' },
        ],
    },
    city_map: {
        id: 'city_map',
        name: 'Changsha City Map',
        description: 'The bustling city center.',
        background: '/assets/backgrounds/city_map.png',
        interactables: [
            { id: 'loc_campus', label: 'Return to Campus', action: 'move', target: 'campus_map' },
            { id: 'loc_mall', label: 'Shopping Mall', action: 'talk', target: 'meet_chenxi' }, // Trigger Heroine 3
            { id: 'loc_park', label: 'Riverside Park', action: 'move', target: 'park' },
        ],
    },
};
