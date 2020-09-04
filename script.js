const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
let initialColors;

// Event listener for slider controls
sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});

function generateHex() {
  const hexColor = chroma.random();

  return hexColor;
}

function randomColors() {
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    div.style.background = randomColor;
    hexText.innerText = randomColor;

    // Checking text contrast
    checkTextContrast(randomColor, hexText);

    const color = chroma(randomColor);
    const sliders = div.querySelectorAll('.sliders input');
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeSliders(color, hue, brightness, saturation);
  });
}

function colorizeSliders(color, hue, brightness, saturation) {
  // Scale saturation
  const noSat = color.set('hsl.s', 0);
  const fullSat = color.set('hsl.s', 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  // Scale brightness
  const midBrightness = color.set('hsl.l', 0.5);
  const scaleBrightness = chroma.scale(['black', midBrightness, 'white']);

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(204,75,75), rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(
    0
  )},${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();

  if (luminance > 0.5) {
    text.style.color = 'black';
  } else {
    text.style.color = 'white';
  }
}

function hslControls(e) {
  const index =
    e.target.getAttribute('data-hue') ||
    e.target.getAttribute('data-bright') ||
    e.target.getAttribute('data-saturation');

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const currentBgColor = colorDivs[index].querySelector('h2').innerText;

  let color = chroma(currentBgColor)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value)
    .set('hsl.s', saturation.value);

  colorDivs[index].style.background = color;
}

randomColors();
