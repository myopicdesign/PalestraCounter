document.addEventListener("DOMContentLoaded", () => {
    let counter = 0;
    let sliderValueInternal = 1; // parte sempre da 1
    let threshold = mapSliderToThreshold(sliderValueInternal);
    let lastY = null;
    let debounceTimeout = 200;
    let lastUpdate = Date.now();
    let isRunning = false;

    const counterElem = document.getElementById('counter');
    const echoContainer = document.getElementById('echo-container');
    const resetBtn = document.getElementById('resetBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');

    const slider = document.getElementById('sensitivity-slider');

    counterElem.textContent = counter;
    slider.value = sliderValueInternal;

    function triggerEcho() {
        const echo = document.createElement("div");
        echo.className = "echo";
        echoContainer.appendChild(echo);
        echo.addEventListener("animationend", () => echo.remove());
    }

    function mapSliderToThreshold(val) {
        switch (parseInt(val)) {
            case -2: return 0.5;
            case -1: return 0.8;
            case 0: return 1;
            case 1: return 1.2;
            case 2: return 1.5;
            case 3: return 2;
            default: return 1;
        }
    }

    function updateCounter(event) {
        if (!event.accelerationIncludingGravity) return;

        if (lastY === null) {
            lastY = event.accelerationIncludingGravity.y;
            return;
        }

        let accelerationY = event.accelerationIncludingGravity.y;
        let deltaY = accelerationY - lastY;
        let now = Date.now();

        if (now - lastUpdate > debounceTimeout) {
            if (Math.abs(deltaY) > threshold) {
                if (deltaY > 0) {
                    counter++;
                    counterElem.textContent = counter;
                    triggerEcho();
                }
                lastUpdate = now;
            }
        }
        lastY = accelerationY;
    }

    slider.addEventListener('input', () => {
        sliderValueInternal = parseInt(slider.value);
        threshold = mapSliderToThreshold(sliderValueInternal);
    });

    resetBtn.addEventListener('click', () => {
        counter = 0;
        counterElem.textContent = counter;
    });

    startBtn.addEventListener('click', async () => {
        if (isRunning) return;
        isRunning = true;

        if (typeof DeviceMotionEvent !== 'undefined' &&
            typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const res = await DeviceMotionEvent.requestPermission();
                if (res === 'granted') {
                    window.addEventListener('devicemotion', updateCounter);
                } else {
                    alert("Permesso sensore negato.");
                    isRunning = false;
                }
            } catch (e) {
                console.error(e);
                isRunning = false;
            }
        } else {
            window.addEventListener('devicemotion', updateCounter);
        }
    });

    stopBtn.addEventListener('click', () => {
        if (!isRunning) return;
        window.removeEventListener('devicemotion', updateCounter);
        isRunning = false;
    });
});
