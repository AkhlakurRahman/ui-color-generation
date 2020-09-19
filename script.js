const colorDivs = document.querySelectorAll('.color');
const generateButton = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popupContainer = document.querySelector('.copy-container');
const adjustButtons = document.querySelectorAll('.adjust');
const lockButtons = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
let initialColors;

// Local storage part
let savedPalettes = [];

generateButton.addEventListener('click', randomColors);

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

lockButtons.forEach((button, index) => {
  button.addEventListener('click', (e) => {
    lockAColor(e, index);
  });
});

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();

    if (div.classList.contains('locked')) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      // Pushing the color to the array
      initialColors.push(chroma(randomColor).hex());
    }

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

  // Check for button contrast
  adjustButtons.forEach((button, index) => {
    checkTextContrast(initialColors[index], button);
    checkTextContrast(initialColors[index], lockButtons[index]);
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

function lockAColor(e, index) {
  const lockSVG = e.target.children[0];
  const activeBg = colorDivs[index];
  activeBg.classList.toggle('locked');

  if (lockSVG.classList.contains('fa-lock-open')) {
    e.target.innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    e.target.innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

// Implement save to palette and Local storage
const saveButton = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input');
const libraryContainer = document.querySelector('.library-container');
const libraryButton = document.querySelector('.library');
const libraryClose = document.querySelector('.close-library');

saveButton.addEventListener('click', openSavePalette);

closeSave.addEventListener('click', closeSavePalette);

submitSave.addEventListener('click', savePalette);

libraryButton.addEventListener('click', openLibraryPalette);

libraryClose.addEventListener('click', closeLibraryPalette);

function openSavePalette() {
  const popup = saveContainer.children[0];

  saveContainer.classList.add('active');
  popup.classList.add('active');
}

function closeSavePalette() {
  const popup = saveContainer.children[0];

  saveContainer.classList.remove('active');
  popup.classList.remove('active');
}

function openLibraryPalette() {
  const popup = libraryContainer.children[0];

  libraryContainer.classList.add('active');
  popup.classList.add('active');
}

function closeLibraryPalette() {
  const popup = libraryContainer.children[0];

  libraryContainer.classList.remove('active');
  popup.classList.remove('active');
}

function savePalette() {
  const popup = saveContainer.children[0];

  saveContainer.classList.remove('active');
  popup.classList.remove('active');

  const name = saveInput.value;
  const colors = [];

  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  let paletteNumber = savedPalettes.length;

  const paletteObj = { name, colors, paletteNumber };

  savedPalettes.push(paletteObj);

  saveToLocal(paletteObj);

  saveInput.value = '';

  const palette = document.createElement('div');
  palette.classList.add('custom-palette');

  const title = document.createElement('h4');
  title.innerText = paletteObj.name;

  const preview = document.createElement('div');
  preview.classList.add('small-preview');

  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement('div');
    smallDiv.style.backgroundColor = smallColor;
    preview.appendChild(smallDiv);
  });

  const paletteButton = document.createElement('button');
  paletteButton.classList.add('pick-palette-btn');
  paletteButton.classList.add(paletteObj.paletteNumber);
  paletteButton.innerText = 'Select';

  // Append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteButton);

  libraryContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localPalettes;

  if (localStorage.getItem('palettes') === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem('palettes'));
  }

  localPalettes.push(paletteObj);
  localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

randomColors();
