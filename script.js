const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popupContainer = document.querySelector('.copy-container');
const adjustButtons = document.querySelectorAll('.adjust');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;

// Event listener for slider controls
sliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});

function generateHex() {
  const hexColor = chroma.random();

  return hexColor;
}

colorDivs.forEach((div, index) => {
  div.addEventListener('change', () => {
    updateUIText(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener('click', () => {
    copyToClipboard(hex);
  });
});

popupContainer.addEventListener('transitionend', () => {
  const popup = popupContainer.children[0];
  popupContainer.classList.remove('active');
  popup.classList.remove('active');
});

adjustButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustments.forEach((button, index) => {
  button.addEventListener('click', () => {
    closeAdjustmentPanel(index);
  });
});

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    // Pushing the color to the array
    initialColors.push(chroma(randomColor).hex());

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
  // Reset all the control sliders
  resetControlSliders();
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

  const currentBgColor = initialColors[index];

  let color = chroma(currentBgColor)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value)
    .set('hsl.s', saturation.value);

  colorDivs[index].style.backgroundColor = color;

  // Colorize sliders/inputs
  colorizeSliders(color, hue, brightness, saturation);
}

function updateUIText(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector('h2');
  const icons = activeDiv.querySelectorAll('.controls button');

  textHex.innerText = color.hex();

  checkTextContrast(color, textHex);

  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetControlSliders() {
  const sliders = document.querySelectorAll('.sliders input');
  sliders.forEach((slider) => {
    if (slider.name === 'hue') {
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }

    if (slider.name === 'brightness') {
      const brightnessColor = initialColors[slider.getAttribute('data-bright')];
      const brightnessValue = chroma(brightnessColor).hsl()[2];
      slider.value = Math.floor(brightnessValue * 100) / 100;
    }

    if (slider.name === 'saturation') {
      const saturationColor =
        initialColors[slider.getAttribute('data-saturation')];
      const saturationValue = chroma(saturationColor).hsl()[1];
      slider.value = Math.floor(saturationValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement('textarea');
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);

  // Appearing popup
  const popup = popupContainer.children[0];
  popupContainer.classList.add('active');
  popup.classList.add('active');
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle('active');
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove('active');
}

randomColors();
