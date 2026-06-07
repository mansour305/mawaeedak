import { z } from "zod/v4";
/**
 * Prayer times table.
 *
 * This schema extends the original by including a `date` field (ISO
 * YYYY-MM-DD), a `city_key` to identify the locality, and `source` / `method`
 * fields to describe how the times were obtained (e.g. official data from
 * وزارة الشؤون الإسلامية or calculations based on the Umm Al‑Qura calendar).
 */
export declare const prayerTimesTable: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "prayer_times";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "prayer_times";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        city_key: import("drizzle-orm/pg-core").PgColumn<{
            name: "city_key";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        city_name_ar: import("drizzle-orm/pg-core").PgColumn<{
            name: "city_name_ar";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        date_gregorian: import("drizzle-orm/pg-core").PgColumn<{
            name: "date_gregorian";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        date_hijri: import("drizzle-orm/pg-core").PgColumn<{
            name: "date_hijri";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        fajr: import("drizzle-orm/pg-core").PgColumn<{
            name: "fajr";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        sunrise: import("drizzle-orm/pg-core").PgColumn<{
            name: "sunrise";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        dhuhr: import("drizzle-orm/pg-core").PgColumn<{
            name: "dhuhr";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        asr: import("drizzle-orm/pg-core").PgColumn<{
            name: "asr";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        maghrib: import("drizzle-orm/pg-core").PgColumn<{
            name: "maghrib";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        isha: import("drizzle-orm/pg-core").PgColumn<{
            name: "isha";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        source: import("drizzle-orm/pg-core").PgColumn<{
            name: "source";
            tableName: "prayer_times";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
        created_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "prayer_times";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            identity: undefined;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export declare const insertPrayerTimesSchema: z.ZodObject<{
    source: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    city_key: z.ZodString;
    city_name_ar: z.ZodString;
    date_gregorian: z.ZodString;
    date_hijri: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    fajr: z.ZodString;
    sunrise: z.ZodString;
    dhuhr: z.ZodString;
    asr: z.ZodString;
    maghrib: z.ZodString;
    isha: z.ZodString;
}, {
    out: {};
    in: {};
}>;
export type InsertPrayerTimes = z.infer<typeof insertPrayerTimesSchema>;
export type PrayerTimes = typeof prayerTimesTable.$inferSelect;
//# sourceMappingURL=prayer_times.d.ts.map