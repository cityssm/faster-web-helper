export function getUserSettings(userName, connectedDatabase) {
    const userSettingsList = connectedDatabase
        .prepare(`select propertyName, propertyValue
        from UserSettings
        where userName = ?`)
        .all(userName);
    const userSettings = {};
    for (const setting of userSettingsList) {
        userSettings[setting.propertyName] = setting.propertyValue;
    }
    return userSettings;
}
