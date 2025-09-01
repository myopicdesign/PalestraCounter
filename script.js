document.addEventListener("DOMContentLoaded", () => {
    let counter = 0;
    let threshold = 1;
    let lastY = null;
    let lastUpdate = Date.now();
    let debounceTimeout = 200;
    let isRunning = false;

    const counterElem = document.getElementById('counter');
    const echoContainer = document.getElementById('echo-container');
    const resetBtn = document.getElementById('resetBtn');
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const slider = document.getElementById('sensitivity-slider');

    counterElem.textContent = counter;

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

        let deltaY = event.accelerationIncludingGravity.y - lastY;
        let now = Date.now();

        if (now - lastUpdate > debounceTimeout && Math.abs(deltaY) > threshold) {
            if (deltaY > 0) {
                counter++;
                counterElem.textContent = counter;
                triggerEcho();
            }
            lastUpdate = now;
        }
        lastY = event.accelerationIncludingGravity.y;
    }

    slider.addEventListener('input', () => {
        threshold = mapSliderToThreshold(slider.value);
    });

    resetBtn.addEventListener('click', () => {
        counter = 0;
        counterElem.textContent = counter;
    });

    startBtn.addEventListener('click', async () => {
        if (isRunning) return;
        isRunning = true;

        startBtn.classList.add("active");
        stopBtn.classList.remove("active");

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

        stopBtn.classList.add("active");
        startBtn.classList.remove("active");
    });
});
