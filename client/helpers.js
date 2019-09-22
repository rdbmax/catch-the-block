export const randomPosition = () => ({
    x: Math.round(Math.random()*10),
    y: 1,
    z: Math.round(Math.random()*10)
});

export const randomColor = () => Math.random() * 0x808008 + 0x808080;
