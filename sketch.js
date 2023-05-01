let audioContext;

// Get the text element and window height
const textElement = document.querySelector('#text');
const windowHeight = window.innerHeight;

// Set up the audio context and microphone input when the start button is clicked
document.querySelector('#startButton').addEventListener('click', async () => {
  // Set up the Web Audio API context
  audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Set up the microphone input
  const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const source = audioContext.createMediaStreamSource(mediaStream);
  const analyserNode = audioContext.createAnalyser();
  source.connect(analyserNode);

  // Set up the font weight update loop
  let duration = 0;
  let maxDuration = 4;
  let maxWeight = 1000;
  let isBreathing = false;
  let weight = 0;
  let sustainTime = 0;
  let decreaseStep = maxWeight * 0.05 * (1 / maxDuration);

  // Set up the animation loop
  let bottomValue = 0;
  let leftValue = 0;
  let rotationValue = 0;
  let isRotating = false;
  let rotationDirection = 1;
  

  // Update the font weight, position, and rotation
  function update() {
    // Get the frequency data from the analyzer node
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    analyserNode.getByteFrequencyData(dataArray);

    // Calculate the average frequency
    const frequencySum = dataArray.reduce((sum, value) => sum + value, 0);
    const frequencyAvg = frequencySum / dataArray.length;

    const textHeight = textElement.offsetHeight;

    // Update the duration and font weight based on the frequency
    if (frequencyAvg > 20) {
      duration = Math.min(duration + 0.05, maxDuration);
      isBreathing = true;
      weight = Math.min(weight + (maxWeight * 0.05 * (duration / maxDuration)), maxWeight);
      sustainTime = 0;
    } else {
      if (weight > 0) {
        duration = Math.max(duration - 0.05, 0);
        isBreathing = false;
        weight = Math.max(weight - (maxWeight * 0.05 * (duration / maxDuration)), 0);
        sustainTime += 0.05;
      }
      if (sustainTime >= maxDuration) {
        duration = 0;
        weight = 0;
        sustainTime = 0;
      }
    }

    // Set the font variation settings
    const fontVariationSettings = `'wght' ${weight}`;
    textElement.style.fontVariationSettings = fontVariationSettings;

    // Update the position based on the font weight


    // Request the next animation frame
    requestAnimationFrame(update);
  }

  // Start the animation loop
  update();
});

