/**
 * fingerprint profiles keep session settings coherent without modifying browser internals.
 */
const profiles = Object.freeze({
  desktopwindows: { os: "windows", platform: "Win32", browser: "chrome", locale: "en-US", timezone: "America/New_York", touch: false, devicepixelratio: 1 },
  desktopmacos: { os: "macos", platform: "MacIntel", browser: "safari", locale: "en-US", timezone: "America/Los_Angeles", touch: false, devicepixelratio: 2 },
  mobileandroid: { os: "android", platform: "Linux armv8l", browser: "chrome", locale: "en-US", timezone: "America/Chicago", touch: true, devicepixelratio: 2.75 }
});

export function fingerprintprofile(name = "desktopwindows", overrides = {}) { return { ...(profiles[name] ?? profiles.desktopwindows), ...overrides, name }; }
export function fingerprintvalidate(profile) { return Boolean(profile?.os && profile?.platform && profile?.browser && profile?.locale && profile?.timezone && typeof profile.touch === "boolean"); }
export function fingerprintfor(sessionid, options = {}) { const names = options.profiles ?? Object.keys(profiles); const index = [...String(sessionid)].reduce((sum, value) => sum + value.charCodeAt(0), 0) % names.length; return fingerprintprofile(names[index], options.overrides); }
