import { type SettingName } from './helpers.database.js';
export default function getSetting(settingName: SettingName): string | null | undefined;
interface SettingValues {
    settingValue: string | null;
    previousSettingValue: string | null;
}
export declare function getSettingValues(settingName: SettingName): SettingValues | undefined;
export {};
