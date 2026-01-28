export const darkenColor = (hex: string, amount: number) => {
	const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
	const num = parseInt(hex.replace("#", ""), 16);
	const r = clamp((num >> 16) - amount);
	const g = clamp(((num >> 8) & 0xff) - amount);
	const b = clamp((num & 0xff) - amount);

	return `#${((1 << 24) + (r << 16) + (g << 8) + b)
		.toString(16)
		.slice(1)}`;
};

export const applyThemeToDOM = (color: string) => {
	const root = document.documentElement;
	const dark = darkenColor(color, 40);
	const light = `${color}15`;
	root.style.setProperty("--app-primary", color);
	root.style.setProperty("--app-primary-dark", dark);
	root.style.setProperty("--app-primary-light", light);
	localStorage.setItem("app-theme-color", color);
};
