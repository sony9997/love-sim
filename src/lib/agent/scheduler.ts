import type { CharacterId, LocationId, Time, LocalizedText, Stats } from '../game-data/types';

export { CharacterId };
export interface DailySchedule {
    timeSlot: string; // "06:00-08:00"
    defaultLocation: LocationId;
    activities: Activity[];
}

export interface Activity {
    id: string;
    name: LocalizedText;
    duration: number; // hours
    requiredLocation: LocationId;
    impact: {
        affection?: number;
        stats?: Partial<Omit<Stats, 'charm'>>; // charm is not a stat, it's for UI display
        moodChange?: string;
    };
}

export const CHARACTER_SCHEDULES: Record<CharacterId, DailySchedule[]> = {
    su_qingqian: [
        { timeSlot: '06:00-08:00', defaultLocation: 'dorm_room', activities: [] },
        { timeSlot: '08:00-12:00', defaultLocation: 'classroom', activities: [{ id: 'study', name: 'Study', duration: 4, requiredLocation: 'classroom', impact: { stats: { intelligence: 2 } } }] },
        { timeSlot: '12:00-14:00', defaultLocation: 'cafeteria', activities: [{ id: 'lunch', name: 'Lunch', duration: 2, requiredLocation: 'cafeteria', impact: { moodChange: 'neutral' } }] },
        { timeSlot: '14:00-18:00', defaultLocation: 'student_council', activities: [{ id: 'council', name: 'Student Council', duration: 4, requiredLocation: 'student_council', impact: { stats: { intelligence: 1 } } }] },
        { timeSlot: '18:00-22:00', defaultLocation: 'library', activities: [{ id: 'read', name: 'Read', duration: 4, requiredLocation: 'library', impact: { stats: { intelligence: 3 } } }] },
        { timeSlot: '22:00-06:00', defaultLocation: 'dorm_room', activities: [] },
    ],
    chen_siyao: [
        { timeSlot: '07:00-09:00', defaultLocation: 'dorm_room', activities: [] },
        { timeSlot: '09:00-12:00', defaultLocation: 'campus_map', activities: [{ id: 'practice', name: 'Practice', duration: 3, requiredLocation: 'campus_map', impact: { stats: { fitness: 2 } } }] },
        { timeSlot: '12:00-14:00', defaultLocation: 'cafeteria', activities: [] },
        { timeSlot: '14:00-17:00', defaultLocation: 'classroom', activities: [] },
        { timeSlot: '17:00-21:00', defaultLocation: 'city_map', activities: [{ id: 'idol', name: 'Idol Work', duration: 4, requiredLocation: 'city_map', impact: { moodChange: 'excited' } }] },
        { timeSlot: '21:00-07:00', defaultLocation: 'dorm_room', activities: [] },
    ],
    ling_ruoyu: [
        { timeSlot: '05:00-09:00', defaultLocation: 'lab', activities: [{ id: 'research', name: 'Research', duration: 4, requiredLocation: 'lab', impact: { stats: { intelligence: 4 } } }] },
        { timeSlot: '09:00-12:00', defaultLocation: 'classroom', activities: [{ id: 'teach', name: 'Teach', duration: 3, requiredLocation: 'classroom', impact: { stats: { intelligence: 1 } } }] },
        { timeSlot: '12:00-18:00', defaultLocation: 'cafeteria', activities: [] },
        { timeSlot: '18:00-23:00', defaultLocation: 'lab', activities: [{ id: 'research', name: 'Research', duration: 5, requiredLocation: 'lab', impact: { stats: { intelligence: 3 } } }] },
        { timeSlot: '23:00-05:00', defaultLocation: 'dorm_room', activities: [] },
    ],
    lu_jiaxin: [
        { timeSlot: '09:00-12:00', defaultLocation: 'campus_map', activities: [] },
        { timeSlot: '12:00-15:00', defaultLocation: 'biker_club', activities: [{ id: 'ride', name: 'Ride Motorcycle', duration: 3, requiredLocation: 'biker_club', impact: { moodChange: 'excited' } }] },
        { timeSlot: '15:00-18:00', defaultLocation: 'city_map', activities: [] },
        { timeSlot: '18:00-22:00', defaultLocation: 'bar', activities: [{ id: 'sing', name: 'Sing', duration: 4, requiredLocation: 'bar', impact: { stats: { money: 500 } } }] },
        { timeSlot: '22:00-09:00', defaultLocation: 'dorm_room', activities: [] },
    ],
};

export function getScheduledLocation(agentId: CharacterId, time: Time): LocationId {
    const schedules = CHARACTER_SCHEDULES[agentId];

    for (const schedule of schedules) {
        const [start, end] = schedule.timeSlot.split('-').map(parseTime);
        if (time.hour >= start && time.hour < end) {
            return schedule.defaultLocation;
        }
    }

    return 'campus_map'; // Default fallback
}

function parseTime(timeStr: string): number {
    const [hour] = timeStr.split(':').map(Number);
    return hour;
}
