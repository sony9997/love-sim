import { describe, it, expect } from 'vitest';
import { getScheduledLocation, CHARACTER_SCHEDULES } from './scheduler';
import type { CharacterId } from './scheduler';

describe('Scheduler', () => {
    describe('getScheduledLocation', () => {
        it('should return correct location based on time', () => {
            // Su Qingqian at 10:00 should be at classroom (08:00-12:00)
            const location = getScheduledLocation('su_qingqian' as const, { day: 1, hour: 10, weekday: 0 });
            expect(location).toBe('classroom');
        });

        it('should return student_council for su_qingqian at 15:00', () => {
            const location = getScheduledLocation('su_qingqian' as const, { day: 1, hour: 15, weekday: 0 });
            expect(location).toBe('student_council');
        });

        it('should return library for su_qingqian at 20:00', () => {
            const location = getScheduledLocation('su_qingqian' as const, { day: 1, hour: 20, weekday: 0 });
            expect(location).toBe('library');
        });

        it('should return campus_map for chen_siyao at 10:00', () => {
            const location = getScheduledLocation('chen_siyao' as const, { day: 1, hour: 10, weekday: 0 });
            expect(location).toBe('campus_map');
        });

        it('should return lab for ling_ruoyu at 06:00', () => {
            const location = getScheduledLocation('ling_ruoyu' as const, { day: 1, hour: 6, weekday: 0 });
            expect(location).toBe('lab');
        });

        it('should return bar for lu_jiaxin at 20:00', () => {
            const location = getScheduledLocation('lu_jiaxin' as const, { day: 1, hour: 20, weekday: 0 });
            expect(location).toBe('bar');
        });

        it('should return default campus_map for unknown time', () => {
            const location = getScheduledLocation('su_qingqian' as const, { day: 1, hour: 30, weekday: 0 });
            expect(location).toBe('campus_map');
        });
    });

    describe('CHARACTER_SCHEDULES', () => {
        it('should have schedules for all characters', () => {
            const expectedChars = ['su_qingqian', 'chen_siyao', 'ling_ruoyu', 'lu_jiaxin'] as const;
            expectedChars.forEach((char) => {
                expect(CHARACTER_SCHEDULES[char]).toBeDefined();
                expect(CHARACTER_SCHEDULES[char].length).toBeGreaterThan(0);
            });
        });
    });
});
